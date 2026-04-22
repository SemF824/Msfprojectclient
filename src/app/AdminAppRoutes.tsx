import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import AdminLayout from "./components/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Lazy imports des pages admin
const AdminLogin         = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard     = lazy(() => import("./pages/admin/AdminDashboard"));
const DemandesManagement = lazy(() => import("./pages/admin/DemandesManagement"));
const DemandeDetail      = lazy(() => import("./pages/admin/DemandeDetail"));
const AdminNotFound      = lazy(() => import("./pages/admin/AdminNotFound"));

const AdminLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function AdminAppRoutes() {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        {/* Route publique de login (accessible via /admin) */}
        <Route index element={<AdminLogin />} />

        {/* Layout protégé (toutes les sous-routes commenceront par /admin/... grâce au routeur parent) */}
        <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="demandes"     element={<DemandesManagement />} />
          <Route path="demandes/:id" element={<DemandeDetail />} />
          <Route path="proprietes"   element={<div className="p-8"><h1 className="text-2xl font-bold">Catalogue Propriétés</h1><p className="mt-4 text-gray-500">Module en construction...</p></div>} />
          {/* Routes de placeholders */}
          <Route path="clients"      element={<div className="p-8">Clients</div>} />
          <Route path="statistiques" element={<div className="p-8">Statistiques</div>} />
          <Route path="parametres"   element={<div className="p-8">Paramètres</div>} />
          <Route path="equipe"       element={<div className="p-8">Équipe</div>} />
          <Route path="systeme"      element={<div className="p-8">Système</div>} />

          {/* Fallback Admin */}
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
