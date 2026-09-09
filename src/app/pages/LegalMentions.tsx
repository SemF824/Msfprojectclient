import { Scale, MapPin, Mail, Phone } from "lucide-react";

export default function LegalMentions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1e] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center">
              <Scale className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mentions Légales
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Informations juridiques de MAISONS SANS FRONTIERES
              </p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Éditeur du site
              </h2>
              <p>
                Le présent site web <strong>https://www.msfcongo.com</strong>{" "}
                est édité par :
              </p>
              <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl mt-4 space-y-4">
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  MAISONS SANS FRONTIERES (MSF CONGO)
                </p>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-1" />
                  <div>
                    <p>
                      <strong>Siège social :</strong> Brazzaville, B.P. 13 934,
                      République du Congo
                    </p>
                    <p className="mt-2">
                      <strong>Succursale :</strong> Immeuble MAISONS SANS
                      FRONTIÈRES, 1 place ANTONETTI, centre-ville, 7ème étage,
                      B.P. : 1 320, Pointe-Noire, Congo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#d4af37]" />
                  <span>(+242) 06 458 86 18 / (+242) 05 587 73 24</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  <span>promotions@msfcongo.com</span>
                </div>
              </div>
              <p className="mt-4">
                <strong>Fondateur - Président Directeur Général :</strong>{" "}
                Monsieur Roger ROC
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Propriété Intellectuelle
              </h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, vidéos,
                architecture, logos, marques) est la propriété exclusive de
                MAISONS SANS FRONTIERES ou de ses partenaires. Toute
                reproduction, représentation, modification, publication ou
                adaptation de tout ou partie des éléments du site, quel que soit
                le moyen ou le procédé utilisé, est interdite, sauf autorisation
                écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Limitation de responsabilité
              </h2>
              <p>
                MAISONS SANS FRONTIERES s'efforce de fournir sur le site des
                informations aussi précises que possible. Toutefois,
                l'entreprise ne pourra être tenue responsable des oublis, des
                inexactitudes et des carences dans la mise à jour, qu'elles
                soient de son fait ou du fait des tiers partenaires qui lui
                fournissent ces informations.
              </p>
              <p className="mt-2">
                Les informations relatives aux projets immobiliers, maquettes et
                plans sont fournies à titre indicatif et ne revêtent aucun
                caractère contractuel avant la signature d'un accord officiel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Hébergement et Création
              </h2>
              <p>
                Ce site a été conçu et réalisé par l'agence web{" "}
                <strong>KETCH@ IT</strong> (https://www.ketcha-it.pro/).
                L'hébergement est assuré par des prestataires garantissant un
                haut niveau de sécurité et de conformité, localisés dans des
                centres de données sécurisés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Accessibilité
              </h2>
              <p>
                Conformément à nos engagements d'inclusivité, nous nous
                efforçons de rendre ce site accessible à tous (navigation au
                clavier, contrastes adaptés, textes alternatifs pour les
                lecteurs d'écran). En cas de difficulté de navigation, n'hésitez
                pas à nous contacter.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
