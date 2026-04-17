import { RouterProvider, createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DemandesManagement from "./pages/admin/DemandesManagement";
import DemandeDetail from "./pages/admin/DemandeDetail";
import AdminLogin from "./pages/admin/AdminLogin";

// ADMIN ROUTES - BackOffice MSF Congo
const adminRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/login",
    Component: AdminLogin
  },
  {
    path: "/",
    Component: AdminLayout,
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
      }
    ]
  }
]);

export default function AdminApp() {
  return <RouterProvider router={adminRouter} />;
}
