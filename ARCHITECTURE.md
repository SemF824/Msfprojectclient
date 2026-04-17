# MSF CONGO - Architecture Séparée Client/Admin

## 📋 Vue d'Ensemble

Ce projet MSF Congo est composé de **DEUX applications distinctes** qui partagent la même base de données Supabase :

### 🌐 **CLIENT APP** - Site Public
- **URL Production** : `https://msfcongo.com` ou `https://www.msfcongo.com`
- **URL Dev** : `http://localhost:5173/`
- **Public** : Visiteurs, clients, prospects
- **Fonctionnalités** :
  - Catalogue de propriétés
  - Demande de devis en ligne
  - Espace client (profil, favoris, transactions)
  - Notifications

### 🔧 **ADMIN APP** - BackOffice
- **URL Production** : `https://admin.msfcongo.com`
- **URL Dev** : `http://localhost:5173/?admin=true`
- **Restreint** : Personnel MSF Congo uniquement
- **Fonctionnalités** :
  - Dashboard analytique
  - Gestion demandes de devis
  - Validation documents
  - Base clients
  - Statistiques ventes

---

## 🏗️ Structure du Projet

```
📁 /src
├── 📱 /app
│   ├── App.tsx                      ⚡ Point d'entrée (détecte quelle app charger)
│   ├── ClientApp.tsx                🌐 Application CLIENT (routes publiques)
│   ├── AdminApp.tsx                 🔧 Application ADMIN (routes admin)
│   │
│   ├── 📁 /components
│   │   ├── Layout.tsx               🌐 Layout CLIENT
│   │   ├── AdminLayout.tsx          🔧 Layout ADMIN
│   │   ├── Header.tsx               🌐 Header CLIENT
│   │   └── Footer.tsx               🌐 Footer CLIENT
│   │
│   ├── 📁 /pages
│   │   ├── Home.tsx                 🌐 Page d'accueil CLIENT
│   │   ├── PropertyDetails.tsx     🌐 Détails propriété CLIENT
│   │   ├── DevisRequest.tsx        🌐 Formulaire devis CLIENT
│   │   ├── Dashboard.tsx            🌐 Dashboard utilisateur CLIENT
│   │   ├── Profile.tsx              🌐 Profil CLIENT
│   │   ├── ... (autres pages client)
│   │   │
│   │   └── 📁 /admin
│   │       ├── AdminLogin.tsx       🔧 Connexion ADMIN
│   │       ├── AdminDashboard.tsx   🔧 Dashboard ADMIN
│   │       ├── DemandesManagement.tsx 🔧 Liste demandes ADMIN
│   │       └── DemandeDetail.tsx    🔧 Détail demande ADMIN
│   │
│   └── routes.tsx                   ❌ DEPRECATED (remplacé par ClientApp/AdminApp)
│
├── 📁 /config
│   └── supabase.config.ts           🔗 Configuration PARTAGÉE Supabase
│
└── 📁 /utils
    └── /supabase
        └── info.tsx                 🔗 Identifiants Supabase (partagés)
```

---

## 🔄 Flux de Routing

### App.tsx (Point d'Entrée)

```typescript
// Détection automatique de l'application
if (hostname.startsWith('admin.')) {
  // Charger ADMIN APP
  return <AdminApp />;
} else {
  // Charger CLIENT APP
  return <ClientApp />;
}
```

### En Développement Local

| URL | Application Chargée |
|-----|---------------------|
| `http://localhost:5173/` | 🌐 CLIENT APP |
| `http://localhost:5173/?admin=true` | 🔧 ADMIN APP |

### En Production

| Domaine | Application Chargée |
|---------|---------------------|
| `msfcongo.com` | 🌐 CLIENT APP |
| `www.msfcongo.com` | 🌐 CLIENT APP |
| `admin.msfcongo.com` | 🔧 ADMIN APP |

---

## 🗄️ Base de Données Partagée

Les deux applications utilisent **la même instance Supabase** :

### Tables Communes

| Table | Utilisée par | Description |
|-------|--------------|-------------|
| `devis_requests` | CLIENT + ADMIN | Demandes de devis |
| `users` | CLIENT + ADMIN | Utilisateurs (clients + admins) |
| `kv_store_3c1961a2` | CLIENT + ADMIN | Propriétés (KV store) |
| `documents` | CLIENT + ADMIN | Documents uploadés |
| `transactions` | CLIENT + ADMIN | Historique transactions |
| `admin_notes` | ADMIN uniquement | Notes internes |
| `timeline_events` | ADMIN uniquement | Historique événements |

### Permissions (RLS - Row Level Security)

```sql
-- CLIENT : Peut voir/modifier UNIQUEMENT ses propres données
CREATE POLICY "client_own_data" ON devis_requests
  FOR SELECT USING (auth.uid() = client_id);

-- ADMIN : Peut voir/modifier TOUTES les données
CREATE POLICY "admin_all_data" ON devis_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'agent', 'superadmin')
    )
  );
```

### Buckets de Stockage

| Bucket | Utilisé par | Contenu |
|--------|-------------|---------|
| `make-3c1961a2-documents` | CLIENT + ADMIN | CNI, justificatifs, etc. |
| `make-3c1961a2-properties` | ADMIN | Photos propriétés |
| `make-3c1961a2-avatars` | CLIENT | Photos de profil |

---

## 🚀 Déploiement

### Option 1 : Déploiement Simple (Même Serveur)

Déployer les deux apps sur le même serveur avec détection par sous-domaine.

