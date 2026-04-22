# 🏢 MSF CONGO - Site Immobilier Luxe

Site web immobilier moderne et futuriste pour **MSF Congo** (Roger ROC), spécialisé dans les développements côtiers haut de gamme à Pointe-Noire, Congo.

## 🎯 Deux Applications en Une 2.2

Ce projet contient **DEUX applications distinctes** qui partagent la même base de données :

### 🌐 **CLIENT APP** - Site Public
Interface client pour consulter les propriétés et faire des demandes de devis.

### 🔧 **ADMIN APP** - BackOffice
Interface de gestion pour le personnel MSF Congo.

---

## 🚀 Accès Rapide

### Site Client (Public)
```
https://votre-site.netlify.app/
```

### Admin (BackOffice)
```
https://votre-site.netlify.app/admin
```

**Identifiants Admin :**
- Email : `[VOTRE_EMAIL_ADMIN]`
- Password : `[VOTRE_MOT_DE_PASSE]`

📖 **Guide complet d'accès admin** : [ACCES_ADMIN.md](./ACCES_ADMIN.md)

---

## 📦 Installation Locale

```bash
# Cloner le repo
git clone https://github.com/votre-username/msf-congo.git
cd msf-congo

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

### Accès en Local

**Site Client :**
```
http://localhost:5173/
```

**Admin :**
```
http://localhost:5173/admin
ou
http://localhost:5173/?admin=true
```

---

## 🏗️ Architecture

```
📁 /src/app
├── App.tsx              # Point d'entrée (détecte client/admin)
├── ClientApp.tsx        # 🌐 Application CLIENT
├── AdminApp.tsx         # 🔧 Application ADMIN
│
├── /pages               # Pages CLIENT
│   ├── Home.tsx
│   ├── PropertyDetails.tsx
│   ├── DevisRequest.tsx
│   └── ...
│
├── /pages/admin         # Pages ADMIN
│   ├── AdminDashboard.tsx
│   ├── DemandesManagement.tsx
│   └── DemandeDetail.tsx
│
└── /components
    ├── Layout.tsx       # Layout CLIENT
    └── AdminLayout.tsx  # Layout ADMIN
```

📖 **Documentation complète** : [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🎨 Design

### Thème
- **Couleurs** : Bleu marine (#0a0f1e) + Or (#d4af37)
- **Style** : Glassmorphism, moderne, futuriste
- **Typographie** : Sophistiquée et corporate

### Fonctionnalités CLIENT
- ✅ Catalogue de propriétés avec filtres
- ✅ Demande de devis en ligne (7 étapes)
- ✅ Espace utilisateur (profil, favoris, transactions)
- ✅ 5 Projets phares détaillés
- ✅ Système de notifications

### Fonctionnalités ADMIN
- ✅ Dashboard avec statistiques
- ✅ Gestion des demandes de devis
- ✅ Validation de documents
- ✅ Assignation aux agents
- ✅ Notes internes
- ✅ Timeline des événements

---

## 🗄️ Base de Données

**Supabase** (partagée entre CLIENT et ADMIN)

### Tables Principales
- `devis_requests` - Demandes de devis
- `users` - Utilisateurs (clients + admins)
- `documents` - Documents uploadés
- `transactions` - Historique transactions
- `admin_notes` - Notes internes (admin uniquement)

Configuration : [/src/config/supabase.config.ts](./src/config/supabase.config.ts)

---

## 📱 Pages Disponibles

### Site Client (11 pages)

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Page d'accueil avec projets phares |
| Propriété | `/propriete/:id` | Détails d'une propriété |
| Projet | `/projet/:slug` | Détails d'un projet |
| Devis | `/devis/:propertyId` | Formulaire demande de devis |
| Services | `/services` | Nos services |
| Contact | `/contact` | Formulaire de contact |
| Dashboard | `/dashboard` | Dashboard utilisateur |
| Profil | `/profile` | Profil utilisateur |
| Favoris | `/favorites` | Propriétés favorites |
| Transactions | `/transactions` | Historique transactions |
| Notifications | `/notifications` | Notifications |

### Admin (7 pages)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/admin` | Page de connexion |
| Dashboard | `/dashboard` | Dashboard admin |
| Demandes | `/demandes` | Liste demandes de devis |
| Détail | `/demandes/:id` | Détail d'une demande |
| Propriétés | `/proprietes` | Gestion propriétés |
| Clients | `/clients` | Base clients |
| Stats | `/statistiques` | Statistiques ventes |

---

## 🚀 Déploiement

### Sur Netlify

1. **Push sur GitHub**
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

2. **Connecter à Netlify**
- Allez sur [netlify.com](https://netlify.com)
- New site from Git
- Sélectionnez votre repo
- Build command : `npm run build`
- Publish directory : `dist`
- Deploy !

3. **Accéder à l'Admin**
```
https://votre-site.netlify.app/admin
```

Le fichier `netlify.toml` est déjà configuré ✅

---

## 🔐 Sécurité

### Actuellement (Démo)
- Identifiants hardcodés pour les tests
- Pas de vérification de rôle

### Production (TODO)
- [ ] Authentification Supabase avec RLS
- [ ] Vérification rôle admin
- [ ] JWT tokens
- [ ] 2FA pour les admins
- [ ] Logs d'activité

---

## 🛠️ Technologies

- **Frontend** : React + TypeScript
- **Routing** : React Router v7
- **Styling** : Tailwind CSS v4
- **Animations** : Motion (Framer Motion)
- **Backend** : Supabase
- **Storage** : Supabase Storage
- **Deploy** : Netlify
- **Icons** : Lucide React

---

## 📞 Contact MSF Congo

**Adresse :**  
Immeuble Maisons Sans Frontières  
1 place Antonetti, 7ème étage  
Centre-ville, Pointe-Noire, Congo

**Horaires :** 9h30 - 18h30

**Téléphones :**
- +242 06 458 86 18
- +242 05 587 73 24

**Email :** promotions@msfcongo.com

---

## 📄 Licence

© 2024 MSF Congo - Roger ROC - Tous droits réservés

---

## 🆘 Support

### Problème d'accès à l'admin ?
Consultez le [Guide d'Accès Admin](./ACCES_ADMIN.md)

### Problème technique ?
1. Vérifiez les logs Netlify
2. Testez en local avec `npm run dev`
3. Vérifiez que `netlify.toml` est présent

---

**Développé avec ❤️ pour MSF Congo** 🇨🇬
