import { useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bath, Bed, MapPin, Maximize, TrendingUp, Loader2 } from "lucide-react";
import { motion, useInView } from "motion/react";
import { Link } from "react-router";
import { supabase } from "../../hooks/useSupabaseAuth";
import { PriceTag } from "./PriceTag";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string | number;
  image: string;
  beds: number;
  baths: number;
  sqft: string | number;
  type: string;
  tag?: string;
}

interface FeaturedPropertiesProps {
  filters?: { type: string; location: string; price: string };
}

const AnimatedCard = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export function FeaturedProperties({ filters }: FeaturedPropertiesProps) {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, location, price, image, beds, baths, sqft, type, tag",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!filters) return true;

      let typeMatch = true;
      if (filters.type && filters.type !== "all") {
        const typeMap: Record<string, string[]> = {
          apartment: ["appartement", "appartements"],
          villa: ["villa", "villas"],
          penthouse: ["penthouse", "penthouses"],
          terrain: ["terrain", "terrains"],
          lotti: ["lotti", "lottis", "lot", "lots"],
        };
        const searchTypes = typeMap[filters.type] || [filters.type];
        const propTypeLower = (property.type || "").toLowerCase();
        typeMatch = searchTypes.some(
          (t) =>
            propTypeLower.includes(t.toLowerCase()) ||
            t.toLowerCase().includes(propTypeLower),
        );
      }

      let locMatch = true;
      if (filters.location) {
        locMatch = (property.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase());
      }

      let priceMatch = true;
      if (filters.price && filters.price !== "all") {
        const propPrice = Number(property.price);
        if (!isNaN(propPrice)) {
          if (filters.price.endsWith("+")) {
            const minPrice = Number(filters.price.replace("+", ""));
            priceMatch = propPrice >= minPrice;
          } else {
            const [minStr, maxStr] = filters.price.split("-");
            const minPrice = Number(minStr);
            const maxPrice = Number(maxStr);
            priceMatch = propPrice >= minPrice && propPrice <= maxPrice;
          }
        }
      }

      return typeMatch && locMatch && priceMatch;
    });
  }, [properties, filters]);

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-transparent min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-4"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#d4af37]" />
            <span className="text-[10px] sm:text-xs text-[#d4af37] tracking-wider uppercase font-semibold">
              Collection Premium
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 font-black"
          >
            <span className="text-[#0a0f1e]">Propriétés </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b8952e]">
              en Vedette
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            Découvrez notre sélection triée de résidences extraordinaires dans
            les lieux les plus prestigieux du Congo
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#d4af37] animate-spin" />
            <p className="text-gray-400 text-sm sm:text-base">
              Chargement du catalogue...
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-gray-400 text-sm sm:text-base py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            Aucune propriété ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property, index) => (
              <AnimatedCard
                key={property.id}
                delay={index * 100}
                className="h-full"
              >
                <div className="group h-full flex flex-col relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/10 will-change-transform">
                  <div className="relative h-56 sm:h-64 overflow-hidden flex-shrink-0">
                    <img
                      src={property.image}
                      alt={property.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-[#0a0f1e]/20 to-transparent opacity-80" />
                    {property.tag && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                        {property.tag}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#0a0f1e] text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                      {property.type}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2 group-hover:text-[#d4af37] transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-3 sm:mb-4">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37] flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">
                        {property.location}
                      </span>
                    </div>
                    <div className="mb-4 sm:mb-6">
                      <PriceTag
                        amountInXaf={property.price}
                        className="text-xl sm:text-2xl md:text-3xl text-[#d4af37] font-black"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                        <span className="text-[10px] sm:text-xs">
                          {property.beds}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium border-x border-gray-200 px-2 sm:px-4">
                        <Bath className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                        <span className="text-[10px] sm:text-xs">
                          {property.baths}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                        <span className="text-[10px] sm:text-xs truncate">
                          {property.sqft} m²
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/properties/${property.id}`}
                      className="block w-full mt-4 sm:mt-6 py-2.5 sm:py-3 bg-gray-50 text-[#0a0f1e] text-xs sm:text-sm font-bold text-center rounded-lg border border-gray-200 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all shadow-sm"
                    >
                      Voir les Détails
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {!isLoading && filteredProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10 sm:mt-12"
          >
            <Link
              to="/properties"
              className="inline-block w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-sm sm:text-base font-bold rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all"
            >
              Voir Toutes les Propriétés
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}