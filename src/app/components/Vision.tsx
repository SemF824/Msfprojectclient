import { motion } from "motion/react";
import { TreePine, Building, Shield, Users } from "lucide-react";

const visionPoints = [
  {
    icon: Building,
    title: "Villes Nouvelles Autonomes",
    description: "Nous ne créons pas de simples lotissements, mais de véritables écosystèmes urbains complets avec infrastructures, services et vie communautaire."
  },
  {
    icon: TreePine,
    title: "Urbanisme Durable",
    description: "Architecture moderne adaptée à la culture africaine et respectueuse de l'environnement. Nos projets intègrent l'assainissement et la gestion écologique."
  },
  {
    icon: Shield,
    title: "Sécurité Juridique",
    description: "Partenaire stratégique de l'État dans les Zones Économiques Spéciales (ZES). Conformité totale aux normes OHADA pour protéger vos investissements."
  },
  {
    icon: Users,
    title: "Formation & RSE",
    description: "Engagement fort dans la formation d'ingénieurs et techniciens locaux. Nous bâtissons l'expertise congolaise pour construire le Congo de demain."
  }
];

export function Vision() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">Notre Vision</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ delay: 0.1 }}
            style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
            className="text-4xl md:text-5xl mb-4"
          >
            <span className="text-white">Bâtir des </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              Villes Durables
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ delay: 0.2 }}
            style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
            className="text-gray-300 max-w-3xl mx-auto text-lg"
          >
            La philosophie de Roger Roc : pallier le manque de logements en créant des villes nouvelles autonomes,
            alliant modernité, culture africaine et respect de l'environnement.
          </motion.p>
        </div>

        {/* Vision Grid - CORRIGÉ : Logique + GPU */}
        <div className="grid md:grid-cols-2 gap-8">
          {visionPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px", amount: 0.1 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              style={{
                willChange: "transform, opacity",
                transform: "translateZ(0)",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden"
              }}
              className="group relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/20"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <point.icon className="w-8 h-8 text-[#d4af37]" />
              </div>

              {/* Content */}
              <h3 className="text-2xl text-white mb-4 group-hover:text-[#d4af37] transition-colors">
                {point.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {point.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
          className="text-center mt-16"
        >
          <div className="inline-block p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-[#d4af37]/20 shadow-xl">
            <p className="text-gray-300 text-lg mb-4">
              <strong className="text-white">Partenaire stratégique de l'État</strong> dans les Zones Économiques Spéciales (ZES)
            </p>
            <p className="text-[#d4af37]">
              Leader de la promotion immobilière privée au Congo-Brazzaville
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}