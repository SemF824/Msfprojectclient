import { Hero } from "../components/Hero";
import { Statistics } from "../components/Statistics";
import { About } from "../components/About";
import { Vision } from "../components/Vision";
import { Projects } from "../components/Projects";
import { Expertise } from "../components/Expertise";
import { PropertyFilter } from "../components/PropertyFilter";
import { FeaturedProperties } from "../components/FeaturedProperties";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="min-h-[200px]"><Statistics /></div>
      <div className="min-h-[400px]"><About /></div>
      <div className="min-h-[400px]"><Vision /></div>
      <div className="min-h-[600px]"><Projects /></div>
      <div className="min-h-[400px]"><Expertise /></div>
      <PropertyFilter />
      <FeaturedProperties />
    </div>
  );
}
