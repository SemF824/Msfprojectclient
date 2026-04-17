# 🚀 Guide de Déploiement MSF Congo sur Netlify

## 📋 Prérequis

- [x] Compte GitHub
- [x] Compte Netlify (gratuit)
- [x] Code MSF Congo prêt
- [x] Git installé localement

---

## 🔧 Étape 1 : Préparer le Projet Localement

### 1.1 Vérifier que tout fonctionne

```bash
# Installer les dépendances
npm install

# Tester en local
npm run dev

# Tester le build
npm run build
```

### 1.2 Vérifier les fichiers importants

```bash
# Ces fichiers DOIVENT être présents :
✅ netlify.toml (à la racine)
✅ .gitignore (à la racine)
✅ package.json
✅ /src/app/App.tsx
✅ /src/app/ClientApp.tsx
✅ /src/app/AdminApp.tsx
```

---

## 📤 Étape 2 : Push sur GitHub

### 2.1 Initialiser Git (si pas déjà fait)

```bash
# Dans le dossier du projet
git init
```

### 2.2 Créer un repo sur GitHub

1. Allez sur https://github.com
2. Cliquez sur "New repository"
3. Nom : `msf-congo` (ou autre)
4. Description : "Site immobilier MSF Congo"
5. Public ou Private : **Private** (recommandé)
6. ⚠️ NE PAS cocher "Initialize with README"
7. Cliquez "Create repository"

### 2.3 Connecter le repo local à GitHub

```bash
# Ajouter l'origin (remplacez YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/msf-congo.git

# Vérifier
git remote -v
```

### 2.4 Premier commit et push

```bash
# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit - MSF Congo site"

# Push vers GitHub
git push -u origin main
```

**✅ Votre code est maintenant sur GitHub !**

---

## 🌐 Étape 3 : Déployer sur Netlify

### 3.1 Connexion à Netlify

1. Allez sur https://netlify.com
2. Cliquez "Sign up" ou "Log in"
3. **Connectez-vous avec GitHub** (recommandé)
4. Autorisez Netlify à accéder à vos repos

### 3.2 Créer un nouveau site

1. Cliquez sur **"Add new site"** → **"Import an existing project"**
2. Choisissez **"GitHub"**
3. Autorisez Netlify à accéder à vos repos (si demandé)
4. Cherchez et sélectionnez votre repo **"msf-congo"**

### 3.3 Configuration du build

**Netlify détecte automatiquement les settings :**

```
Build command:    npm run build
Publish directory: dist
Branch to deploy: main
```

✅ **Laissez ces valeurs par défaut** (Netlify lit le `netlify.toml`)

### 3.4 Variables d'environnement (optionnel)

Si vous utilisez Supabase, ajoutez :

1. Cliquez sur "Show advanced"
2. Cliquez "New variable"
3. Ajoutez :
   ```
   VITE_SUPABASE_URL = https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJxxx...
   ```

### 3.5 Déployer !

1. Cliquez **"Deploy site"**
2. ⏳ Attendez 1-2 minutes (Netlify build et déploie)
3. 🎉 **Votre site est en ligne !**

---

## 🔗 Étape 4 : Accéder au Site

### 4.1 URL par défaut

Netlify vous donne une URL aléatoire :
```
https://random-name-123456.netlify.app
```

### 4.2 Personnaliser l'URL (gratuit)

1. Dans Netlify, cliquez sur "Site settings"
2. Cliquez "Change site name"
3. Entrez : `msf-congo` (ou autre nom disponible)
4. Cliquez "Save"

**✅ Nouvelle URL :**
```
https://msf-congo.netlify.app
```

### 4.3 Domaine personnalisé (optionnel)

Si vous avez un nom de domaine (ex: msfcongo.com) :

1. Dans Netlify → "Domain settings"
2. Cliquez "Add custom domain"
3. Entrez : `msfcongo.com`
4. Suivez les instructions pour configurer les DNS
5. Netlify active automatiquement HTTPS !

---

## ✅ Étape 5 : Tester l'Admin

### 5.1 Accéder à l'admin

**3 méthodes :**

**Méthode 1 (recommandée) :**
```
https://msf-congo.netlify.app/admin
```

**Méthode 2 :**
```
https://msf-congo.netlify.app/?admin=true
```

**Méthode 3 :**
- Allez sur le site
- Scrollez en bas
- Cliquez "Admin" dans le footer

### 5.2 Se connecter

**Identifiants :**
```
Email    : admin@msfcongo.com
Password : admin123
```

### 5.3 Vérifier les pages

Après login, testez :
- ✅ `/dashboard` → Dashboard admin
- ✅ `/demandes` → Liste demandes
- ✅ `/demandes/REQ-001` → Détail demande

---

