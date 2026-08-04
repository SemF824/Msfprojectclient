/// <reference types="vite/client" />/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_CALENDLY_URL: string
  readonly VITE_ADMIN_EMAIL: string
  // Ajoutez d'autres variables si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}