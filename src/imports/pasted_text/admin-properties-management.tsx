Tu es un Lead Developer React/TypeScript senior travaillant sur le projet MSF Congo, une application immobilière de luxe déployée sur Vercel. Le projet utilise React 18, React Router v7, Tailwind CSS v4, Supabase, et Motion (Framer Motion). Tu dois résoudre plusieurs problèmes critiques dans l'ordre exact indiqué. Lis TOUT avant de commencer.

═══════════════════════════════════════════════════════════════
RÈGLES ABSOLUES
═══════════════════════════════════════════════════════════════

1. Donne TOUJOURS le fichier COMPLET, jamais de "..." ou "// reste inchangé"
2. N'invente JAMAIS de données fictives (mock data) dans les pages connectées à Supabase
3. Ne change PAS la structure du routing existant sauf si explicitement demandé
4. Utilise TOUJOURS les imports depuis "react-router" (v7), jamais "react-router-dom"
5. Toutes les routes admin sont préfixées /admin/* (ex: /admin/dashboard)
6. Toutes les routes client protégées sont sous /client/* (ex: /client/dashboard)
7. Le site public est sous /vitrine/* (ex: /vitrine, /vitrine/contact)
8. Le hook d'auth est dans src/hooks/useSupabaseAuth.ts — ne pas recréer
9. Le client Supabase s'importe via: import { supabase } from "../../hooks/useSupabaseAuth"
10. Préfixe CSS Tailwind only — pas de styled-components, pas de CSS modules

═══════════════════════════════════════════════════════════════
TÂCHE 1 — CORRIGER LE CLIGNOTEMENT DES CARDS (LAYOUT THRASHING)
═══════════════════════════════════════════════════════════════

PROBLÈME : Les grilles de 4 cards (2x2 ou 1x4) en stats clignotent au chargement
car Motion anime opacity+y avec des délais échelonnés PENDANT que le layout
calcule ses dimensions. Cela provoque un "flash of unstyled content".

CAUSE TECHNIQUE : `initial={{ opacity: 0, y: 20 }}` combiné à `transition={{ delay: index * 0.1 }}`
sur des éléments dans un CSS Grid force plusieurs reflows.

SOLUTION : Remplacer les animations individuelles par une animation de conteneur
avec staggerChildren, et ajouter `layout="position"` uniquement quand nécessaire.
Utiliser `whileInView` avec `once: true` et `amount: 0.1` pour déclencher tôt.

Applique cette correction dans ces fichiers (donne chaque fichier complet) :

A) src/app/pages/admin/AdminDashboard.tsx
   - Les 4 stat cards en haut clignotent
   - Solution : wrapper les 4 cards dans un motion.div avec variants stagger
   - Ajouter `layoutId` unique sur chaque card pour éviter le recalcul

B) src/app/pages/Dashboard.tsx (dashboard client)
   - Les stats overview clignotent
   - Même correction

C) src/app/components/Statistics.tsx
   - Les 4 stats sur la page d'accueil clignotent
   - Même correction

PATTERN À UTILISER (copier exactement) :

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// Wrapper de la grille :
<motion.div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
  variants={containerVariants}
  initial="hidden"
  animate="visible"   // ou whileInView="visible" selon le contexte
  viewport={{ once: true, amount: 0.1 }}
>
  {items.map((item, i) => (
    <motion.div key={i} variants={itemVariants}>
      {/* contenu */}
    </motion.div>
  ))}
