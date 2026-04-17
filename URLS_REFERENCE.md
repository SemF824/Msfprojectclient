# 🔗 MSF Congo - Référence Complète des URLs

## 🌐 Site en Production Netlify

Remplacez `msf-congo.netlify.app` par votre vraie URL Netlify.

---

## 📱 SITE CLIENT (Public)

### Pages Principales

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `https://msf-congo.netlify.app/` | Page d'accueil avec projets phares |
| **Services** | `https://msf-congo.netlify.app/services` | Nos services immobiliers |
| **Contact** | `https://msf-congo.netlify.app/contact` | Formulaire de contact |

### Projets

| Projet | URL | Description |
|--------|-----|-------------|
| **Villa Tchikobo** | `https://msf-congo.netlify.app/projet/villa-tchikobo` | Résidence de luxe 10 villas |
| **Ocean Boulevard** | `https://msf-congo.netlify.app/projet/ocean-boulevard` | Complexe front de mer |
| **Les Eucalyptus** | `https://msf-congo.netlify.app/projet/les-eucalyptus` | Villas de charme |
| **Côte Sauvage** | `https://msf-congo.netlify.app/projet/cote-sauvage` | Résidence pieds dans l'eau |
| **Marina Luxe** | `https://msf-congo.netlify.app/projet/marina-luxe` | Studios premium marina |

### Propriétés (Exemples)

| Propriété | URL | Description |
|-----------|-----|-------------|
| **Villa Tchikobo #5** | `https://msf-congo.netlify.app/propriete/tchikobo-villa-5` | Villa 5 chambres |
| **Penthouse Ocean** | `https://msf-congo.netlify.app/propriete/ocean-penthouse` | Penthouse 450m² |
| **Villa Eucalyptus** | `https://msf-congo.netlify.app/propriete/eucalyptus-villa` | Villa jardin |
| **Appt T4 Côte Sauvage** | `https://msf-congo.netlify.app/propriete/cote-sauvage-t4` | Appartement T4 |
| **Studio Marina** | `https://msf-congo.netlify.app/propriete/marina-studio` | Studio 45m² |

### Demandes de Devis

| Action | URL | Description |
|--------|-----|-------------|
| **Devis Villa Tchikobo** | `https://msf-congo.netlify.app/devis/tchikobo-villa-5` | Formulaire 7 étapes |
| **Devis Penthouse** | `https://msf-congo.netlify.app/devis/ocean-penthouse` | Demande de devis |
| **Devis Eucalyptus** | `https://msf-congo.netlify.app/devis/eucalyptus-villa` | Demande de devis |

### Espace Utilisateur (Après connexion)

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `https://msf-congo.netlify.app/dashboard` | Tableau de bord utilisateur |
| **Profil** | `https://msf-congo.netlify.app/profile` | Profil utilisateur |
| **Favoris** | `https://msf-congo.netlify.app/favorites` | Propriétés favorites |
| **Transactions** | `https://msf-congo.netlify.app/transactions` | Historique transactions |
| **Notifications** | `https://msf-congo.netlify.app/notifications` | Notifications |
| **Paramètres** | `https://msf-congo.netlify.app/settings` | Paramètres compte |

### Authentification

| Page | URL | Description |
|------|-----|-------------|
| **Connexion** | `https://msf-congo.netlify.app/connexion` | Page de connexion client |
| **Inscription** | `https://msf-congo.netlify.app/inscription` | Page d'inscription |

---

## 🔧 ADMIN (BackOffice)

### 🔐 Accès Admin (3 Méthodes)

| Méthode | URL | Notes |
|---------|-----|-------|
| **Méthode 1** | `https://msf-congo.netlify.app/admin` | ✅ **RECOMMANDÉ** |
| **Méthode 2** | `https://msf-congo.netlify.app/?admin=true` | Via query param |
| **Méthode 3** | Clic "Admin" dans footer du site | Via navigation |

### Identifiants

