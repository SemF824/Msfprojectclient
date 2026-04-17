Tu es un expert sécurité React/TypeScript. Applique TOUTES ces corrections 
dans l'ordre exact indiqué. Garde le design existant intact.

--- CORRECTION 1 : Clés Supabase sans fallback hardcodé ---

Dans src/hooks/useSupabaseAuth.ts, remplace :
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://...'
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ...'
Par :
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requises')
  }

Applique la même correction dans src/config/supabase.config.ts.

--- CORRECTION 2 : Authentification réelle dans Header.tsx ---

Dans src/app/components/Header.tsx, remplace le state hardcodé 
  const [isLoggedIn, setIsLoggedIn] = useState(true)
par l'utilisation du hook Supabase :
  import { useSupabaseAuth } from '../../hooks/useSupabaseAuth'
  const { user, signOut } = useSupabaseAuth()
  const isLoggedIn = !!user

Remplace le nom affiché "Jean D." par :
  user?.email?.split('@')[0] ?? 'Mon compte'

Remplace le handler de déconnexion par :
  onClick={async () => { await signOut(); setIsUserMenuOpen(false); }}

--- CORRECTION 3 : ProtectedAdminRoute sans flash de contenu ---

Dans src/app/components/ProtectedAdminRoute.tsx, remplace l'architecture 
useEffect + navigate par un retour synchrone avec Navigate :

import { Navigate } from "react-router"
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth"

export default function ProtectedAdminRoute({ children }) {
  const { user, isAdmin, isLoading } = useSupabaseAuth()
  
  if (isLoading) {
    return <LoadingSpinner /> // le composant spinner existant
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />
  }
  
  return <>{children}</>
}

--- CORRECTION 4 : Double route "/" dans AdminApp.tsx ---

Dans src/app/AdminApp.tsx, il y a deux objets avec path: "/". 
Fusionne-les en un seul tableau de routes cohérent :

const adminRouter = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminLogin
  },
  {
    path: "/",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: AdminDashboard },
      { path: "demandes", Component: DemandesManagement },
      { path: "demandes/:id", Component: DemandeDetail },
      { path: "proprietes", element: <div>En développement</div> },
      { path: "clients", element: <div>En développement</div> },
      { path: "statistiques", element: <div>En développement</div> },
      { path: "parametres", element: <div>En développement</div> },
      { path: "*", Component: AdminNotFound }
    ]
  }
])

--- CORRECTION 5 : Sauvegarde DevisRequest dans Supabase ---

Dans src/app/pages/DevisRequest.tsx, remplace le handleSubmit par une
vraie insertion Supabase. Importe supabase depuis useSupabaseAuth.
Dans handleSubmit, après la validation, insère :

const { error } = await supabase
  .from('devis_requests')
  .insert([{
    client_first_name: formData.firstName,
    client_last_name: formData.lastName,
    client_email: formData.email,
    client_phone: formData.phone,
    client_alternate_phone: formData.alternatePhone || null,
    client_address: formData.address,
    client_city: formData.city,
    client_country: formData.country,
    client_profession: formData.profession,
    client_company: formData.company || null,
    property_id: property.id,
    property_name: property.title,
    property_price: property.price,
    request_type: formData.requestType,
    financing_needed: formData.financingNeeded,
    down_payment_amount: formData.downPaymentAmount 
      ? parseInt(formData.downPaymentAmount) : null,
    visit_date: formData.visitDate || null,
    visit_time: formData.visitTime || null,
    number_of_persons: parseInt(formData.numberOfPersons),
    message: formData.message || null,
    status: 'nouveau',
    priority: 'normale'
  }])

if (error) throw error
setIsSubmitted(true)

Entoure de try/catch et affiche un message d'erreur si échec.
Ajoute un state isSubmitting pour désactiver le bouton pendant l'envoi.

--- CORRECTION 6 : Headers sécurité dans netlify.toml ---

Remplace le contenu de netlify.toml par :

[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"

[[headers]]
  for = "/admin*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
    Cache-Control = "no-store, no-cache, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

--- CORRECTION 7 : Protection anti-spam formulaire contact ---

Dans src/app/pages/Contact.tsx, ajoute un rate limiting côté client 
basique. Juste avant l'insertion Supabase, ajoute cette vérification :

const lastSubmit = localStorage.getItem('last_contact_submit')
const now = Date.now()
if (lastSubmit && now - parseInt(lastSubmit) < 60000) {
  setSubmitError('Veuillez attendre 1 minute avant d\'envoyer un nouveau message.')
  setIsSubmitting(false)
  return
}

Après l'insertion réussie, ajoute :
localStorage.setItem('last_contact_submit', now.toString())

--- RÉSUMÉ FINAL ---

Après ces 7 corrections, vérifie que :
- Aucun fichier ne contient de clé Supabase hardcodée (ni en valeur ni en fallback)
- Header.tsx affiche le vrai utilisateur Supabase connecté
- AdminApp.tsx n'a qu'une seule route "/"
- DevisRequest.tsx insère bien en base de données
- netlify.toml a les headers X-Robots-Tag sur /admin*
- Le formulaire Contact a un délai anti-spam

Ne modifie pas le design, les animations Motion, ni les couleurs #0a0f1e/#d4af37.