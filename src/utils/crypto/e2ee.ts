// src/utils/crypto/e2ee.ts
import { storeKey, loadKey } from './keyStore';

const ECDH_PARAMS = { name: 'ECDH', namedCurve: 'P-256' };
const ECDSA_PARAMS = { name: 'ECDSA', namedCurve: 'P-256' };

/**
 * Génère et stocke les paires de clés s'elles n'existent pas encore.
 * @returns Les clés publiques au format JWK prêtes à être envoyées à Supabase.
 */
export async function initializeUserKeys(): Promise<{ ecdhPubJwk: JsonWebKey; ecdsaPubJwk: JsonWebKey } | null> {
  try {
    let ecdhKeys = await loadKey('ecdh');
    let ecdsaKeys = await loadKey('ecdsa');

    // Génération si introuvable
    if (!ecdhKeys) {
      ecdhKeys = await crypto.subtle.generateKey(ECDH_PARAMS, false, ['deriveKey', 'deriveBits']) as CryptoKeyPair;
      await storeKey('ecdh', ecdhKeys);
    }

    if (!ecdsaKeys) {
      // Pour la signature, extractable=false sécurise la clé privée
      ecdsaKeys = await crypto.subtle.generateKey(ECDSA_PARAMS, false, ['sign', 'verify']) as CryptoKeyPair;
      await storeKey('ecdsa', ecdsaKeys);
    }

    // Export des clés publiques uniquement pour les stocker sur le serveur
    const ecdhPubJwk = await crypto.subtle.exportKey('jwk', ecdhKeys.publicKey);
    const ecdsaPubJwk = await crypto.subtle.exportKey('jwk', ecdsaKeys.publicKey);

    return { ecdhPubJwk, ecdsaPubJwk };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des clés E2EE :", error);
    return null;
  }
}