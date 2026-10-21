// src/utils/crypto/keyStore.ts

const DB_NAME = 'MSF_Crypto_Store';
const STORE_NAME = 'user_key_pairs';

/**
 * Initialise ou récupère l'instance IndexedDB
 */
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Sauvegarde une clé de façon sécurisée (IDB supporte le format natif CryptoKey)
 */
export async function storeKey(
  keyId: 'ecdh' | 'ecdsa',
  keyPair: CryptoKeyPair,
  userId?: string
): Promise<void> {
  const db = await getDB();
  const effectiveKey = userId ? `${keyId}_${userId}` : keyId;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(keyPair, effectiveKey);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère une paire de clés stockée
 */
export async function loadKey(
  keyId: 'ecdh' | 'ecdsa',
  userId?: string
): Promise<CryptoKeyPair | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    // Si userId est spécifié, essayer d'abord la clé scopée par utilisateur
    if (userId) {
      const userRequest = store.get(`${keyId}_${userId}`);
      userRequest.onsuccess = () => {
        if (userRequest.result) {
          resolve(userRequest.result);
        } else {
          // Fallback sur la clé legacy globale si présente
          const legacyRequest = store.get(keyId);
          legacyRequest.onsuccess = () => resolve(legacyRequest.result || null);
          legacyRequest.onerror = () => reject(legacyRequest.error);
        }
      };
      userRequest.onerror = () => reject(userRequest.error);
      return;
    }

    const request = store.get(keyId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}