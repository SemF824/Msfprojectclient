Il faut arrêter d'essayer de "tricher" en montant deux applications distinctes. Une application React robuste n'utilise qu'un seul BrowserRouter à la racine, qui distribue ensuite le trafic vers les bonnes branches.

Voici le plan chirurgical pour réunifier ton projet et éliminer définitivement l'écran noir.

1. Réunification dans App.tsx
On supprime la fausse séparation asynchrone. On met un seul BrowserRouter et on utilise les <Routes> pour séparer les mondes.

Fichier à remplacer intégralement : src/app/App.tsx

TypeScript
import { BrowserRouter, Routes, Route, Navigate } from "react-router"; // Modifié react-router-dom -> react-router si tu utilises v7
import { Suspense, lazy } from "react";

// Fallback global de chargement
const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[#d4af37] font-semibold tracking-wider animate-pulse">MSF CONGO</p>
  </div>
);

// Lazy loading des deux branches principales pour optimiser les performances
const ClientAppRoutes = lazy(() => import("./ClientAppRoutes"));
const AdminAppRoutes = lazy(() => import("./AdminAppRoutes"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          {/* TOUT ce qui commence par /admin est géré par la branche Admin */}
          <Route path="/admin/*" element={<AdminAppRoutes />} />
          
          {/* TOUT le reste est géré par la branche Client */}
          <Route path="/*" element={<ClientAppRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
2. Transformation de AdminApp.tsx en AdminAppRoutes.tsx
L'AdminApp ne doit plus contenir de <BrowserRouter>. Elle devient un simple sous-ensemble de routes.

Renomme AdminApp.tsx en AdminAppRoutes.tsx et remplace son contenu :

TypeScript
import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import AdminLayout from "./components/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Lazy imports des pages admin
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DemandesManagement = lazy(() => import("./pages/admin/DemandesManagement"));
const DemandeDetail = lazy(() => import("./pages/admin/DemandeDetail"));
const AdminNotFound = lazy(() => import("./pages/admin/AdminNotFound"));

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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="demandes" element={<DemandesManagement />} />
          <Route path="demandes/:id" element={<DemandeDetail />} />
          <Route path="proprietes" element={<div className="p-8"><h1 className="text-2xl font-bold">Catalogue Propriétés</h1><p className="mt-4 text-gray-500">Module en construction...</p></div>} />
          {/* Routes de placeholders */}
          <Route path="clients" element={<div className="p-8">Clients</div>} />
          <Route path="statistiques" element={<div className="p-8">Statistiques</div>} />
          <Route path="parametres" element={<div className="p-8">Paramètres</div>} />
          <Route path="equipe" element={<div className="p-8">Équipe</div>} />
          <Route path="systeme" element={<div className="p-8">Système</div>} />
          
          {/* Fallback Admin */}
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
3. Transformation de ClientApp.tsx en ClientAppRoutes.tsx
Même logique pour l'espace client.

Renomme ClientApp.tsx en ClientAppRoutes.tsx et remplace son contenu :

TypeScript
import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

// Pages publiques
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import DevisRequest from "./pages/DevisRequest";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Pages Client protégées
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <Route path="contact" element={<Contact />} />
          <Route path="services" element={<Services />} />
          <Route path="devis" element={<DevisRequest />} />
          <Route path="propriete/:id" element={<PropertyDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Routes autonomes (Auth et Dashboards persos) */}
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<Signup />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="favorites" element={<Favorites />} />
      </Routes>
    </Suspense>
  );
}