```
📧 Email    : admin@msfcongo.com
🔑 Password : admin123
```

### Pages Admin (Après connexion)

| Page | URL | Description |
|------|-----|-------------|
| **Login** | `https://msf-congo.netlify.app/admin` | Page de connexion admin |
| **Dashboard** | `https://msf-congo.netlify.app/dashboard` | Dashboard admin |
| **Demandes** | `https://msf-congo.netlify.app/demandes` | Liste demandes de devis |
| **Détail REQ-001** | `https://msf-congo.netlify.app/demandes/REQ-001` | Détail demande |
| **Détail REQ-002** | `https://msf-congo.netlify.app/demandes/REQ-002` | Détail demande |
| **Propriétés** | `https://msf-congo.netlify.app/proprietes` | Gestion propriétés |
| **Clients** | `https://msf-congo.netlify.app/clients` | Base clients |
| **Statistiques** | `https://msf-congo.netlify.app/statistiques` | Analytics |
| **Paramètres** | `https://msf-congo.netlify.app/parametres` | Paramètres système |

---

## 🧪 URLs de Test (Développement Local)

### Site Client

| Page | URL Locale |
|------|-----------|
| **Accueil** | `http://localhost:5173/` |
| **Propriété** | `http://localhost:5173/propriete/tchikobo-villa-5` |
| **Devis** | `http://localhost:5173/devis/tchikobo-villa-5` |
| **Dashboard** | `http://localhost:5173/dashboard` |

### Admin

| Page | URL Locale |
|------|-----------|
| **Login Admin** | `http://localhost:5173/admin` |
| **Login Admin (alt)** | `http://localhost:5173/?admin=true` |
| **Dashboard Admin** | `http://localhost:5173/dashboard` (après login) |
| **Demandes** | `http://localhost:5173/demandes` (après login) |

---

## 📋 URLs pour Tests Automatisés

### Tests E2E (Cypress, Playwright)

```javascript
// Site Client
const CLIENT_URLS = {
  home: 'https://msf-congo.netlify.app/',
  property: 'https://msf-congo.netlify.app/propriete/tchikobo-villa-5',
  quote: 'https://msf-congo.netlify.app/devis/tchikobo-villa-5',
  services: 'https://msf-congo.netlify.app/services',
  contact: 'https://msf-congo.netlify.app/contact'
};

// Admin
const ADMIN_URLS = {
  login: 'https://msf-congo.netlify.app/admin',
  dashboard: 'https://msf-congo.netlify.app/dashboard',
  requests: 'https://msf-congo.netlify.app/demandes',
  requestDetail: 'https://msf-congo.netlify.app/demandes/REQ-001'
};

// Credentials
const ADMIN_CREDS = {
  email: 'admin@msfcongo.com',
  password: 'admin123'
};
```

---

## 🔗 URLs API (Supabase)

### Backend Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| **Supabase API** | `https://PROJECT_ID.supabase.co` | API Supabase |
| **Storage** | `https://PROJECT_ID.supabase.co/storage/v1` | Stockage fichiers |
| **Auth** | `https://PROJECT_ID.supabase.co/auth/v1` | Authentification |

---

## 📱 Deep Links (Mobile/QR Codes)

### QR Codes pour Marketing

| Action | URL | Usage |
|--------|-----|-------|
| **Accueil** | `https://msf-congo.netlify.app/` | Flyers, cartes de visite |
| **Villa Tchikobo** | `https://msf-congo.netlify.app/projet/villa-tchikobo` | Panneau sur site |
| **Contact** | `https://msf-congo.netlify.app/contact` | Brochures |
| **Devis Rapide** | `https://msf-congo.netlify.app/devis/tchikobo-villa-5` | Campagne ads |

---

## 🌍 URLs avec Sous-domaines (Optionnel)

### Si vous configurez un domaine personnalisé

