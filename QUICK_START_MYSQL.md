# 🚀 Quick Start MySQL Local - MSF Congo

## ⚡ Démarrage en 3 Minutes

### Étape 1 : Vérifier Docker

```bash
# Vérifier si Docker est installé
docker --version

# Si pas installé, télécharger ici :
# https://www.docker.com/products/docker-desktop
```

### Étape 2 : Lancer MySQL

```bash
# À la racine du projet MSF Congo
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Résultat attendu :
# NAME                IMAGE              STATUS
# msf_mysql           mysql:8.0          Up (healthy)
# msf_phpmyadmin      phpmyadmin:latest  Up
```

### Étape 3 : Accéder à phpMyAdmin

```
🌐 URL : http://localhost:8080

📋 Serveur : mysql
👤 Utilisateur : msf_admin
🔑 Mot de passe : msf_admin_2024
```

### Étape 4 : Vérifier les Données

Dans phpMyAdmin :

1. Cliquer sur base `msf_congo` (à gauche)
2. Vérifier que 7 tables existent :
   - ✅ `clients` (2 clients de test)
   - ✅ `demandes` (2 demandes de test)
   - ✅ `documents`
   - ✅ `proprietes` (2 propriétés de test)
   - ✅ `transactions`
   - ✅ `activities` (1 activité de test)
3. Cliquer sur `clients` → `Parcourir`
4. Voir les 2 clients : Jean Dupont & Marie Okemba

---

## ✅ C'est Fait !

Votre base MySQL locale est prête avec :

- ✅ 7 tables créées
- ✅ Relations (foreign keys) configurées
- ✅ Données de test insérées
- ✅ phpMyAdmin accessible
- ✅ Encodage UTF8MB4 (emojis, accents)

---

## 📊 Données de Test Disponibles

### Clients

| ID | Nom | Email | Téléphone | Statut |
|----|-----|-------|-----------|--------|
| client-001 | Jean Dupont | jean.dupont@email.com | +242 06 458 86 18 | prospect |
| client-002 | Marie Okemba | m.okemba@company.cg | +242 05 587 73 24 | client |

### Propriétés

| ID | Nom | Type | Prix (FCFA) | Statut |
|----|-----|------|-------------|--------|
| tchikobo-villa-5 | Villa Tchikobo Prestige | villa | 295 200 000 | disponible |
| appartement-royal-3b | Appartement Royal 3B | appartement | 75 000 000 | disponible |

### Demandes

| ID | Client | Propriété | Type | Statut |
|----|--------|-----------|------|--------|
| REQ-001 | Jean Dupont | Villa Tchikobo | achat | nouveau |
| REQ-002 | Marie Okemba | Appartement Royal | visite | en_cours |

---

## 🧪 Tester avec SQL

Dans phpMyAdmin, onglet **SQL**, essayez ces requêtes :

### Voir tous les clients

```sql
SELECT * FROM clients;
```

### Voir les demandes avec infos client

```sql
SELECT 
  d.id AS demande_id,
  CONCAT(c.first_name, ' ', c.last_name) AS client_name,
  c.email,
  c.phone,
  d.property_name,
  d.property_price,
  d.request_type,
  d.status,
  d.priority,
  d.created_at
FROM demandes d
JOIN clients c ON d.client_id = c.id
ORDER BY d.created_at DESC;
```

### Compter les demandes par statut

```sql
SELECT 
  status,
  COUNT(*) AS total
FROM demandes
GROUP BY status;
```

### Voir les propriétés disponibles

```sql
SELECT 
  name,
  type,
  bedrooms,
  surface,
  FORMAT(price, 0, 'fr_FR') AS prix_fcfa,
  status
FROM proprietes
WHERE status = 'disponible'
ORDER BY price DESC;
```

---

## 📋 Commandes Utiles

### Démarrer MySQL

```bash
docker-compose up -d
```

### Arrêter MySQL

```bash
docker-compose down
```

### Voir les logs en temps réel

