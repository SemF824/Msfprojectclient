# Configuration de Sécurité - MSF Congo

Ce guide explique comment configurer l'authentification Supabase et la sécurité pour MSF Congo.

## 1. Configuration des Variables d'Environnement

### Étape 1 : Copier .env.example

```bash
cp .env.example .env
```

### Étape 2 : Remplir les Valeurs Supabase

Dans le fichier `.env`, remplacez les valeurs suivantes :

```env
VITE_SUPABASE_URL=https://kkrfqweqapnhcnjlzmvm.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_key_ici
```

**⚠️ IMPORTANT :** Ne committez JAMAIS le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

## 2. Configuration de l'Authentification Admin dans Supabase

### Créer un Utilisateur Admin

1. Allez dans votre projet Supabase > **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Remplissez :
   - Email : `admin@msfcongo.com` (ou votre email admin)
   - Password : Un mot de passe fort
   - **Auto-confirm user** : Activé

### Ajouter le Rôle Admin

Dans Supabase, allez dans **SQL Editor** et exécutez cette commande pour donner le rôle admin :

```sql
-- Ajouter le rôle admin à l'utilisateur
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'admin@msfcongo.com';
```

### Vérification

```sql
-- Vérifier que le rôle a été ajouté
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@msfcongo.com';
```

Vous devriez voir :
```
email                    | role
-------------------------+-------
admin@msfcongo.com      | admin
```

## 3. Créer la Table contact_requests dans Supabase

### Création de la Table

Dans **SQL Editor** de Supabase, exécutez :

```sql
-- Table pour les demandes de contact
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  property_type TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'traite', 'archive'))
);

-- Index pour améliorer les performances
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_contact_requests_email ON contact_requests(email);

-- Row Level Security (RLS)
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs non authentifiés peuvent insérer
CREATE POLICY "Allow anonymous insert"
  ON contact_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique : Seuls les admins peuvent lire
CREATE POLICY "Allow admin read"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Politique : Seuls les admins peuvent mettre à jour
CREATE POLICY "Allow admin update"
  ON contact_requests
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Politique : Seuls les admins peuvent supprimer
CREATE POLICY "Allow admin delete"
  ON contact_requests
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

### Vérification

```sql
-- Vérifier que la table a été créée
SELECT * FROM contact_requests LIMIT 1;
```

## 4. Tester l'Authentification

### Test Admin Login

1. Accédez à `http://localhost:5173/admin` (ou votre URL de développement)
2. Connectez-vous avec :
   - Email : `admin@msfcongo.com`
   - Mot de passe : Le mot de passe que vous avez défini dans Supabase
3. Vous devriez être redirigé vers `/dashboard`

### Test Formulaire Contact

1. Accédez à `http://localhost:5173/contact`
2. Remplissez le formulaire de contact
3. Soumettez le formulaire
4. Vérifiez dans Supabase > **Table Editor** > `contact_requests` que la demande a été enregistrée

## 5. Configuration de Production

### Variables d'Environnement en Production

Pour déployer en production (Vercel, Netlify, etc.), ajoutez les variables d'environnement suivantes dans les paramètres de votre plateforme :

```
VITE_SUPABASE_URL=https://kkrfqweqapnhcnjlzmvm.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_key_production
```

### Sécurité Supplémentaire Recommandée

1. **Activer l'authentification à deux facteurs (2FA)** pour tous les comptes admin
2. **Configurer les politiques RLS** strictes dans Supabase
3. **Monitorer les logs d'authentification** dans Supabase
4. **Limiter les tentatives de connexion** (Rate limiting)
5. **Utiliser HTTPS uniquement** en production

## 6. Résolution des Problèmes

### Erreur : "Invalid login credentials"

- Vérifiez que l'utilisateur existe dans Supabase > Authentication > Users
- Vérifiez que le mot de passe est correct
- Vérifiez que l'utilisateur a confirmé son email (Auto-confirm activé)

### Erreur : "User is not an admin"

- Exécutez à nouveau la requête SQL pour ajouter le rôle admin
- Vérifiez avec `SELECT raw_user_meta_data FROM auth.users WHERE email = 'admin@msfcongo.com'`
- Assurez-vous que le rôle est bien `"admin"` (avec guillemets)

### Erreur : "Table contact_requests does not exist"

- Exécutez le script SQL de création de la table
- Vérifiez dans Supabase > Table Editor que la table existe

### Erreur : "Row Level Security policy violation"

- Vérifiez que les politiques RLS sont correctement configurées
- Pour tester, vous pouvez temporairement désactiver RLS : `ALTER TABLE contact_requests DISABLE ROW LEVEL SECURITY;`
- **⚠️ Ne JAMAIS désactiver RLS en production !**

## 7. Schéma de Base de Données Complet

Pour référence, voici le schéma complet recommandé pour MSF Congo :

```sql
-- Vous avez déjà :
-- - auth.users (table Supabase Auth par défaut)
-- - contact_requests (créée ci-dessus)

-- Tables supplémentaires recommandées pour le futur :

-- Table des propriétés
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'reserve', 'vendu')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes de devis
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'documents', 'approuve', 'rejete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Support

Pour toute question ou problème, contactez l'équipe de développement MSF Congo.

---

**Dernière mise à jour :** 2026-04-17
