// src/utils/crypto/documentCrypto.ts
import { loadKey } from './keyStore';

export interface RecipientKeyData {
  recipientId: string;
  ecdhPubJwk: JsonWebKey;
}

export interface WrappedKeyData {
  recipientId: string;
  encryptedAesKey: string;
  ephemeralPubKey: JsonWebKey;
}

export interface EncryptedDocumentResult {
  ciphertextBlob: Blob;
  iv: string;
  signature: string;
  accessKeys: WrappedKeyData[];
}

export interface DecryptedDocumentResult {
  fileBlob: Blob;
  isValidSignature: boolean;
}

/**
 * Convertit un ArrayBuffer en chaîne Base64.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convertit une chaîne Base64 en ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Chiffre un document de bout en bout, le signe, et génère les accès pour les destinataires.
 */
export async function processDocumentForUpload(
  file: File | Blob,
  recipients: RecipientKeyData[]
): Promise<EncryptedDocumentResult> {
  try {
    const fileBuffer = await file.arrayBuffer();

    const aesKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      fileBuffer
    );
    const ciphertextBlob = new Blob([ciphertextBuffer], { type: 'application/octet-stream' });

    const senderEcdsaKey = await loadKey('ecdsa');
    if (!senderEcdsaKey) {
      throw new Error("Clé de signature introuvable. L'utilisateur doit initialiser ses clés E2EE.");
    }
    
    const signatureBuffer = await crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      senderEcdsaKey.privateKey,
      ciphertextBuffer
    );

    const accessKeys: WrappedKeyData[] = [];

    for (const recipient of recipients) {
      const recipientPubKey = await crypto.subtle.importKey(
        'jwk',
        recipient.ecdhPubJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );

      const ephemeralPair = (await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey']
      )) as CryptoKeyPair;

      const wrappingKey = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: recipientPubKey },
        ephemeralPair.privateKey,
        { name: 'AES-KW', length: 256 },
        false,
        ['wrapKey']
      );

      const wrappedAesKeyBuffer = await crypto.subtle.wrapKey(
        'raw',
        aesKey,
        wrappingKey,
        'AES-KW'
      );

      const ephemeralPubKeyJwk = await crypto.subtle.exportKey('jwk', ephemeralPair.publicKey);

      accessKeys.push({
        recipientId: recipient.recipientId,
        encryptedAesKey: arrayBufferToBase64(wrappedAesKeyBuffer),
        ephemeralPubKey: ephemeralPubKeyJwk
      });
    }

    return {
      ciphertextBlob,
      iv: arrayBufferToBase64(iv.buffer),
      signature: arrayBufferToBase64(signatureBuffer),
      accessKeys
    };

  } catch (error) {
    console.error("Échec du chiffrement du document :", error);
    throw new Error("Le processus de chiffrement E2EE a échoué.");
  }
}

/**
 * Déchiffre un document et vérifie cryptographiquement sa provenance (signature).
 */
export async function decryptDocument(
  encryptedBlob: Blob,
  ivBase64: string,
  signatureBase64: string,
  senderEcdsaPubJwk: JsonWebKey,
  wrappedAesKeyBase64: string,
  ephemeralPubKeyJwk: JsonWebKey
): Promise<DecryptedDocumentResult> {
  try {
    const localEcdhKey = await loadKey('ecdh');
    if (!localEcdhKey) {
      throw new Error("Clé de déchiffrement introuvable. Initialisez vos clés E2EE.");
    }

    const ephemeralPubKey = await crypto.subtle.importKey(
      'jwk',
      ephemeralPubKeyJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );

    const unwrappingKey = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: ephemeralPubKey },
      localEcdhKey.privateKey,
      { name: 'AES-KW', length: 256 },
      false,
      ['unwrapKey']
    );

    const wrappedAesKeyBuffer = base64ToArrayBuffer(wrappedAesKeyBase64);
    const aesKey = await crypto.subtle.unwrapKey(
      'raw',
      wrappedAesKeyBuffer,
      unwrappingKey,
      'AES-KW',
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const ciphertextBuffer = await encryptedBlob.arrayBuffer();
    const iv = base64ToArrayBuffer(ivBase64);
    
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      aesKey,
      ciphertextBuffer
    );

    const senderPubKey = await crypto.subtle.importKey(
      'jwk',
      senderEcdsaPubJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    const signatureBuffer = base64ToArrayBuffer(signatureBase64);
    const isValidSignature = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      senderPubKey,
      signatureBuffer,
      ciphertextBuffer
    );

    return {
      fileBlob: new Blob([plaintextBuffer]),
      isValidSignature
    };
  } catch (error) {
    console.error("Échec du déchiffrement du document :", error);
    throw new Error("Impossible de déchiffrer le document ou clé invalide.");
  }
}