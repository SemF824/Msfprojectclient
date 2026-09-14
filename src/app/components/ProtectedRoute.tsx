import { Navigate, useLocation } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading, isPasswordRecovery } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  // 1. Si en cours de réinitialisation de mot de passe, bloquer l'accès aux pages de données
  if (isPasswordRecovery) {
    return <Navigate to="/update-password" replace />;
  }

  // 2. Si aucun utilisateur n'est connecté, direction la page de connexion client.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. LA SÉCURITÉ ANTI-ÉCRAN NOIR : Si l'utilisateur est un Admin, il n'a rien à faire ici.
  if (isAdmin) {
    console.warn("Accès client refusé pour un administrateur. Redirection...");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. C'est un vrai client, on le laisse passer.
  return <>{children}</>;
}