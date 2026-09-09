import CryptoJS from "crypto-js";

// La clé de chiffrement doit absolument provenir d'une variable d'environnement
// pour ne pas être exposée dans le code source de l'application.
// Par défaut, nous utilisons une clé de fallback uniquement pour le développement.
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY ||
  "default-secret-key-change-it-in-production";

/**
 * Chiffre une chaîne de caractères en utilisant le standard AES-256.
 *
 * @param text - Le texte brut à chiffrer.
 * @returns La chaîne de caractères chiffrée (ciphertext).
 */
export const encryptAES = (text: string): string => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Déchiffre une chaîne de caractères chiffrée avec le standard AES-256.
 *
 * @param ciphertext - La chaîne chiffrée à déchiffrer.
 * @returns Le texte brut d'origine.
 */
export const decryptAES = (ciphertext: string): string => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error("Erreur lors du déchiffrement :", error);
    return ciphertext; // En cas d'échec (ex: ancienne donnée non chiffrée), on retourne la chaîne brute
  }
};

/**
 * Chiffre un objet JSON en chaîne chiffrée AES-256.
 * Utile pour stocker des payloads complexes.
 *
 * @param data - L'objet à chiffrer.
 * @returns La chaîne chiffrée.
 */
export const encryptObjectAES = (data: Record<string, unknown>): string => {
  const jsonString = JSON.stringify(data);
  return encryptAES(jsonString);
};

/**
 * Déchiffre une chaîne chiffrée AES-256 en objet JSON.
 *
 * @param ciphertext - La chaîne chiffrée.
 * @returns L'objet d'origine ou null en cas d'échec.
 */
export const decryptObjectAES = <T>(ciphertext: string): T | null => {
  try {
    const jsonString = decryptAES(ciphertext);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erreur lors du déchiffrement de l'objet :", error);
    return null;
  }
};
