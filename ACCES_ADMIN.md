# 🔐 Guide d'Accès à l'Admin MSF Congo

## 🚀 Comment Accéder à l'Admin sur Netlify

Vous avez **3 méthodes** pour accéder à l'interface admin :

---

## ✅ **MÉTHODE 1 : Via le Chemin /admin (RECOMMANDÉ)**

### URL à utiliser :
```
https://votre-site.netlify.app/admin
```

**Exemple concret :**
```
https://msf-congo.netlify.app/admin
```

### Étapes :
1. Allez sur votre site Netlify
2. Ajoutez `/admin` à la fin de l'URL
3. Appuyez sur Entrée
4. ✅ Vous arrivez sur la page de login admin

---

## ✅ **MÉTHODE 2 : Via Query Parameter**

### URL à utiliser :
```
https://votre-site.netlify.app/?admin=true
```

### Étapes :
1. Allez sur votre site Netlify
2. Ajoutez `?admin=true` à la fin de l'URL
3. Appuyez sur Entrée
4. ✅ Vous arrivez sur la page de login admin

---

## ✅ **MÉTHODE 3 : Via le Footer du Site**

### Étapes :
1. Allez sur votre site Netlify (page d'accueil)
2. Scrollez tout en bas de la page
3. Dans le footer, section "Mentions Légales"
4. Cliquez sur le lien **"Admin"** (en couleur dorée)
5. ✅ Vous arrivez sur la page de login admin

---

## 🔑 **Identifiants de Connexion**

Une fois sur la page de login admin :

### Identifiants :
```
Email     : [VOTRE_EMAIL_ADMIN]
Password  : [VOTRE_MOT_DE_PASSE]
```

⚠️ **IMPORTANT** : Configurez vos identifiants administrateur dans Supabase.  
N'utilisez jamais de mots de passe faibles en production !

---

## 📱 **Vérification sur Mobile**

Sur téléphone/tablette, les 3 méthodes fonctionnent aussi :

1. **Méthode 1** : Tapez `/admin` dans le navigateur
2. **Méthode 2** : Tapez `?admin=true` dans le navigateur
3. **Méthode 3** : Cliquez sur "Admin" dans le footer

---

## 🔧 **Configuration Netlify (Déjà Fait)**

Le fichier `netlify.toml` a été créé automatiquement avec :

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Cela permet au routing de fonctionner correctement.

---

## 🚨 **Dépannage**

### ❌ Problème : "Page Not Found" sur /admin

**Solution :**
1. Vérifiez que `netlify.toml` est bien dans la racine du projet
2. Re-déployez sur Netlify
3. Videz le cache du navigateur (Ctrl+Shift+R)

### ❌ Problème : Login ne fonctionne pas

**Solution :**
1. Vérifiez vos identifiants configurés dans Supabase
2. Vérifiez que vous êtes bien sur la page de login admin (fond sombre)

### ❌ Problème : Redirect vers la page d'accueil

**Solution :**
1. Utilisez la méthode 1 : `https://votre-site.netlify.app/admin`
2. Ne fermez pas la fenêtre, laissez charger
3. Si problème persiste, videz le cache

---

## 🌐 **URLs Complètes**

### Site Client (Public)
```
https://votre-site.netlify.app/
https://votre-site.netlify.app/propriete/tchikobo-villa-5
https://votre-site.netlify.app/devis/tchikobo-villa-5
https://votre-site.netlify.app/dashboard
```

### Admin (BackOffice)
```
https://votre-site.netlify.app/admin
https://votre-site.netlify.app/admin/dashboard
https://votre-site.netlify.app/admin/demandes
https://votre-site.netlify.app/admin/demandes/REQ-001
```

---

## 📋 **Checklist Post-Déploiement**

Après avoir poussé sur GitHub et déployé sur Netlify :

- [x] ✅ Le fichier `netlify.toml` est dans le repo
- [ ] ✅ Test URL : `https://votre-site.netlify.app/admin`
- [ ] ✅ Login avec `admin@msfcongo.com` / `admin123`
- [ ] ✅ Dashboard admin s'affiche
- [ ] ✅ Navigation sidebar fonctionne
- [ ] ✅ Liste demandes accessible
- [ ] ✅ Détail demande accessible

---

## 🔒 **Sécurité Production (TODO)**

Pour la production, vous devrez :

### 1. Changer les Identifiants Admin
```typescript
// Dans AdminLogin.tsx
// Remplacer les identifiants hardcodés
// Par une vraie authentification Supabase
```

### 2. Activer Supabase Auth
```typescript
// Vérifier le rôle utilisateur
const { data: { user } } = await supabase.auth.getUser();
if (user.role !== 'admin') {
  return <Navigate to="/" />;
}
```

### 3. Protéger les Routes
```typescript
// Ajouter middleware de protection
const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = checkAdminAuth();
  return isAdmin ? children : <Navigate to="/admin/login" />;
};
```

---

## 📞 **Support**

Si vous avez des problèmes d'accès :

1. Vérifiez que le build Netlify a réussi
2. Consultez les logs Netlify
3. Vérifiez que tous les fichiers sont bien push sur GitHub
4. Testez en navigation privée (pour éviter le cache)

---

## 🎯 **Résumé Rapide**

**Pour accéder à l'admin sur Netlify :**

```
👉 https://votre-site.netlify.app/admin

📧 Email    : [VOTRE_EMAIL_ADMIN]
🔑 Password : [VOTRE_MOT_DE_PASSE]
```

**C'est tout !** 🚀

---

© 2024 MSF Congo - Roger ROC