</motion.div>
```

═══════════════════════════════════════════════════════════════
TÂCHE 2 — CRÉER LES PAGES MANQUANTES
═══════════════════════════════════════════════════════════════

Ces routes sont déclarées dans ClientAppRoutes.tsx et AdminAppRoutes.tsx
mais leurs composants sont des placeholders ou n'existent pas.
Crée chaque fichier COMPLET ci-dessous.

─────────────────────────────────────────────────
2A. src/app/pages/admin/PropertiesManagement.tsx
─────────────────────────────────────────────────

Page d'administration du catalogue de propriétés.
Connectée à la table Supabase "properties" (colonnes : id, title, location,
price, image, beds, baths, sqft, type, tag, status, created_at).

FONCTIONNALITÉS :
- Header avec titre "Catalogue Propriétés" + bouton "Ajouter une propriété"
- Grille de cards (pas de tableau) affichant les propriétés depuis Supabase
- Chaque card : image, titre, type, prix formaté en FCFA, statut badge,
  boutons Modifier/Supprimer (supprimer = superadmin seulement via userRole)
- Barre de filtres : recherche texte, filtre par type (villa/appartement/terrain),
  filtre par statut (disponible/reserve/vendu)
- État de chargement avec skeleton (4 cards grises animées pulse)
- État vide avec icône Building2 et message
- Modale d'ajout/édition (overlay plein écran) avec formulaire :
  champs : title (required), type (select), location (required),
  price (number required), beds (number), baths (number), sqft (number),
  tag (text), status (select : disponible/reserve/vendu),
  image_url (text, optionnel)
- La modale utilise supabase.from("properties").insert() ou .update()
- Toast de confirmation avec state local (pas de librairie externe)
- Pagination : 12 propriétés par page
- Import useSupabaseAuth pour récupérer userRole

DESIGN : cohérent avec AdminDashboard (fond blanc, bordures gray-200,
accent #d4af37, texte #0a0f1e)

─────────────────────────────────────────────────
2B. src/app/pages/admin/ClientsManagement.tsx
─────────────────────────────────────────────────

Page de gestion de la base clients.
Connectée à la vue Supabase auth.users via une table "profiles" (à créer
si inexistante, colonnes : id UUID ref auth.users, full_name, email, phone,
city, profession, company, created_at).

Si la table profiles n'existe pas, utiliser devis_requests pour déduire
les clients uniques par client_email.

FONCTIONNALITÉS :
- Header avec titre "Base Clients" + compteur total
- Tableau avec colonnes : Nom, Email, Téléphone, Ville, Demandes (#),
  Dernière activité, Actions
- Ligne cliquable → ouvre un panneau latéral (right drawer) avec détail :
  infos client, liste de ses demandes de devis (depuis devis_requests
  WHERE client_email = email), liste de ses documents (depuis documents
  WHERE user_id = id si disponible)
- Barre de recherche en temps réel (filtre côté client sur les données chargées)
- Export CSV : bouton qui génère un fichier CSV des données filtrées
  (utiliser Blob + URL.createObjectURL, pas de librairie)
- Badge de statut client dérivé du nombre de demandes :
  0 demandes = "Prospect" (gris), 1-2 = "Client" (bleu), 3+ = "VIP" (doré)

DESIGN : cohérent avec DemandesManagement

─────────────────────────────────────────────────
2C. src/app/pages/admin/StatistiquesPage.tsx
─────────────────────────────────────────────────

Page de statistiques et analytics.
Données calculées depuis Supabase en temps réel.

FONCTIONNALITÉS :
- 6 KPI cards en haut (2 rangées de 3) :
  * Total Demandes (COUNT devis_requests)
  * Demandes ce mois (COUNT WHERE created_at >= début du mois)
  * Valeur Potentielle (SUM property_price FROM devis_requests)
  * Taux d'Approbation (COUNT approuve / COUNT total * 100)
  * Documents Uploadés (COUNT documents)
  * Clients Uniques (COUNT DISTINCT client_email FROM devis_requests)

- Graphique "Demandes par Statut" : camembert simple SVG (pas de recharts)
  avec légende, couleurs : bleu=nouveau, jaune=en_cours,
  violet=documents, vert=approuve, rouge=rejete

- Graphique "Évolution mensuelle" : barres SVG simples (12 derniers mois)
  comptant les demandes par mois depuis devis_requests.created_at

- Tableau "Top Propriétés Demandées" : GROUP BY property_name,
  COUNT(*) AS nb_demandes, ORDER BY nb_demandes DESC LIMIT 10

- Sélecteur de période : "7 jours", "30 jours", "3 mois", "1 an"
  (filtre les données côté Supabase avec .gte('created_at', dateDebut))

GRAPHIQUES SVG : utiliser viewBox responsive, pas de librairie externe.
Les graphiques doivent être de vrais SVG calculés depuis les données,
pas des placeholders.

─────────────────────────────────────────────────
2D. src/app/pages/admin/ParametresPage.tsx
─────────────────────────────────────────────────

Page de paramètres système admin.
FONCTIONNALITÉS :
- Section "Mon Compte Admin" : affiche nom, email depuis useSupabaseAuth,
  bouton "Changer le mot de passe" (appelle supabase.auth.updateUser)
- Section "Notifications Admin" : toggles (state local) pour :
  * Email lors d'une nouvelle demande
  * Email lors d'un upload de document
  * SMS pour demandes haute priorité (UI seulement, pas de backend)
- Section "Sécurité" :
  * Badge "Authentification Supabase Active" (toujours vert)
  * Affichage de la table user_roles (lecture seule) : liste des admins
    depuis public.user_roles WHERE role IN ('admin','superadmin')
  * Bouton "Déconnexion de toutes les sessions" → supabase.auth.signOut({ scope: 'global' })
- Section "Données" :
  * Bouton "Exporter toutes les demandes" → CSV de devis_requests
  * Affichage date de dernière sauvegarde Supabase (placeholder)
- Design sobre, fond blanc, sections séparées par des bordures

═══════════════════════════════════════════════════════════════
TÂCHE 3 — MODULE COMPLET RÉCEPTION ET CONSULTATION DOCUMENTS ADMIN
═══════════════════════════════════════════════════════════════

Le fichier src/app/pages/admin/ClientsDocuments.tsx existe déjà
mais est incomplet. Remplace-le INTÉGRALEMENT.

CONTEXTE SUPABASE :
- Bucket : "msf-private-docs" (privé, RLS activé)
- Table : documents (id, user_id, name, type, size, url, storage_path,
  category, status, admin_comment, created_at)
- Categories : 'identity' | 'finance' | 'land_title' | 'other'
- Status : 'en_attente' | 'approuve' | 'rejete'
- Table profiles : id (= auth.users.id), full_name, email, phone

FONCTIONNALITÉS COMPLÈTES À IMPLÉMENTER :

1. RECHERCHE CLIENT
   - Input de recherche avec debounce 300ms
   - Recherche dans profiles par full_name.ilike ou email.ilike
   - Gestion UUID : si l'input matche /^[0-9a-f]{8}-...$/i → ajouter id.eq
   - Affichage liste autocomplete avec avatar initiales, nom, email
   - Clic → loadUserDocs(user) → charge tous ses documents

2. AFFICHAGE DOCUMENTS
   - Grille de cards (pas de tableau) avec :
     * Icône catégorie colorée (IdCard=bleu, Coins=vert, Landmark=orange, FolderOpen=gris)
     * Nom du fichier tronqué
     * Badges : catégorie + statut + taille + date
     * Badge statut coloré : en_attente=bleu, approuve=vert, rejete=rouge
     * Commentaire admin si présent (en italique orange)
   - Filtres par catégorie (boutons pills)
   - Compteur par catégorie dans le panneau latéral

3. ACTIONS SUR DOCUMENTS
   A) CONSULTER (URL SIGNÉE 120 SECONDES)
      - Bouton "Consulter" avec icône ExternalLink
      - Appel : supabase.storage.from("msf-private-docs").createSignedUrl(doc.storage_path, 120)
      - Si PDF → window.open(signedUrl, "_blank", "noopener,noreferrer")
      - Si image → modal de prévisualisation plein écran avec <img src={signedUrl}>
      - Si autre → propose le téléchargement via <a href={signedUrl} download>
      - Afficher spinner pendant la génération
      - Gestion d'erreur : message rouge si storage_path absent ou API error

   B) VALIDER
      - Bouton vert CheckCircle
      - supabase.from("documents").update({ status: "approuve", admin_comment: null }).eq("id", doc.id)
      - Mise à jour locale de l'état immédiate (optimistic update)
      - Toast vert "Document approuvé"

   C) REJETER avec COMMENTAIRE
      - Bouton orange AlertTriangle
      - Ouvre une mini modale inline (pas plein écran) avec :
        * Textarea "Raison du rejet" (placeholder: "Ex: Document illisible, veuillez renvoyer")
        * Bouton "Confirmer le rejet" + bouton "Annuler"
      - supabase.from("documents").update({ status: "rejete", admin_comment: raison }).eq("id", doc.id)
      - Toast orange "Document rejeté"

   D) SUPPRIMER (admin + superadmin)
      - Bouton rouge Trash2
      - Confirm dialog natif
      - 1. supabase.storage.from("msf-private-docs").remove([doc.storage_path])
      - 2. supabase.from("documents").delete().eq("id", doc.id)
      - Mise à jour locale immédiate
      - Toast rouge "Document supprimé"

4. MODAL DE PRÉVISUALISATION IMAGE
   - Overlay noir semi-transparent
   - Image centrée max 90vw × 85vh object-contain
   - En-tête : nom du fichier, catégorie, taille, "URL expire dans 120s"
   - Bouton fermer X en haut à droite
   - Bouton "Renouveler le lien" qui régénère une nouvelle URL signée
   - Bouton "Télécharger" (<a href={signedUrl} download={doc.name}>)
   - Clic sur overlay → ferme la modal

5. PANNEAU LATÉRAL DROIT
   - Rappel des procédures (liste à puces)
   - Légende des catégories avec icônes
   - Stats du dossier courant : count par catégorie, total
   - Si aucun client sélectionné : message "Recherchez un client..."

6. NOTIFICATIONS ET FEEDBACK
   - AnimatePresence pour les toasts (apparaissent en bas à droite)
   - Toast : icône + message + fermeture auto après 3s
   - Loader overlay pendant les actions longues (upload, delete)

7. SÉCURITÉ
   - Toujours vérifier que doc.storage_path existe avant createSignedUrl
   - Ne jamais exposer le storage_path dans l'UI
   - Les URLs signées ne sont jamais stockées en state permanent
   - Nettoyer les URLs d'objet (URL.revokeObjectURL) après utilisation

Voici le fichier COMPLET à produire :

```tsx
// src/app/pages/admin/ClientsDocuments.tsx
// FICHIER COMPLET — remplace l'existant intégralement
```

[L'IA doit écrire le fichier complet de ~600-800 lignes]

═══════════════════════════════════════════════════════════════
TÂCHE 4 — CORRIGER LES INCOHÉRENCES DE ROUTING
═══════════════════════════════════════════════════════════════

PROBLÈME : Certains fichiers utilisent des routes incohérentes.

Donne les fichiers COMPLETS corrigés pour :

A) src/app/AdminAppRoutes.tsx
   CORRECTION : Importer et utiliser PropertiesManagement, ClientsManagement,
   StatistiquesPage, ParametresPage au lieu des placeholders <div>.
   Les routes doivent être :
   - /admin → AdminLogin (index)
   - /admin/dashboard → AdminDashboard
   - /admin/demandes → DemandesManagement
   - /admin/demandes/:id → DemandeDetail
   - /admin/proprietes → PropertiesManagement (NOUVEAU)
   - /admin/clients → ClientsManagement (NOUVEAU)
   - /admin/documents → ClientsDocuments
   - /admin/statistiques → StatistiquesPage (NOUVEAU)
   - /admin/parametres → ParametresPage (NOUVEAU)
   - /admin/equipe → SuperAdminGuard + EquipePage (placeholder conservé)
   - /admin/systeme → SuperAdminGuard + SystemePage (placeholder conservé)
   - /admin/* → AdminNotFound

B) src/app/components/AdminLayout.tsx
   CORRECTION : Mettre à jour les hrefs de navigation pour correspondre
   aux routes /admin/... préfixées. Vérifier que TOUS les liens sidebar
   utilisent le bon préfixe /admin/.
   Logo → /admin/dashboard
   Sidebar items : /admin/dashboard, /admin/demandes, /admin/proprietes,
   /admin/clients, /admin/documents, /admin/statistiques, /admin/parametres
   Superadmin : /admin/equipe, /admin/systeme
   Déconnexion → navigate('/admin', { replace: true })
   Retour site → /vitrine

C) src/app/components/ProtectedAdminRoute.tsx
   CORRECTION SÉCURITÉ CRITIQUE :
   L'implémentation actuelle vérifie isAdmin depuis user_metadata.role
   qui est MODIFIABLE côté client (faille de sécurité).
   
   Remplacer par une vérification depuis la table public.user_roles :
```tsx
   // Au lieu de : const { user, isAdmin } = useSupabaseAuth()
   // Faire :
   useEffect(() => {
     if (!user) return;
     supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', user.id)
       .single()
       .then(({ data, error }) => {
         if (error || !data) {
           setIsAdminVerified(false);
         } else {
           setIsAdminVerified(['admin', 'superadmin'].includes(data.role));
         }
         setIsChecking(false);
       });
   }, [user]);
