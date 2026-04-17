import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Transactions = lazy(() => import("./pages/Transactions"));
const TransactionDetail = lazy(() => import("./pages/TransactionDetail"));
const DevisRequest = lazy(() => import("./pages/DevisRequest"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// CLIENT ROUTES - Site public MSF Congo
const clientRouter = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home
      },
      {
        path: "propriete/:id",
        Component: PropertyDetails
      },
      {
        path: "projet/:slug",
        Component: ProjectDetail
      },
      {
        path: "services",
        Component: Services
      },
      {
        path: "contact",
        Component: Contact
      },
      {
        path: "transactions",
        Component: Transactions
      },
      {
        path: "transaction/:id",
        Component: TransactionDetail
      },
      {
        path: "devis/:propertyId",
        Component: DevisRequest
      },
      {
        path: "profile",
        Component: Profile
      },
      {
        path: "favorites",
        Component: Favorites
      },
      {
        path: "notifications",
        Component: Notifications
      },
      {
        path: "settings",
        Component: Settings
      },
      {
        path: "*",
        Component: NotFound
      }
    ]
  },
  {
    path: "/connexion",
    Component: Login
  },
  {
    path: "/inscription",
    Component: Signup
  },
  {
    path: "/dashboard",
    Component: Dashboard
  },
  {
    path: "*",
    Component: NotFound
  }
]);

export default function ClientApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={clientRouter} />
      </Suspense>
    </ErrorBoundary>
  );
}
