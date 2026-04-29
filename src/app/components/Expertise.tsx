import { motion } from "motion/react";
import { Construction, Route, Droplet, Building2 } from "lucide-react";

const expertiseAreas = [
  {
    icon: Building2,
    title: "Promotion Immobilière",
    description: "Leader de la promotion immobilière privée au Congo-Brazzaville. Conception et réalisation de villes nouvelles complètes avec infrastructures intégrées.",
    highlights: ["Villas de standing", "Immeubles résidentiels", "Lotissements urbains"]
  },
  {
    icon: Construction,
    title: "Génie Civil",
    description: "Construction de ponts et infrastructures lourdes indispensables pour désenclaver nos cités et connecter les quartiers au centre-ville.",
    highlights: ["Ponts routiers", "Ouvrages d'art", "Fondations spéciales"]
  },
  {
    icon: Route,
    title: "Aménagement Urbain",
    description: "Réalisation de routes modernes et de ronds-points emblématiques comme la place Antonetti à Pointe-Noire. Création de voiries complètes pour nos développements.",
    highlights: ["Routes bitumées", "Ronds-points", "Voiries urbaines"]
  },
  {
    icon: Droplet,
    title: "Assainissement",
    description: "Création de systèmes complets d'évacuation et de gestion des eaux sur des zones auparavant marécageuses. Solutions écologiques et durables.",
    highlights: ["Drainage urbain", "Réseaux EU/EP", "Assainissement écologique"]
  }
];

export function Expertise() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
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
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/40 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <Building2 className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">Nos Expertises</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl mb-4"
          >
            <span className="text-[#0a0f1e]">Au-delà de </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              l'Immobilier
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-3xl mx-auto text-lg"
          >
            MSF Congo ne construit pas que des maisons, nous bâtissons l'infrastructure de la nation
          </motion.p>
        </div>

        {/* Expertise Grid - OPTIMISÉ POUR ÉVITER LE FLICKERING */}
        <div className="grid md:grid-cols-2 gap-8">
          {expertiseAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 bg-white backdrop-blur-xl rounded-3xl border border-gray-200 hover:border-[#d4af37]/50 transition-all duration-500 shadow-sm flex flex-col min-h-[350px]"
            >
              {/* Icon Container - Hauteur fixe */}
              <div className="relative mb-6 flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                  <area.icon className="w-10 h-10 text-[#d4af37]" />
                </div>
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#d4af37]/10 rounded-full blur-2xl group-hover:bg-[#d4af37]/20 transition-colors duration-500" />
              </div>

              {/* Content - Remplit l'espace */}
              <h3 className="text-2xl text-[#0a0f1e] mb-4 group-hover:text-[#d4af37] transition-colors flex-shrink-0">
                {area.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed flex-1">
                {area.description}
              </p>

              {/* Highlights - En bas, non resizable */}
              <ul className="space-y-2 flex-shrink-0">
                {area.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/5 group-hover:to-transparent rounded-3xl transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Bottom Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block max-w-4xl p-8 bg-white backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl">
            <p className="text-xl text-[#0a0f1e] mb-3">
              <strong className="text-[#d4af37]">Une Vision Holistique</strong> du Développement Urbain
            </p>
            <p className="text-gray-600">
              De la conception des logements à la construction des infrastructures,
              MSF Congo maîtrise l'intégralité de la chaîne de valeur pour créer des villes véritablement autonomes et durables.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
