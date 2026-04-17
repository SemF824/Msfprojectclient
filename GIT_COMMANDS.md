# 📦 Commandes Git pour MSF Congo

## 🚀 Premier Déploiement

### Étape 1 : Initialiser le repo (si pas déjà fait)

```bash
# Dans le dossier du projet MSF Congo
git init
```

### Étape 2 : Ajouter tous les fichiers

```bash
# Ajouter TOUS les fichiers au staging
git add .

# Vérifier ce qui sera commité
git status
```

### Étape 3 : Premier commit

```bash
# Créer le commit initial
git commit -m "Initial commit - MSF Congo site complet avec Client et Admin"
```

### Étape 4 : Connecter à GitHub

```bash
# Remplacez YOUR-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/YOUR-USERNAME/msf-congo.git

# Vérifier la connexion
git remote -v
```

### Étape 5 : Push vers GitHub

```bash
# Premier push (créer la branche main)
git branch -M main
git push -u origin main

# Ou si vous utilisez master
git push -u origin master
```

---

## 🔄 Mises à Jour Quotidiennes

### Workflow standard

```bash
# 1. Vérifier les fichiers modifiés
git status

# 2. Ajouter les modifications
git add .

# 3. Commit avec message descriptif
git commit -m "Description de vos modifications"

# 4. Push vers GitHub (déclenche auto-deploy Netlify)
git push
```

---

## 📝 Messages de Commit Recommandés

### Format professionnel

```bash
# Nouvelle fonctionnalité
git commit -m "feat: Ajout page statistiques admin"

# Correction de bug
git commit -m "fix: Correction du formulaire de devis"

# Mise à jour de style
git commit -m "style: Amélioration responsive mobile"

# Mise à jour de contenu
git commit -m "content: Mise à jour des prix propriétés"

# Refactoring
git commit -m "refactor: Réorganisation composants admin"

# Documentation
git commit -m "docs: Mise à jour guide déploiement"
```

---

## 🔍 Commandes Utiles

### Voir l'historique

```bash
# Voir les derniers commits
git log --oneline -10

# Voir les modifications d'un fichier
git log --follow src/app/pages/Home.tsx
```

### Annuler des modifications

```bash
# Annuler modifications NON commitées
git checkout -- src/app/pages/Home.tsx

# Ou pour TOUS les fichiers
git checkout -- .

# Revenir au dernier commit (DANGEREUX)
git reset --hard HEAD
```

### Voir les différences

```bash
# Voir ce qui a changé (pas encore staged)
git diff

# Voir ce qui est staged
git diff --staged
```

---

## 🌿 Branches (Optionnel)

### Créer une branche de développement

```bash
# Créer et basculer sur nouvelle branche
git checkout -b development

# Faire vos modifications...
git add .
git commit -m "Travail en cours sur feature X"

# Push la branche
git push -u origin development
```

### Merger dans main

```bash
# Retour sur main
git checkout main

# Merger development dans main
git merge development

# Push les changements
git push
```

---

## 🚨 En Cas de Problème

### Conflit de merge

```bash
# Si conflit après un pull
# 1. Ouvrir les fichiers en conflit
# 2. Résoudre manuellement (supprimer <<<< ==== >>>>)
# 3. Ajouter les fichiers résolus
git add fichier-résolu.tsx

# 4. Continuer le merge
git commit -m "Résolution conflits"
git push
```

### Erreur "Push rejected"

```bash
# Récupérer les changements distants d'abord
git pull origin main

# Ensuite push
git push
```

### Erreur "Untracked files"

```bash
# Ignorer certains fichiers
# Créer/éditer .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore

# Commit le .gitignore
git add .gitignore
git commit -m "Ajout gitignore"
```

---

## 📋 Checklist Avant Chaque Push

- [ ] `git status` - Vérifier les fichiers modifiés
- [ ] `npm run build` - Vérifier que le build fonctionne
- [ ] `git add .` - Ajouter tous les fichiers
- [ ] `git commit -m "..."` - Commit avec message clair
- [ ] `git push` - Push vers GitHub
- [ ] Vérifier Netlify - Attendre fin du déploiement

