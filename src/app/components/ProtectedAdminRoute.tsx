import { Navigate } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, isLoading } = useSupabaseAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium mb-2">Vérification de l'accès...</p>
          <p className="text-sm text-gray-500">Authentification en cours</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not admin/superadmin
  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // User is authenticated and has admin or superadmin role
  return <>{children}</>;
}
