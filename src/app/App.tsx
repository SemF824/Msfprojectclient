import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "sonner";
import CookieConsent from "./components/CookieConsent";
import { CurrencyProvider } from "../context/CurrencyContext";
import { LanguageProvider } from "../context/LanguageContext";

// Fallback global de chargement
const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[#d4af37] font-semibold tracking-wider animate-pulse">
      MSF CONGO
    </p>
  </div>
);

// Lazy loading des deux branches principales pour optimiser les performances
const ClientAppRoutes = lazy(() => import("./ClientAppRoutes"));
const AdminAppRoutes = lazy(() => import("./AdminAppRoutes"));

// Composant réactif pour scroller au top à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CurrencyProvider>
          {/* Écouteur de navigation globale */}
          <ScrollToTop />

          {/* Gestionnaire de notifications global de l'application */}
          <Toaster position="top-right" richColors closeButton />

          {/* Bannière de consentement pour les cookies (RGPD/CCPA) */}
          <CookieConsent />

          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              {/* TOUT ce qui commence par /admin est géré par la branche Admin */}
              <Route path="/admin/*" element={<AdminAppRoutes />} />

              {/* TOUT le reste est géré par la branche Client */}
              <Route path="/*" element={<ClientAppRoutes />} />
            </Routes>
          </Suspense>
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}