import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import AdminLayout from "./components/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import SuperAdminGuard from "./components/SuperAdminGuard";
import TeamManagement from "./pages/admin/TeamManagement";

// Lazy imports des pages admin
const AdminLogin          = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard      = lazy(() => import("./pages/admin/AdminDashboard"));
const DemandesManagement  = lazy(() => import("./pages/admin/DemandesManagement"));
const DemandeDetail       = lazy(() => import("./pages/admin/DemandeDetail"));
const ClientsDocuments    = lazy(() => import("./pages/admin/ClientsDocuments"));
const AdminNotFound       = lazy(() => import("./pages/admin/AdminNotFound"));
const PropertiesManagement= lazy(() => import("./pages/admin/PropertiesManagement"));
const ClientsManagement   = lazy(() => import("./pages/admin/ClientsManagement"));
const StatistiquesPage    = lazy(() => import("./pages/admin/StatistiquesPage"));
const ParametresPage      = lazy(() => import("./pages/admin/ParametresPage"));

const AdminLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function AdminAppRoutes() {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        {/* Route publique de login */}
        <Route index element={<AdminLogin />} />

        {/* Layout protégé */}
        <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="demandes"     element={<DemandesManagement />} />
          <Route path="demandes/:id" element={<DemandeDetail />} />
          <Route path="proprietes"   element={<PropertiesManagement />} />
          <Route path="clients"      element={<ClientsManagement />} />
          <Route path="documents"    element={<ClientsDocuments />} />
          <Route path="statistiques" element={<StatistiquesPage />} />
          <Route path="parametres"   element={<ParametresPage />} />
          <Route path="equipe" element={<TeamManagement />} />

          {/* Routes superadmin */}
          <Route path="equipe" element={
            <SuperAdminGuard>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-purple-700">Gestion de l'Équipe</h1>
                <p className="mt-4 text-gray-500">Administration restreinte aux Super Admins.</p>
              </div>
            </SuperAdminGuard>
          } />
          <Route path="systeme" element={
            <SuperAdminGuard>
              <div className="p-8">
                <h1 className="text-2xl font-bold text-indigo-700">Système</h1>
                <p className="mt-4 text-gray-500">Administration restreinte aux Super Admins.</p>
              </div>
            </SuperAdminGuard>
          } />

          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}