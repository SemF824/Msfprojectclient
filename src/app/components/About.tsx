import { motion } from "motion/react";
import { Building2, Globe, Award, Users } from "lucide-react";

export function About() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e]">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 backdrop-blur-md border border-[#d4af37]/30 mb-6">
              <Award className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs text-[#d4af37] tracking-wider uppercase">Notre Histoire</span>
            </div>

            <h2 className="text-4xl md:text-5xl mb-6">
              <span className="text-white">Un Visionnaire, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                Une Mission
              </span>
            </h2>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Né au lendemain des troubles socio-politiques de 1997, <strong className="text-[#d4af37]">Maisons Sans Frontières</strong> est 
              bien plus qu'une entreprise de construction. C'est la vision d'un homme, <strong className="text-white">Roger Roc</strong>, 
              affectueusement surnommé <em>"Chiki"</em> (celui qui est revenu).
            </p>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Originaire de la Martinique et installé au Congo depuis près de <strong className="text-[#d4af37]">50 ans</strong>, 
              Roger Roc a littéralement changé le visage de Pointe-Noire. Sa philosophie : ne pas construire de simples lotissements, 
              mais créer de véritables <strong className="text-white">"villes nouvelles"</strong> autonomes, alliant architecture moderne, 
              culture africaine et respect de l'environnement.
            </p>

            <p className="text-gray-300 mb-8 leading-relaxed">
              Depuis 2001, MSF Congo construit l'infrastructure du pays, forme des ingénieurs et techniciens locaux, et accompagne 
              l'État dans les Zones Économiques Spéciales (ZES). Aujourd'hui, nous sommes fiers d'être le <strong className="text-[#d4af37]">
              leader de la promotion immobilière privée</strong> au Congo-Brazzaville.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-[#d4af37]/20">
                <Building2 className="w-8 h-8 text-[#d4af37] mb-3" />
                <div className="text-3xl text-white mb-1">1997</div>
                <div className="text-sm text-gray-400">Année de Fondation</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-[#d4af37]/20">
                <Globe className="w-8 h-8 text-[#d4af37] mb-3" />
                <div className="text-3xl text-white mb-1">50 ans</div>
                <div className="text-sm text-gray-400">d'Engagement au Congo</div>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwZGV2ZWxvcG1lbnQlMjBhZnJpY2F8ZW58MXx8fHwxNzc2MjcxMTA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern city development"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 to-transparent" />
              
              {/* Floating Card */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-[#d4af37]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#0a0f1e]" />
                  </div>
                  <div>
                    <h4 className="text-white text-lg mb-1">Engagement RSE</h4>
                    <p className="text-gray-300 text-sm">
                      Formation d'ingénieurs et techniciens locaux pour bâtir l'avenir du Congo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-tr from-[#d4af37]/20 to-transparent rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}