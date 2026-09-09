import { Cookie, CheckCircle2 } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1e] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center">
              <Cookie className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Politique de Cookies
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Gestion des traceurs et de la navigation
              </p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Qu'est-ce qu'un cookie ?
              </h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal
                (ordinateur, tablette, smartphone) lors de la visite d'un site
                web. Il permet au site de mémoriser vos actions et préférences
                (telles que la connexion, la langue, la taille de la police et
                d'autres préférences d'affichage) pendant une durée donnée, pour
                que vous n'ayez pas à réindiquer ces informations à chaque fois
                vous consultez le site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Les cookies que nous utilisons
              </h2>
              <p>
                Nous utilisons différents types de cookies pour assurer le bon
                fonctionnement de notre site :
              </p>

              <div className="space-y-4 mt-6">
                <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl border-l-4 border-[#d4af37]">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Cookies
                    Strictement Nécessaires
                  </h3>
                  <p className="mt-2 text-sm">
                    Ces cookies sont indispensables au fonctionnement du site
                    (ex: maintien de la session sécurisée dans votre espace
                    client, mémorisation de votre choix de consentement aux
                    cookies). Ils ne peuvent pas être désactivés.
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Cookies de Performance & Analytiques
                  </h3>
                  <p className="mt-2 text-sm">
                    Sous réserve de votre consentement, nous utilisons des
                    outils d'analyse (dont l'impact est minimisé) pour mesurer
                    l'audience de notre site, comprendre comment les visiteurs
                    interagissent avec nos pages, et améliorer l'ergonomie.
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl border-l-4 border-purple-500">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Cookies Fonctionnels & Tiers
                  </h3>
                  <p className="mt-2 text-sm">
                    Certains éléments interactifs (comme les cartes
                    interactives, ou les intégrations de réseaux sociaux)
                    peuvent déposer des cookies. Ils ne sont activés qu'avec
                    votre consentement explicite.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Gestion de vos préférences
              </h2>
              <p>
                Vous pouvez à tout moment modifier vos choix en matière de
                cookies via la bannière de consentement accessible en bas de
                page, ou directement via les paramètres de votre navigateur
                internet (Chrome, Safari, Firefox, Edge, etc.).
              </p>
              <p className="mt-2">
                Veuillez noter que le refus de certains cookies peut altérer
                certaines fonctionnalités de notre site (notamment l'accès à
                certaines cartes ou médias tiers).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
