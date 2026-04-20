Tu es un expert React/TypeScript/Supabase. Applique toutes ces corrections dans l'ordre exact. Ne modifie pas le design (couleurs #0a0f1e/#d4af37, animations Motion, layout général).
CORRECTION 1 : Sécurité critique — Supprimer les clés hardcodées
Le fichier utils/supabase/info.tsx contient la clé anon Supabase en clair dans le repo. Il faut que useSupabaseAuth.ts et supabase.config.ts utilisent ce fichier comme fallback sécurisé en dev uniquement.
Dans src/hooks/useSupabaseAuth.ts, remplace la création du client par :
typescriptimport { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;
Cela permet à l'app de fonctionner en dev sans .env (le fichier info.tsx est auto-généré par Make) tout en laissant les variables d'env prendre le dessus en production Vercel. Le fichier utils/supabase/info.tsx est déjà dans le repo et versionné — on l'utilise donc comme source de vérité dev.
Applique la même logique dans src/config/supabase.config.ts.
Crée un fichier .env.example à la racine :
env# Variables d'environnement MSF Congo
# Copier ce fichier en .env et remplir les valeurs

VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_ici

# Google Maps (pour la carte Contact et PropertyDetails)
VITE_GOOGLE_MAPS_API_KEY=votre_clé_google_maps_ici
CORRECTION 2 : Corriger les clignotements (flickering) sur la page Home
Les clignotements sont causés par deux choses : les animations whileInView qui se re-déclenchent si once est absent ou si le composant re-render, et le backdrop-blur qui force des repaints GPU sur Vercel Edge.
Dans tous les composants suivants : Statistics.tsx, About.tsx, Vision.tsx, Projects.tsx, Expertise.tsx, FeaturedProperties.tsx, PropertyFilter.tsx — assure-toi que chaque motion.div avec whileInView a bien viewport={{ once: true }} et ajoute will-change: transform via Tailwind (will-change-transform) sur les éléments qui animent.
Dans FeaturedProperties.tsx, remplace les 6 motion.div de la grille par :
tsx<motion.div
  key={property.id}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ delay: index * 0.1, duration: 0.4 }}
  className="group relative bg-white/5 ... will-change-transform"
>
Dans Statistics.tsx, ajoute layout="position" sur les cards pour éviter les reflows :
tsx<motion.div
  key={index}
  layout="position"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.1 }}
Dans src/app/pages/Home.tsx, importe et wraps chaque section avec Suspense individuel pour éviter les layout shifts lors du lazy loading :
tsximport { lazy, Suspense } from "react";

