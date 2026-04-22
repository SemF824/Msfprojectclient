import { Navigate, useLocation } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, userRole, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!user || userRole !== 'superadmin') {
    return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
