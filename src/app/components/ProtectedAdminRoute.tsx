import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      // Redirect to admin login if not authenticated or not admin
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated and is admin
  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
