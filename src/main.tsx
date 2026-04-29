import { createRoot } from "react-dom/client";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import App from "./app/App.tsx";
import "./styles/index.css";

// Récupération de la clé depuis les variables d'environnement
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!recaptchaKey) {
  console.warn("⚠️ Attention : VITE_RECAPTCHA_SITE_KEY est manquante. Le système anti-bot est inopérant.");
}

createRoot(document.getElementById("root")!).render(
  <GoogleReCaptchaProvider
    reCaptchaKey={recaptchaKey || "CLE_MANQUANTE"}
    language="fr"
    scriptProps={{
      async: true,
      defer: true,
      appendTo: "head",
      nonce: undefined // À configurer si tu mets en place une Content Security Policy (CSP) stricte plus tard
    }}
  >
    <App />
  </GoogleReCaptchaProvider>
);