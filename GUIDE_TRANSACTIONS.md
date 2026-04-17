# Guide du Système de Transactions MSF Congo

## 📋 Vue d'ensemble

Le système de transactions MSF Congo permet aux utilisateurs de :
- ✅ Effectuer des réservations de propriétés avec acompte
- ✅ Gérer des paiements échelonnés
- ✅ Suivre l'historique de toutes les transactions
- ✅ Utiliser plusieurs moyens de paiement (Mobile Money, Virement, Carte)

## 🚀 Comment Tester le Système

### 1. Accéder au Dashboard
1. Allez sur la page d'accueil : `/`
2. Cliquez sur "Connexion" dans le menu
3. Ou accédez directement au Dashboard : `/dashboard`

### 2. Voir les Transactions
**Option A - Depuis le Dashboard :**
- Sur le Dashboard (`/dashboard`)
- Cliquez sur "Voir Transactions" dans la section "Demandes Récentes"

**Option B - URL directe :**
- Accédez à `/transactions`

### 3. Voir les Détails d'une Transaction
- Sur la page Transactions (`/transactions`)
- Cliquez sur n'importe quelle transaction
- Ou accédez directement : `/transaction/1`

### 4. Effectuer une Nouvelle Réservation
**Option A - Depuis une propriété :**
1. Allez sur `/propriete/tchikobo-villa-5`
2. Cliquez sur "Réserver Maintenant"

**Option B - URL directe :**
- Accédez à `/reserver/tchikobo-villa-5`

## 💳 Moyens de Paiement Disponibles

### 1. Mobile Money (Populaire au Congo)
- **Airtel Money** : +242 05 XXX XX XX
- **MTN Mobile Money** : +242 06 XXX XX XX
- Confirmation instantanée par notification

### 2. Virement Bancaire
Banques supportées :
- BGFI Bank Congo
- Ecobank Congo
- BICEC
- UBA Congo
- Banque de Développement du Congo

Traitement : 24-48h ouvrées

### 3. Carte Bancaire
- Visa
- Mastercard
- Paiement sécurisé par SSL

## 📊 Types de Transactions

### Réservation (Acompte)
- Montant : 30% du prix total
- Bloque la propriété
- Confirmation immédiate

### Paiement Échelonné
- Plans flexibles (4, 10 échéances, etc.)
- Suivi de chaque paiement
- Rappels automatiques

### Paiement Intégral
- Paiement complet en une fois
- Transfert de propriété immédiat

## 🔍 Fonctionnalités de la Page Transactions

### Filtres et Recherche
- **Recherche** : Par nom de propriété ou ID de transaction
- **Filtre par statut** :
  - ✅ Complété
  - ⏳ En Attente
  - 🔄 En Cours
  - ❌ Échoué

### Statistiques
- Total payé (en FCFA)
- Nombre de transactions
- Transactions en attente
- Transactions complétées

### Actions
- 📥 Exporter l'historique
- 📄 Télécharger les reçus
- 🖨️ Imprimer
- 📧 Envoyer par email

## 🔐 Sécurité

### Informations Protégées
- ✅ Cryptage SSL de niveau bancaire
- ✅ Aucune donnée bancaire stockée localement
- ✅ Tokens de session sécurisés
- ✅ Validation côté serveur

### Note Importante
⚠️ **Cette démo utilise des données fictives**. Pour la production, connectez :
- Gateway de paiement Mobile Money (Airtel/MTN API)
- Système bancaire sécurisé
- Service de validation des cartes

## 📱 Pages du Système

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Vue d'ensemble du compte |
| Transactions | `/transactions` | Liste de toutes les transactions |
| Détail Transaction | `/transaction/:id` | Détails complets d'une transaction |
| Réservation | `/reserver/:propertyId` | Formulaire de paiement |

## 💰 Montants en FCFA

Tous les montants sont affichés en **FCFA (Franc CFA)**, la monnaie officielle du Congo-Brazzaville.

**Exemples de prix :**
- Villa Tchikobo Prestige : 295 200 000 FCFA
- Acompte (30%) : 88 556 000 FCFA
- Frais de traitement : 10 000 FCFA

## 📞 Support

En cas de problème avec une transaction :
- 📧 Email : promotions@msfcongo.com
- ☎️ Téléphone : +242 06 458 86 18 ou +242 05 587 73 24
- 📍 Bureau : Immeuble MSF, Place Antonetti, 7ème étage, Pointe-Noire

## 🎯 Prochaines Étapes

Pour mettre en production :

1. **Backend Supabase** :
   - Créer les tables de transactions
   - Implémenter l'authentification
   - Ajouter les webhooks de paiement

2. **Intégrations** :
   - API Airtel Money
   - API MTN Mobile Money
   - Gateway bancaire

3. **Sécurité** :
   - Validation 2FA
   - KYC (Know Your Customer)
   - Détection de fraude

4. **Notifications** :
   - Email de confirmation
   - SMS pour Mobile Money
   - Alertes de paiement

## 🏆 Fonctionnalités Bonus

- ✨ Animation fluide avec Motion
- 📊 Statistiques en temps réel
- 🎨 Design responsive (mobile/tablet/desktop)
- 🔄 Timeline interactive des transactions
- 📱 Optimisé pour Mobile Money (très populaire au Congo)
