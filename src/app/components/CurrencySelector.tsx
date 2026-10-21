import React from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { SUPPORTED_CURRENCIES, SupportedCurrency } from "../../utils/currency";

export const CurrencySelector: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
        aria-label="Sélectionner la devise"
        className="appearance-none bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-semibold text-gray-900 border border-gray-300 rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer transition-colors shadow-sm"
      >
        {Object.values(SUPPORTED_CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="text-gray-900 bg-white">
            {c.flag} {c.code} ({c.symbol})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 text-[10px] text-gray-700">
        ▼
      </div>
    </div>
  );
};