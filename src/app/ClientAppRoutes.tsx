import { Routes, Route, Navigate, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Pages publiques (import synchrone → SEO / LCP) ──────────────────────────
import Home            from "./pages/Home";
import Contact         from "./pages/Contact";
import Services        from "./pages/Services";
import DevisRequest    from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail   from "./pages/ProjectDetail";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";

// ── Espace client protégé (lazy) ─────────────────────────────────────────────
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Transactions      = lazy(() => import("./pages/Transactions"));
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"));
const Notifications     = lazy(() => import("./pages/Notifications"));
const Profile           = lazy(() => import("./pages/Profile"));
const Favorites         = lazy(() => import("./pages/Favorites"));
const Settings          = lazy(() => import("./pages/Settings"));
const NotFound          = lazy(() => import("./pages/NotFound"));

const ClientLoader = () => (
  <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500 tracking-wide">Chargement…</span>
    </div>
  </div>
);

// ✅ Composant pour scroller au top lors du changement de route
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

          {/* ── Redirection racine → vitrine ──────────────────────────────────── */}
          <Route index element={<Navigate to="/vitrine" replace />} />

          {/* ═════════════════════════════════════════════════════════════════════
              VITRINE PUBLIQUE  —  préfixe /vitrine
          ════════════════════════════════════════════════════════════════════ */}
          <Route path="vitrine" element={<Layout />}>
            <Route index                   element={<Home />} />
            <Route path="contact"          element={<Contact />} />
            <Route path="services"         element={<Services />} />
            <Route path="devis"            element={<DevisRequest />} />
            <Route path="devis/:propertyId" element={<DevisRequest />} />
            <Route path="propriete/:id"    element={<PropertyDetails />} />
            <Route path="projet/:slug"     element={<ProjectDetail />} />
          </Route>

          {/* ── Routes autonomes (sans Layout public) ─────────────────────────── */}
          <Route path="connexion"  element={<Login />} />
          <Route path="inscription" element={<Signup />} />

          {/* ═════════════════════════════════════════════════════════════════════
              ESPACE CLIENT PROTÉGÉ  —  préfixe /client
          ════════════════════════════════════════════════════════════════════ */}
          <Route path="client">
            <Route
              path="dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="transactions"
              element={<ProtectedRoute><Transactions /></ProtectedRoute>}
            />
            <Route
              path="transactions/:id"
              element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>}
            />
            <Route
              path="notifications"
              element={<ProtectedRoute><Notifications /></ProtectedRoute>}
            />
            <Route
              path="profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="favorites"
              element={<ProtectedRoute><Favorites /></ProtectedRoute>}
            />
            <Route
              path="settings"
              element={<ProtectedRoute><Settings /></ProtectedRoute>}
            />
          </Route>

          {/* ── Catch-all ─────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </>
  );
}
