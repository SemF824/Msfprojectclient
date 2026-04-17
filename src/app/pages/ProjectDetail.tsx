import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { 
  ArrowLeft, MapPin, Calendar, Building2, Users, 
  CheckCircle2, Home, ShoppingBag, GraduationCap,
  Activity, Church, Palmtree, Briefcase
} from "lucide-react";

const projectsData = {
  "tchikobo": {
    id: 1,
    name: "Lotissement ROC de Tchikobo",
    location: "Pointe-Noire",
    tagline: "300 Logements Haut Standing",
    status: "Achevé",
    statusColor: "emerald",
    hero: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjI3MTEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "La société MAISONS SANS FRONTIERES CONGO (MSF Congo) en apportant une solution aux problèmes majeurs d'infrastructure et d'assainissement dans les villes du Congo, au travers des grands travaux déjà réalisés dans le bassin de TCHIKOBO à Pointe-Noire, conformément aux documents d'urbanisme (plans directeurs) ambitionne de donner au Congo un ensemble immobilier de grande envergure.",
    intro: "Cet ensemble cohérent regroupe une zone d'activités tertiaires et une zone résidentielle de grand standing en harmonie avec son environnement.",
    quote: "Ce qui fut jadis une grande vasière est aujourd'hui un quartier moderne. Un rêve s'est matérialisé en ambition et est devenu une réalité.",
    stats: [
      { label: "Logements Livrés", value: "300+", icon: Home },
      { label: "Immeubles", value: "16", icon: Building2 },
      { label: "Étages", value: "8+", icon: Building2 },
      { label: "Résidents", value: "1 200+", icon: Users }
    ],
    features: [
      {
        title: "Zone Résidentielle",
        description: "Plus de 300 logements de grand standing déjà livrés dans une zone résidentielle harmonieuse.",
        icon: Home
      },
      {
        title: "Zone Tertiaire",
        description: "16 grands immeubles de 8+ étages comprenant bureaux, commerces, banques, hôtels et logements collectifs.",
        icon: Building2
      },
      {
        title: "Infrastructure Moderne",
        description: "Voiries, réseaux d'eau et d'électricité assurant une parfaite distribution sur l'ensemble du complexe.",
        icon: CheckCircle2
      }
    ],
    timeline: [
      { year: "2014", event: "Lancement du projet" },
      { year: "2015-2020", event: "Construction de 300+ logements" },
      { year: "Aujourd'hui", event: "Projet achevé et livré" }
    ]
  },
  "antonetti": {
    id: 2,
    name: "Rond-point d'Antonetti",
    location: "Place Antonetti, Pointe-Noire",
    tagline: "Don à la Municipalité",
    status: "Achevé",
    statusColor: "emerald",
    hero: "https://images.unsplash.com/photo-1774281178828-25e0b401bbee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZGFib3V0JTIwdHJhZmZpYyUyMGNpcmNsZSUyMG1vZGVybiUyMHVyYmFufGVufDF8fHx8MTc3NjI4NjA5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Depuis le 15 février 2017, les travaux du rond-point de TCHIKOBO à Pointe-Noire sont terminés. Il est dorénavant opérationnel. L'ouverture de l'avenue principale qui reliera l'avenue du Général De Gaulle, à l'avenue de Loango, en traversant le « Lotissement ROC de TCHIKOBO », offre une nouvelle physionomie au centre-ville.",
    intro: "La modernisation et le développement durable de la ville de Pointe-Noire sont en marche et suivent leurs cours.",
    quote: "Un ouvrage d'importance particulière pour la ville et son agglomération, conçu pour assurer une continuité urbaine des aménagements futurs.",
    stats: [
      { label: "Première Pierre", value: "2014", icon: Calendar },
      { label: "Achèvement", value: "2017", icon: CheckCircle2 },
      { label: "Financement", value: "MSF", icon: Building2 },
      { label: "Type", value: "Don", icon: Users }
    ],
    features: [
      {
        title: "Don à la Municipalité",
        description: "Entièrement financé par MSF Congo et offert à la ville de Pointe-Noire.",
        icon: CheckCircle2
      },
      {
        title: "Continuité Urbaine",
        description: "Ouvrage conçu pour assurer une continuité urbaine des aménagements futurs.",
        icon: Building2
      },
      {
        title: "Nouvelle Physionomie",
        description: "L'avenue principale offre une nouvelle physionomie au centre-ville.",
        icon: Home
      }
    ],
    timeline: [
      { year: "08/08/2014", event: "Pose symbolique de la première pierre en présence du Député-Maire Roland BOUITY VIAUDO" },
      { year: "2014-2017", event: "Construction de l'imposant rond-point" },
      { year: "15/02/2017", event: "Achèvement et mise en service" }
    ]
  },
  "caraibes": {
    id: 3,
    name: "Les Résidences Caraïbes",
    location: "Kounda - La Nouvelle Ville",
    tagline: "Le Projet Titanesque",
    status: "En Cours",
    statusColor: "blue",
    hero: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwdXJiYW4lMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NzYyNzExMDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Dans la nouvelle ville de Kounda, le projet les « Résidences Caraïbes » intègre parfaitement le plan directeur de la ville de Pointe-Noire. Situé à 15 minutes du centre-ville, en empruntant une nouvelle route le long du littoral (CORAF), le projet de 3000 maisons de divers standing est dans un site de 600 hectares environ, avec une vue imprenable sur la baie et le port de Pointe-Noire.",
    intro: "Cette nouvelle ville répond à l'extension urbaine du centre-ville de Pointe-Noire, à l'horizon 2020. Cette nouvelle ville sera entièrement viabilisée (eau, électricité, routes et réseaux d'assainissement), selon un aménagement urbain en harmonie avec son environnement, conformément aux normes internationales.",
    quote: "Tel que le lotissement ROC de TCHIKOBO, au centre-ville de Pointe-Noire, les habitants du lotissement les « Résidences Caraïbes » bénéficieront de la proximité d'une zone tertiaire au centre de la ville.",
    stats: [
      { label: "Superficie", value: "600 ha", icon: Home },
      { label: "Logements", value: "3 000", icon: Building2 },
      { label: "Trajet Centre", value: "15 min", icon: MapPin },
      { label: "Vue", value: "Baie & Port", icon: Palmtree }
    ],
    features: [
      {
        title: "Zone Tertiaire Centrale",
        description: "Hôtellerie, sports, administrations, commerces, éducation, santé, religions, loisirs, ainsi qu'un parc animalier.",
        icon: ShoppingBag
      },
      {
        title: "Route Côtière CORAF",
        description: "Accès via une nouvelle route le long du littoral, à seulement 15 minutes du centre-ville.",
        icon: MapPin
      },
      {
        title: "Viabilisation Complète",
        description: "Eau, électricité, routes et réseaux d'assainissement selon les normes internationales.",
        icon: CheckCircle2
      },
      {
        title: "Vue Imprenable",
        description: "Situé avec une vue exceptionnelle sur la baie et le port autonome de Pointe-Noire.",
        icon: Palmtree
      }
    ],
    timeline: [
      { year: "Octobre 2014", event: "Début des travaux de viabilisation" },
      { year: "Janvier 2015", event: "Lancement de la commercialisation" },
      { year: "Août 2015", event: "Construction des premières maisons" },
      { year: "En cours", event: "Développement progressif de la nouvelle ville" }
    ]
  },
  "bime": {
    id: 4,
    name: "Complexe Résidentiel ROC BIMÉ",
    location: "Mont Barnier, Brazzaville",
    tagline: "1 200 Logements à la Capitale",
    status: "En Cours",
    statusColor: "blue",
    hero: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBjb21wbGV4fGVufDF8fHx8MTc3NjI3MTEwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "À Brazzaville, nous avons le complexe résidentiel « ROC-BIME », un projet de construction de 1200 logements, situé dans la banlieue nord (Mont-Barnier), à environ 15 minutes du centre-ville, dans un domaine de 150 hectares.",
    intro: "Un projet stratégique pour répondre à la croissance urbaine de Brazzaville avec des standards de qualité MSF. Zone résidentielle et tertiaire cadrant avec les Zones Économiques Spéciales.",
    quote: "L'engagement de la construction du complexe ROC BIMÉ répond pleinement aux objectifs du développement économique durable du Congo, tels que programmés par le Gouvernement.",
    stats: [
      { label: "Superficie", value: "150 ha", icon: Home },
      { label: "Logements", value: "1 200", icon: Building2 },
      { label: "Trajet Centre", value: "15 min", icon: MapPin },
      { label: "Familles", value: "5 000+", icon: Users }
    ],
    features: [
      {
        title: "Voiries & Réseaux",
        description: "Des voiries, des réseaux d'eau et d'électricité qui assurent une parfaite distribution sur l'ensemble du complexe.",
        icon: CheckCircle2
      },
      {
        title: "Zone Commune Complète",
        description: "Supermarchés, magasins, restaurants, écoles, administrations, centres de santé, pharmacies, bibliothèques, centres de cultes, centres de loisirs, business center.",
        icon: ShoppingBag
      },
      {
        title: "Espaces Aménagés",
        description: "Parc zoologique, jardins publics, zones piétonnes et espaces verts pour le bien-être des résidents.",
        icon: Palmtree
      },
      {
        title: "Zones Résidentielles",
        description: "Villas de plusieurs types répondant aux besoins variés des familles congolaises.",
        icon: Home
      }
    ],
    amenities: [
      { name: "Supermarchés", icon: ShoppingBag },
      { name: "Restaurants", icon: ShoppingBag },
      { name: "Écoles", icon: GraduationCap },
      { name: "Centres de Santé", icon: Activity },
      { name: "Pharmacies", icon: Activity },
      { name: "Bibliothèques", icon: GraduationCap },
      { name: "Centres de Cultes", icon: Church },
      { name: "Centres de Loisirs", icon: Palmtree },
      { name: "Business Center", icon: Briefcase },
      { name: "Parc Zoologique", icon: Palmtree },
      { name: "Jardins Publics", icon: Palmtree },
      { name: "Zones Piétonnes", icon: Home }
    ],
    timeline: [
      { year: "2014", event: "Annonce du projet de 1 200 logements" },
      { year: "T3 2014", event: "Début des travaux prévu" },
      { year: "En cours", event: "Développement du complexe résidentiel" }
    ]
  },
  "oyo": {
    id: 5,
    name: "Projet DNS d'Oyo",
    location: "Oyo, Nord du Congo",
    tagline: "Joyau Architectural du Nord",
    status: "Long Terme",
    statusColor: "amber",
    hero: "https://images.unsplash.com/photo-1771457362598-69d9dd69404b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGRldmVsb3BtZW50JTIwYWZyaWNhJTIwaG91c2VzfGVufDF8fHx8MTc3NjI4NjA5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Le projet DNS D'OYO est un véritable joyau architectural dont MAISONS SANS FRONTIÈRES, projette d'ériger dans la ville D'OYO au nord du Congo, sur un espace total de 30 ha pour environ 300 maisons. Comprenant tout aussi une zone tertiaire (commerciale) et une zone résidentielle.",
    intro: "L'activité de promotion immobilière que développe la société MAISONS SANS FRONTIERES CONGO (MSF Congo) créatrice d'emplois et génératrice de ressources, exige des compétences, des techniques et un savoir faire à la hauteur des exigences des partenaires économiques et des acquéreurs.",
    quote: "Un projet à long terme pour apporter l'habitat de qualité au-delà des grandes villes et assurer un développement territorial équilibré du Congo.",
    stats: [
      { label: "Superficie", value: "30 ha", icon: Home },
      { label: "Logements", value: "300", icon: Building2 },
      { label: "Zones", value: "2", icon: MapPin },
      { label: "Impact", value: "Régional", icon: Users }
    ],
    features: [
      {
        title: "Zone Tertiaire",
        description: "Zone commerciale complète pour les besoins quotidiens des résidents et de la région.",
        icon: ShoppingBag
      },
      {
        title: "Zone Résidentielle",
        description: "300 maisons de qualité apportant le standard MSF dans le nord du Congo.",
        icon: Home
      },
      {
        title: "Développement Régional",
        description: "Présence affirmée dans le département de la Cuvette pour un développement territorial équilibré.",
        icon: MapPin
      }
    ],
    timeline: [
      { year: "2014", event: "Annonce du projet DNS d'Oyo" },
      { year: "Long terme", event: "Projet à développement progressif" }
    ]
  }
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = slug ? projectsData[slug as keyof typeof projectsData] : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-[#0a0f1e] mb-4">Projet non trouvé</h1>
          <Link to="/" className="text-[#d4af37] hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        <img
          src={project.hero}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-16">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour aux projets</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4 ${
                project.statusColor === 'emerald' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' :
                project.statusColor === 'blue' ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' :
                'bg-amber-500/20 border-amber-400/50 text-amber-300'
              }`}>
                {project.status}
              </div>

              <h1 className="text-4xl md:text-6xl text-white mb-4">
                {project.name}
              </h1>

              <div className="flex items-center gap-2 text-gray-300 mb-4">
                <MapPin className="w-5 h-5 text-[#d4af37]" />
                <span className="text-xl">{project.location}</span>
              </div>

              <p className="text-2xl text-[#d4af37]">
                {project.tagline}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {project.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <div className="text-3xl text-[#0a0f1e] mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl text-[#0a0f1e] mb-6">
              À Propos du Projet
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {project.description}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {project.intro}
            </p>
            
            <div className="bg-gradient-to-br from-[#1e3a5f]/5 to-[#d4af37]/5 border-l-4 border-[#d4af37] p-6 rounded-r-xl my-8">
              <p className="text-lg text-gray-800 italic leading-relaxed">
                "{project.quote}"
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl text-[#0a0f1e] mb-12 text-center"
          >
            Caractéristiques Principales
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {project.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-[#d4af37]" />
                  </div>
                  <h3 className="text-xl text-[#0a0f1e] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Amenities for BIME */}
      {project.id === 4 && 'amenities' in project && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl text-[#0a0f1e] mb-12 text-center"
            >
              Commodités & Services
            </motion.h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {project.amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#d4af37]/50 transition-all"
                  >
                    <Icon className="w-5 h-5 text-[#d4af37]" />
                    <span className="text-sm text-gray-700">{amenity.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl text-[#0a0f1e] mb-12 text-center"
          >
            Chronologie du Projet
          </motion.h2>

          <div className="max-w-3xl mx-auto">
            {project.timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  {index !== project.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-[#d4af37] to-transparent mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-lg text-[#d4af37] mb-2">{item.year}</div>
                  <div className="text-gray-700">{item.event}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a0f1e] to-[#1e3a5f]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-white mb-6">
              Intéressé par ce projet ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Contactez-nous pour plus d'informations ou pour planifier une visite
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:bg-[#f4e3b2] transition-all text-lg"
            >
              <span>Contactez-Nous</span>
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
