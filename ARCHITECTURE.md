# 🏗️ MSF CONGO - Architecture Système & Sécurité E2EE

## 📋 Vue d'Ensemble du Système

La plateforme **MSF Congo** est construite sur une architecture bi-application unifiée partageant la même codebase et la même base de données Supabase, avec une isolation stricte des rôles et du chiffrement de bout en bout (E2EE) :

### 🌐 **CLIENT APP** - Interface Publique & Espace Client
- **URL Production** : `https://msfcongo.com` / `https://www.msfcongo.com`
- **URL Dev** : `http://localhost:5173/`
- **Public & Utilisateurs** : Prospects, acheteurs, investisseurs
- **Fonctionnalités Principales** :
  - Catalogue interactif des biens et programmes côtiers
  - Moteur de calcul et demande de devis personnalisés
  - Messagerie chiffrée de bout en bout (E2EE) avec les agents
  - Coffre-fort documentaire chiffré (CNI, contrats, promesses de vente)
  - Prise de rendez-vous en ligne (Calendly)
  - Suivi des demandes, simulations de prêts et historique financier
  - Multi-devises dynamique (XAF / EUR / USD)

### 🔧 **ADMIN APP** - Backoffice d'Administration & Gestion
- **URL Production** : `https://admin.msfcongo.com`
- **URL Dev** : `http://localhost:5173/?admin=true` ou `http://localhost:5173/admin`
- **Accès Restreint** : Personnel habilité (`admin`, `superadmin`)
- **Fonctionnalités Principales** :
  - Dashboard analytique & suivi des demandes de devis
  - Traitement et déchiffrement sécurisé des demandes de devis
  - Messagerie E2EE d'entreprise avec les clients
  - Validation et audit des documents clients uploadés
  - Gestion du catalogue immobilier (prix, photos, caractéristiques)
  - Gestion des utilisateurs et attribution des rôles administratifs
  - Statistiques de conversion et exportations de données

---

## 🏛️ Structure du Codebase

```
📁 /src
├── 📱 /app
│   ├── App.tsx                      ⚡ Point d'entrée (détection de sous-domaine / URL)
│   ├── ClientAppRoutes.tsx          🌐 Routage de l'Application Client (27 pages)
│   ├── AdminAppRoutes.tsx           🔧 Routage du Backoffice Admin (12 pages)
│   │
│   ├── 📁 /components               🧩 Composants partagés & métier
│   │   ├── Header.tsx               🌐 En-tête Client & sélecteur de devises
│   │   ├── Footer.tsx               🌐 Pied de page & informations légales
│   │   ├── Layout.tsx               🌐 Layout global Client
│   │   ├── AdminLayout.tsx          🔧 Layout du Backoffice Admin
│   │   ├── ProtectedRoute.tsx       🔒 Protection authentification Client
│   │   ├── ProtectedAdminRoute.tsx  🔒 Protection accès Admin/Agent
│   │   ├── SuperAdminGuard.tsx      🔒 Protection accès réservé SuperAdmin
│   │   ├── CookieConsent.tsx        🍪 Gestion du consentement RGPD
│   │   ├── CurrencySelector.tsx     💵 Composant de conversion XAF/EUR/USD
│   │   └── 📁 /ui
│   │       ├── EncryptedChat.tsx    💬 Interface de messagerie E2EE en temps réel
│   │       └── PhoneInput.tsx       📞 Champ téléphone international (libphonenumber-js)
│   │
│   └── 📁 /pages                   📄 Pages applicatives (Client & Admin)
│       ├── Home.tsx, DevisRequest.tsx, Properties.tsx, ...
│       └── 📁 /admin                📄 Pages du Backoffice
│           ├── AdminDashboard.tsx, DemandesManagement.tsx, ...
│
├── 📁 /utils
│   ├── 📁 /crypto                   🔐 Modules de Cybersécurité E2EE
│   │   ├── e2ee.ts                  🔑 Initialisation & export des clés WebCrypto JWK
│   │   ├── keyStore.ts              💾 Stockage IndexedDB des clés privées
│   │   ├── messageCrypto.ts         💬 Chiffrement/Déchiffrement hybride des chats
│   │   └── documentCrypto.ts        📄 Chiffrement/Déchiffrement hybride des fichiers
│   ├── devisEncryption.ts           🔒 Chiffrement AES-256 des devis au repos
│   ├── encryption.ts                🔐 Utilitaires CryptoJS
│   ├── currency.ts                  💵 Utilitaires de conversion monétaire
│   └── phone.ts                     📞 Formatage & validation des numéros
│
├── 📁 /context                      🔄 Contextes React
│   └── CurrencyContext.tsx          💵 Gestion centralisée de la devise (XAF/EUR/USD)
│
├── 📁 /hooks                        🪝 Hooks React personnalisés
│   ├── useSupabaseAuth.ts           🔑 Gestion de la session et des rôles
│   ├── useClientRequests.ts         📩 Gestion des demandes de devis
│   ├── useNotifications.ts          🔔 Centre de notifications
│   └── useSEO.ts                    🔍 Optimisation du référencement
│
└── 📁 /config
    └── supabase.config.ts           🔗 Helper de connexion Supabase

📁 /supabase
├── 📁 /functions                    ⚡ Supabase Edge Functions (Deno/Hono)
│   ├── 📁 /calendly-webhook         📅 Webhook de synchronisation Calendly
│   ├── 📁 /submit-contact           📬 Traitement sécurisé du formulaire contact + reCAPTCHA
│   └── 📁 /server                   🌐 API Hono avec Key-Value Store
└── config.toml                      ⚙️ Configuration Supabase CLI (Hetzner Self-Hosted)
```

