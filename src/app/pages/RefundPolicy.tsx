import { ArrowLeftRight, FileText, AlertCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1e] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Politique de Rétractation et Remboursement
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Modalités applicables à nos services
              </p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0" />
                <p className="m-0 text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Avertissement :</strong> Les transactions immobilières
                  (achat, vente à terme, Vente en l'État Futur d'Achèvement -
                  VEFA) sont soumises à des contrats notariés spécifiques et à
                  la législation congolaise en vigueur. Cette politique concerne
                  uniquement les frais de réservation initiale ou d'acompte
                  préliminaire effectués via nos processus administratifs, avant
                  la signature de l'acte authentique.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Droit de rétractation (Réservations préliminaires)
              </h2>
              <p>
                Dans le cadre d'un contrat de réservation préliminaire (hors
                acte notarié définitif), vous disposez d'un délai légal de
                rétractation de <strong>dix (10) jours calendaires</strong> (ou
                selon les lois locales spécifiques applicables si l'acheteur
                réside en UE) à compter du lendemain de la remise en main propre
                ou de la signature électronique du contrat de réservation.
              </p>
              <p className="mt-2">
                Durant ce délai, vous pouvez vous rétracter sans avoir à
                justifier de motif, par lettre recommandée avec accusé de
                réception ou tout moyen électronique sécurisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Conditions de remboursement des acomptes
              </h2>
              <p>
                Si vous exercez votre droit de rétractation dans les délais
                impartis, nous nous engageons à rembourser l'intégralité des
                dépôts de garantie ou acomptes versés dans un délai maximum de{" "}
                <strong>vingt et un (21) jours</strong> suivant la réception de
                votre notification de rétractation.
              </p>

              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d4af37]" />
                Cas de non-remboursement
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Au-delà du délai légal de rétractation, le dépôt de garantie
                  ou acompte peut être conservé par le promoteur en cas de
                  désistement injustifié (hors conditions suspensives telles que
                  le refus de prêt bancaire).
                </li>
                <li>
                  Si l'acte authentique de vente est signé, aucune rétractation
                  n'est possible, et la résolution de la vente relève des
                  procédures légales d'annulation de vente.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Conditions suspensives (Prêt immobilier)
              </h2>
              <p>
                Si votre acquisition est soumise à l'obtention d'un prêt
                immobilier et que celui-ci vous est refusé, la réservation est
                annulée de plein droit. Vous serez intégralement remboursé de
                vos versements préalables sous présentation de l'attestation de
                refus de prêt émise par votre organisme bancaire, dans les
                conditions prévues au contrat de réservation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Services de conseil
              </h2>
              <p>
                Pour les prestations de services immatériels (conseil en
                investissement, études de marché) facturées, tout service débuté
                avec votre accord explicite avant la fin du délai de
                rétractation n'est plus éligible à un remboursement intégral.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
