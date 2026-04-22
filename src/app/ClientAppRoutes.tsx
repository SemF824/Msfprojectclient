import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // IMPORT VITAL

// Pages publiques
import Home            from "./pages/Home";
import Contact         from "./pages/Contact";
import Services        from "./pages/Services";
import DevisRequest    from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail   from "./pages/ProjectDetail";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";

// Pages Client protégées (Lazy loadées)
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Transactions      = lazy(() => import("./pages/Transactions"));
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"));
const Notifications     = lazy(() => import("./pages/Notifications"));
const Profile           = lazy(() => import("./pages/Profile"));
const Favorites         = lazy(() => import("./pages/Favorites"));
const Settings          = lazy(() => import("./pages/Settings"));
const NotFound          = lazy(() => import("./pages/NotFound"));

const ClientLoader = () => (
  <div className="min-h-screen pt-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function ClientAppRoutes() {
  return (
    <Suspense fallback={<ClientLoader />}>
      <Routes>
        {/* Routes avec Header et Footer */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="contact"  element={<Contact />} />
          <Route path="services" element={<Services />} />
          <Route path="devis"              element={<DevisRequest />} />
          <Route path="devis/:propertyId"  element={<DevisRequest />} />
          <Route path="propriete/:id"  element={<PropertyDetails />} />
          <Route path="projet/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Routes autonomes */}
        <Route path="connexion"  element={<Login />} />
        <Route path="inscription" element={<Signup />} />

        {/* Espace Client Protégé */}
        <Route path="dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="transactions"       element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="transactions/:id"   element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="notifications"      element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="favorites"          element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="settings"           element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
