import ClientApp from "./ClientApp";
import AdminApp from "./AdminApp";

/**
 * MSF CONGO - Point d'Entrée Principal
 *
 * Détection SYNCHRONE (pas de useEffect) pour éviter :
 * - Le flash visuel (ClientApp qui monte puis se démonte)
 * - La double instanciation des routeurs React Router
 *
 * Accès ADMIN APP :
 * - http://admin.msfcongo.com → ADMIN APP
 * - http://votre-site.com/admin* → ADMIN APP
 *
 * Accès CLIENT APP :
 * - Tout autre chemin → CLIENT APP
 */

function getInitialAppType(): 'client' | 'admin' {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Méthode 1 : Sous-domaine admin.msfcongo.com
  if (hostname.startsWith('admin.')) {
    return 'admin';
  }
  // Méthode 2 : Chemin /admin*
  if (pathname.startsWith('/admin')) {
    return 'admin';
  }
  return 'client';
}

export default function App() {
  // Calcul synchrone : zéro re-render, zéro flash
  const appType = getInitialAppType();

  if (appType === 'admin') {
    return <AdminApp />;
  }

  return <ClientApp />;
}