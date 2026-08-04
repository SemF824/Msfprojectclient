import { useState } from "react";
import { motion } from "motion/react";
import { Hero } from "../components/Hero";
import { Statistics } from "../components/Statistics";
import { About } from "../components/About";
import { Vision } from "../components/Vision";
import { Projects } from "../components/Projects";
import { Expertise } from "../components/Expertise";
import { PropertyFilter } from "../components/PropertyFilter";
import { FeaturedProperties } from "../components/FeaturedProperties";
import { useSEO } from "../../hooks/useSEO";

export default function Home() {
  // INJECTION SEO DYNAMIQUE
  useSEO({
    title: "Promoteur Immobilier d'Excellence",
    description: "Découvrez MSF Congo et notre nouveau projet Résidences Caraïbes à Pointe-Noire. Investissez dans des appartements et villas de haut standing."
  });

  // L'état qui va stocker les critères de recherche
  const [searchFilters, setSearchFilters] = useState({
    type: "all",
    location: "",
    price: "all",
  });

  // Orchestration des animations pour la section "Investissez en toute sérénité"
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <div className="min-h-[200px]">
        <Statistics />
      </div>
      <div className="min-h-[400px]">
        <About />
      </div>
      <div className="min-h-[400px]">
        <Vision />
      </div>
      <div className="min-h-[600px]">
        <Projects />
      </div>
      <div className="min-h-[400px]">
        <Expertise />
      </div>

      {/* On passe la fonction de mise à jour au filtre */}
      <PropertyFilter onSearch={setSearchFilters} />

      {/* On passe les critères de recherche aux propriétés */}
      <FeaturedProperties filters={searchFilters} />

      {/* SECTION : Investissez en toute sérénité */}
      <section className="py-24 bg-[#0a0f1e] text-white">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            style={{ WebkitTransform: "translate3d(0,0,0)" }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Investissez en toute sérénité</h2>
            <p className="text-gray-400">Un processus transparent et sécurisé en 3 étapes clés, conçu pour vous garantir une tranquillité d'esprit totale.</p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { title: "Réservation & Gros Œuvre", pct: "30%", desc: "Sécurisez votre villa avec un premier apport. Ce montant couvre l'acquisition du terrain, les études préliminaires et la réalisation complète des fondations." },
              { title: "Élévation & Toiture", pct: "30%", desc: "Vous réglez 10% pour l'élévation des murs de la structure, puis 20% supplémentaires à la mise hors d'eau (installation de la toiture). Vous ne payez que ce que vous voyez s'élever." },
              { title: "Finitions & Clés en main", pct: "40%", desc: "Ce dernier versement sécurise la finalisation de votre villa : plomberie, électricité, finitions intérieures/extérieures et la remise officielle de vos clés." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                style={{
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  WebkitTransform: "translate3d(0,0,0)"
                }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors relative overflow-hidden group isolate"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <span className="text-6xl font-black text-[#d4af37]">{feature.pct}</span>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-[#d4af37] font-black text-xl">{i+1}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
