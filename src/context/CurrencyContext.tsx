import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  FALLBACK_RATES,
  getExchangeRates,
  formatCurrencyAmount,
} from "../utils/currency";

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency) => void;
  rates: Record<SupportedCurrency, number>;
  isLoading: boolean;
  formatPrice: (amountInXaf: number, customTarget?: SupportedCurrency) => string;
  convertPrice: (amountInXaf: number, customTarget?: SupportedCurrency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);
const USER_CURRENCY_PREF = "msf_user_currency";

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    try {
      const saved = localStorage.getItem(USER_CURRENCY_PREF) as SupportedCurrency;
      return saved && SUPPORTED_CURRENCIES[saved] ? saved : "XAF";
    } catch {
      return "XAF";
    }
  });

  const [rates, setRates] = useState<Record<SupportedCurrency, number>>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getExchangeRates().then((resolvedRates) => {
      if (active) {
        setRates(resolvedRates);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setCurrency = (nextCurrency: SupportedCurrency) => {
    setCurrencyState(nextCurrency);
    try {
      localStorage.setItem(USER_CURRENCY_PREF, nextCurrency);
    } catch {
      // Ignorer
    }
  };

  const contextValue = useMemo(() => {
    return {
      currency,
      setCurrency,
      rates,
      isLoading,
      formatPrice: (amountInXaf: number, customTarget?: SupportedCurrency) =>
        formatCurrencyAmount(amountInXaf, customTarget || currency, rates),
      convertPrice: (amountInXaf: number, customTarget?: SupportedCurrency) => {
        const target = customTarget || currency;
        const rate = rates[target] ?? FALLBACK_RATES[target] ?? 1;
        return amountInXaf * rate;
      },
    };
  }, [currency, rates, isLoading]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency doit être appelé dans un CurrencyProvider");
  }
  return context;
};