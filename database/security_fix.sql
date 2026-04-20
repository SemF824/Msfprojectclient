-- ============================================================
-- CORRECTION SÉCURITÉ : Vérification admin côté serveur
-- Le role dans user_metadata est modifiable côté client !
-- Cette fonction utilise la table user_roles (plus sécurisée)
-- ============================================================

-- 1. S'assurer que la table user_roles existe (du fichier security_policies.sql)
-- Si pas encore créée, créer l'utilisateur admin manuellement :

-- Obtenir l'UUID de l'admin :
-- SELECT id FROM auth.users WHERE email = 'votre-admin@email.com';

-- Insérer le rôle admin (remplacer UUID_ICI par le vrai UUID) :
-- INSERT INTO public.user_roles (user_id, role, created_by)
-- VALUES ('UUID_ICI', 'admin', 'UUID_ICI')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 2. Vérification : le hook useSupabaseAuth.ts utilise user_metadata.role
-- Pour une sécurité maximale, ajouter cette policy Supabase pour que
-- les routes admin vérifient la table user_roles et non user_metadata :

-- Créer une fonction RLS sécurisée pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$;

-- Appliquer sur devis_requests : seuls les admins peuvent tout voir
CREATE POLICY "Admins can read all devis_requests via user_roles"
ON public.devis_requests
FOR SELECT
TO authenticated
USING (
  client_email = auth.jwt()->>'email'
  OR public.check_is_admin()
);

-- Appliquer sur contact_requests
CREATE POLICY "Admins can read all contact_requests via user_roles"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (
  email = auth.jwt()->>'email'
  OR public.check_is_admin()
);

-- 3. Mettre à jour user_metadata pour cohérence visuelle côté client
-- (le hook useSupabaseAuth vérifie user_metadata.role pour l'UI,
--  mais les policies Supabase vérifient la table user_roles pour la sécurité réelle)

-- Pour chaque admin, s'assurer que les deux sont synchronisés :
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE id IN (
  SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'superadmin')
);
