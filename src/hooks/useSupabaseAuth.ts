import { useState, useEffect } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseKey);

// Crée le client uniquement si les variables sont présentes
const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

if (!isConfigured) {
  console.warn(
    "[useSupabaseAuth] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. " +
    "Le hook fonctionne en mode dégradé (pas d'authentification)."
  );
}

interface UseSupabaseAuthReturn {
  user: User | null;
  isAdmin: boolean;
  userRole: 'admin' | 'superadmin' | 'client' | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  getSession: () => Promise<any>;
  // IMPORTANT : isAdmin est pour l'UI uniquement (basé sur user_metadata).
  // La vraie vérification de sécurité se fait dans ProtectedAdminRoute via la table user_roles.
  verifyAdminRole: () => Promise<boolean>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured); // false d'emblée si pas configuré

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[useSupabaseAuth] Erreur récupération session :', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const userRole = (user?.user_metadata?.role as 'admin' | 'superadmin' | 'client') || null;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('[useSupabaseAuth] Erreur déconnexion :', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase non configuré.') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { data: null, error };
      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const getSession = async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  // ── Vérification sécurisée du rôle admin via la table public.user_roles ──────
  // Contrairement à isAdmin (user_metadata), cette fonction interroge la DB
  // et ne peut pas être falsifiée côté client.
  const verifyAdminRole = async (): Promise<boolean> => {
    if (!supabase || !user) return false;
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (error || !data) return false;
    return ['admin', 'superadmin'].includes(data.role);
  };

  return { user, isAdmin, userRole, isLoading, signOut, signIn, getSession, verifyAdminRole };
}

export { supabase };