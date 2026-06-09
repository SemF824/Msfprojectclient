import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

// Hack anti-clignotement WebKit / Safari
const safariFix: React.CSSProperties = {
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
  WebkitTransform: "translate3d(0,0,0)",
  transform: "translate3d(0,0,0)",
};

export function Hero() {
  return (
    /*
     * h-[100svh] est gardé mais on s'assure d'avoir un min-height
     * conséquent pour que le contenu ne s'écrase pas sur les très petits écrans.
     */
    <section
      className="relative w-full overflow-hidden md:h-screen min-h-[600px]"
      style={{ height: "100svh" }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1759893486935-d13a93453f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY29hc3RhbCUyMGNpdHklMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc2MjcxMTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic Coastal Development"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/95 via-[#0a0f1e]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
      </div>

      {/* Grid animé : Affiché uniquement sur desktop */}
      <div className="hidden md:block absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content - Ajout d'un pb-24 pour dégager de l'espace en bas */}
      <div className="relative container mx-auto px-4 md:px-6 h-full flex items-center pt-16 md:pt-0 pb-24 md:pb-0">
        <div className="max-w-3xl w-full">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={safariFix}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#1e3a5f]/80 md:bg-[#1e3a5f]/40 md:backdrop-blur-md border border-[#d4af37]/30 mb-4 md:mb-6"
          >
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="text-[10px] md:text-xs text-[#d4af37] tracking-wider uppercase">
              Projet Pointe-Noire
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={safariFix}
            className="text-4xl md:text-7xl mb-4 md:mb-6 tracking-tight font-bold"
          >
            <span className="block text-white">L'Excellence du</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              Luxe au Congo
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={safariFix}
            className="text-sm md:text-lg text-gray-300 mb-5 md:mb-8 max-w-2xl leading-relaxed"
          >
            Découvrez le summum de l'habitat côtier avec notre développement
            exclusif en front de mer. L'architecture moderne rencontre
            l'élégance africaine dans cette collection prestigieuse de
            résidences ultra-luxueuses.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={safariFix}
            className="flex flex-wrap gap-4 md:gap-8 mb-6 md:mb-10"
          >
            {[
              { val: "4 500+", label: "Logements Prévus" },
              { val: "600 ha", label: "Rés. Caraïbes" },
              { val: "Depuis 1997", label: "Leader au Congo" },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#d4af37] before:to-transparent"
              >
                <div className="text-xl md:text-3xl text-white mb-1 font-bold">
                  {stat.val}
                </div>
                <div className="text-[10px] md:text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={safariFix}
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          >
            <Link
              to="/vitrine/properties"
              className="group flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all max-w-xs sm:max-w-none"
            >
              <span className="font-bold text-sm md:text-base">
                Explorer les Propriétés
              </span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#visite"
              className="flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white/10 text-white rounded-lg border border-[#d4af37]/30 hover:bg-white/20 transition-all font-medium text-sm md:text-base max-w-xs sm:max-w-none"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 text-[#d4af37]" />
              <span>Visite Virtuelle</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator : Ancré fermement en bas avec un espace garanti */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={safariFix}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-[9px] md:text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap drop-shadow-md">
          Défiler pour Découvrir
        </span>
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-[#d4af37]/50 rounded-full flex items-start justify-center p-1 md:p-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={safariFix}
            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#d4af37] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}