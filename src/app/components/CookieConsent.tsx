import { useState, useEffect } from "react";
import { Link } from "react-router";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-[#0a0f1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#d4af37]/30 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center shrink-0">
                <Cookie className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Nous respectons votre vie privée
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous utilisons des cookies essentiels pour faire fonctionner
                  ce site. Afin de vous offrir une meilleure expérience, de
                  réaliser des statistiques d'audience et d'interagir avec des
                  services tiers, nous souhaiterions également utiliser des
                  cookies non-essentiels.{" "}
                  <Link
                    to="/cookie-policy"
                    className="text-[#d4af37] hover:underline whitespace-nowrap"
                    aria-label="En savoir plus sur notre politique de cookies"
                  >
                    En savoir plus
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={declineCookies}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium focus:ring-2 focus:ring-[#d4af37] focus:outline-none"
                aria-label="Refuser les cookies non essentiels"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-2.5 rounded-lg bg-[#d4af37] text-white hover:bg-[#b08d27] transition-colors text-sm font-medium shadow-lg shadow-[#d4af37]/25 focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] focus:outline-none"
                aria-label="Accepter tous les cookies"
              >
                Tout Accepter
              </button>
            </div>
            <button
              onClick={declineCookies}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              aria-label="Fermer la bannière de cookies"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
