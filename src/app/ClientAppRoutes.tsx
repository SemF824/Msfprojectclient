import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

// Pages publiques (Imports synchrones pour le SEO/LCP)
import Home            from "./pages/Home";
import Contact         from "./pages/Contact";
import Services        from "./pages/Services";
import DevisRequest    from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail   from "./pages/ProjectDetail"; // RESTAURÉ
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";

// Pages Client protégées (Lazy loadées)
const Dashboard         = lazy(() => import("./pages/Dashboard"));
const Transactions      = lazy(() => import("./pages/Transactions"));
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"));
const Notifications     = lazy(() => import("./pages/Notifications"));
const Profile           = lazy(() => import("./pages/Profile"));
const Favorites         = lazy(() => import("./pages/Favorites"));
const Settings          = lazy(() => import("./pages/Settings")); // RESTAURÉ
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

          {/* RESTAURÉ : Passage de paramètre obligatoire ou optionnel pour les devis */}
          <Route path="devis"              element={<DevisRequest />} />
          <Route path="devis/:propertyId"  element={<DevisRequest />} />

          <Route path="propriete/:id"  element={<PropertyDetails />} />

          {/* RESTAURÉ : Route des projets */}
          <Route path="projet/:slug" element={<ProjectDetail />} />

          {/* Catch-all Layout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Routes autonomes (Sans Header/Footer public) */}
        <Route path="connexion"  element={<Login />} />
        <Route path="inscription" element={<Signup />} />

        {/* Espace Client */}
        <Route path="dashboard"          element={<Dashboard />} />
        <Route path="transactions"       element={<Transactions />} />
        <Route path="transactions/:id"   element={<TransactionDetail />} />
        <Route path="notifications"      element={<Notifications />} />
        <Route path="profile"            element={<Profile />} />
        <Route path="favorites"          element={<Favorites />} />
        <Route path="settings"           element={<Settings />} /> {/* RESTAURÉ */}
      </Routes>
    </Suspense>
  );
}
