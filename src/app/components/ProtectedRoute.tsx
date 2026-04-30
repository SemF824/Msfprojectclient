import { Navigate, useLocation } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  // 1. Si aucun utilisateur n'est connecté, direction la page de connexion client.
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // 2. LA SÉCURITÉ ANTI-ÉCRAN NOIR : Si l'utilisateur est un Admin, il n'a rien à faire ici.
  if (isAdmin) {
    console.warn("Accès client refusé pour un administrateur. Redirection...");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 3. C'est un vrai client, on le laisse passer.
  return <>{children}</>;
}