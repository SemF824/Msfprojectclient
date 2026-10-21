import React from "react";
import { useTranslation, SupportedLang } from "../../context/LanguageContext";

const LANGUAGES: { code: SupportedLang; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
];

export const LanguageSelector: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { lang, setLang } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as SupportedLang)}
        aria-label="Sélectionner la langue / Select language"
        className="appearance-none bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-semibold text-gray-900 border border-gray-300 rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer transition-colors shadow-sm"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-gray-900 bg-white">
            {l.flag} {l.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 text-[10px] text-gray-700">
        ▼
      </div>
    </div>
  );
};
