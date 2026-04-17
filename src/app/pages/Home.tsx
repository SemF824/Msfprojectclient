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
    <>
      <Hero />
      <Statistics />
      <About />
      <Vision />
      <Projects />
      <Expertise />
      <PropertyFilter />
      <FeaturedProperties />
    </>
  );
}
