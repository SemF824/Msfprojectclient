import { encryptAES, decryptAES } from "./encryption";
import type { DevisRequest } from "../types/database.types";

// Champs sensibles à chiffrer dans les demandes de devis
const SENSITIVE_FIELDS: (keyof DevisRequest)[] = [
  "client_phone",
  "client_address", // Si ajouté au type
  "client_city", // Si ajouté au type
  "client_country", // Si ajouté au type
  "client_profession", // Si ajouté au type
  "client_company", // Si ajouté au type
  "message",
];

/**
 * Chiffre les champs sensibles d'un objet (ex: DevisRequest) avant insertion en base.
 * @param data Objet à chiffrer
 * @returns Un nouvel objet avec les champs sensibles chiffrés
 */
export const encryptDevisRequest = <T extends Partial<DevisRequest> | any>(
  data: T,
): T => {
  if (!data) return data;
  const encryptedData = { ...data };

  SENSITIVE_FIELDS.forEach((field) => {
    if (encryptedData[field] && typeof encryptedData[field] === "string") {
      encryptedData[field] = encryptAES(encryptedData[field]);
    }
  });

  return encryptedData;
};

/**
 * Déchiffre les champs sensibles d'un objet (ex: DevisRequest) récupéré depuis la base.
 * @param data Objet à déchiffrer
 * @returns Un nouvel objet avec les champs sensibles déchiffrés
 */
export const decryptDevisRequest = <T extends Partial<DevisRequest> | any>(
  data: T,
): T => {
  if (!data) return data;
  const decryptedData = { ...data };

  SENSITIVE_FIELDS.forEach((field) => {
    // Ne pas tenter de déchiffrer si le champ est vide ou s'il ne ressemble pas à un ciphertext (ex: U2FsdGVkX1...)
    if (decryptedData[field] && typeof decryptedData[field] === "string") {
      // CryptoJS préfixe généralement avec 'U2FsdGVkX1' (Salted_)
      if (decryptedData[field].startsWith("U2FsdGVkX1")) {
        decryptedData[field] = decryptAES(decryptedData[field]);
      }
    }
  });

  return decryptedData;
};

/**
 * Déchiffre un tableau complet de demandes de devis.
 * @param list Liste des objets à déchiffrer
 * @returns Liste des objets déchiffrés
 */
export const decryptDevisRequests = <T extends Partial<DevisRequest> | any>(
  list: T[],
): T[] => {
  if (!Array.isArray(list)) return list;
  return list.map(decryptDevisRequest);
};
