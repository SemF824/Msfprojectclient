export * from "../context/LanguageContext";
import { detectLanguageFromCloudflare } from "../context/LanguageContext";

// Exécution anticipée côté bundle
if (typeof window !== "undefined") {
  detectLanguageFromCloudflare().then((lang) => {
    document.documentElement.lang = lang;
  });
}
