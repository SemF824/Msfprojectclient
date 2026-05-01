import { motion } from "motion/react";
import { MapPin, Home, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const projects = [
  {
    id: 1,
    slug: "tchikobo",
    name: "Lotissement ROC de Tchikobo",
    location: "Pointe-Noire",
    tagline: "300 Logements Haut Standing",
    description: "Plus de 300 logements de grand standing déjà livrés avec zone d'activités tertiaires comprenant 16 grands immeubles de 8+ étages sur l'avenue principale. Bureaux, commerces, banques, hôtels et logements collectifs. Ce qui fut jadis une grande vasière est aujourd'hui un quartier moderne.",
    stats: [
      { label: "Logements", value: "300+" },
      { label: "Immeubles", value: "16" },
      { label: "Étages", value: "8+" }
    ],
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjI3MTEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "Achevé",
    color: "emerald"
  },
  {
    id: 2,
    slug: "antonetti",
    name: "Rond-point d'Antonetti",
    location: "Place Antonetti, Pointe-Noire",
    tagline: "Don à la Municipalité",
    description: "Pose de la première pierre le 08/08/2014 en présence du Député-Maire Roland BOUITY VIAUDO. Travaux achevés le 15/02/2017. Ouvrage d'importance particulière pour assurer une continuité urbaine. L'avenue principale relie l'avenue du Général De Gaulle à l'avenue de Loango. Entièrement financé par MSF Congo.",
    stats: [
      { label: "Première Pierre", value: "2014" },
      { label: "Achèvement", value: "2017" },
      { label: "Financement", value: "MSF" }
    ],
    image: "https://images.unsplash.com/photo-1774281178828-25e0b401bbee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZGFib3V0JTIwdHJhZmZpYyUyMGNpcmNsZSUyMG1vZGVybiUyMHVyYmFufGVufDF8fHx8MTc3NjI4NjA5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "Achevé",
    color: "emerald"
  },
  {
    id: 3,
    slug: "caraibes",
    name: "Les Résidences Caraïbes",
    location: "Kounda - La Nouvelle Ville",
    tagline: "Le Projet Titanesque",
    description: "Situé à 15 minutes du centre-ville via la nouvelle route le long du littoral (CORAF). 3 000 logements de divers standing sur 600 hectares avec vue imprenable sur la baie et le port. Zone tertiaire centrale avec hôtellerie, commerces, éducation, santé, sports, loisirs et parc animalier. Entièrement viabilisée selon les normes internationales.",
    stats: [
      { label: "Superficie", value: "600 ha" },
      { label: "Logements", value: "3 000" },
      { label: "Trajet", value: "15 min" }
    ],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwdXJiYW4lMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NzYyNzExMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "En Cours",
    color: "blue"
  },
  {
    id: 4,
    slug: "bime",
    name: "Complexe Résidentiel ROC BIMÉ",
    location: "Mont Barnier, Brazzaville",
    tagline: "1 200 Logements à la Capitale",
    description: "Situé dans la banlieue nord à 15 minutes du centre-ville sur un domaine de 150 hectares. Projet de 1 200 logements avec voiries, réseaux complets, zone commune (supermarchés, écoles, santé, loisirs, business center), parc zoologique, jardins publics et villas de plusieurs types.",
    stats: [
      { label: "Superficie", value: "150 ha" },
      { label: "Logements", value: "1 200" },
      { label: "Trajet Centre", value: "15 min" }
    ],
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBjb21wbGV4fGVufDF8fHx8MTc3NjI3MTEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "En Cours",
    color: "blue"
  },
  {
    id: 5,
    slug: "oyo",
    name: "Projet DNS d'Oyo",
    location: "Oyo, Nord du Congo",
    tagline: "Joyau Architectural du Nord",
    description: "Un véritable joyau architectural sur un espace total de 30 ha pour 300 logements. Comprend une zone tertiaire (commerciale) et une zone résidentielle. Un projet à long terme pour le développement du nord du Congo.",
    stats: [
      { label: "Superficie", value: "30 ha" },
      { label: "Logements", value: "300" },
      { label: "Zones", value: "2" }
    ],
    image: "https://images.unsplash.com/photo-1771457362598-69d9dd69404b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGRldmVsb3BtZW50JTIwYWZyaWNhJTIwaG91c2VzfGVufDF8fHx8MTc3NjI4NjA5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "Long Terme",
    color: "amber"
  }
];

export function Projects() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#d4af37]/30 shadow-sm mb-4"
          >
            <Building2 className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs text-[#0a0f1e] font-bold tracking-wider uppercase">Nos Réalisations</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl mb-4 font-black text-[#0a0f1e]"
          >
            Projets <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Phares</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-3xl mx-auto text-lg"
          >
            Des villes nouvelles qui transforment le paysage urbain congolais
          </motion.p>
        </div>

        {/* Projects */}
        <div className="space-y-20">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex flex-col lg:flex gap-12 items-center`}
            >
              {/* Image */}
              <div className="lg:w-1/2 relative w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-[400px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 via-transparent to-transparent" />
                  
                  {/* Tag */}
                  <div className={`absolute top-6 left-6 px-4 py-2 rounded-full font-bold text-sm shadow-md ${
                    project.color === 'emerald' ? 'bg-emerald-100 border border-emerald-200 text-emerald-800' :
                    project.color === 'blue' ? 'bg-blue-100 border border-blue-200 text-blue-800' :
                    'bg-amber-100 border border-amber-200 text-amber-800'
                  }`}>
                    {project.tag}
                  </div>
                </div>

                {/* Decorative */}
                <div className={`absolute -z-10 ${index % 2 === 0 ? '-right-4 md:-right-8' : '-left-4 md:-left-8'} -bottom-4 md:-bottom-8 w-full h-full bg-[#d4af37]/10 rounded-3xl`} />
              </div>

              {/* Content */}
              <div className="lg:w-1/2 space-y-6 w-full">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <MapPin className="w-5 h-5 text-[#d4af37]" />
                    <span className="font-semibold">{project.location}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl text-[#0a0f1e] font-bold mb-2 leading-tight">
                    {project.name}
                  </h3>
                  <p className="text-[#d4af37] text-xl mb-6 font-bold">
                    {project.tagline}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {project.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {project.stats.map((stat, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#d4af37]/30 transition-colors">
                      <div className="text-2xl text-[#d4af37] mb-1 font-black">{stat.value}</div>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to={`/vitrine/projet/${project.slug}`} className="group/btn mt-4 inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white font-semibold rounded-xl hover:bg-[#d4af37] hover:text-[#0a0f1e] transition-all shadow-md hover:shadow-lg">
                  <span>En Savoir Plus</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}