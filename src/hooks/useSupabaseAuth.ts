import { useState, useEffect, useCallback } from "react";
import {
  createClient,
  SupabaseClient,
  User,
  AuthResponse,
} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseKey);

// Crée le client uniquement si les variables sont présentes
const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

if (!isConfigured) {
  console.warn(
    "[useSupabaseAuth] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. " +
      "Le hook fonctionne en mode dégradé (pas d'authentification).",
  );
}

export type AppUserRole = "admin" | "superadmin" | "client" | null;

// Temps d'inactivité avant déconnexion automatique (2 heures)
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;
let inactivityTimer: NodeJS.Timeout | null = null;
let isActivityListenerAttached = false;

const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (!supabase) return;

  inactivityTimer = setTimeout(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log("[Auth] Déconnexion automatique pour inactivité.");
        supabase.auth.signOut();
      }
    });
  }, INACTIVITY_TIMEOUT);
};

const setupGlobalActivityListeners = () => {
  if (isActivityListenerAttached || typeof window === "undefined") return;

  const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
  const handleActivity = () => resetInactivityTimer();

  events.forEach((event) => window.addEventListener(event, handleActivity));
  isActivityListenerAttached = true;
};

// Écoute des déconnexions cross-tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "supabase.auth.token" && !e.newValue) {
      if (supabase) supabase.auth.signOut();
    }
  });
}

interface UseSupabaseAuthReturn {
  user: User | null;
  isAdmin: boolean;
  userRole: AppUserRole;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data: AuthResponse["data"] | null; error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  getSession: () => Promise<any>;
  verifyAdminRole: () => Promise<boolean>;
  getUserRole: (targetUser?: User | null) => Promise<AppUserRole>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppUserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Gestion de l'inactivité ---
  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("[useSupabaseAuth] Erreur déconnexion :", error);
    }
  }, []);

  // Détermine le rôle de manière fiable (user_roles DB puis fallback user_metadata)
  const resolveRole = useCallback(
    async (currentUser: User | null): Promise<AppUserRole> => {
      if (!currentUser) return null;

      // 1. Tenter la vérification via la table sécurisée public.user_roles
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .maybeSingle();

          if (!error && data?.role) {
            const dbRole = data.role as AppUserRole;
            if (
              dbRole === "admin" ||
              dbRole === "superadmin" ||
              dbRole === "client"
            ) {
              return dbRole;
            }
          }
        } catch (err) {
          console.warn(
            "[useSupabaseAuth] Erreur lors de la lecture de user_roles:",
            err,
          );
        }
      }

      // 2. Fallback sur user_metadata
      const metadataRole = currentUser.user_metadata?.role as AppUserRole;
      if (
        metadataRole === "admin" ||
        metadataRole === "superadmin" ||
        metadataRole === "client"
      ) {
        return metadataRole;
      }

      return "client";
    },
    [],
  );

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const role = await resolveRole(sessionUser);
          if (isMounted) setUserRole(role);
          setupGlobalActivityListeners();
          resetInactivityTimer();
        } else {
          if (isMounted) setUserRole(null);
          if (inactivityTimer) clearTimeout(inactivityTimer);
        }
      } catch (error) {
        console.error("[useSupabaseAuth] Erreur récupération session :", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        if (isMounted) {
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          if (inactivityTimer) clearTimeout(inactivityTimer);
        }
        return;
      }

      const sessionUser = session?.user ?? null;
      if (isMounted) {
        setUser(sessionUser);
        if (sessionUser) {
          const role = await resolveRole(sessionUser);
          if (isMounted) setUserRole(role);
          setupGlobalActivityListeners();
          resetInactivityTimer();
        } else {
          setUserRole(null);
          if (inactivityTimer) clearTimeout(inactivityTimer);
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resolveRole]);

  const isAdmin = userRole === "admin" || userRole === "superadmin";

  const signOut = handleSignOut;

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error("Supabase non configuré.") };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { data: null, error };

      if (data.user) {
        setUser(data.user);
        const role = await resolveRole(data.user);
        setUserRole(role);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error("Supabase non configuré.") };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const getSession = async () => {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  };

  const verifyAdminRole = async (): Promise<boolean> => {
    if (!supabase || !user) return false;
    const role = await resolveRole(user);
    return role === "admin" || role === "superadmin";
  };

  const getUserRole = async (
    targetUser?: User | null,
  ): Promise<AppUserRole> => {
    return resolveRole(targetUser !== undefined ? targetUser : user);
  };

  return {
    user,
    isAdmin,
    userRole,
    isLoading,
    signOut,
    signIn,
    resetPassword,
    getSession,
    verifyAdminRole,
    getUserRole,
  };
}

export { supabase };
