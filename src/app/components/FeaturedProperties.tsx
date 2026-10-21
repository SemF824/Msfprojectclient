import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import { motion } from "motion/react";
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
      return (data || []) as Property[];
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
          } else if (filters.price.includes("-")) {
            const [min, max] = filters.price.split("-").map(Number);
            priceMatch = propPrice >= min && propPrice <= max;
          }
        }
      }

      return typeMatch && locMatch && priceMatch;
    });
  }, [properties, filters]);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#8c7423] text-xs font-semibold mb-3">
            <span>Portfolio Sélectionné</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 font-bold text-[#0a0f1e] tracking-tight">
            Propriétés <span className="text-[#d4af37]">en Vedette</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Découvrez notre sélection triée de résidences extraordinaires dans
            les lieux les plus prestigieux du Congo.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
              >
                <div className="h-60 bg-gray-100 w-full animate-pulse" />
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3.5 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-9 bg-gray-100 rounded-lg w-28 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-gray-500 text-sm sm:text-base py-14 bg-white rounded-2xl border border-gray-200/80 shadow-sm max-w-md mx-auto">
            Aucune propriété ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#d4af37]/60 transition-[border-color,box-shadow] duration-200 hover:shadow-xl shadow-sm"
              >
                <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 via-transparent to-transparent opacity-60" />
                  {property.tag && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-[#d4af37] to-[#c49f2c] text-[#0a0f1e] text-[10px] font-bold uppercase rounded-full shadow-sm">
                      {property.tag}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-[#0a0f1e] text-[10px] font-bold rounded-full shadow-sm">
                    {property.type}
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0a0f1e] mb-1.5 group-hover:text-[#8c7423] transition-colors leading-snug">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="text-xs sm:text-sm truncate">
                        {property.location}
                      </span>
                    </div>
                    <div className="mb-4">
                      <PriceTag
                        amountInXaf={property.price}
                        className="text-xl sm:text-2xl text-[#8c7423] font-black"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Bed className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs">{property.beds} ch.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium border-x border-gray-100 px-3">
                        <Bath className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs">{property.baths} sdb.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Maximize className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs">{property.sqft} m²</span>
                      </div>
                    </div>
                    <Link
                      to={`/properties/${property.id}`}
                      className="block w-full mt-4 py-2.5 bg-gray-50 text-[#0a0f1e] text-xs font-bold text-center rounded-xl border border-gray-200 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#0a0f1e] transition-colors duration-150 shadow-sm"
                    >
                      Consulter les Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredProperties.length > 0 && (
          <div className="text-center mt-10 sm:mt-12">
            <Link
              to="/properties"
              className="inline-block px-7 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#c49f2c] text-[#0a0f1e] text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
            >
              Voir Toutes les Propriétés
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