**Configuration Nginx :**
```nginx
# CLIENT APP
server {
    server_name msfcongo.com www.msfcongo.com;
    root /var/www/msfcongo/client;
    # Servir index.html qui charge ClientApp
}

# ADMIN APP
server {
    server_name admin.msfcongo.com;
    root /var/www/msfcongo/admin;
    # Servir index.html qui charge AdminApp
}
```

### Option 2 : Déploiement Séparé (Recommandé)

Créer **deux projets de build distincts**.

#### Build CLIENT
```bash
# Dans package.json, créer un script
"build:client": "vite build --mode client"

# Fichier .env.client
VITE_APP_TYPE=client
```

#### Build ADMIN
```bash
# Dans package.json, créer un script
"build:admin": "vite build --mode admin"

# Fichier .env.admin
VITE_APP_TYPE=admin
```

Modifier `App.tsx` pour lire la variable d'environnement :
```typescript
const appType = import.meta.env.VITE_APP_TYPE || 'client';
```

### Déploiement sur Vercel/Netlify

#### CLIENT APP
- **Repository** : `msfcongo-client`
- **Build Command** : `npm run build:client`
- **Domain** : `msfcongo.com`

#### ADMIN APP
- **Repository** : `msfcongo-admin`
- **Build Command** : `npm run build:admin`
- **Domain** : `admin.msfcongo.com`

---

## 🔐 Sécurité

### CLIENT APP
- ✅ Authentification Supabase (email/password)
- ✅ RLS : Utilisateur voit uniquement ses données
- ✅ Pas d'accès aux notes admin
- ✅ Pas d'accès aux autres clients

### ADMIN APP
- ✅ Authentification renforcée (2FA recommandé)
- ✅ Vérification rôle admin dans Supabase
- ✅ Accès à TOUTES les demandes
- ✅ Validation documents
- ✅ Notes internes
- ✅ Logs d'activité

### Protection Routes Admin (À Implémenter)

```typescript
// Dans AdminApp.tsx
const ProtectedRoute = ({ children }) => {
  const { user } = useSupabaseAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

---

## 📊 Flux de Données Typique

### 1️⃣ Client Demande un Devis

```
CLIENT APP (/devis/:propertyId)
    ↓
Formulaire rempli
    ↓
INSERT dans devis_requests (Supabase)
    ↓
Email notification → Admin
    ↓
ADMIN APP (/admin/demandes)
    ↓
Admin voit nouvelle demande
```

### 2️⃣ Admin Valide une Demande

```
ADMIN APP (/admin/demandes/REQ-001)
    ↓
Change statut → "En Cours"
    ↓
UPDATE devis_requests (Supabase)
    ↓
INSERT timeline_event
    ↓
Email notification → Client
    ↓
CLIENT APP (/notifications)
    ↓
Client voit notification
```

### 3️⃣ Upload Document

```
CLIENT APP (/devis/:propertyId)
    ↓
Upload CNI.pdf
    ↓
STORAGE Supabase (make-3c1961a2-documents)
    ↓
INSERT documents table
    ↓
ADMIN APP (/admin/demandes/REQ-001)
    ↓
Admin voit document
    ↓
Valide ✅ ou Rejette ❌
    ↓
UPDATE documents.status
```

---

## 🧪 Testing

### CLIENT APP
```bash
# Lancer en mode client
npm run dev

# Tester
http://localhost:5173/
http://localhost:5173/propriete/tchikobo-villa-5
http://localhost:5173/devis/tchikobo-villa-5
```

### ADMIN APP
```bash
# Lancer en mode admin
npm run dev

# Tester
http://localhost:5173/?admin=true
# Login: admin@msfcongo.com / admin123
http://localhost:5173/?admin=true#/dashboard
http://localhost:5173/?admin=true#/demandes
```

---

## 📝 Variables d'Environnement

### Partagées (les deux apps)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### CLIENT uniquement
```env
VITE_APP_NAME=MSF Congo
VITE_SUPPORT_EMAIL=contact@msfcongo.com
```

### ADMIN uniquement
```env
VITE_APP_NAME=MSF Congo Admin
VITE_ADMIN_EMAIL=admin@msfcongo.com
VITE_LOG_LEVEL=debug
```

---

## 🔧 Maintenance

### Ajouter une Page CLIENT
```typescript
// 1. Créer /src/app/pages/NouvelePage.tsx
// 2. Importer dans ClientApp.tsx
import NouvelePage from "./pages/NouvelePage";

// 3. Ajouter route
{
  path: "nouvelle-page",
  Component: NouvelePage
}
```

### Ajouter une Page ADMIN
```typescript
// 1. Créer /src/app/pages/admin/NouvellePage.tsx
// 2. Importer dans AdminApp.tsx
import NouvellePage from "./pages/admin/NouvellePage";

// 3. Ajouter route
{
  path: "nouvelle-page",
  Component: NouvellePage
}
```

### Mettre à Jour la Config Partagée
```typescript
// Modifier /src/config/supabase.config.ts
export const supabaseConfig = {
  // Ajouter nouvelles tables, types, helpers
};
```

---

## 📞 Support

### CLIENT APP
- Email : contact@msfcongo.com
- Téléphone : +242 06 458 86 18

### ADMIN APP
- Email : admin@msfcongo.com
- Support technique : tech@msfcongo.com

---

## 📜 Licence

© 2024 MSF Congo - Tous droits réservés

**Roger ROC** - Développements Immobiliers de Luxe à Pointe-Noire, Congo
