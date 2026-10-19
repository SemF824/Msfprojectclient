# 🏢 MSF CONGO - Plateforme Immobilière de Luxe & Backoffice Admin

Plateforme web immobilière moderne, sécurisée et futuriste pour **MSF Congo** (Roger ROC), spécialisée dans les développements immobiliers côtiers haut de gamme à Pointe-Noire, Congo.

---

## 🎯 Architecture Bi-Application

Ce projet intègre **DEUX applications distinctes et indépendantes** dans une même codebase, partageant une base de données Supabase unifiée :

### 🌐 **CLIENT APP** - Plateforme Publique & Espace Client
Interface client haute performance permettant d'explorer les projets immobiliers, de calculer et demander des devis chiffrés, d'échanger via une messagerie chiffrée de bout en bout (E2EE), de prendre rendez-vous (Calendly) et de gérer ses documents et transactions.

### 🔧 **ADMIN APP** - Backoffice d'Administration & Gestion
Interface de gestion sécurisée (RBAC & E2EE) réservée au personnel MSF Congo pour le suivi des demandes, la validation des pièces justificatives, la messagerie chiffrée avec les clients, la gestion du catalogue de propriétés, l'organisation de l'équipe et l'analyse statistique des ventes.

---

## 🚀 Accès & Routing

### Routage Dynamique
L'application détecte automatiquement le contexte d'exécution :
- **Par sous-domaine en production** : `msfcongo.com` (Client) vs `admin.msfcongo.com` (Admin)
- **Par paramètre URL ou sous-domaine en local** :
  - Client : `http://localhost:5173/`
  - Admin : `http://localhost:5173/?admin=true` ou `http://localhost:5173/admin`

---

## 📦 Installation & Déploiement Local

```bash
# Cloner le dépôt
git clone https://github.com/SemF824/Msfprojectclient.git
cd Msfprojectclient

# Installer les dépendances
pnpm install # ou npm install

# Lancer le serveur de développement Vite
npm run dev

# Exécuter la migration de chiffrement des devis (si nécessaire)
npm run migrate:encrypt-devis
```

### Stack Docker Local (Optionnel)
Pour exécuter un environnement local MySQL / phpMyAdmin complémentaire :
```bash
docker-compose up -d
```

---

## 🔐 Sécurité Avancée & Cybersécurité E2EE

Le projet intègre une architecture de sécurité de niveau bancaire :

1. **Chiffrement de Bout en Bout (E2EE) - WebCrypto API** :
   - **Échange de clés & Signatures** : ECDH (P-256) pour la dérivation de clés éphémères et ECDSA (P-256) pour la signature numérique d'authenticité.
   - **Chiffrement Symétrique** : AES-GCM (256 bits) avec vecteur d'initialisation (IV) unique de 96 bits pour la messagerie et les documents.
   - **Stockage Sécurisé** : Clés privées non-extractibles conservées localement dans **IndexedDB** (`keyStore.ts`).

2. **Chiffrement au Repos (AES-256)** :
   - Chiffrement automatique des données personnelles sensibles (`client_phone`, `message`, `client_address`) dans les demandes de devis avant enregistrement en BDD (`devisEncryption.ts`).

3. **Protection Anti-Bot & RGPD** :
   - Intégration **Google reCAPTCHA v3** sur tous les formulaires publics.
   - Bannières de consentement des cookies, politiques de confidentialité, mentions légales et gestion des données conformément au RGPD.

4. **Contrôle d'Accès basé sur les Rôles (RBAC) & RLS** :
   - Rôles : `client`, `agent`, `admin`, `superadmin`.
   - Politiques Row Level Security (RLS) Supabase garantissant l'isolation totale des données.

---

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript (typage strict Zod & TypeScript), Vite 7
- **Routing** : React Router v7
- **Design & UI** : Tailwind CSS v4, Radix UI, Motion (Framer Motion), Lucide Icons
- **Backend & BDD** : Supabase PostgreSQL, Supabase Auth, Supabase Storage
- **Edge Functions (Deno / Hono)** :
  - `calendly-webhook` : Synchronisation automatique des rendez-vous
  - `submit-contact` : Validation reCAPTCHA et traitement du formulaire de contact
  - `server` : API backend Hono avec KV Store
