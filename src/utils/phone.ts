import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  AsYouType,
} from "libphonenumber-js/min";

export interface CountryPhoneOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

// Convertit dynamiquement un code ISO pays ("CG", "FR", "AE") en drapeau Emoji
export function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

// Récupérateur automatique des noms de pays en français (API native Intl)
const regionNamesFr = new Intl.DisplayNames(["fr"], { type: "region" });

// Ordre de priorité au sommet de liste pour l'écosystème MSF
const PRIORITY_COUNTRIES: CountryCode[] = [
  "CG", // Congo-Brazzaville (Défaut)
  "CD", // RDC Kinshasa
  "FR", // France
  "AE", // Émirats Arabes Unis (Dubaï)
  "US", // États-Unis
  "CA", // Canada
  "GB", // Royaume-Uni
  "BE", // Belgique
  "CH", // Suisse
  "CM", // Cameroun
  "GA", // Gabon
  "CI", // Côte d'Ivoire
  "SN", // Sénégal
];

export const DEFAULT_COUNTRY_CODE: CountryCode = "CG";

// Génération dynamique et optimisée de la liste mondiale des pays
export const ALL_COUNTRY_PHONE_OPTIONS: CountryPhoneOption[] = (() => {
  const allCodes = getCountries();
  
  // Tri : Pays prioritaires en premier, puis le reste par ordre alphabétique français
  const sortedCodes = [
    ...PRIORITY_COUNTRIES,
    ...allCodes.filter((c) => !PRIORITY_COUNTRIES.includes(c)).sort((a, b) => {
      const nameA = regionNamesFr.of(a) || a;
      const nameB = regionNamesFr.of(b) || b;
      return nameA.localeCompare(nameB, "fr");
    }),
  ];

  return sortedCodes.map((code) => {
    let dialCode = "";
    try {
      dialCode = `+${getCountryCallingCode(code)}`;
    } catch {
      dialCode = "";
    }

    return {
      code,
      name: regionNamesFr.of(code) || code,
      dialCode,
      flag: getFlagEmoji(code),
    };
  });
})();

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string;           // Format international stockable : "+242064588618"
  nationalNumber: string; // Chiffres nationaux : "064588618"
  formattedDisplay: string;
  errorMessage?: string;
}

/**
 * Valide, normalise et formate un numéro de téléphone avec libphonenumber-js
 */
export function validateAndFormatPhone(
  rawInput: string,
  countryCode: CountryCode = DEFAULT_COUNTRY_CODE
): PhoneValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      isValid: false,
      e164: "",
      nationalNumber: "",
      formattedDisplay: "",
      errorMessage: "Le numéro de téléphone est requis.",
    };
  }

  try {
    const phoneNumber = parsePhoneNumberFromString(rawInput, countryCode);

    if (!phoneNumber) {
      return {
        isValid: false,
        e164: "",
        nationalNumber: rawInput.replace(/[^\d]/g, ""),
        formattedDisplay: rawInput,
        errorMessage: "Format de numéro non reconnu.",
      };
    }

    const isValid = phoneNumber.isValid();

    return {
      isValid,
      e164: isValid ? phoneNumber.number : "",
      nationalNumber: phoneNumber.nationalNumber,
      formattedDisplay: phoneNumber.formatInternational(),
      errorMessage: isValid ? undefined : "Numéro invalide pour ce pays.",
    };
  } catch {
    return {
      isValid: false,
      e164: "",
      nationalNumber: rawInput.replace(/[^\d]/g, ""),
      formattedDisplay: rawInput,
      errorMessage: "Erreur d'analyse du numéro.",
    };
  }
}

/**
 * Formate un numéro au fur et à mesure de la frappe
 */
export function formatAsYouType(raw: string, countryCode: CountryCode = DEFAULT_COUNTRY_CODE): string {
  const formatter = new AsYouType(countryCode);
  return formatter.input(raw);
}

/**
 * Vérifie simplement la validité d'une chaîne
 */
export function isValidPhone(phone: string, countryCode: CountryCode = DEFAULT_COUNTRY_CODE): boolean {
  try {
    return isValidPhoneNumber(phone, countryCode);
  } catch {
    return false;
  }
}