// Les composants Home sont déjà importés statiquement — laisse-les ainsi
// Mais ajoute une div stable pour éviter le cumulative layout shift :

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="min-h-[200px]"><Statistics /></div>
      <div className="min-h-[400px]"><About /></div>
      <div className="min-h-[400px]"><Vision /></div>
      <div className="min-h-[600px]"><Projects /></div>
      <div className="min-h-[400px]"><Expertise /></div>
      <PropertyFilter />
      <FeaturedProperties />
    </div>
  );
}
CORRECTION 3 : Google Maps dans Contact.tsx
Remplace la section "Map Placeholder" dans src/app/pages/Contact.tsx par un vrai composant Google Maps qui lit la clé API depuis les variables d'environnement.
Ajoute ce composant dans Contact.tsx, juste avant le return :
tsxconst GoogleMap = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="h-80 bg-gray-100 relative flex items-center justify-center rounded-xl">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
          <p className="text-[#0a0f1e] mb-2 font-medium">Carte Interactive</p>
          <p className="text-sm text-gray-600">1 place Antonetti, 7ème étage</p>
          <p className="text-sm text-gray-600">Pointe-Noire, Congo</p>
          <p className="text-xs text-gray-400 mt-2">Configurez VITE_GOOGLE_MAPS_API_KEY pour activer</p>
        </div>
      </div>
    );
  }

  // Coordonnées de la Place Antonetti, Pointe-Noire
  const lat = -4.7759;
  const lng = 11.8634;
  
  return (
    <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Place+Antonetti+Pointe-Noire+Congo&zoom=15&language=fr`}
        allowFullScreen
        title="Localisation MSF Congo"
      />
    </div>
  );
};
Remplace ensuite la div "Map Placeholder" par <GoogleMap /> dans la section "Map & Office Info".
Dans PropertyDetails.tsx, remplace la section "Carte Interactive" par le même composant mais avec la propriété en paramètre :
tsxconst PropertyMap = ({ location }: { location: string }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="w-12 h-12 text-[#d4af37] mx-auto mb-2" />
          <p className="text-gray-600">Carte Interactive</p>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location + ' Pointe-Noire Congo')}&zoom=14&language=fr`}
        allowFullScreen
        title={`Localisation ${location}`}
      />
    </div>
  );
};
CORRECTION 4 : Dashboard.tsx — Supprimer Jean Dupont hardcodé
Dans src/app/pages/Dashboard.tsx, supprime le mock user et utilise Supabase Auth :
tsximport { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export default function Dashboard() {
  const { user: authUser, isLoading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Guard de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Données dynamiques depuis Supabase
  const displayName = authUser?.user_metadata?.full_name 
    || authUser?.user_metadata?.first_name
    || authUser?.email?.split('@')[0] 
    || 'Utilisateur';
  const displayEmail = authUser?.email || '';
Supprime entièrement le bloc const user = { name: "Jean Dupont", ... }.
Dans le JSX du Dashboard, remplace toutes les occurrences de user.name par displayName et user.email par displayEmail.
Dans la sidebar :
tsx{/* Avant : */}
<h3 className="text-[#0a0f1e] text-lg font-semibold">{user.name}</h3>
<p className="text-gray-600 text-sm">{user.email}</p>

{/* Après : */}
<h3 className="text-[#0a0f1e] text-lg font-semibold">{displayName}</h3>
<p className="text-gray-600 text-sm">{displayEmail}</p>
Dans le titre de bienvenue :
tsx{/* Avant : */}
<span className="text-transparent ...">{user.name.split(' ')[0]}</span>

{/* Après : */}
<span className="text-transparent ...">{displayName.split(' ')[0]}</span>
CORRECTION 5 : Profile.tsx — Supprimer les données hardcodées
Dans src/app/pages/Profile.tsx, remplace les valeurs initiales du state par des données Supabase :
tsximport { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export default function Profile() {
  const { user: authUser, isLoading } = useSupabaseAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    country: "Congo-Brazzaville",
    profession: "",
    company: "",
    dateOfBirth: "",
    idNumber: "",
  });

  // Pré-remplir avec les données Supabase quand disponibles
  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        firstName: authUser.user_metadata?.first_name || "",
        lastName: authUser.user_metadata?.last_name || "",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
        city: authUser.user_metadata?.city || "",
      }));
    }
  }, [authUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
Importe useEffect depuis React. Dans la sidebar du profil :
tsx<h3 className="text-2xl text-[#0a0f1e] font-semibold mb-1">
  {formData.firstName || authUser?.email?.split('@')[0] || 'Utilisateur'} {formData.lastName}
</h3>
<p className="text-gray-600 mb-1">{formData.profession || 'Profil à compléter'}</p>
CORRECTION 6 : Header.tsx — Afficher le vrai nom
Dans src/app/components/Header.tsx, dans le bouton user menu (desktop), remplace :
tsx{/* Avant : */}
<span className="text-sm text-[#0a0f1e] font-medium">{user?.email?.split('@')[0] ?? 'Mon compte'}</span>

{/* Après : */}
<span className="text-sm text-[#0a0f1e] font-medium">
  {user?.user_metadata?.full_name 
    || user?.user_metadata?.first_name 
    || user?.email?.split('@')[0] 
    || 'Mon compte'}
</span>
Dans le dropdown, remplace les deux occurrences du nom affiché :
tsx{/* Avant : */}
<p className="text-[#0a0f1e] font-semibold">{user?.email?.split('@')[0] ?? 'Utilisateur'}</p>
<p className="text-sm text-gray-600">{user?.email ?? ''}</p>

{/* Après : */}
<p className="text-[#0a0f1e] font-semibold">
  {user?.user_metadata?.full_name 
    || user?.user_metadata?.first_name 
    || user?.email?.split('@')[0] 
    || 'Utilisateur'}
</p>
<p className="text-sm text-gray-600">{user?.email ?? ''}</p>
CORRECTION 7 : Signup.tsx — Sauvegarder en Supabase
Dans src/app/pages/Signup.tsx, importe Supabase et remplace le handleSubmit :
tsximport { supabase } from "../../hooks/useSupabaseAuth";

const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError("Les mots de passe ne correspondent pas");
    return;
  }
  
  setIsLoading(true);
  setError("");
  
  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          city: formData.city,
        }
      }
    });
    
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    
    navigate("/dashboard");
  } catch (err: any) {
    setError("Erreur lors de l'inscription. Veuillez réessayer.");
  } finally {
    setIsLoading(false);
  }
};
Dans le JSX, affiche l'erreur avant le bouton :
tsx{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
    {error}
  </div>
)}

<button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl ... disabled:opacity-50 disabled:cursor-not-allowed">
  {isLoading ? (
    <>
      <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
      Création en cours...
    </>
  ) : (
    <>
      <span className="font-medium">Créer mon Compte</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </>
  )}
