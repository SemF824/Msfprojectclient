import { Routes, Route, Navigate, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import Layout from "./components/Layout";
import ClientLayout from "./components/ClientLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages publiques (import synchrone pour optimisation SEO et LCP)
import Home            from "./pages/Home";
import Contact         from "./pages/Contact";
import Services        from "./pages/Services";
import DevisRequest    from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail   from "./pages/ProjectDetail";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";
import Properties      from "./pages/Properties";
import About           from "./pages/About";

// Espace client protégé (lazy loading)
const Dashboard          = lazy(() => import("./pages/Dashboard"));
const Transactions       = lazy(() => import("./pages/Transactions"));
const TransactionDetail  = lazy(() => import("./pages/TransactionDetail"));
const Notifications      = lazy(() => import("./pages/Notifications"));
const Profile            = lazy(() => import("./pages/Profile"));
const Favorites          = lazy(() => import("./pages/Favorites"));
const Settings           = lazy(() => import("./pages/Settings"));
const NotFound           = lazy(() => import("./pages/NotFound"));

// Nouvelles pages métiers extraites
const ClientRequests     = lazy(() => import("./pages/ClientRequests"));
const ClientAppointments = lazy(() => import("./pages/ClientAppointments"));
const ClientDocuments    = lazy(() => import("./pages/ClientDocuments"));
const ClientLoan         = lazy(() => import("./pages/ClientLoan"));

const ClientLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function ClientAppRoutes() {
  const location = useLocation();

  // Scroll to top fluide automatique à chaque transition de route
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <Suspense fallback={<ClientLoader />}>
      <Routes>
        {/* ROUTES PUBLIQUES (Avec Layout Global) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="devis-request" element={<DevisRequest />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* ESPACE CLIENT PROTÉGÉ (Avec ClientLayout dédié) */}
        <Route path="client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
          {/* Redirection automatique vers le dashboard si aucun sous-chemin n'est spécifié */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          
          {/* Uniformisation de l'accès aux détails d'une transaction */}
          <Route path="transactions/:id" element={<TransactionDetail />} />
          
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />
          
          <Route path="requests" element={<ClientRequests />} />
          <Route path="appointments" element={<ClientAppointments />} />
          <Route path="documents" element={<ClientDocuments />} />
          <Route path="loan" element={<ClientLoan />} />
        </Route>

        {/* Redirections legacy sécurisées vers le nouvel espace client imbriqué */}
        <Route path="dashboard" element={<Navigate to="/client/dashboard" replace />} />
        <Route path="transactions" element={<Navigate to="/client/transactions" replace />} />
        <Route path="notifications" element={<Navigate to="/client/notifications" replace />} />
        <Route path="profile" element={<Navigate to="/client/profile" replace />} />
        <Route path="favorites" element={<Navigate to="/client/favorites" replace />} />
        <Route path="settings" element={<Navigate to="/client/settings" replace />} />

        {/* Capture des routes orphelines */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}