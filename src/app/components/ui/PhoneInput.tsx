import React, { useState, useMemo, useRef, useEffect } from "react";
import { CountryCode } from "libphonenumber-js/min";
import {
  ALL_COUNTRY_PHONE_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  CountryPhoneOption,
  validateAndFormatPhone,
  formatAsYouType,
} from "../../../utils/phone";
import { CheckCircle2, AlertCircle, ChevronDown, Search } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean, e164: string) => void;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  error?: string;
  defaultCountry?: CountryCode;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  id = "phone-input",
  name = "phone",
  label,
  required = false,
  error,
  defaultCountry = DEFAULT_COUNTRY_CODE,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(() => {
    return (
      ALL_COUNTRY_PHONE_OPTIONS.find((c) => c.code === selectedCountryCode) ||
      ALL_COUNTRY_PHONE_OPTIONS[0]
    );
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return ALL_COUNTRY_PHONE_OPTIONS;
    const q = search.toLowerCase();
    return ALL_COUNTRY_PHONE_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const validation = useMemo(() => {
    if (!value) return null;
    return validateAndFormatPhone(value, selectedCountryCode);
  }, [value, selectedCountryCode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatAsYouType(raw, selectedCountryCode);
    const result = validateAndFormatPhone(raw, selectedCountryCode);
    onChange(formatted, result.isValid, result.e164);
  };

  const handleSelectCountry = (country: CountryPhoneOption) => {
    setSelectedCountryCode(country.code);
    setIsOpen(false);
    setSearch("");
    const result = validateAndFormatPhone(value, country.code);
    onChange(value, result.isValid, result.e164);
  };

  return (
    <div className="w-full space-y-1.5 relative" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-stretch rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37] focus-within:bg-white transition-all h-11">
        {/* Sélecteur d'indicatif et drapeau à dimension fixe */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center justify-between w-[88px] shrink-0 px-2.5 bg-gray-100/80 hover:bg-gray-200/70 border-r border-gray-200 rounded-l-xl text-xs font-medium text-gray-800 transition-colors"
        >
          <span className="w-5 text-center leading-none text-base shrink-0 select-none">
            {selectedCountry.flag}
          </span>
          <span className="font-semibold text-xs text-gray-700 tracking-tight truncate">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#d4af37]" : ""
            }`}
          />
        </button>

        {/* Champ de saisie du numéro */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <input
            id={id}
            name={name}
            type="tel"
            value={value}
            onChange={handleInputChange}
            placeholder="Ex: 06 458 86 18"
            className="w-full h-full pl-3 pr-9 text-sm text-[#0a0f1e] bg-transparent rounded-r-xl outline-none placeholder:text-gray-400 font-medium"
          />

          {value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              {validation?.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          )}
        </div>

        {/* Dropdown de recherche de pays */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-full min-w-[280px] sm:w-80 max-w-[calc(100vw-2rem)] max-h-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un pays ou indicatif..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-amber-50/70 transition-colors ${
                      selectedCountryCode === c.code ? "bg-amber-50/90 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base shrink-0 select-none">{c.flag}</span>
                      <span className="text-gray-800 truncate">{c.name}</span>
                    </div>
                    <span className="text-gray-500 text-[11px] font-mono shrink-0 font-medium">
                      {c.dialCode}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">
                  Aucun pays trouvé pour cette recherche.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || (value && validation && !validation.isValid && validation.errorMessage)) && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error || validation?.errorMessage}</span>
        </p>
      )}
    </div>
  );
};