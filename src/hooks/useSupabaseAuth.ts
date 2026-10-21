import { useState, useEffect, useCallback } from "react";
import {
  createClient,
  SupabaseClient,
  User,
  AuthResponse,
  AuthError,
  Session,
} from "@supabase/supabase-js";
import * as Sentry from "@sentry/react";
import { secureCookieStorage } from "../utils/cookieStorage";
import { initializeUserKeys } from "../utils/crypto/e2ee";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseKey);

// Nettoyage préventif des anciens tokens non sécurisés dans localStorage
if (typeof window !== "undefined") {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore les erreurs d'accès à localStorage
  }
}

// Client Supabase durci avec stockage sécurisé par Cookies et protocole PKCE
const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        storage: secureCookieStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
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
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
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

// Synchronise ou génère les clés cryptographiques E2EE (IndexedDB + Supabase public keys)
const ensureUserE2EEKeys = async (userId: string) => {
  if (!supabase) return;
  try {
    const keys = await initializeUserKeys(userId);
    if (!keys) return;

    const { error } = await supabase
      .from("user_public_keys")
      .upsert(
        {
          user_id: userId,
          ecdh_pub_key: keys.ecdhPubJwk,
          ecdsa_pub_key: keys.ecdsaPubJwk,
        },
        { onConflict: "user_id" },
      );

    if (error) {
      console.warn(
        "[useSupabaseAuth] Erreur lors de l'enregistrement des clés publiques E2EE :",
        error,
      );
    }
  } catch (err) {
    console.warn("[useSupabaseAuth] Exception lors de l'initialisation E2EE :", err);
  }
};

interface UseSupabaseAuthReturn {
  user: User | null;
  isAdmin: boolean;
  userRole: AppUserRole;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  signOut: (options?: { scope?: "global" | "local" | "others" }) => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data: AuthResponse["data"] | null; error: Error | AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | AuthError | null }>;
  getSession: () => Promise<Session | null>;
  verifyAdminRole: () => Promise<boolean>;
  getUserRole: (targetUser?: User | null) => Promise<AppUserRole>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppUserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // --- Gestion de la déconnexion ---
  const handleSignOut = useCallback(
    async (options?: { scope?: "global" | "local" | "others" }) => {
      if (!supabase) return;
      try {
        await supabase.auth.signOut(options);
        setUser(null);
        setUserRole(null);
        setIsPasswordRecovery(false);
        Sentry.setUser(null);
      } catch (error) {
        console.error("[useSupabaseAuth] Erreur déconnexion :", error);
        Sentry.captureException(error, {
          tags: { context: "supabase_auth_sign_out" },
        });
      }
    },
    [],
  );

  // Détermine le rôle de manière fiable (table user_roles DB puis fallback user_metadata)
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
          Sentry.setUser({ id: sessionUser.id, email: sessionUser.email });
          setupGlobalActivityListeners();
          resetInactivityTimer();
          await ensureUserE2EEKeys(sessionUser.id);
        } else {
          if (isMounted) setUserRole(null);
          Sentry.setUser(null);
          if (inactivityTimer) clearTimeout(inactivityTimer);
        }
      } catch (error) {
        console.error("[useSupabaseAuth] Erreur récupération session :", error);
        Sentry.captureException(error, {
          tags: { context: "supabase_auth_init_session" },
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        if (isMounted) {
          setIsPasswordRecovery(true);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null);
          setUserRole(null);
          setIsPasswordRecovery(false);
          Sentry.setUser(null);
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
          Sentry.setUser({ id: sessionUser.id, email: sessionUser.email });
          setupGlobalActivityListeners();
          resetInactivityTimer();
          ensureUserE2EEKeys(sessionUser.id);
        } else {
          setUserRole(null);
          Sentry.setUser(null);
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
      const err = new Error("Supabase non configuré.");
      Sentry.captureException(err, { tags: { context: "supabase_auth_sign_in" } });
      return { data: null, error: err };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.status !== 400) {
          Sentry.captureException(error, {
            tags: { context: "supabase_auth_sign_in_failure", http_status: String(error.status) },
            extra: { email },
          });
        }
        return { data: null, error };
      }

      if (data.user) {
        setUser(data.user);
        setIsPasswordRecovery(false);
        const role = await resolveRole(data.user);
        setUserRole(role);
        Sentry.setUser({ id: data.user.id, email: data.user.email });
        await ensureUserE2EEKeys(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      Sentry.captureException(error as Error, {
        tags: { context: "supabase_auth_sign_in_exception" },
      });
      return { data: null, error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      const err = new Error("Supabase non configuré.");
      Sentry.captureException(err, { tags: { context: "supabase_auth_reset_password" } });
      return { error: err };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        Sentry.captureException(error, {
          tags: {
            context: "supabase_auth_reset_password_server_error",
            http_status: String(error.status ?? "unknown"),
          },
          extra: {
            email,
            origin: window.location.origin,
            errorMessage: error.message,
          },
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      Sentry.captureException(error as Error, {
        tags: { context: "supabase_auth_reset_password_exception" },
        extra: { email },
      });
      return { error: error as Error };
    }
  };

  const getSession = async (): Promise<Session | null> => {
    if (!supabase) return null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      Sentry.captureException(error as Error, {
        tags: { context: "supabase_auth_get_session" },
      });
      return null;
    }
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
    isPasswordRecovery,
    signOut,
    signIn,
    resetPassword,
    getSession,
    verifyAdminRole,
    getUserRole,
  };
}

export { supabase };