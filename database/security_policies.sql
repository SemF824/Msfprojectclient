-- ============================================================================
-- MSF CONGO - SECURITY POLICIES SQL SCRIPT
-- ============================================================================
-- Ce script configure la sécurité de la base de données Supabase avec:
-- 1. Table user_roles pour éviter l'élévation de privilèges via user_metadata
-- 2. Row Level Security (RLS) sur toutes les tables sensibles
-- 3. Policies strictes pour protéger les données
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Créer la table user_roles (système de rôles robuste)
-- ============================================================================
-- Cette table remplace user_metadata pour la gestion des rôles
-- car user_metadata peut être modifié côté client, créant une faille de sécurité

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'agent', 'admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour performance sur les requêtes de vérification de rôle
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- RLS sur user_roles: seuls les admins peuvent modifier les rôles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire son propre rôle
CREATE POLICY "Users can read their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Seuls les superadmins peuvent insérer/modifier des rôles
CREATE POLICY "Only superadmins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Only superadmins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  )
);

-- ============================================================================
-- ÉTAPE 2: Sécuriser la table contact_requests
-- ============================================================================

-- Vérifier si la table existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  property_type TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'traite', 'archive'))
);

-- Activer RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs anonymes peuvent UNIQUEMENT insérer (pas de lecture)
CREATE POLICY "Anonymous users can insert contact requests"
ON public.contact_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent insérer et lire leurs propres demandes
CREATE POLICY "Authenticated users can insert contact requests"
ON public.contact_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can read their own contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Policy: SEULS les admins peuvent lire TOUTES les demandes de contact
CREATE POLICY "Admins can read all contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Policy: SEULS les admins peuvent modifier les demandes de contact
CREATE POLICY "Admins can update contact requests"
ON public.contact_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

-- Policy: SEULS les superadmins peuvent supprimer
CREATE POLICY "Only superadmins can delete contact requests"
ON public.contact_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);

-- ============================================================================
-- ÉTAPE 3: Sécuriser la table devis_requests
-- ============================================================================

-- Vérifier si la table existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.devis_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_first_name TEXT NOT NULL,
  client_last_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_alternate_phone TEXT,
  client_address TEXT NOT NULL,
  client_city TEXT NOT NULL,
  client_country TEXT NOT NULL,
  client_profession TEXT NOT NULL,
  client_company TEXT,
  client_monthly_income TEXT,

  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  property_price NUMERIC NOT NULL,

  request_type TEXT NOT NULL CHECK (request_type IN ('achat', 'location', 'information')),
  financing_needed TEXT CHECK (financing_needed IN ('oui', 'non', 'peut-etre')),
  down_payment_amount NUMERIC,

  visit_date DATE,
  visit_time TIME,
  number_of_persons INTEGER,

  message TEXT,

  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'documents', 'approuve', 'rejete')),
  priority TEXT DEFAULT 'moyenne' CHECK (priority IN ('haute', 'moyenne', 'basse')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  terms_accepted BOOLEAN DEFAULT false,
  contact_accepted BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.devis_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs anonymes peuvent UNIQUEMENT insérer
CREATE POLICY "Anonymous users can insert devis requests"
ON public.devis_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent insérer et lire leurs propres devis
CREATE POLICY "Authenticated users can insert devis requests"
ON public.devis_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can read their own devis requests"
ON public.devis_requests
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR client_email = auth.jwt()->>'email'
);

-- Policy: SEULS les admins/agents peuvent lire TOUS les devis
CREATE POLICY "Admins and agents can read all devis requests"
ON public.devis_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('agent', 'admin', 'superadmin')
  )
);

-- Policy: SEULS les admins/agents peuvent modifier les devis
CREATE POLICY "Admins and agents can update devis requests"
ON public.devis_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('agent', 'admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('agent', 'admin', 'superadmin')
  )
);

-- Policy: SEULS les superadmins peuvent supprimer
CREATE POLICY "Only superadmins can delete devis requests"
ON public.devis_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);

-- ============================================================================
-- ÉTAPE 4: Fonction helper pour vérifier les rôles (optionnelle mais utile)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = uid;

  RETURN COALESCE(user_role, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 5: Trigger pour updated_at automatique
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables
CREATE TRIGGER set_updated_at_user_roles
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_contact_requests
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_devis_requests
  BEFORE UPDATE ON public.devis_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ÉTAPE 6: Instructions de déploiement
-- ============================================================================

-- Pour exécuter ce script:
-- 1. Connectez-vous à votre console Supabase
-- 2. Allez dans "SQL Editor"
-- 3. Créez une nouvelle requête
-- 4. Copiez-collez l'intégralité de ce fichier
-- 5. Cliquez sur "Run" pour exécuter

-- IMPORTANT: Après l'exécution, créez manuellement un premier superadmin:
-- INSERT INTO public.user_roles (user_id, role, created_by)
-- VALUES ('VOTRE_USER_ID_ICI', 'superadmin', 'VOTRE_USER_ID_ICI');

-- Pour obtenir votre user_id:
-- SELECT id FROM auth.users WHERE email = 'votre-email@exemple.com';

-- ============================================================================
-- NOTES DE SÉCURITÉ SUPPLÉMENTAIRES
-- ============================================================================

-- 1. Rate Limiting: Configurez des limites de taux dans Supabase Dashboard
--    pour empêcher les attaques DDoS sur les endpoints publics
--
-- 2. Email Verification: Activez la vérification d'email dans Auth > Settings
--
-- 3. Captcha: Intégrez reCAPTCHA v3 ou Turnstile côté client avant l'insertion
--
-- 4. Monitoring: Configurez des alertes pour détecter les anomalies:
--    - Volume anormal d'insertions
--    - Tentatives d'élévation de privilèges
--    - Requêtes suspectes
--
-- 5. Backup: Configurez des sauvegardes automatiques quotidiennes
--
-- 6. Audit Logs: Considérez l'ajout d'une table d'audit pour tracer
--    toutes les modifications sensibles (changements de rôle, etc.)
