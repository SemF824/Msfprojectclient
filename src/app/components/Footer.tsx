import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Download,
} from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "../../context/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-[#0a0f1e] to-gray-900 text-white pt-20 pb-8 px-6 relative overflow-hidden border-t border-[#d4af37]/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* ── Brand ──────────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#0a0f1e]" />
              </div>
              <div>
                <h3 className="text-xl text-white tracking-tight">MSF CONGO</h3>
                <p className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase">
                  Roger ROC
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* ── Liens Rapides ───────────────────────────────────────────────── */}
          <div>
            <h4 className="text-white mb-6">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#apropos"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="#proprietes"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("nav.properties")}
                </Link>
              </li>
              <li>
                <Link
                  to="#projets"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  Projets
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Juridique & Politiques ───────────────────────────────────────── */}
          <div>
            <h4 className="text-white mb-6">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/legal-mentions"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("footer.legalMentions")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("footer.cookiePolicy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  {t("footer.refundPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Contact ─────────────────────────────────────────────────────── */}
          <div>
            <h4 className="text-white mb-6">{t("footer.contactUs")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Immeuble Maisons Sans Frontières
                  <br />
                  1 place Antonetti, 7ème étage
                  <br />
                  Centre-ville, Pointe-Noire, Congo
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+242064588618"
                    className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                  >
                    +242 06 458 8618
                  </a>
                  <a
                    href="tel:+242065324040"
                    className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                  >
                    +242 06 532 4040
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <a
                  href="mailto:promotions@msfcongo.com"
                  className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
                >
                  promotions@msfcongo.com
                </a>
              </li>
            </ul>

            {/* LE BOUTON BROCHURE INTÉGRÉ DANS TON DESIGN */}
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-[#d4af37]/30">
              <p className="text-xs text-[#d4af37] mb-2 font-semibold uppercase tracking-wider">
                {t("footer.resources")}
              </p>
              <p className="text-sm text-gray-300 mb-3">
                {t("footer.brochureText")}
              </p>
              <a
                href="/brochure-caraibes.pdf"
                download="Brochure_Residences_Caraibes_MSF.pdf"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#d4af37] text-[#0a0f1e] rounded-lg hover:bg-[#f4e3b2] transition-all font-bold text-sm"
              >
                <Download className="w-4 h-4" />
                {t("footer.downloadBrochure")}
              </a>
            </div>

            <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-xs text-gray-400 mb-1">
                {t("footer.brazzavilleOffice")}
              </p>
              <p className="text-sm text-gray-300">
                {t("footer.brazzavilleText")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Barre du bas ────────────────────────────────────────────────── */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {t("footer.copyright")}
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                to="/privacy-policy"
                className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
              >
                {t("footer.privacyPolicyShort")}
              </Link>
              <Link
                to="/legal-mentions"
                className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors"
              >
                {t("footer.termsOfUse")}
              </Link>
              <a
                href="/admin"
                className="text-gray-500 text-xs hover:text-[#d4af37] transition-colors opacity-60 hover:opacity-100"
              >
                {t("footer.admin")}
              </a>
              <div className="ml-2">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
    </footer>
  );
}
