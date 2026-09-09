import { ShieldCheck, Mail, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1e] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Politique de Confidentialité
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Dernière mise à jour : 9 Septembre 2026
              </p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p>
                Chez MAISONS SANS FRONTIERES (MSF CONGO), nous accordons une
                importance capitale à la confidentialité et à la sécurité de vos
                données personnelles. Cette politique de confidentialité décrit
                comment nous collectons, utilisons, protégeons et partageons vos
                informations lorsque vous utilisez notre site web
                (https://www.msfcongo.com) et nos services immobiliers, en
                conformité avec le Règlement Général sur la Protection des
                Données (RGPD - UE), les lois applicables aux États-Unis (ex:
                CCPA) et les réglementations en vigueur en République du Congo
                et dans la zone OHADA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Données collectées (Minimisation des données)
              </h2>
              <p>
                Nous ne collectons que les données strictement nécessaires au
                fonctionnement de nos services :
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Informations d'identité :</strong> Nom, prénom (lors
                  de la création de compte ou de demandes de devis).
                </li>
                <li>
                  <strong>Coordonnées :</strong> Adresse email, numéro de
                  téléphone.
                </li>
                <li>
                  <strong>Données de navigation (avec consentement) :</strong>{" "}
                  Adresse IP anonymisée, type de navigateur, pages visitées (via
                  des cookies analytiques sécurisés).
                </li>
                <li>
                  <strong>Données relatives aux projets :</strong> Critères de
                  recherche immobilière et historiques de transactions (pour
                  l'espace client sécurisé).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Utilisation de vos données
              </h2>
              <p>Vos informations sont utilisées exclusivement pour :</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  Fournir et gérer nos services immobiliers (ventes, locations,
                  conseil).
                </li>
                <li>Traiter vos demandes de contact et requêtes de devis.</li>
                <li>Sécuriser votre espace client.</li>
                <li>
                  Améliorer l'accessibilité et les performances de notre
                  plateforme.
                </li>
                <li>
                  Se conformer à nos obligations légales et réglementaires.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Partage et transfert des données
              </h2>
              <p>
                Nous ne vendons, ne louons, ni ne commercialisons vos données
                personnelles à des tiers. Vos données peuvent être partagées
                uniquement avec :
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  Nos prestataires d'hébergement sécurisés et nos intégrations
                  tierces strictement nécessaires (qui respectent des normes de
                  sécurité élevées).
                </li>
                <li>Les autorités compétentes si la loi l'exige.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Sécurité et conservation
              </h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et
                organisationnelles robustes pour protéger vos données contre
                l'accès non autorisé, l'altération ou la destruction. Les
                données sont conservées uniquement le temps nécessaire à la
                réalisation des finalités pour lesquelles elles ont été
                collectées, ou pour satisfaire à nos obligations légales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Vos droits
              </h2>
              <p>
                Conformément aux réglementations internationales (RGPD, etc.),
                vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  Droit d'accès, de rectification et d'effacement de vos
                  données.
                </li>
                <li>Droit de limitation et d'opposition au traitement.</li>
                <li>Droit à la portabilité de vos données.</li>
                <li>
                  Droit de retirer votre consentement à tout moment (ex:
                  cookies).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Contact
              </h2>
              <p>
                Pour exercer vos droits ou pour toute question relative à cette
                politique de confidentialité, vous pouvez nous contacter :
              </p>
              <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  <span>promotions@msfcongo.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#d4af37]" />
                  <span>
                    1 place Antonetti, 7ème étage, Centre-ville, Pointe-Noire,
                    Congo (B.P. : 1 320)
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
