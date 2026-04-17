import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./components/AdminLayout";

// Lazy load all admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DemandesManagement = lazy(() => import("./pages/admin/DemandesManagement"));
const DemandeDetail = lazy(() => import("./pages/admin/DemandeDetail"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminNotFound = lazy(() => import("./pages/admin/AdminNotFound"));

// Loading component for admin
const AdminLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement de l'administration...</p>
    </div>
  </div>
);

// ADMIN ROUTES - BackOffice MSF Congo
const adminRouter = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminLogin
  },
  {
    path: "/",
    element: <Navigate to="/admin" replace />
  },
  {
    path: "/",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        path: "dashboard",
        Component: AdminDashboard
      },
      {
        path: "demandes",
        Component: DemandesManagement
      },
      {
        path: "demandes/:id",
        Component: DemandeDetail
      },
      {
        path: "proprietes",
        element: <div className="p-8 text-center text-gray-500">Page Propriétés - En développement</div>
      },
      {
        path: "clients",
        element: <div className="p-8 text-center text-gray-500">Page Clients - En développement</div>
      },
      {
        path: "statistiques",
        element: <div className="p-8 text-center text-gray-500">Page Statistiques - En développement</div>
      },
      {
        path: "parametres",
        element: <div className="p-8 text-center text-gray-500">Page Paramètres - En développement</div>
      },
      {
        path: "*",
        Component: AdminNotFound
      }
    ]
  }
]);

export default function AdminApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AdminLoadingScreen />}>
        <RouterProvider router={adminRouter} />
      </Suspense>
    </ErrorBoundary>
  );
}