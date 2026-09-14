import { Navigate, useLocation } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Gardien admin sécurisé.
 * Vérifie le rôle via le hook useSupabaseAuth (interrogeant user_roles et metadata).
 */
export default function ProtectedAdminRoute({
  children,
}: ProtectedAdminRouteProps) {
  const {
    user,
    isAdmin,
    userRole,
    isLoading: authLoading,
    isPasswordRecovery,
  } = useSupabaseAuth();
  const location = useLocation();

  // Phase 1 : Chargement Auth & Rôle
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-3" />
          <p className="text-lg text-gray-700 font-medium mb-1">
            Vérification de l'accès...
          </p>
          <p className="text-sm text-gray-500">
            Contrôle des privilèges administrateur
          </p>
        </div>
      </div>
    );
  }

  // Phase 2 : En cours de réinitialisation de mot de passe -> Bloqué sur /update-password
  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }

  // Phase 3 : Non connecté -> Redirection vers la page de login admin
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Phase 4 : Utilisateur connecté mais sans privilèges admin
  const isAuthorized =
    isAdmin || userRole === "admin" || userRole === "superadmin";
  if (!isAuthorized) {
    console.warn(
      "Accès Admin refusé pour un compte non-administrateur. Redirection vers l'espace client...",
    );
    return <Navigate to="/client/dashboard" replace />;
  }

  // Accès autorisé
  return <>{children}</>;
}