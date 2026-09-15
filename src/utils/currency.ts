export type SupportedCurrency =
  | "XAF"
  | "EUR"
  | "USD"
  | "AED"
  | "GBP"
  | "CAD"
  | "CHF"
  | "CNY"
  | "RUB"
  | "JPY";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  flag: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  XAF: { code: "XAF", symbol: "FCFA", label: "Franc CFA", flag: "🇨🇬", decimals: 0 },
  EUR: { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺", decimals: 2 },
  USD: { code: "USD", symbol: "$", label: "Dollar US", flag: "🇺🇸", decimals: 2 },
  AED: { code: "AED", symbol: "AED", label: "Dirham (Dubaï)", flag: "🇦🇪", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", label: "Livre Sterling", flag: "🇬🇧", decimals: 2 },
  CAD: { code: "CAD", symbol: "CA$", label: "Dollar Canadien", flag: "🇨🇦", decimals: 2 },
  CHF: { code: "CHF", symbol: "CHF", label: "Franc Suisse", flag: "🇨🇭", decimals: 2 },
  CNY: { code: "CNY", symbol: "¥", label: "Yuan Renminbi", flag: "🇨🇳", decimals: 2 },
  RUB: { code: "RUB", symbol: "₽", label: "Rouble Russe", flag: "🇷🇺", decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", label: "Yen Japonais", flag: "🇯🇵", decimals: 0 },
};

// 1 EUR = 655.957 FCFA (Taux fixe officiel BCE / BEAC)
const FIXED_EUR_TO_XAF = 655.957;
const BASE_XAF_TO_EUR = 1 / FIXED_EUR_TO_XAF;

// Taux de repli de sécurité offline
export const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  XAF: 1,
  EUR: BASE_XAF_TO_EUR,
  USD: BASE_XAF_TO_EUR * 1.08,
  AED: BASE_XAF_TO_EUR * 3.97,
  GBP: BASE_XAF_TO_EUR * 0.85,
  CAD: BASE_XAF_TO_EUR * 1.48,
  CHF: BASE_XAF_TO_EUR * 0.95,
  CNY: BASE_XAF_TO_EUR * 7.82,
  RUB: BASE_XAF_TO_EUR * 98.50,
  JPY: BASE_XAF_TO_EUR * 163.20,
};

interface CacheRecord {
  rates: Record<SupportedCurrency, number>;
  nextUpdate: number;
}

const STORAGE_CACHE_KEY = "msf_rates_cache_v3";
const STORAGE_ERROR_LOCK_KEY = "msf_rates_error_lock";
const MIN_FALLBACK_TTL = 12 * 60 * 60 * 1000; // 12 heures
const ERROR_LOCK_DURATION = 60 * 60 * 1000;   // 1 heure de cooldown en cas d'erreur

let memoryPromise: Promise<Record<SupportedCurrency, number>> | null = null;

export async function getExchangeRates(): Promise<Record<SupportedCurrency, number>> {
  const now = Date.now();

  // 1. Contrôle du cache persistant
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed: CacheRecord = JSON.parse(raw);
      if (parsed.rates && now < parsed.nextUpdate) {
        return parsed.rates;
      }
    }
  } catch {
    // Ignorer erreurs de lecture
  }

  // 2. Circuit Breaker anti-spam en cas d'erreur récente
  try {
    const errorLock = localStorage.getItem(STORAGE_ERROR_LOCK_KEY);
    if (errorLock && now < Number(errorLock)) {
      const raw = localStorage.getItem(STORAGE_CACHE_KEY);
      if (raw) {
        const parsed: CacheRecord = JSON.parse(raw);
        if (parsed.rates) return parsed.rates;
      }
      return FALLBACK_RATES;
    }
  } catch {
    // Ignorer
  }

  // 3. Déduplication de la requête en vol (In-Flight Singleton)
  if (memoryPromise) {
    return memoryPromise;
  }

  memoryPromise = (async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`API HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      if (data.result !== "success" || !data.rates) {
        throw new Error("Invalid API payload");
      }

      const eurRates = data.rates as Record<string, number>;
      const nextUpdateTime = data.time_next_update_unix
        ? data.time_next_update_unix * 1000
        : now + MIN_FALLBACK_TTL;

      const computedRates: Record<SupportedCurrency, number> = {
        XAF: 1,
        EUR: BASE_XAF_TO_EUR,
        USD: BASE_XAF_TO_EUR * (eurRates.USD ?? 1.08),
        AED: BASE_XAF_TO_EUR * (eurRates.AED ?? 3.97),
        GBP: BASE_XAF_TO_EUR * (eurRates.GBP ?? 0.85),
        CAD: BASE_XAF_TO_EUR * (eurRates.CAD ?? 1.48),
        CHF: BASE_XAF_TO_EUR * (eurRates.CHF ?? 0.95),
        CNY: BASE_XAF_TO_EUR * (eurRates.CNY ?? 7.82),
        RUB: BASE_XAF_TO_EUR * (eurRates.RUB ?? 98.50),
        JPY: BASE_XAF_TO_EUR * (eurRates.JPY ?? 163.20),
      };

      try {
        const cacheObj: CacheRecord = {
          rates: computedRates,
          nextUpdate: Math.max(nextUpdateTime, now + 3600000),
        };
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cacheObj));
        localStorage.removeItem(STORAGE_ERROR_LOCK_KEY);
      } catch {
        // Ignorer quota de stockage
      }

      return computedRates;
    } catch (err) {
      console.warn("[Currency] API indisponible, application du fallback :", err);

      try {
        localStorage.setItem(STORAGE_ERROR_LOCK_KEY, String(now + ERROR_LOCK_DURATION));
        const raw = localStorage.getItem(STORAGE_CACHE_KEY);
        if (raw) {
          const parsed: CacheRecord = JSON.parse(raw);
          if (parsed.rates) return parsed.rates;
        }
      } catch {
        // Ignorer
      }

      return FALLBACK_RATES;
    } finally {
      memoryPromise = null;
    }
  })();

  return memoryPromise;
}

export function formatCurrencyAmount(
  amountInXaf: number,
  targetCurrency: SupportedCurrency,
  rates: Record<SupportedCurrency, number>
): string {
  if (isNaN(amountInXaf) || amountInXaf === null || amountInXaf === undefined) {
    return "0 FCFA";
  }

  const rate = rates[targetCurrency] ?? FALLBACK_RATES[targetCurrency] ?? 1;
  const converted = amountInXaf * rate;
  const config = SUPPORTED_CURRENCIES[targetCurrency];

  if (targetCurrency === "XAF") {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(Math.round(converted))} FCFA`;
  }

  if (targetCurrency === "AED") {
    return `${new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted)} AED`;
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(converted);
}