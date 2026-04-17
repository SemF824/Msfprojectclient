import { useEffect, useState } from "react";
import ClientApp from "./ClientApp";
import AdminApp from "./AdminApp";

/**
 * MSF CONGO - Point d'Entrée Principal
 * 
 * Ce fichier détecte automatiquement quelle application charger :
 * - CLIENT APP : Site public (www.msfcongo.com ou msfcongo.com)
 * - ADMIN APP : BackOffice (admin.msfcongo.com)
 * 
 * Accès ADMIN APP :
 * - http://votre-site.com/admin → ADMIN APP
 * - http://votre-site.com/?admin=true → ADMIN APP
 * - http://admin.votre-site.com → ADMIN APP
 * 
 * Accès CLIENT APP :
 * - http://votre-site.com/ → CLIENT APP
 */

export default function App() {
  const [appType, setAppType] = useState<'client' | 'admin'>('client');

  useEffect(() => {
    // Détection de l'application à charger
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Méthode 1 : Sous-domaine admin.msfcongo.com
    if (hostname.startsWith('admin.')) {
      setAppType('admin');
    }
    // Méthode 2 : Chemin /admin
    else if (pathname.startsWith('/admin')) {
      setAppType('admin');
    }
    // Méthode 3 : Query param ?admin=true
    else if (searchParams.get('admin') === 'true') {
      setAppType('admin');
    }
    // Par défaut : Client
    else {
      setAppType('client');
    }
  }, []);

  // Afficher l'application appropriée
  if (appType === 'admin') {
    return <AdminApp />;
  }

  return <ClientApp />;
}