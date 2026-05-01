import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Heart, MapPin, Bed, Bath, Maximize,
  Trash2, ExternalLink, Loader2, Home, 
  TrendingUp, AlertCircle
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import Breadcrumb from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";

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

export default function Favorites() {
  const { user } = useSupabaseAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      if (!user || !supabase) return;
      setIsLoading(true);

      try {
        // 1. On récupère les IDs des favoris de CE client
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("property_id")
          .eq("user_id", user.id); // SÉCURITÉ FRONT-END

        if (favError) throw favError;

        if (favData && favData.length > 0) {
          const propertyIds = favData.map((f) => f.property_id);
          
          // 2. On récupère les détails des propriétés
          const { data: propData, error: propError } = await supabase
            .from("properties")
            .select("*")
            .in("id", propertyIds);
            
          if (propError) throw propError;
          if (propData && isMounted) {
            setFavorites(propData);
          }
        } else {
          if (isMounted) setFavorites([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFavorites();

    return () => { isMounted = false; };
  }, [user]);

  const removeFavorite = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    try {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      setFavorites(favorites.filter(f => f.id !== propertyId));
    } catch (error) {
      console.error("Erreur suppression favoris", error);
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === "number") {
      return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
    }
    return price;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Favoris", path: "/client/favorites" }
        ]} />
        <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2 font-bold break-words">
          Propriétés <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Favorites</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">Gérez votre sélection de biens immobiliers</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
          <p className="text-gray-500 font-medium">Récupération de vos coups de cœur...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0a0f1e] mb-2">Aucun favori pour le moment</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Explorez notre catalogue et utilisez l'icône cœur pour sauvegarder les propriétés qui vous intéressent.
            </p>
            <Link 
              to="/vitrine/proprietes" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:bg-[#b8952e] transition-colors"
            >
              <Home className="w-5 h-5" />
              Explorer les propriétés
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {favorites.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-56 sm:h-64 overflow-hidden flex-shrink-0">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent opacity-80" />
                
                <button 
                  onClick={(e) => removeFavorite(property.id, e)}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full text-pink-600 hover:bg-pink-50 hover:scale-110 transition-all shadow-md z-10"
                  title="Retirer des favoris"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {property.tag && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-xs font-bold rounded-full shadow-md z-10">
                    {property.tag}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col min-w-0">
                <div className="mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{property.type}</span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-[#0a0f1e] mb-2 group-hover:text-[#d4af37] transition-colors truncate">
                  {property.title}
                </h3>
                
                <div className="flex items-start gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm line-clamp-2">{property.location}</span>
                </div>
                
                <div className="text-xl sm:text-2xl text-[#d4af37] font-black mb-6 mt-auto break-words">
                  {formatPrice(property.price)}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    <Bed className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs sm:text-sm font-semibold">{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    <Bath className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs sm:text-sm font-semibold">{property.baths}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    <Maximize className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs sm:text-sm font-semibold">{property.sqft}m²</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 flex-shrink-0">
                  <Link 
                    to={`/vitrine/propriete/${property.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-[#0a0f1e] font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Détails
                  </Link>
                  <button 
                    onClick={(e) => removeFavorite(property.id, e)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Retirer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}