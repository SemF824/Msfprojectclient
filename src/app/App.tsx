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
 * En développement local :
 * - http://localhost:5173/ → CLIENT APP
 * - http://localhost:5173/?admin=true → ADMIN APP
 * 
 * En production :
 * - Déployer CLIENT APP sur : msfcongo.com
 * - Déployer ADMIN APP sur : admin.msfcongo.com
 */

export default function App() {
  const [appType, setAppType] = useState<'client' | 'admin'>('client');

  useEffect(() => {
    // Détection de l'application à charger
    const hostname = window.location.hostname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // En production : Détecter par sous-domaine
    if (hostname.startsWith('admin.')) {
      setAppType('admin');
    }
    // En développement : Détecter par query param
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
