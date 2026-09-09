/**
 * MSF CONGO - Stockage Sécurisé de Session basé sur les Cookies
 *
 * Remplace le stockage localStorage standard par des cookies sécurisés
 * compatibles avec les environnements Hetzner + Cloudflare (HTTPS, SameSite=Strict).
 * Gère automatiquement le chunking si la taille du jeton d'authentification dépasse 3 Ko.
 */

interface CookieOptions {
  days?: number;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
  domain?: string;
}

const CHUNK_SIZE = 3000; // Limite sûre sous le plafond des 4 Ko par cookie
const COOKIE_EXPIRY_DAYS = 7; // Durée de persistance de la session

const isHttps = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.location.protocol === "https:" ||
    window.location.hostname !== "localhost"
  );
};

const defaultOptions: CookieOptions = {
  days: COOKIE_EXPIRY_DAYS,
  secure: isHttps(),
  sameSite: "Strict",
  path: "/",
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = defaultOptions,
): void => {
  if (typeof document === "undefined") return;

  const secure = options.secure ?? isHttps();
  const sameSite = options.sameSite || "Strict";
  const path = options.path || "/";
  let expires = "";

  if (options.days) {
    const date = new Date();
    date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=${sameSite}`;

  if (secure) {
    cookieString += "; Secure";
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  document.cookie = cookieString;
};

const removeCookie = (
  name: string,
  options: CookieOptions = defaultOptions,
): void => {
  if (typeof document === "undefined") return;
  const path = options.path || "/";
  const secure = options.secure ?? isHttps();
  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=${options.sameSite || "Strict"}`;
  if (secure) {
    cookieString += "; Secure";
  }
  document.cookie = cookieString;
};

/**
 * Adaptateur de stockage conforme à l'interface Supabase SupportedStorage.
 * Permet d'écrire/lire les tokens dans les cookies avec gestion de fragmentation.
 */
export const secureCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null;

    // Vérifier si le cookie est fragmenté
    const countStr = getCookie(`${key}.chunks`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      if (!isNaN(count) && count > 0) {
        let fullValue = "";
        for (let i = 0; i < count; i++) {
          const chunk = getCookie(`${key}.${i}`);
          if (chunk) {
            fullValue += chunk;
          } else {
            return null;
          }
        }
        return fullValue;
      }
    }

    // Cookie simple
    return getCookie(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof document === "undefined") return;

    // Supprimer les anciens fragments éventuels
    const oldCountStr = getCookie(`${key}.chunks`);
    if (oldCountStr) {
      const oldCount = parseInt(oldCountStr, 10);
      for (let i = 0; i < oldCount; i++) {
        removeCookie(`${key}.${i}`);
      }
      removeCookie(`${key}.chunks`);
    }

    // Si la valeur est courte, on stocke directement
    if (value.length <= CHUNK_SIZE) {
      setCookie(key, value);
      return;
    }

    // Si la valeur est volumineuse, on segmente en chunks
    removeCookie(key);
    const totalChunks = Math.ceil(value.length / CHUNK_SIZE);
    setCookie(`${key}.chunks`, totalChunks.toString());

    for (let i = 0; i < totalChunks; i++) {
      const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      setCookie(`${key}.${i}`, chunk);
    }
  },

  removeItem: (key: string): void => {
    if (typeof document === "undefined") return;

    const countStr = getCookie(`${key}.chunks`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      for (let i = 0; i < count; i++) {
        removeCookie(`${key}.${i}`);
      }
      removeCookie(`${key}.chunks`);
    }

    removeCookie(key);
  },
};