```bash
docker-compose logs -f mysql
```

### Redémarrer MySQL

```bash
docker-compose restart mysql
```

### Se connecter en ligne de commande

```bash
docker exec -it msf_mysql mysql -u msf_admin -p
# Mot de passe : msf_admin_2024

# Puis :
USE msf_congo;
SHOW TABLES;
SELECT * FROM clients;
```

### Backup de la base

```bash
docker exec msf_mysql mysqldump -u msf_admin -pmsf_admin_2024 msf_congo > backup_$(date +%Y%m%d).sql
```

### Restaurer un backup

```bash
docker exec -i msf_mysql mysql -u msf_admin -pmsf_admin_2024 msf_congo < backup_20240417.sql
```

---

## 🔧 Configuration

### Informations de Connexion

```
Host: localhost
Port: 3306
Database: msf_congo
User: msf_admin
Password: msf_admin_2024
Root Password: msf_root_2024 (ne pas utiliser)
```

### phpMyAdmin

```
URL: http://localhost:8080
Upload Limit: 50MB
```

### Volumes Docker

```
Données MySQL : mysql_data (volume Docker)
Init SQL : ./database/init.sql (monté au démarrage)
```

---

## ❓ Dépannage

### Problème : Port 3306 déjà utilisé

```bash
# Voir quel process utilise le port
# Windows
netstat -ano | findstr :3306

# Mac/Linux
lsof -i :3306

# Solution : Arrêter MySQL local ou changer le port
# Dans docker-compose.yml : "3307:3306"
```

### Problème : Conteneur ne démarre pas

```bash
# Voir les logs
docker-compose logs mysql

# Supprimer et recréer
docker-compose down -v
docker-compose up -d
```

### Problème : Données de test manquantes

```bash
# Réinitialiser la base
docker-compose down -v
docker-compose up -d

# Le fichier init.sql sera re-exécuté
```

### Problème : phpMyAdmin inaccessible

```bash
# Vérifier que le conteneur tourne
docker-compose ps

# Redémarrer
docker-compose restart phpmyadmin
```

---

## 🚀 Prochaines Étapes

Maintenant que MySQL est prêt, vous pouvez :

1. ✅ **Créer l'API Backend** - Routes pour CRUD clients, demandes, etc.
2. ✅ **Connecter l'Admin App** - Afficher les vraies données MySQL
3. ✅ **Tester les uploads de documents** - Stocker chemins dans DB
4. ✅ **Ajouter plus de données** - Via phpMyAdmin ou API
5. ✅ **Créer des rapports** - Statistiques, analytics

---

## 📚 Documentation Complète

- 📄 **Schéma complet** : `/DATABASE_SCHEMA.md`
- 🐬 **Setup détaillé** : `/MYSQL_LOCAL_SETUP.md`
- 🔧 **Corrections routing** : `/CORRECTIONS_ROUTING.md`
- 🧪 **Tests routing** : `/TEST_ROUTING.md`

---

## ✅ Checklist

Après avoir suivi ce guide :

- [ ] ✅ Docker Desktop installé et lancé
- [ ] ✅ `docker-compose up -d` exécuté
- [ ] ✅ phpMyAdmin accessible sur http://localhost:8080
- [ ] ✅ 7 tables visibles dans `msf_congo`
- [ ] ✅ 2 clients de test visibles
- [ ] ✅ 2 propriétés de test visibles
- [ ] ✅ 2 demandes de test visibles

**Tout est vert ? Parfait ! 🎉**

Vous pouvez maintenant développer l'API backend et connecter votre Admin App à MySQL.

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez un problème :

1. Vérifier les logs : `docker-compose logs -f mysql`
2. Vérifier que Docker Desktop tourne
3. Vider le cache Docker : `docker system prune`
4. Redémarrer Docker Desktop
5. Réessayer `docker-compose up -d`

---

© 2024 MSF Congo - Roger ROC 🇨🇬
Base de données MySQL locale prête pour développement ! 🚀