| Sous-domaine | URL | Application |
|--------------|-----|-------------|
| **WWW** | `https://www.msfcongo.com` | Site client |
| **Principal** | `https://msfcongo.com` | Site client (redirect) |
| **Admin** | `https://admin.msfcongo.com` | BackOffice admin |
| **API** | `https://api.msfcongo.com` | API (si custom) |

---

## 🔍 Sitemap (Pour SEO)

### Structure du site client

```
https://msf-congo.netlify.app/
├── /
├── /services
├── /contact
├── /projet/
│   ├── /projet/villa-tchikobo
│   ├── /projet/ocean-boulevard
│   ├── /projet/les-eucalyptus
│   ├── /projet/cote-sauvage
│   └── /projet/marina-luxe
├── /propriete/
│   ├── /propriete/tchikobo-villa-5
│   ├── /propriete/ocean-penthouse
│   ├── /propriete/eucalyptus-villa
│   ├── /propriete/cote-sauvage-t4
│   └── /propriete/marina-studio
└── /devis/
    ├── /devis/tchikobo-villa-5
    └── /devis/[propertyId]
```

### Structure de l'admin

```
https://msf-congo.netlify.app/admin
├── /admin (login)
├── /dashboard
├── /demandes
├── /demandes/[requestId]
├── /proprietes
├── /clients
├── /statistiques
└── /parametres
```

---

## 📊 URLs Analytiques

### Google Analytics / Plausible

**Pages à tracker prioritairement :**

1. `/` - Page d'accueil
2. `/projet/*` - Pages projets
3. `/propriete/*` - Pages propriétés
4. `/devis/*` - Formulaires de devis
5. `/contact` - Contact

**Goals/Conversions :**
- Formulaire devis soumis
- Contact envoyé
- Propriété mise en favoris

---

## 🎯 Raccourcis pour Partage

### URLs courtes à retenir

| Destination | URL Simple | Redirige vers |
|-------------|-----------|---------------|
| **Admin** | `/admin` | Page login admin |
| **Devis** | `/devis/tchikobo-villa-5` | Formulaire devis Villa Tchikobo |
| **Contact** | `/contact` | Formulaire contact |

---

## 🛠️ URLs de Debug

### En cas de problème

| Test | URL | Ce qu'elle doit afficher |
|------|-----|--------------------------|
| **App Type Detection** | `/?admin=true` | Page login admin |
| **Router Client** | `/propriete/test-404` | 404 ou page par défaut |
| **Router Admin** | `/demandes/test-404` | 404 admin ou redirection |

---

## 📖 Documentation URLs

| Documentation | Lien |
|---------------|------|
| **Architecture** | `/ARCHITECTURE.md` |
| **Accès Admin** | `/ACCES_ADMIN.md` |
| **Déploiement** | `/DEPLOIEMENT.md` |
| **Vérifications** | `/VERIFICATIONS.md` |
| **README** | `/README.md` |

---

## 🔄 Redirections (À configurer si domaine personnalisé)

```nginx
# Redirections recommandées
www.msfcongo.com         → msfcongo.com
msfcongo.com/home        → msfcongo.com/
msfcongo.com/admin-login → msfcongo.com/admin
```

---

## 📞 Contact URLs

| Type | URL/Info |
|------|----------|
| **Email** | `mailto:promotions@msfcongo.com` |
| **Téléphone 1** | `tel:+242064588618` |
| **Téléphone 2** | `tel:+242055877324` |
| **Google Maps** | `https://maps.google.com/?q=1+place+Antonetti+Pointe-Noire+Congo` |

---

## ✅ Checklist URLs

Avant mise en production, vérifiez :

- [ ] Toutes les URLs client fonctionnent
- [ ] Toutes les URLs admin fonctionnent
- [ ] Redirections configurées
- [ ] HTTPS activé partout
- [ ] Pas de liens cassés (404)
- [ ] Deep links fonctionnent sur mobile
- [ ] QR codes testés
- [ ] SEO meta tags ajoutés

---

© 2024 MSF Congo - Roger ROC 🇨🇬
