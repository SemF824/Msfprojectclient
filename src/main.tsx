import "./i18n/index";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import * as Sentry from "@sentry/react";
import App from "./app/App.tsx";
import "./styles/index.css";

// Initialisation Sentry avec masquage des conteneurs tiers
Sentry.init({
  dsn: "https://e72c1c74f5b185795af92c9330c41da5@o4512084926595072.ingest.de.sentry.io/4512084941144144",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
      // Empêche Sentry de sérialiser et d'inspecter les iframes tierces (Google reCAPTCHA, Calendly)
      block: [
        ".grecaptcha-badge",
        "iframe[src*='google.com']",
        "iframe[src*='recaptcha']",
        "iframe[src*='calendly.com']",
      ],
    }),
  ],
  ignoreErrors: [
    "Blocked a frame with origin",
    "SecurityError: Blocked a frame",
    "Permission denied to access property",
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Récupération de la clé reCAPTCHA
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!recaptchaKey) {
  console.warn(
    "⚠️ Attention : VITE_RECAPTCHA_SITE_KEY est manquante. Le système anti-bot est inopérant.",
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("L'élément racine #root est introuvable dans le DOM.");
}

createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey || "CLE_MANQUANTE"}
      language="fr"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <App />
    </GoogleReCaptchaProvider>
  </QueryClientProvider>,
);