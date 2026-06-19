import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Trash2,
  ExternalLink,
  Loader2,
  Home,
  AlertCircle,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      if (!user || !supabase) return;
      setIsLoading(true);
      setError(null);

      try {
        // 1. Récupération des IDs des favoris de l'utilisateur
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("property_id")
          .eq("user_id", user.id);

        if (favError) throw favError;

        if (!favData || favData.length === 0) {
          if (isMounted) {
            setFavorites([]);
            setIsLoading(false);
          }
          return;
        }

        const propertyIds = favData.map((fav) => fav.property_id);

        // 2. Récupération des détails des propriétés associées
        const { data: propData, error: propError } = await supabase
          .from("properties")
          .select("*")
          .in("id", propertyIds);

        if (propError) throw propError;

        if (isMounted) {
          setFavorites(propData || []);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des favoris :", err);
        if (isMounted) {
          setError("Impossible de charger vos favoris. Veuillez réessayer.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const removeFavorite = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Évite la navigation si le bouton est dans un lien enveloppant
    if (!user || !supabase) return;

    try {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (deleteError) throw deleteError;

      // Mise à jour optimiste de l'état local
      setFavorites((prev) => prev.filter((item) => item.id !== propertyId));
    } catch (err) {
      console.error("Erreur lors de la suppression du favori :", err);
      alert("Erreur lors de la suppression du favori. Veuillez réessayer.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Mes Favoris", path: "/client/favorites" },
          ]}
        />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          Mes Propriétés Favorites
        </h1>
        <p className="text-gray-500 text-sm">
          Retrouvez ici tous les biens immobiliers que vous avez mis de côté.
        </p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 border-[#d4af37] animate-spin text-[#d4af37]" />
          <p className="text-sm text-gray-500 font-medium">
            Chargement de vos favoris...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <EmptyState
            icon={Home}
            title="Aucun favori pour le moment"
            description="Parcourez notre catalogue de biens et cliquez sur le cœur pour ajouter des propriétés à votre liste."
          />
          <div className="mt-6 flex justify-center">
            <Link
              to="/proprietes"
              className="px-6 py-3 bg-[#0a0f1e] text-white text-sm font-semibold rounded-xl hover:bg-[#1a2540] transition-colors"
            >
              Découvrir les propriétés
            </Link>
          </div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((property) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
              >
                {/* Image & Tag */}
                <div className="relative aspect-[16/10] bg-gray-100 flex-shrink-0 overflow-hidden group">
                  <img
                    src={
                      property.image ||
                      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
                    }
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {property.tag && (
                    <span className="absolute top-3 left-3 bg-[#0a0f1e] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      {property.tag}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#0a0f1e] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {property.type}
                  </span>
                </div>

                {/* Contenu principal */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[#0a0f1e] font-bold text-lg leading-snug line-clamp-1">
                        {property.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </p>
                  </div>

                  {/* Caractéristiques */}
                  <div className="grid grid-cols-3 gap-2 my-4 border-t border-b border-gray-100 py-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg justify-center">
                      <Bed className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {property.beds}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg justify-center">
                      <Bath className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {property.baths}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg justify-center">
                      <Maximize className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {property.sqft}m²
                      </span>
                    </div>
                  </div>

                  {/* Prix & Actions */}
                  <div className="space-y-4 pt-1 flex-shrink-0">
                    <p className="text-[#0a0f1e] font-black text-xl">
                      {typeof property.price === "number"
                        ? new Intl.NumberFormat("fr-FR").format(
                            property.price,
                          ) + " FCFA"
                        : property.price}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/propriete/${property.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-[#0a0f1e] font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Détails
                      </Link>
                      <button
                        onClick={(e) => removeFavorite(property.id, e)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm group"
                      >
                        <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />{" "}
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
