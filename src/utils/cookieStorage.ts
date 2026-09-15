/**
 * MSF CONGO - Adaptateur de Stockage Sécurisé de Session (Cookies)
 *
 * Implémente un stockage sécurisé conforme aux standards OWASP :
 * - Attributs Secure, SameSite=Strict, Path=/
 * - Expiration synchronisée (7 jours)
 * - Gestion du chunking pour contourner la limite de 4 Ko par cookie
 */

interface CookieOptions {
  days?: number;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
  domain?: string;
}

const CHUNK_SIZE = 3000;
const COOKIE_EXPIRY_DAYS = 7;

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

export const secureCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null;

    const countStr = getCookie(`${key}_chunks`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      if (!isNaN(count) && count > 0) {
        let result = "";
        for (let i = 0; i < count; i++) {
          const chunk = getCookie(`${key}_${i}`);
          if (chunk === null) return null;
          result += chunk;
        }
        return result;
      }
    }

    return getCookie(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof document === "undefined") return;

    // Suppression préalable d'anciens fragments
    const oldCount = getCookie(`${key}_chunks`);
    if (oldCount) {
      const count = parseInt(oldCount, 10);
      for (let i = 0; i < count; i++) {
        removeCookie(`${key}_${i}`);
      }
      removeCookie(`${key}_chunks`);
    }
    removeCookie(key);

    if (value.length > CHUNK_SIZE) {
      const chunks = Math.ceil(value.length / CHUNK_SIZE);
      setCookie(`${key}_chunks`, chunks.toString());
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const chunk = value.substring(start, start + CHUNK_SIZE);
        setCookie(`${key}_${i}`, chunk);
      }
    } else {
      setCookie(key, value);
    }
  },

  removeItem: (key: string): void => {
    if (typeof document === "undefined") return;

    const countStr = getCookie(`${key}_chunks`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      for (let i = 0; i < count; i++) {
        removeCookie(`${key}_${i}`);
      }
      removeCookie(`${key}_chunks`);
    }
    removeCookie(key);
  },
};