```
   
   Pendant la vérification → spinner "Vérification des droits..."
   Si non autorisé → navigate('/admin', { replace: true })

═══════════════════════════════════════════════════════════════
TÂCHE 5 — CORRIGER LES BUGS ET IMPORTS MANQUANTS
═══════════════════════════════════════════════════════════════

A) src/app/pages/Notifications.tsx
   CORRECTION : Ajouter l'import manquant de ArrowLeft depuis lucide-react.
   La ligne suivante est dans le JSX mais ArrowLeft n'est pas importé :
   <ArrowLeft className="w-4 h-4 rotate-180" />
   Donne le fichier COMPLET avec l'import ajouté.

B) src/hooks/useSupabaseAuth.ts
   CORRECTION SÉCURITÉ : Le hook expose isAdmin basé sur user_metadata.role.
   user_metadata est stocké côté client et peut être manipulé.
   
   CONSERVER l'interface existante mais ajouter une note dans le hook :
   "isAdmin ici est pour l'UI uniquement. La vraie vérification de sécurité
   se fait dans ProtectedAdminRoute via la table user_roles."
   
   Ajouter également une fonction utilitaire :
```ts
   const verifyAdminRole = async (): Promise<boolean> => {
     if (!supabase || !user) return false;
     const { data, error } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', user.id)
       .single();
     if (error || !data) return false;
     return ['admin', 'superadmin'].includes(data.role);
   };
