Tu es un expert React/TypeScript. Applique ces corrections UX/UI dans l'ordre exact. Ne modifie pas le design, les couleurs #0a0f1e/#d4af37, ni les animations Motion.
CORRECTION 1 : Dashboard.tsx — Remplacer le user hardcodé
Remplace le mock user par les vraies données Supabase :
tsximport { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

// Supprime :
const user = { name: "Jean Dupont", email: "jean.dupont@email.com", phone: "+242 06 XXX XXXX", avatar: "" };

// Ajoute en haut du composant :
const { user: authUser } = useSupabaseAuth();
const displayName = authUser?.user_metadata?.full_name 
  || authUser?.email?.split('@')[0] 
  || 'Utilisateur';
const displayEmail = authUser?.email || '';
Remplace toutes les références à user.name par displayName, et user.email par displayEmail dans le JSX du Dashboard.
Dans le titre de bienvenue, remplace :
tsx{user.name.split(' ')[0]}
par :
tsx{displayName.split(' ')[0]}
Dans la sidebar (infos profil) :
tsx// Remplace
<h3>{user.name}</h3>
<p>{user.email}</p>
// Par
<h3>{displayName}</h3>
<p>{displayEmail}</p>
CORRECTION 2 : Profile.tsx — State initial dynamique
Importe useSupabaseAuth et initialise le formData avec les vraies données :
tsximport { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

const { user: authUser } = useSupabaseAuth();

const [formData, setFormData] = useState({
  firstName: authUser?.user_metadata?.first_name || "",
  lastName: authUser?.user_metadata?.last_name || "",
  email: authUser?.email || "",
  phone: authUser?.user_metadata?.phone || "",
  alternatePhone: "",
  address: "",
  city: "",
  country: "Congo-Brazzaville",
  profession: "",
  company: "",
  dateOfBirth: "",
  idNumber: "",
});
Dans la sidebar du profil, remplace les valeurs hardcodées du nom/email par :
tsx<h3>{formData.firstName || authUser?.email?.split('@')[0] || 'Utilisateur'} {formData.lastName}</h3>
<p>{formData.email || authUser?.email}</p>
CORRECTION 3 : Header.tsx — Afficher le nom complet si disponible
Remplace l'affichage du nom dans le bouton user menu :
tsx// Remplace
<span>{user?.email?.split('@')[0] ?? 'Mon compte'}</span>

// Par
<span>
  {user?.user_metadata?.full_name 
    || user?.user_metadata?.first_name 
    || user?.email?.split('@')[0] 
    || 'Mon compte'}
</span>
Dans le dropdown, remplace aussi :
tsx<p className="text-[#0a0f1e] font-semibold">
  {user?.user_metadata?.full_name 
    || user?.user_metadata?.first_name 
    || user?.email?.split('@')[0] 
    || 'Utilisateur'}
</p>
<p className="text-sm text-gray-600">{user?.email ?? ''}</p>
CORRECTION 4 : Bouton retour Home dans les pages connectées
Dans Dashboard.tsx, ajoute un lien "Retour au site" dans la sidebar, après le logo/avatar et avant la navigation :
tsx<Link 
  to="/"
  className="flex items-center gap-2 px-4 py-2 mb-4 text-sm text-gray-500 hover:text-[#d4af37] transition-colors border border-gray-200 rounded-xl hover:border-[#d4af37]/50"
>
  <Home className="w-4 h-4" />
  <span>Retour au site</span>
</Link>
Dans Profile.tsx, Favorites.tsx, Notifications.tsx, Settings.tsx, Transactions.tsx — dans le breadcrumb en haut de page, ajoute un lien home avant le lien "Retour au Dashboard" :
tsx<div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
  <Link to="/" className="hover:text-[#d4af37] transition-colors">Accueil</Link>
  <span>/</span>
  <Link to="/dashboard" className="hover:text-[#d4af37] transition-colors">Dashboard</Link>
  <span>/</span>
  <span className="text-[#0a0f1e]">Page actuelle</span>
</div>
Remplace le simple bouton "Retour au Dashboard" existant par ce fil d'Ariane.
CORRECTION 5 : Skeleton loading pendant le chargement du profil
Dans Dashboard.tsx, ajoute un guard sur isLoading :
tsxconst { user: authUser, isLoading } = useSupabaseAuth();

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
Applique le même guard dans Profile.tsx.
CORRECTION 6 : Signup.tsx — Sauvegarder le nom en user_metadata
Dans Signup.tsx, remplace le handleSubmit par une vraie inscription Supabase qui sauvegarde le nom :
tsximport { supabase } from "../../hooks/useSupabaseAuth";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { error } = await supabase.auth.signUp({
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
    if (error) throw error;
    navigate("/dashboard");
  } catch (error: any) {
    console.error('Signup error:', error.message);
  }
};
