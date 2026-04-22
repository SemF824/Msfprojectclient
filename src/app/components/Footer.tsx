import { Building2, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-[#0a0f1e] to-gray-900 text-white pt-20 pb-8 px-6 relative overflow-hidden border-t border-[#d4af37]/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#0a0f1e]" />
              </div>
              <div>
                <h3 className="text-xl text-white tracking-tight">MSF CONGO</h3>
                <p className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase">Roger ROC</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Redéfinir l'immobilier de luxe au Congo avec des développements de classe mondiale et un service inégalé.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-6">Liens Rapides</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/#apropos" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/#proprietes" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Propriétés
                </Link>
              </li>
              <li>
                <Link to="/#projets" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Projets
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Investissement
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Carrières
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Vente de Propriétés
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Locations de Luxe
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Gestion Immobilière
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Conseil en Investissement
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  Construction sur Mesure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-6">Contactez-nous</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Immeuble Maisons Sans Frontières<br />
                  1 place Antonetti, 7ème étage<br />
                  Centre-ville, Pointe-Noire, Congo
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+242064588618" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                    +242 06 458 8618
                  </a>
                  <a href="tel:+242065324040" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                    +242 06 532 4040
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <a href="mailto:promotions@msfcongo.com" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                  promotions@msfcongo.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Succursale Brazzaville</p>
              <p className="text-sm text-gray-300">Également présents dans la capitale</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 MSF Congo - Roger ROC. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                Politique de Confidentialité
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                Conditions d'Utilisation
              </a>
              <a href="#" className="text-gray-400 text-sm hover:text-[#d4af37] transition-colors">
                Mentions Légales
              </a>
              {/* Lien admin : <a> natif obligatoire pour forcer un rechargement complet
                  et déclencher correctement la détection d'App.tsx (pas de Link React Router) */}
              <a href="/admin" className="text-gray-500 text-xs hover:text-[#d4af37] transition-colors opacity-60 hover:opacity-100">
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
    </footer>
  );
}