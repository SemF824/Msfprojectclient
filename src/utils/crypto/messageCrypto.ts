// src/utils/crypto/messageCrypto.ts
import { loadKey } from "./keyStore";
import { RecipientKeyData, arrayBufferToBase64, base64ToArrayBuffer } from "./documentCrypto";
import { decryptAES } from "../encryption";

const ECDSA_PARAMS: EcdsaParams = { name: "ECDSA", hash: { name: "SHA-256" } };
const ECDH_PARAMS: EcKeyImportParams = { name: "ECDH", namedCurve: "P-256" };
const AES_GCM_PARAMS = { name: "AES-GCM", length: 256 };

export interface EncryptedMessagePayload {
  ciphertext: string;
  iv: string;
  signature: string;
  accessKeys: {
    recipientId: string;
    encryptedAesKey: string;
    ephemeralPubKey: JsonWebKey;
  }[];
}

/**
 * Chiffre et signe un message texte pour plusieurs destinataires (Client + Admins).
 */
export async function encryptChatMessage(
  plaintext: string,
  recipients: RecipientKeyData[]
): Promise<EncryptedMessagePayload> {
  const ecdsaPair = await loadKey("ecdsa");
  if (!ecdsaPair || !ecdsaPair.privateKey) {
    throw new Error("Clé privée ECDSA introuvable. Veuillez initialiser vos clés de sécurité.");
  }

  // 1. Génération de la clé symétrique AES-GCM
  const messageAesKey = await crypto.subtle.generateKey(
    AES_GCM_PARAMS,
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Chiffrement du texte en AES-GCM avec IV 96-bit (12 octets)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const textEncoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    messageAesKey,
    textEncoded
  );

  // 3. Signature cryptographique ECDSA du ciphertext
  const signatureBuffer = await crypto.subtle.sign(
    ECDSA_PARAMS,
    ecdsaPair.privateKey,
    cipherBuffer
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", messageAesKey);

  // 4. Encapsulation de la clé AES pour chaque destinataire via ECDH éphémère
  const accessKeys = await Promise.all(
    recipients.map(async (recipient) => {
      const ephemeralPair = (await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey"]
      )) as CryptoKeyPair;

      const recipientPubKey = await crypto.subtle.importKey(
        "jwk",
        recipient.ecdhPubJwk,
        ECDH_PARAMS,
        false,
        []
      );

      const wrappingKey = await crypto.subtle.deriveKey(
        { name: "ECDH", public: recipientPubKey },
        ephemeralPair.privateKey,
        { name: "AES-KW", length: 256 },
        false,
        ["wrapKey"]
      );

      const cryptoKeyToWrap = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );

      const wrappedAesKeyBuffer = await crypto.subtle.wrapKey(
        "raw",
        cryptoKeyToWrap,
        wrappingKey,
        "AES-KW"
      );

      const ephemeralPubJwk = await crypto.subtle.exportKey("jwk", ephemeralPair.publicKey);

      return {
        recipientId: recipient.recipientId,
        encryptedAesKey: arrayBufferToBase64(wrappedAesKeyBuffer),
        ephemeralPubKey: ephemeralPubJwk,
      };
    })
  );

  return {
    ciphertext: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    signature: arrayBufferToBase64(signatureBuffer),
    accessKeys,
  };
}

/**
 * Déchiffre et vérifie un message texte reçu.
 */
export async function decryptChatMessage(
  ciphertextBase64: string,
  ivBase64?: string | null,
  signatureBase64?: string | null,
  senderEcdsaPubJwk?: JsonWebKey | null,
  wrappedAesKeyBase64?: string | null,
  ephemeralPubKeyJwk?: JsonWebKey | null
): Promise<{ text: string; isValidSignature: boolean }> {
  // Support rétrocompatible pour les anciens messages non E2EE
  if (!ivBase64 || !signatureBase64 || !wrappedAesKeyBase64 || !ephemeralPubKeyJwk || !senderEcdsaPubJwk) {
    const legacyDecrypted = decryptAES(ciphertextBase64);
    return { text: legacyDecrypted, isValidSignature: false };
  }

  const ecdhPair = await loadKey("ecdh");
  if (!ecdhPair || !ecdhPair.privateKey) {
    throw new Error("Clé privée ECDH introuvable sur cet appareil.");
  }

  const cipherBuffer = base64ToArrayBuffer(ciphertextBase64);
  const signatureBuffer = base64ToArrayBuffer(signatureBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);
  const wrappedAesKeyBuffer = base64ToArrayBuffer(wrappedAesKeyBase64);

  // 1. Vérification de la signature d'authenticité ECDSA
  const senderPubKey = await crypto.subtle.importKey(
    "jwk",
    senderEcdsaPubJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const isValidSignature = await crypto.subtle.verify(
    ECDSA_PARAMS,
    senderPubKey,
    signatureBuffer,
    cipherBuffer
  );

  // 2. Dérivation de la clé de déballage avec la clé éphémère
  const ephemeralPubKey = await crypto.subtle.importKey(
    "jwk",
    ephemeralPubKeyJwk,
    ECDH_PARAMS,
    false,
    []
  );

  const unwrapKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: ephemeralPubKey },
    ecdhPair.privateKey,
    { name: "AES-KW", length: 256 },
    false,
    ["unwrapKey"]
  );

  // 3. Déballage de la clé AES-GCM
  const messageAesKey = await crypto.subtle.unwrapKey(
    "raw",
    wrappedAesKeyBuffer,
    unwrapKey,
    "AES-KW",
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // 4. Déchiffrement du contenu texte
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    messageAesKey,
    cipherBuffer
  );

  const text = new TextDecoder().decode(decryptedBuffer);

  return { text, isValidSignature };
}