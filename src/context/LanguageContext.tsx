import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import frDict from "../i18n/locales/fr.json";
import enDict from "../i18n/locales/en.json";
import esDict from "../i18n/locales/es.json";

export type SupportedLang = "fr" | "en" | "es";

export interface LanguageContextType {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  isDetecting: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<SupportedLang, any> = {
  fr: frDict,
  en: enDict,
  es: esDict,
};

const STORAGE_KEY = "msf_lang";

// Pays d'Afrique francophone et francophonie mondiale
const FR_COUNTRIES = new Set([
  "CG", "CD", "CM", "CI", "SN", "ML", "BF", "TG", "BJ", "GA", "GN", "MG",
  "NE", "TD", "CF", "BI", "DJ", "KM", "MR", "MU", "SC", "RW", "FR", "BE",
  "CH", "LU", "MC", "HT",
]);

// Pays hispanophones
const ES_COUNTRIES = new Set([
  "ES", "MX", "CO", "AR", "PE", "VE", "CL", "EC", "GT", "CU", "BO", "DO",
  "HN", "PY", "SV", "NI", "CR", "PA", "UY", "GQ", "PR",
]);

// Pays anglophones
const EN_COUNTRIES = new Set([
  "GB", "US", "AU", "CA", "IE", "NZ", "ZA", "NG", "GH", "KE", "UG", "TZ",
  "ZW", "ZM", "SL", "LR",
]);

export async function detectLanguageFromCloudflare(): Promise<SupportedLang> {
  // 1. Priorité au choix manuel stocké en localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang;
    if (saved && (saved === "fr" || saved === "en" || saved === "es")) {
      return saved;
    }
  } catch {
    // Ignore
  }

  // 2. Détection Cloudflare native via /cdn-cgi/trace
  try {
    const res = await fetch("/cdn-cgi/trace", { cache: "force-cache" });
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/loc=([A-Z]{2})/);
      const country = match?.[1];
      if (country) {
        if (FR_COUNTRIES.has(country)) return "fr";
        if (ES_COUNTRIES.has(country)) return "es";
        if (EN_COUNTRIES.has(country)) return "en";
      }
    }
  } catch {
    // Échec silencieux, cascade vers le navigateur
  }

  // 3. Fallback sur la langue du navigateur
  try {
    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    if (browserLang === "es") return "es";
    if (browserLang === "en") return "en";
    if (browserLang === "fr") return "fr";
  } catch {
    // Ignore
  }

  // 4. Défaut absolu : Français (Congo & Afrique Centrale)
  return "fr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<SupportedLang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang;
      if (saved && ["fr", "en", "es"].includes(saved)) return saved;
    } catch {
      // Ignore
    }
    return "fr";
  });
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let active = true;
    detectLanguageFromCloudflare().then((detected) => {
      if (active) {
        setLangState(detected);
        document.documentElement.lang = detected;
        setIsDetecting(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((nextLang: SupportedLang) => {
    setLangState(nextLang);
    document.documentElement.lang = nextLang;
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // Ignore
    }
  }, []);

  // Fonction de traduction multi-clés "nav.home", "hero.title1" avec interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const resolveKey = (dict: any, path: string): any => {
        const parts = path.split(".");
        let curr = dict;
        for (const p of parts) {
          if (!curr || typeof curr !== "object") return undefined;
          curr = curr[p];
        }
        return curr;
      };

      let val = resolveKey(dictionaries[lang], key);
      // Fallback sur français si absent
      if (val === undefined && lang !== "fr") {
        val = resolveKey(dictionaries.fr, key);
      }
      if (val === undefined) {
        return key;
      }
      if (typeof val !== "string") {
        return String(val);
      }

      if (params) {
        return Object.entries(params).reduce((str, [k, v]) => {
          return str.replace(new RegExp(`{{${k}}}`, "g"), String(v));
        }, val);
      }

      return val;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      isDetecting,
      t,
    }),
    [lang, setLang, isDetecting, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang doit être appelé dans un LanguageProvider");
  }
  return ctx;
};

// Hook compatible standard useTranslation
export const useTranslation = (_ns?: string) => {
  const ctx = useLang();
  return {
    t: ctx.t,
    lang: ctx.lang,
    setLang: ctx.setLang,
    i18n: {
      language: ctx.lang,
      changeLanguage: ctx.setLang,
    },
  };
};