- **Monitoring & Métriques** : Sentry (`@sentry/react`)
- **Paiements & Devises** : Convertisseur multi-devises dynamique (XAF / EUR / USD)
- **Internationalisation Téléphonique** : `libphonenumber-js`
- **Prise de RDV** : `react-calendly`
- **GraphQL** : Firebase DataConnect (`dataconnect/`)

---

## 📱 Catalogue des Pages

### 🌐 Site Client (27 pages)

| Page | Route | Description |
|------|-------|-------------|
| Accueil | `/` | Vitrine principale & projets phares |
| Propriétés | `/proprietes` | Catalogue complet avec filtres |
| Détail Propriété | `/propriete/:id` | Fiche détaillée d'un bien |
| Projet | `/projet/:slug` | Présentation d'un programme immobilier |
| Devis | `/devis/:propertyId` | Assistant de demande de devis chiffré |
| Mes Demandes | `/client/requests` | Suivi des demandes de devis client |
| Services | `/services` | Prestations MSF Congo |
| Contact | `/contact` | Formulaire sécurisé reCAPTCHA |
| Dashboard Client | `/dashboard` | Vue d'ensemble du compte client |
| Profil | `/profile` | Gestion des données personnelles |
| Favoris | `/favorites` | Propriétés enregistrées |
| Demande de Prêt | `/loan` | Simulateur & demande de prêt |
| Documents Client | `/client/documents` | Coffre-fort documentaire chiffré |
| Messagerie Client | `/client/messages` | Chat E2EE sécurisé en temps réel |
| Rendez-vous | `/client/appointments` | Gestion des rendez-vous Calendly |
| Transactions | `/transactions` | Historique des règlements |
| Détail Transaction | `/transactions/:id` | Reçu et détail de paiement |
| Notifications | `/notifications` | Centre de notifications |
| Paramètres | `/settings` | Préférences du compte |
| Connexion | `/login` | Authentification client |
| Inscription | `/signup` | Création de compte client |
| Mot de passe | `/update-password` | Réinitialisation / mise à jour |
| À Propos | `/about` | Histoire et vision de MSF Congo |
| Mentions Légales | `/legal-mentions` | Informations réglementaires |
| Confidentialité | `/privacy-policy` | Politique de protection des données |
| Cookies | `/cookie-policy` | Politique des cookies |
| Remboursement | `/refund-policy` | Conditions de remboursement |

### 🔧 Backoffice Admin (12 pages)

| Page | Route | Description |
|------|-------|-------------|
| Connexion Admin | `/admin` / `/admin/login` | Authentification sécurisée admin |
| Dashboard Admin | `/admin/dashboard` | Vue d'ensemble des KPIs et activités |
| Demandes | `/admin/demandes` | Gestion et filtrage des demandes de devis |
| Détail Demande | `/admin/demandes/:id` | Traitement, déchiffrement et validation |
| Propriétés | `/admin/proprietes` | Gestion du catalogue de biens |
| Clients | `/admin/clients` | Repertoire et fiches clients |
| Documents Clients | `/admin/documents` | Validation et suivi des pièces justificatives |
| Messagerie Admin | `/admin/messages` | Chat E2EE avec les clients |
| Équipe | `/admin/team` | Gestion des membres et rôles |
| Statistiques | `/admin/statistiques` | Rapport d'activité et chiffres d'affaires |
| Paramètres Admin | `/admin/parametres` | Configuration globale du système |
| Page Introuvable | `*` | Page 404 personnalisée admin |

---

## 📑 Documentation Associée

- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) : Guide d'architecture technique, routage, schéma BDD, sécurité E2EE et déploiement.
- 🎨 [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) : Crédits et licences des composants UI et médias.
- 📐 [guidelines/Guidelines.md](./guidelines/Guidelines.md) : Standards de développement et charte graphique.

---

## 📞 Contact MSF Congo

**Adresse :**  
Immeuble Maisons Sans Frontières  
1 place Antonetti, 7ème étage, Centre-ville, Pointe-Noire, Congo

**Téléphones :** +242 06 458 86 18 / +242 05 587 73 24  
**Email :** promotions@msfcongo.com

---

© 2024-2026 MSF Congo - Roger ROC - Tous droits réservés

