import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { supabase } from "../../hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Gardien admin sécurisé.
 * Vérifie le rôle via la table public.user_roles (non falsifiable côté client)
 * au lieu de se fier à user_metadata.role.
 */
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading: authLoading } = useSupabaseAuth();

  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [isChecking,      setIsChecking]      = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // S'il n'y a pas d'utilisateur connecté du tout
    if (!user) {
      setIsAdminVerified(false);
      return;
    }

    if (!supabase) {
      // Supabase non configuré → fallback sur user_metadata (mode dégradé)
      const role = user?.user_metadata?.role;
      setIsAdminVerified(role === "admin" || role === "superadmin");
      return;
    }

    setIsChecking(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          // Si la table user_roles n'existe pas encore, fallback user_metadata
          const role = user?.user_metadata?.role;
          setIsAdminVerified(role === "admin" || role === "superadmin");
        } else {
          setIsAdminVerified(["admin", "superadmin"].includes(data.role));
        }
        setIsChecking(false);
      });
  }, [user, authLoading]);

  // Phase 1 : Chargement Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium mb-2">Vérification de l'accès...</p>
          <p className="text-sm text-gray-500">Authentification en cours</p>
        </div>
      </div>
    );
  }

  // Phase 2 : Vérification user_roles en cours
  if (isChecking || isAdminVerified === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Vérification des droits...</p>
          <p className="text-sm text-gray-400 mt-1">Contrôle de sécurité en cours</p>
        </div>
      </div>
    );
  }

  // Phase 3 : Le couperet
  if (!isAdminVerified) {
    // Si la personne est connectée, mais que c'est un client classique
    if (user) {
      console.warn("Accès Admin refusé pour un client. Redirection vers l'espace client...");
      return <Navigate to="/client/dashboard" replace />;
    }
    // Si personne n'est connecté
    return <Navigate to="/admin" replace />;
  }

  // L'utilisateur est un vrai admin, on le laisse passer
  return <>{children}</>;
}