</button>
CORRECTION 8 : Bouton "Retour à l'accueil" dans les pages connectées
Dans src/app/pages/Dashboard.tsx, dans la sidebar juste après le bloc profil user et avant la nav principale, ajoute :
tsx{/* Retour au site public */}
<div className="mb-4 pb-4 border-b border-gray-200">
  <Link 
    to="/"
    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#d4af37] transition-colors rounded-xl hover:bg-gray-50"
  >
    <Home className="w-4 h-4" />
    <span>← Retour au site</span>
  </Link>
</div>
Dans src/app/pages/Profile.tsx, Favorites.tsx, Notifications.tsx, Settings.tsx, Transactions.tsx — remplace le fil d'ariane existant "Retour au Dashboard" par un breadcrumb complet :
tsx{/* Remplace l'actuel <Link to="/dashboard"> par : */}
<nav className="flex items-center gap-2 mb-4 text-sm">
  <Link to="/" className="text-gray-500 hover:text-[#d4af37] transition-colors">
    Accueil
  </Link>
  <span className="text-gray-300">/</span>
  <Link to="/dashboard" className="text-gray-500 hover:text-[#d4af37] transition-colors">
    Dashboard
  </Link>
  <span className="text-gray-300">/</span>
  <span className="text-[#0a0f1e] font-medium">
    {/* Nom de la page courante : Mon Profil / Mes Favoris / Notifications / Paramètres / Transactions */}
  </span>
</nav>
CORRECTION 9 : Sécurité base de données Supabase — Script SQL
Crée un fichier database/security_fix.sql avec ce script à exécuter dans le SQL Editor Supabase pour sécuriser les rôles admin :
sql-- ============================================================
-- CORRECTION SÉCURITÉ : Vérification admin côté serveur
-- Le role dans user_metadata est modifiable côté client !
-- Cette fonction utilise la table user_roles (plus sécurisée)
-- ============================================================

-- 1. S'assurer que la table user_roles existe (du fichier security_policies.sql)
-- Si pas encore créée, créer l'utilisateur admin manuellement :

-- Obtenir l'UUID de l'admin :
-- SELECT id FROM auth.users WHERE email = 'votre-admin@email.com';

-- Insérer le rôle admin (remplacer UUID_ICI par le vrai UUID) :
-- INSERT INTO public.user_roles (user_id, role, created_by)
-- VALUES ('UUID_ICI', 'admin', 'UUID_ICI')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 2. Vérification : le hook useSupabaseAuth.ts utilise user_metadata.role
-- Pour une sécurité maximale, ajouter cette policy Supabase pour que
-- les routes admin vérifient la table user_roles et non user_metadata :

-- Créer une fonction RLS sécurisée pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$;

-- Appliquer sur devis_requests : seuls les admins peuvent tout voir
CREATE POLICY "Admins can read all devis_requests via user_roles"
ON public.devis_requests
FOR SELECT
TO authenticated
USING (
  client_email = auth.jwt()->>'email'
  OR public.check_is_admin()
);

-- Appliquer sur contact_requests
CREATE POLICY "Admins can read all contact_requests via user_roles"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (
  email = auth.jwt()->>'email'
  OR public.check_is_admin()
);

-- 3. Mettre à jour user_metadata pour cohérence visuelle côté client
-- (le hook useSupabaseAuth vérifie user_metadata.role pour l'UI,
--  mais les policies Supabase vérifient la table user_roles pour la sécurité réelle)

-- Pour chaque admin, s'assurer que les deux sont synchronisés :
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'superadmin')
);
Ajoute un commentaire dans src/hooks/useSupabaseAuth.ts pour documenter la double vérification :
typescript// SÉCURITÉ : isAdmin vérifie user_metadata.role pour l'UI (côté client)
// Les policies Supabase (RLS) vérifient public.user_roles pour la sécurité réelle
// Les deux doivent être synchronisés via le script database/security_fix.sql
const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'superadmin';
CORRECTION 10 : Variables d'environnement Vercel
Dans le fichier DEPLOIEMENT.md, ajoute une section Vercel en haut :
markdown## 🔑 Variables d'Environnement Vercel

Dans Vercel > Settings > Environment Variables, ajouter :

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| VITE_SUPABASE_URL | https://kkrfqweqapnhcnjlzmvm.supabase.co | Production, Preview, Dev |
| VITE_SUPABASE_ANON_KEY | votre_clé_anon | Production, Preview, Dev |
| VITE_GOOGLE_MAPS_API_KEY | votre_clé_google_maps | Production, Preview, Dev |

Pour Google Maps API :
1. Aller sur https://console.cloud.google.com
2. Activer l'API "Maps Embed API"
3. Créer une clé API
4. Restreindre la clé à votre domaine Vercel (*.vercel.app + votre domaine custom)
5. Copier la clé dans la variable VITE_GOOGLE_MAPS_API_KEY sur Vercel