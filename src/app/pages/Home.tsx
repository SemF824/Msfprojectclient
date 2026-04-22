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
    </div>
  );
}