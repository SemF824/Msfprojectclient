import { EnvVariables } from '../types/env';

export const getEnv = (): EnvVariables => {
  const env: EnvVariables = {
    VITE_CALENDLY_URL: import.meta.env.VITE_CALENDLY_URL as string,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    VITE_ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL as string,
  };

  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.error("CRITICAL: Variables d'environnement Supabase manquantes.");
  }

  return env;
};