```
   Et l'exposer dans le return du hook.

C) src/app/pages/admin/AdminLogin.tsx
   CORRECTION : La redirection après login pointe vers /admin/dashboard
   mais si Supabase n'est pas configuré ou que la table user_roles est vide,
   l'utilisateur est bloqué.
   
   Ajouter un fallback : si signIn réussit mais verifyAdminRole échoue,
   afficher un message d'erreur explicite :
   "Votre compte n'a pas les permissions administrateur.
    Contactez votre superadmin pour obtenir l'accès."
   
   Ne pas rediriger vers / dans ce cas, rester sur la page login.

═══════════════════════════════════════════════════════════════
TÂCHE 6 — METTRE À JOUR LE ROUTING DANS AdminAppRoutes.tsx
═══════════════════════════════════════════════════════════════

Maintenant que les nouvelles pages existent, mettre à jour
src/app/AdminAppRoutes.tsx avec les imports lazy de TOUTES les nouvelles pages.

IMPORTS À AJOUTER :
```tsx
const PropertiesManagement = lazy(() => import("./pages/admin/PropertiesManagement"));
const ClientsManagement    = lazy(() => import("./pages/admin/ClientsManagement"));
const StatistiquesPage     = lazy(() => import("./pages/admin/StatistiquesPage"));
const ParametresPage       = lazy(() => import("./pages/admin/ParametresPage"));
```

Donner le fichier AdminAppRoutes.tsx COMPLET mis à jour.

═══════════════════════════════════════════════════════════════
ORDRE D'EXÉCUTION OBLIGATOIRE
═══════════════════════════════════════════════════════════════

Exécute les tâches dans cet ordre strict :
1. Tâche 1 (anti-clignotement) → 3 fichiers
2. Tâche 5A (import manquant Notifications) → 1 fichier
3. Tâche 5B (hook useSupabaseAuth) → 1 fichier
4. Tâche 2A (PropertiesManagement) → 1 fichier
5. Tâche 2B (ClientsManagement) → 1 fichier
6. Tâche 2C (StatistiquesPage) → 1 fichier
7. Tâche 2D (ParametresPage) → 1 fichier
8. Tâche 3 (ClientsDocuments complet) → 1 fichier
9. Tâche 4A (AdminAppRoutes) → 1 fichier
10. Tâche 4B (AdminLayout) → 1 fichier
11. Tâche 4C (ProtectedAdminRoute) → 1 fichier
12. Tâche 5C (AdminLogin) → 1 fichier
13. Tâche 6 (AdminAppRoutes final) → 1 fichier (si différent de 4A)

═══════════════════════════════════════════════════════════════
RAPPELS TECHNIQUES IMPORTANTS
═══════════════════════════════════════════════════════════════

SUPABASE CLIENT : toujours vérifier que supabase n'est pas null avant usage
```ts
if (!supabase) {
  console.error("Supabase non initialisé");
  return;
}
```

NETTOYAGE MÉMOIRE : dans tous les useEffect avec fetch Supabase :
```ts
useEffect(() => {
  let isMounted = true;
  // ... fetch
  return () => { isMounted = false; };
}, []);
```

TYPES : utiliser (data as any) avec parcimonie — préférer les types définis
dans src/types/database.types.ts

TAILWIND : ne pas utiliser de classes dynamiques comme `bg-${color}-500`
car Tailwind ne peut pas les purger. Utiliser des objets de mapping :
```ts
const colorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  // ...
};
```

IMPORTS MOTION : utiliser "motion/react" (pas "framer-motion")
```ts
import { motion, AnimatePresence } from "motion/react";
```

FORMAT PRIX : utiliser systématiquement
```ts
new Intl.NumberFormat('fr-FR').format(price) + " FCFA"
```

BUCKET STORAGE : le bucket admin s'appelle "msf-private-docs"
Le client upload dans le même bucket.
L'admin génère des URLs signées de 120 secondes (plus long que client = 60s).