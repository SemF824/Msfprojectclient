import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./app/App.tsx";
import "./styles/index.css";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://e72c1c74f5b185795af92c9330c41da5@o4512084926595072.ingest.de.sentry.io/4512084941144144",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  },
  integrations: [
    Sentry.replayIntegration()
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);

// Récupération de la clé depuis les variables d'environnement
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
      gcTime: 1000 * 60 * 30, // 30 minutes (remplace cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey || "CLE_MANQUANTE"}
      language="fr"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
        nonce: undefined, // À configurer si tu mets en place une Content Security Policy (CSP) stricte plus tard
      }}
    >
      <App />
    </GoogleReCaptchaProvider>
  </QueryClientProvider>,
);
