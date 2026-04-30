import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({
  propertyId,
  className = "p-3 rounded-xl border-2",
  showText = false,
}: FavoriteButtonProps) {
  const { user } = useSupabaseAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .single();

      if (data) setIsFavorite(true);
      setIsLoading(false);
    };

    checkFavoriteStatus();
  }, [user, propertyId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Empêche le clic de traverser vers un Link parent

    if (!user) {
      alert("Veuillez vous connecter pour gérer vos favoris.");
      return;
    }
    if (!supabase) return;

    setIsToggling(true);
    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
        setIsFavorite(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: propertyId });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`transition-all flex items-center justify-center gap-2 bg-gray-50 border-gray-200 text-gray-400 opacity-50 ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        {showText && <span>Chargement...</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`transition-all flex items-center justify-center gap-2 ${className} ${
        isFavorite
          ? "bg-pink-50 border-pink-500 text-pink-600"
          : "bg-white border-gray-200 text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]"
      }`}
    >
      {isToggling ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
      )}
      {showText && (
        <span>
          {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        </span>
      )}
    </button>
  );
}
