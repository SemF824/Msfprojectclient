import { Routes, Route, Navigate, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import Layout from "./components/Layout";
import ClientLayout from "./components/ClientLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Pages publiques (import synchrone → SEO / LCP)
import Home            from "./pages/Home";
import Contact         from "./pages/Contact";
import Services        from "./pages/Services";
import DevisRequest    from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail   from "./pages/ProjectDetail";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";

// ── Espace client protégé (lazy)
const Dashboard          = lazy(() => import("./pages/Dashboard"));
const Transactions       = lazy(() => import("./pages/Transactions"));
const TransactionDetail  = lazy(() => import("./pages/TransactionDetail"));
const Notifications      = lazy(() => import("./pages/Notifications"));
const Profile            = lazy(() => import("./pages/Profile"));
const Favorites          = lazy(() => import("./pages/Favorites"));
const Settings           = lazy(() => import("./pages/Settings"));
const NotFound           = lazy(() => import("./pages/NotFound"));

// ── Nouvelles pages extraites du Dashboard
const ClientRequests     = lazy(() => import("./pages/ClientRequests"));
const ClientAppointments = lazy(() => import("./pages/ClientAppointments"));
const ClientDocuments    = lazy(() => import("./pages/ClientDocuments"));
const ClientLoan         = lazy(() => import("./pages/ClientLoan"));

const ClientLoader = () => (
  <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500 tracking-wide">Chargement…</span>
    </div>
  </div>
);

function ScrollToTopOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);
  return null;
}

export default function ClientAppRoutes() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <Suspense fallback={<ClientLoader />}>
        <Routes>

          {/* ── Redirection racine → vitrine ── */}
          <Route index element={<Navigate to="/vitrine" replace />} />

          {/* ── VITRINE PUBLIQUE ── */}
          <Route path="vitrine" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="contact" element={<Contact />} />
            <Route path="services" element={<Services />} />
            <Route path="devis" element={<DevisRequest />} />
            <Route path="devis/:propertyId" element={<DevisRequest />} />
            <Route path="propriete/:id" element={<PropertyDetails />} />
            <Route path="projet/:slug" element={<ProjectDetail />} />
          </Route>

          <Route path="connexion" element={<Login />} />
          <Route path="inscription" element={<Signup />} />

          {/* ── ALIAS SANS PRÉFIXE ── */}
          <Route path="dashboard" element={<Navigate to="/client/dashboard" replace />} />
          <Route path="transactions" element={<Navigate to="/client/transactions" replace />} />
          <Route path="transaction/:id" element={<Navigate to={`/client/transaction/${useLocation().pathname.split('/').pop()}`} replace />} />
          <Route path="notifications" element={<Navigate to="/client/notifications" replace />} />
          <Route path="profile" element={<Navigate to="/client/profile" replace />} />
          <Route path="favorites" element={<Navigate to="/client/favorites" replace />} />
          <Route path="settings" element={<Navigate to="/client/settings" replace />} />

          {/* ── ESPACE CLIENT PROTÉGÉ ── */}
          <Route path="client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="transaction/:id" element={<TransactionDetail />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="settings" element={<Settings />} />

            {/* Nouvelles routes fonctionnelles */}
            <Route path="requests" element={<ClientRequests />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="loan" element={<ClientLoan />} />
            <Route path="history" element={<Navigate to="transactions" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}