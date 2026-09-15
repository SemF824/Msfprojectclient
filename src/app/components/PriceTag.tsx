import React from "react";
import { useCurrency } from "../../context/CurrencyContext";

interface PriceTagProps {
  amountInXaf: number | string | null | undefined;
  className?: string;
  subtextClassName?: string;
  showOriginal?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  amountInXaf,
  className = "",
  subtextClassName = "",
  showOriginal = true,
}) => {
  const { currency, formatPrice } = useCurrency();

  if (amountInXaf === null || amountInXaf === undefined || amountInXaf === "") {
    return <span className={className}>Sur demande</span>;
  }

  const numericAmount = typeof amountInXaf === "number" ? amountInXaf : parseFloat(String(amountInXaf).replace(/[^0-9.-]+/g, ""));

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return <span className={className}>{String(amountInXaf)}</span>;
  }

  const formattedMain = formatPrice(numericAmount);
  const isForeign = currency !== "XAF";

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span>{formattedMain}</span>
      {showOriginal && isForeign && (
        <span className={`text-xs text-gray-500 dark:text-gray-400 font-normal opacity-80 ${subtextClassName}`}>
          ≈ {formatPrice(numericAmount, "XAF")}
        </span>
      )}
    </div>
  );
};