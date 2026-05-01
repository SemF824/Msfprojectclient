import { useState } from "react";
import { motion } from "motion/react";
import { Building2 } from "lucide-react";
import { PropertyFilter } from "../components/PropertyFilter";
import { FeaturedProperties } from "../components/FeaturedProperties";

export default function Properties() {
  const [searchFilters, setSearchFilters] = useState({
    type: "all",
    location: "",
    price: "all",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#d4af37]/20">
            <Building2 className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h1 className="text-4xl md:text-5xl text-[#0a0f1e] font-black mb-6 tracking-tight">
            Notre Catalogue Exclusif
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Explorez nos propriétés de prestige à travers le Congo. Des villas en bord de mer aux appartements de haut standing en centre-ville, trouvez l'investissement qui vous correspond.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
           <PropertyFilter onSearch={setSearchFilters} />
        </div>
      </div>

      <div className="bg-gray-50/50 py-12 border-t border-gray-100">
        <FeaturedProperties filters={searchFilters} />
      </div>
    </div>
  );
}