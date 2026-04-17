import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
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

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 h-full flex items-center">
        <div className="max-w-3xl">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/40 backdrop-blur-md border border-[#d4af37]/30 mb-6"
          >
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">Projet Pointe-Noire</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl mb-6 tracking-tight"
          >
            <span className="block text-white">L'Excellence du</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              Luxe au Congo
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed"
          >
            Découvrez le summum de l'habitat côtier avec notre développement exclusif en front de mer. 
            L'architecture moderne rencontre l'élégance africaine dans cette collection prestigieuse de résidences ultra-luxueuses.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-8 mb-10"
          >
            <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#d4af37] before:to-transparent">
              <div className="text-3xl text-white mb-1">4 500+</div>
              <div className="text-sm text-gray-400">Logements Prévus</div>
            </div>
            <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#d4af37] before:to-transparent">
              <div className="text-3xl text-white mb-1">600 ha</div>
              <div className="text-sm text-gray-400">Rés. Caraïbes</div>
            </div>
            <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#d4af37] before:to-transparent">
              <div className="text-3xl text-white mb-1">Depuis 1997</div>
              <div className="text-sm text-gray-400">Leader au Congo</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all">
              <span>Explorer les Propriétés</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-lg border border-[#d4af37]/30 hover:bg-white/20 transition-all">
              <Play className="w-5 h-5" />
              <span>Visite Virtuelle</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Défiler pour Découvrir</span>
          <div className="w-6 h-10 border-2 border-[#d4af37]/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-[#d4af37] rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}