---

## 🎯 Commandes Spécifiques MSF Congo

### Push après modification du site client

```bash
git add src/app/pages/Home.tsx
git add src/app/components/Header.tsx
git commit -m "Mise à jour site client - nouveau design accueil"
git push
```

### Push après modification de l'admin

```bash
git add src/app/pages/admin/
git commit -m "Admin: Ajout page gestion propriétés"
git push
```

### Push après correction de bug

```bash
git add .
git commit -m "Fix: Correction routing admin sur Netlify"
git push
```

### Push documentation

```bash
git add README.md ACCES_ADMIN.md
git commit -m "Docs: Mise à jour guides utilisateur"
git push
```

---

## 🔒 Ignorer des Fichiers

### Fichiers à NE JAMAIS commiter

Votre `.gitignore` devrait contenir :

```gitignore
# Dependencies
node_modules/

# Build
dist/
build/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Netlify
.netlify/
```

---

## 🌐 Synchronisation avec Netlify

### Comment ça marche ?

```
1. Vous modifiez du code localement
2. git add + commit + push
3. GitHub reçoit les changements
4. Netlify détecte le push automatiquement
5. Netlify lance npm run build
6. Netlify déploie le nouveau build
7. Votre site est mis à jour !
```

**Temps total : 1-2 minutes** ⚡

---

## 📊 Vérifier l'État du Repo

```bash
# Informations complètes
git status

# Voir la branche actuelle
git branch

# Voir les remotes
git remote -v

# Voir les derniers commits
git log --oneline -5
```

---

## 🔄 Workflow Complet Recommandé

### Chaque jour de développement

```bash
# 1. Récupérer les dernières modifications (si équipe)
git pull

# 2. Faire vos modifications dans le code...

# 3. Tester localement
npm run dev
# Vérifier que tout fonctionne

# 4. Tester le build
npm run build
# Vérifier qu'il n'y a pas d'erreurs

# 5. Ajouter les modifications
git add .

# 6. Commit
git commit -m "Description claire de ce qui a changé"

# 7. Push
git push

# 8. Vérifier Netlify
# Aller sur app.netlify.com
# Vérifier que le deploy est en cours
# Attendre "Published"
# Tester le site en ligne
```

---

## 🚀 Commandes Rapides (Copy-Paste)

### Déploiement rapide

```bash
# Une seule commande pour tout
git add . && git commit -m "Update" && git push
```

### Status + Add + Commit + Push

```bash
git status
git add .
git commit -m "Mise à jour MSF Congo"
git push
```

### Vérifier avant de push

```bash
npm run build && git add . && git commit -m "Update" && git push
```

---

## 📞 Aide Git

```bash
# Aide générale
git help

# Aide sur une commande spécifique
git help commit
git help push
git help branch
```

---

## 🎓 Ressources Git

- **Documentation officielle** : https://git-scm.com/doc
- **Guide interactif** : https://learngitbranching.js.org
- **Cheat Sheet** : https://education.github.com/git-cheat-sheet-education.pdf

---

## ⚠️ Erreurs Communes & Solutions

### "Permission denied (publickey)"

**Solution :**
```bash
# Utiliser HTTPS au lieu de SSH
git remote set-url origin https://github.com/YOUR-USERNAME/msf-congo.git
```

### "Your branch is behind"

**Solution :**
```bash
# Récupérer et merger
git pull origin main
```

### "fatal: not a git repository"

**Solution :**
```bash
# Vous n'êtes pas dans le bon dossier
cd /chemin/vers/msf-congo
git status
```

---

## 📝 Notes Importantes

1. **Toujours** tester localement avant de push
2. **Jamais** commiter de fichiers `.env` avec des clés API
3. **Toujours** écrire des messages de commit clairs
4. **Vérifier** que le déploiement Netlify a réussi après chaque push

---

© 2024 MSF Congo - Roger ROC 🇨🇬
