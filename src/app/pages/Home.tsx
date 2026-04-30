import { useState } from "react";
import { Hero } from "../components/Hero";
import { Statistics } from "../components/Statistics";
import { About } from "../components/About";
import { Vision } from "../components/Vision";
import { Projects } from "../components/Projects";
import { Expertise } from "../components/Expertise";
import { PropertyFilter } from "../components/PropertyFilter";
import { FeaturedProperties } from "../components/FeaturedProperties";

export default function Home() {
  // L'état qui va stocker les critères de recherche
  const [searchFilters, setSearchFilters] = useState({
    type: "all",
    location: "",
    price: "all",
  });

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
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Investissez en toute sérénité
            </h2>
            <p className="text-gray-400 text-lg">
              Chez MSF Congo, nous construisons la confiance brique par brique.
              Votre capital est sécurisé par un processus de paiement calqué sur
              la réalité de l'avancement du chantier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Démarrage & Fondations",
                pct: "30%",
                desc: "Ce premier palier couvre l'acquisition de votre terrain, l'établissement du titre foncier à votre nom, la signature du contrat et la réalisation complète des fondations.",
              },
              {
                title: "Élévation & Toiture",
                pct: "30%",
                desc: "Vous réglez 10% pour l'élévation des murs de la structure, puis 20% supplémentaires à la mise hors d'eau (installation de la toiture). Vous ne payez que ce que vous voyez s'élever.",
              },
              {
                title: "Finitions & Clés en main",
                pct: "40%",
                desc: "Ce dernier versement sécurise la finalisation de votre villa : plomberie, électricité, finitions intérieures/extérieures et la remise officielle de vos clés.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-6xl font-black text-[#d4af37]">
                    {feature.pct}
                  </span>
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-[#d4af37] font-black text-xl">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