## 🔄 Étape 6 : Mises à Jour

### 6.1 Faire des modifications

```bash
# Modifiez vos fichiers localement
# Par exemple : /src/app/pages/Home.tsx

# Tester en local
npm run dev
```

### 6.2 Push vers GitHub

```bash
# Ajouter les modifications
git add .

# Commit
git commit -m "Mise à jour de la page d'accueil"

# Push
git push
```

### 6.3 Déploiement automatique

**🎉 Netlify déploie automatiquement !**

- Netlify détecte le push sur GitHub
- Lance le build automatiquement
- Déploie la nouvelle version
- Votre site est mis à jour en 1-2 minutes

**Vous pouvez suivre le déploiement :**
- Dashboard Netlify → Onglet "Deploys"
- Voir les logs en temps réel

---

## 🐛 Dépannage

### ❌ Problème : Build Failed

**Solution :**
```bash
# Tester le build localement
npm run build

# Si erreurs, corrigez-les
# Puis re-push
git add .
git commit -m "Fix build errors"
git push
```

### ❌ Problème : Page Admin 404

**Vérifications :**
1. Le fichier `netlify.toml` est-il push sur GitHub ?
2. Dans Netlify → "Site configuration" → Build settings
3. Vérifiez que "Publish directory" = `dist`

**Solution :**
```bash
# Vérifier que netlify.toml existe
cat netlify.toml

# S'il manque, créez-le et push
git add netlify.toml
git commit -m "Add netlify config"
git push
```

### ❌ Problème : Styles cassés

**Solution :**
```bash
# Vider le cache Netlify
# Dans Netlify → "Deploys" → "Trigger deploy" → "Clear cache and deploy"
```

### ❌ Problème : Variables d'environnement manquantes

**Solution :**
1. Netlify → "Site settings" → "Environment variables"
2. Ajoutez les variables Supabase
3. Re-déployez

---

## 📊 Monitoring

### Voir les statistiques

1. Dashboard Netlify → Onglet "Analytics"
2. Voir :
   - Nombre de visiteurs
   - Pages les plus vues
   - Temps de chargement

### Voir les logs

1. Dashboard Netlify → Onglet "Functions" (si vous en avez)
2. Ou → "Deploys" → Cliquez sur un deploy → "Deploy log"

---

## 🔐 Sécurité Production

### Avant la mise en production réelle :

#### 1. Changer les identifiants admin
```typescript
// Dans AdminLogin.tsx
// Remplacer les identifiants hardcodés par Supabase Auth
```

#### 2. Activer HTTPS
✅ **Automatique sur Netlify !** (même avec domaine personnalisé)

#### 3. Variables d'environnement
```
❌ NE JAMAIS commiter de clés API dans le code
✅ Toujours utiliser les variables d'environnement Netlify
```

#### 4. Protection contre les bots
```bash
# Dans netlify.toml, ajouter :
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Robots-Tag = "noindex"
```

---

## 🚀 Optimisations

### Performance

1. **Images** : Utilisez Unsplash avec `?w=800` pour limiter la taille
2. **Code Splitting** : Déjà fait avec React Router
3. **Cache** : Configuré dans `netlify.toml`

### SEO (Site Client)

```html
<!-- Ajouter dans index.html -->
<meta name="description" content="MSF Congo - Immobilier de luxe à Pointe-Noire">
<meta name="keywords" content="immobilier, luxe, congo, pointe-noire">
```

---

## 📝 Checklist Finale

Avant de considérer le déploiement réussi :

- [ ] ✅ Site accessible sur Netlify
- [ ] ✅ Page d'accueil se charge
- [ ] ✅ Admin accessible via `/admin`
- [ ] ✅ Login admin fonctionne
- [ ] ✅ Dashboard admin s'affiche
- [ ] ✅ Navigation client/admin fonctionne
- [ ] ✅ Responsive sur mobile
- [ ] ✅ Pas d'erreurs console
- [ ] ✅ Images se chargent
- [ ] ✅ Déploiement automatique fonctionne

---

## 🎉 Félicitations !

Votre site MSF Congo est maintenant :

✅ **Déployé** sur Netlify  
✅ **Accessible** publiquement  
✅ **Automatiquement mis à jour** à chaque push  
✅ **Sécurisé** avec HTTPS  
✅ **Rapide** avec CDN mondial Netlify  

---

## 📞 URLs Finales

**Votre site client :**
```
https://msf-congo.netlify.app/
```

**Votre admin :**
```
https://msf-congo.netlify.app/admin
```

**Identifiants admin :**
```
Email    : admin@msfcongo.com
Password : admin123
```

---

## 📚 Ressources

- [Documentation Netlify](https://docs.netlify.com)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)

---

© 2024 MSF Congo - Roger ROC 🇨🇬
