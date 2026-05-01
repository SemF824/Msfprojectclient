import { motion } from "motion/react";
import { Shield, Trophy, Target } from "lucide-react";
import { About as AboutComponent } from "../components/About";
import { Vision } from "../components/Vision";
import { Expertise } from "../components/Expertise";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative pt-32 pb-20 bg-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              L'Héritage MSF Congo
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed border-l-4 border-[#d4af37] pl-6">
              Depuis 1997, nous redéfinissons les standards de l'immobilier de luxe en Afrique Centrale. Plus qu'un constructeur, nous sommes les architectes de votre patrimoine.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-12">
        <AboutComponent />
      </div>
      
      <div className="bg-gray-50 border-y border-gray-200">
        <Vision />
      </div>
      
      <div className="py-12">
        <Expertise />
      </div>

      <section className="py-24 bg-[#0a0f1e] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">Nos Engagements</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">La promesse MSF Congo repose sur trois piliers inébranlables pour sécuriser vos investissements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-center group">
              <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sécurité Juridique</h3>
              <p className="text-gray-400 text-sm">Chaque propriété est garantie par des titres fonciers irréprochables avant le début de tout projet.</p>
            </div>
            
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-center group">
              <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence Primée</h3>
              <p className="text-gray-400 text-sm">Reconnu comme le leader absolu du développement haut de gamme au Congo depuis 25 ans.</p>
            </div>

            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-center group">
              <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vision Long Terme</h3>
              <p className="text-gray-400 text-sm">Des investissements immobiliers pensés et construits pour traverser les générations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}