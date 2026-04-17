import { RouterProvider, createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PropertyDetails from "./pages/PropertyDetails";
import ProjectDetail from "./pages/ProjectDetail";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import DevisRequest from "./pages/DevisRequest";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

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
  }
]);

export default function ClientApp() {
  return <RouterProvider router={clientRouter} />;
}
