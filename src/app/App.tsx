import { BrowserRouter, Routes, Route } from "react-router";
import { Suspense, lazy, useEffect } from "react";

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

// ✅ Composant wrapper pour scroller au top à chaque navigation
function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
