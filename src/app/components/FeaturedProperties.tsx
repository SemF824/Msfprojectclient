import { useState, useEffect } from "react";
import {
  Bath,
  Bed,
  MapPin,
  Maximize,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { supabase } from "../../hooks/useSupabaseAuth";

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
  filters?: {
    type: string;
    location: string;
    price: string;
  };
}

export function FeaturedProperties({
  filters,
}: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!supabase) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) {
          setProperties(data);
        }
      } catch (err) {
        console.error(
          "Erreur de connexion à la table properties :",
          err,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const formatPrice = (price: string | number) => {
    if (typeof price === "number") {
      return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
    }
    return price;
  };

  const filteredProperties = properties.filter((property) => {
    if (!filters) return true;
    let typeMatch = true;
    if (filters.type !== "all") {
      const typeMap: Record<string, string> = {
        apartment: "Appartement",
        villa: "Villa",
        penthouse: "Penthouse",
        terrain: "Terrain",
        lotti: "Lotti",
      };
      const expectedType =
        typeMap[filters.type] || filters.type;
      typeMatch = property.type === expectedType;
    }
    let locationMatch = true;
    if (filters.location) {
      locationMatch = property.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
    }
    return typeMatch && locationMatch;
  });

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0a0f1e] to-[#1e3a5f]/20 min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/40 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">
              Collection Premium
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl mb-4"
          >
            <span className="text-white">Propriétés </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              en Vedette
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Découvrez notre sélection triée de résidences
            extraordinaires dans les lieux les plus prestigieux
            du Congo
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
            <p className="text-gray-400">
              Chargement du catalogue...
            </p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            Aucune propriété ne correspond à vos critères de
            recherche ou le catalogue est vide.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.4,
                }}
                className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/20 will-change-transform"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-60" />
                  {property.tag && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-xs font-bold rounded-full">
                      {property.tag}
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0a0f1e]/70 backdrop-blur-md text-white text-xs font-medium rounded-full border border-[#d4af37]/40">
                    {property.type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-sm">
                      {property.location}
                    </span>
                  </div>
                  <div className="text-3xl text-[#d4af37] mb-6 font-bold">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Bed className="w-4 h-4" />
                      <span className="text-sm">
                        {property.beds}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm">
                        {property.baths}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Maximize className="w-4 h-4" />
                      <span className="text-sm">
                        {property.sqft} m²
                      </span>
                    </div>
                  </div>
                  {/* CORRECTION DU LIEN ICI */}
                  <Link
                    to={`/vitrine/propriete/${property.id}`}
                    className="block w-full mt-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium text-center rounded-lg border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#0a0f1e] transition-all"
                  >
                    Voir les Détails
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            {/* CORRECTION DU LIEN ICI AUSSI */}
            <Link
              to="/vitrine/proprietes"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-bold rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all"
            >
              Voir Toutes les Propriétés
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}