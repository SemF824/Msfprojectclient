import {
  Building2,
  Home,
  MapPin,
  Palette,
  SlidersHorizontal,
  LandPlot,
} from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

// On définit que ce composant accepte une fonction onSearch en paramètre
interface PropertyFilterProps {
  onSearch?: (filters: {
    type: string;
    location: string;
    price: string;
  }) => void;
}

export function PropertyFilter({
  onSearch,
}: PropertyFilterProps) {
  const [activeFilter, setActiveFilter] = useState("all"); // Type de bien (boutons du haut)
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const propertyTypes = [
    { value: "all", label: "Tous les types", icon: Building2 },
    { value: "villa", label: "Villas", icon: Home },
    {
      value: "apartment",
      label: "Appartements",
      icon: Building2,
    },
    {
      value: "penthouse",
      label: "Penthouses",
      icon: Building2,
    },
    { value: "terrain", label: "Terrains", icon: LandPlot },
    { value: "lotti", label: "Lottis", icon: MapPin },
  ];

  const cities = [
    { value: "all", label: "Toutes les villes" },
    { value: "pointe-noire", label: "Pointe-Noire" },
    { value: "brazzaville", label: "Brazzaville" },
    { value: "kounda", label: "Kounda" },
    { value: "oyo", label: "Oyo" },
    { value: "sibiti", label: "Sibiti" },
  ];

  const priceRanges = [
    { value: "all", label: "Tous les prix" },
    { value: "0-30000000", label: "0 - 30 000 000 FCFA" },
    { value: "30000000-60000000", label: "30M - 60M FCFA" },
    { value: "60000000-120000000", label: "60M - 120M FCFA" },
    { value: "120000000-300000000", label: "120M - 300M FCFA" },
    { value: "300000000+", label: "300M FCFA +" },
  ];

  const paymentOptions = [
    { value: "all", label: "Tous" },
    { value: "cash", label: "Comptant" },
    { value: "loan", label: "Prêt disponible" },
  ];

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        type: activeFilter,
        location:
          selectedLocation === "all" ? "" : selectedLocation,
        price: selectedPrice,
      });
    }
  };

  return (
    <section className="relative -mt-20 z-10 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-2xl border border-[#d4af37]/30 p-8 shadow-2xl"
        >
          {/* Property Type Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveFilter(type.value)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                    activeFilter === type.value
                      ? "bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] border-[#d4af37] font-semibold"
                      : "bg-white/10 text-white border-white/20 hover:border-[#d4af37]/50 hover:bg-white/15"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Localisation
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                <select
                  value={selectedLocation}
                  onChange={(e) =>
                    setSelectedLocation(e.target.value)
                  }
                  className="w-full pl-11 pr-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Toutes les Villes</option>
                  {cities.map((city) => (
                    <option
                      key={city.value}
                      value={city.value}
                      className="bg-[#1e3a5f]"
                    >
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative">
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Gamme de Prix
              </label>
              <select
                value={selectedPrice}
                onChange={(e) =>
                  setSelectedPrice(e.target.value)
                }
                className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {priceRanges.map((range) => (
                  <option
                    key={range.value}
                    value={range.value}
                    className="bg-[#1e3a5f]"
                  >
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms (UI Only for now) */}
            <div className="relative">
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                Chambres
              </label>
              <select className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer">
                <option value="" className="bg-[#1e3a5f]">
                  Indifférent
                </option>
                <option value="1" className="bg-[#1e3a5f]">
                  1+
                </option>
                <option value="2" className="bg-[#1e3a5f]">
                  2+
                </option>
                <option value="3" className="bg-[#1e3a5f]">
                  3+
                </option>
              </select>
            </div>

            {/* Advanced Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1e3a5f]/80 backdrop-blur-sm text-white font-medium rounded-xl border border-[#d4af37]/40 hover:bg-[#1e3a5f] transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Avancé</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel (UI Preserved) */}
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Contenu avancé conservé à l'identique */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">
                    Surface (m²)
                  </label>
                  <input
                    type="text"
                    placeholder="Min - Max"
                    className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">
                    Mode de Paiement
                  </label>
                  <select className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer">
                    {paymentOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#1e3a5f]"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">
                    Équipements
                  </label>
                  <select className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="" className="bg-[#1e3a5f]">
                      Sélectionner
                    </option>
                    <option
                      value="pool"
                      className="bg-[#1e3a5f]"
                    >
                      Piscine
                    </option>
                    <option
                      value="gym"
                      className="bg-[#1e3a5f]"
                    >
                      Salle de Sport
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">
                    Type de Vue
                  </label>
                  <select className="w-full px-4 py-3 bg-[#1e3a5f]/80 border border-white/20 rounded-xl text-white font-medium focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer">
                    <option value="" className="bg-[#1e3a5f]">
                      Toutes les Vues
                    </option>
                    <option
                      value="ocean"
                      className="bg-[#1e3a5f]"
                    >
                      Vue Océan
                    </option>
                    <option
                      value="city"
                      className="bg-[#1e3a5f]"
                    >
                      Vue Ville
                    </option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Button */}
          <div className="mt-6">
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-bold rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all"
            >
              Rechercher des Propriétés
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}