---

## 🔐 Architecture de Cybersécurité E2EE

Le système intègre un modèle cryptographique hybride avancé reposant sur l'API native `window.crypto.subtle` (WebCrypto) :

```
[ Expéditeur ]                                                   [ Destinataire ]
      │                                                                 │
  Génère clé symétrique AES-256 (GCM)                                   │
      │                                                                 │
  Chiffre le message / document ➔ Ciphertext                             │
      │                                                                 │
  Signe le Ciphertext avec sa clé privée ECDSA (SHA-256)                 │
      │                                                                 │
  Pour chaque destinataire :                                            │
  ├─ Récupère sa clé publique ECDH (P-256)                              │
  ├─ Génère paire éphémère ECDH                                         │
  ├─ Dérive clé de déballage (AES-KW 256)                               │
  └─ Enveloppe la clé AES ➔ WrappedAesKey                               │
      │                                                                 │
      └──────────────── Envoi via Supabase ─────────────────────────────┘
                                                                        │
                                                 Récupère sa clé privée ECDH (IndexedDB)
                                                                        │
                                                 Déballe la clé AES via ECDH éphémère
                                                                        │
                                                 Vérifie la signature ECDSA de l'expéditeur
                                                                        │
                                                 Déchiffre le Ciphertext en clair
```

### Protocoles & Formats
- **Échange de clés** : ECDH avec courbe elliptique `P-256`.
- **Signature numérique** : ECDSA (`P-256` avec Hash `SHA-256`) garantissant l'impossibilité d'usurpation d'identité ou d'altération de message.
- **Chiffrement de contenu** : `AES-GCM` 256 bits avec IV de 96 bits généré aléatoirement.
- **Stockage local des clés** : IndexedDB (`keyStore.ts`) avec paires de clés définies en `extractable: false` pour interdire toute extraction malveillante de la clé privée hors de l'appareil.

---

## 🗄️ Modèle de Données & RLS (Row Level Security)

### Tables Principalement Exploitees

| Table | Rôles & Accès | Description & Rôle Métier |
|-------|---------------|---------------------------|
| `users` | All (Lecture/Écriture propre) | Profils utilisateurs, rôle (`client`, `agent`, `admin`, `superadmin`), infos de contact |
| `user_keys` | All (Lecture publique / Écriture propre) | Clés publiques JWK (ECDH & ECDSA) nécessaires à l'établissement du canal E2EE |
| `devis_requests` | Client (Propre) / Admin (Global) | Demandes de devis chiffrées en AES-256 au repos (`devisEncryption.ts`) |
| `chat_messages` | Destinataires autorisés (E2EE) | Messages chiffrés de bout en bout avec clés d'accès (`accessKeys`) |
| `documents` | Client (Propre) / Admin (Audit) | Fichiers chiffrés en Storage Supabase avec métadonnées d'accès E2EE |
| `transactions` | Client (Propre) / Admin (Comptabilité) | Historique financier et reçus de règlement |
| `admin_notes` | Admin / Agent | Notes confidentielles internes sur les dossiers clients |
| `timeline_events` | Admin / Client (Rétreint) | Journal d'audit et d'évolution des demandes |

---

## ⚡ Supabase Edge Functions & Integrations

1. **`calendly-webhook`** :
   - Écoute les événements de prise de RDV Calendly.
   - Crée ou met à jour automatiquement les enregistrements dans la table `appointments` de Supabase.

2. **`submit-contact`** :
   - Reçoit le formulaire de contact public.
   - Vérifie le jeton **Google reCAPTCHA v3** auprès des serveurs Google.
   - Valide les données, applique un nettoyage strict et notifie l'équipe commerciale MSF.

3. **`server` (API Hono/Deno)** :
   - Offre des endpoints légers ultra-rapides et un Key-Value Store de secours.

---

## 🌐 Multi-Devises & Internationalisation

La plateforme gère nativement le marché immobilier international avec le franc CFA (XAF) comme devise de référence :
- **Taux de conversion dynamiques** : XAF ➔ EUR (1 EUR = 655.957 XAF) & XAF ➔ USD.
- **Contexte React Centralisé** : `CurrencyContext.tsx` permettant un basculement instantané dans toute l'interface.
- **Formatage Téléphonique** : Composant `PhoneInput.tsx` adossé à `libphonenumber-js` pour la prise en charge des indicatifs internationaux (+242 Congo, +33 France, etc.).

---

## 🚀 Guide de Déploiement & Configuration

### Netlify / Vercel
1. Définir les variables d'environnement dans le panneau d'administration :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RECAPTCHA_SITE_KEY`
   - `VITE_SENTRY_DSN`
2. Configurer les redirections SPA (Single Page Application) :
   - `netlify.toml` inclus à la racine.
3. Définir la gestion des sous-domaines (`msfcongo.com` ➔ Client, `admin.msfcongo.com` ➔ Admin).

---

© 2024-2026 MSF Congo - Architecture & Ingénierie

