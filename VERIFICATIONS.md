# ✅ Checklist de Vérification MSF Congo

## 🔍 Avant de Push sur GitHub

- [ ] Tous les fichiers sont créés
- [ ] `netlify.toml` est à la racine
- [ ] `.gitignore` exclut node_modules et .env
- [ ] Pas d'erreurs TypeScript

```bash
npm run build
# Vérifier qu'il n'y a pas d'erreurs
```

---

## 🚀 Après Déploiement sur Netlify

### ✅ Test 1 : Site Client Accessible

**URL :** `https://votre-site.netlify.app/`

- [ ] Page d'accueil se charge
- [ ] Header MSF Congo visible
- [ ] Navigation fonctionne
- [ ] Images se chargent
- [ ] Footer visible en bas

### ✅ Test 2 : Admin Accessible via /admin

**URL :** `https://votre-site.netlify.app/admin`

- [ ] Page de login admin s'affiche (fond sombre)
- [ ] Logo MSF Congo visible
- [ ] Champs email et password présents
- [ ] Encadré bleu avec identifiants démo visible

### ✅ Test 3 : Connexion Admin

**Identifiants :**
- Email : `admin@msfcongo.com`
- Password : `admin123`

**Actions :**
- [ ] Remplir le formulaire
- [ ] Cliquer "Se Connecter"
- [ ] Redirection vers `/dashboard`
- [ ] Dashboard admin s'affiche

### ✅ Test 4 : Navigation Admin

**Depuis le dashboard :**
- [ ] Sidebar visible à gauche
- [ ] 4 cards de stats visibles
- [ ] Table "Demandes Récentes" visible
- [ ] Clic sur "Demandes de Devis" → `/demandes`

### ✅ Test 5 : Liste Demandes

**URL :** `https://votre-site.netlify.app/demandes`

- [ ] Table avec 7 demandes affichée
- [ ] Filtres fonctionnent (recherche, statut, priorité)
- [ ] Clic sur "Voir" REQ-001 → `/demandes/REQ-001`

### ✅ Test 6 : Détail Demande

**URL :** `https://votre-site.netlify.app/demandes/REQ-001`

- [ ] Informations client complètes
- [ ] Propriété affichée avec image
- [ ] Section documents visible
- [ ] Sidebar de gestion visible
- [ ] Timeline visible

### ✅ Test 7 : Admin via Query Param

**URL :** `https://votre-site.netlify.app/?admin=true`

- [ ] Même résultat que `/admin`
- [ ] Page de login admin s'affiche

### ✅ Test 8 : Lien Admin dans Footer

**Actions :**
- [ ] Aller sur `https://votre-site.netlify.app/`
- [ ] Scroller en bas de page
- [ ] Footer visible
- [ ] Cliquer sur "Admin" (en doré)
- [ ] Redirection vers page login admin

---

## 📱 Tests Mobile

### Sur Smartphone

- [ ] Site client responsive
- [ ] Menu burger fonctionne
- [ ] Admin accessible via `/admin`
- [ ] Login admin fonctionne
- [ ] Sidebar admin collapsible

---

## 🔧 Tests Fonctionnels Admin

### Dashboard
- [ ] Stats s'affichent correctement
- [ ] Filtres de période fonctionnent
- [ ] Export CSV (bouton visible)
- [ ] Table demandes récentes scrollable

### Demandes Management
- [ ] Recherche filtre correctement
- [ ] Filtres statut/priorité fonctionnent
- [ ] Pagination fonctionne
- [ ] Lien vers détail fonctionne

### Détail Demande
- [ ] Changer statut fonctionne
- [ ] Assigner agent affiche alerte
- [ ] Ajouter note affiche alerte
- [ ] Documents visibles
- [ ] Actions rapides visibles

---

## 🌐 Tests Navigation

### Client → Admin
- [ ] Footer → Clic "Admin" → Login admin
- [ ] Taper `/admin` dans URL → Login admin
- [ ] Login → Dashboard admin

### Admin → Client
- [ ] Menu user → "Voir le site client" → Page accueil
- [ ] Logo MSF Congo → Page accueil (si configuré)

---

## ⚠️ Problèmes Connus & Solutions

### Problème : 404 sur /admin

**Solution :**
```bash
# Vérifier que netlify.toml existe
ls -la netlify.toml

# Vérifier le contenu
cat netlify.toml

# Re-push si nécessaire
git add netlify.toml
git commit -m "Add netlify config"
git push
```

### Problème : Login admin ne fonctionne pas

**Solution :**
```
1. Vérifier identifiants :
   - Email : admin@msfcongo.com (PAS admin@gmail.com)
   - Password : admin123 (PAS Admin123)

2. Vider cache navigateur (Ctrl+Shift+Del)

3. Tester en navigation privée
```

### Problème : Styles cassés

**Solution :**
```bash
# Vérifier build Netlify
# Dans les logs Netlify, vérifier :
# ✓ built in XXms

# Si erreur CSS :
npm run build
# Corriger les erreurs
```

### Problème : Redirect infini

**Solution :**
```
1. Vérifier netlify.toml :
   - [[redirects]]
   - from = "/*"
   - to = "/index.html"
   - status = 200

2. Re-déployer
```

---

## 📊 Métriques de Performance

### Lighthouse Score (À vérifier)

**Site Client :**
- [ ] Performance : > 90
- [ ] Accessibility : > 90
- [ ] Best Practices : > 90
- [ ] SEO : > 90

**Admin :**
- [ ] Performance : > 85 (acceptable pour backoffice)
- [ ] Accessibility : > 85
- [ ] Best Practices : > 90

---

## 🔐 Sécurité (Production)

### À faire avant mise en production :

- [ ] Changer identifiants admin
- [ ] Activer authentification Supabase
- [ ] Configurer RLS (Row Level Security)
- [ ] Activer HTTPS (automatique sur Netlify)
- [ ] Configurer CORS
- [ ] Ajouter rate limiting
- [ ] Mettre en place monitoring
- [ ] Configurer backups Supabase

---

## 📝 Tests Finaux

### Avant de valider le projet :

- [ ] Tous les tests ci-dessus passent ✅
- [ ] Aucune erreur console navigateur
- [ ] Aucune erreur 404
- [ ] Images se chargent
- [ ] Animations fluides
- [ ] Formulaires fonctionnent
- [ ] Responsive sur mobile/tablet/desktop

---

## 🎯 URLs à Tester

Remplacez `votre-site.netlify.app` par votre vraie URL :

**CLIENT :**
```
✅ https://votre-site.netlify.app/
✅ https://votre-site.netlify.app/propriete/tchikobo-villa-5
✅ https://votre-site.netlify.app/projet/villa-tchikobo
✅ https://votre-site.netlify.app/devis/tchikobo-villa-5
✅ https://votre-site.netlify.app/services
✅ https://votre-site.netlify.app/contact
```

**ADMIN :**
```
✅ https://votre-site.netlify.app/admin
✅ https://votre-site.netlify.app/?admin=true
✅ https://votre-site.netlify.app/dashboard (après login)
✅ https://votre-site.netlify.app/demandes (après login)
✅ https://votre-site.netlify.app/demandes/REQ-001 (après login)
```

---

## ✨ Résultat Attendu

Si tous les tests passent :

✅ **Site Client** : Fonctionnel, rapide, responsive  
✅ **Admin** : Accessible, sécurisé, fonctionnel  
✅ **Navigation** : Fluide entre les deux apps  
✅ **Performance** : Chargement rapide  
✅ **Design** : Professionnel et luxueux  

**🎉 Projet MSF Congo opérationnel !**

---

© 2024 MSF Congo - Roger ROC
