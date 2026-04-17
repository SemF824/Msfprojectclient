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
 * Accès ADMIN APP sécurisé :
 * - http://votre-site.com/admin → ADMIN APP (avec vérification Supabase Auth + rôle)
 * - http://admin.votre-site.com → ADMIN APP (avec vérification Supabase Auth + rôle)
 *
 * Accès CLIENT APP :
 * - http://votre-site.com/ → CLIENT APP
 *
 * SÉCURITÉ : L'accès admin nécessite une authentification Supabase valide
 * avec le rôle "admin" dans user_metadata. La vérification côté client
 * est doublée par ProtectedAdminRoute qui redirige vers /admin si non autorisé.
 */

export default function App() {
  const [appType, setAppType] = useState<'client' | 'admin'>('client');

  useEffect(() => {
    // Détection de l'application à charger
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Méthode 1 : Sous-domaine admin.msfcongo.com
    if (hostname.startsWith('admin.')) {
      setAppType('admin');
    }
    // Méthode 2 : Chemin /admin
    else if (pathname.startsWith('/admin')) {
      setAppType('admin');
    }
    // Par défaut : Client
    else {
      setAppType('client');
    }
  }, []);

  // Afficher l'application appropriée
  // Note: AdminApp utilise ProtectedAdminRoute pour vérifier l'authentification Supabase
  if (appType === 'admin') {
    return <AdminApp />;
  }

  return <ClientApp />;
}