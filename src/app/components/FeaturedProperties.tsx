import { Bath, Bed, MapPin, Maximize, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  sqft: string;
  type: string;
  tag?: string;
}

const properties: Property[] = [
  {
    id: 1,
    title: "Penthouse Vue Océan",
    location: "Marina de Pointe-Noire",
    price: "557 600 000 FCFA",
    image: "https://images.unsplash.com/photo-1766245274464-6ac5175448cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBza3lzY3JhcGVyJTIwbmlnaHR8ZW58MXx8fHwxNzc2MjcxMTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 5,
    baths: 6,
    sqft: "600",
    type: "Penthouse",
    tag: "Vedette"
  },
  {
    id: 2,
    title: "Villa Contemporaine",
    location: "Domaine de la Côte",
    price: "275 520 000 FCFA",
    image: "https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjB2aWxsYSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzYyNTk0MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 4,
    baths: 4,
    sqft: "445",
    type: "Villa",
    tag: "Nouveau"
  },
  {
    id: 3,
    title: "Résidence Sky Luxe",
    location: "Brazzaville Heights",
    price: "246 000 000 FCFA",
    image: "https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzYxOTYwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 3,
    baths: 3,
    sqft: "297",
    type: "Appartement"
  },
  {
    id: 4,
    title: "Manoir Front de Mer",
    location: "Boulevard Atlantique",
    price: "846 240 000 FCFA",
    image: "https://images.unsplash.com/photo-1760963720238-bf7086d039d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3YXRlcmZyb250JTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzc2MjcxMTA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 6,
    baths: 7,
    sqft: "827",
    type: "Manoir",
    tag: "Exclusif"
  },
  {
    id: 5,
    title: "Suite Tour de Verre",
    location: "Centre Kinshasa",
    price: "186 960 000 FCFA",
    image: "https://images.unsplash.com/photo-1718066236074-13f8cf7ae93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwZ2xhc3MlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzYyNzExMDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 2,
    baths: 2,
    sqft: "223",
    type: "Appartement"
  },
  {
    id: 6,
    title: "Villa Paradis Côtier",
    location: "Rivages de Libreville",
    price: "367 360 000 FCFA",
    image: "https://images.unsplash.com/photo-1759893486935-d13a93453f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY29hc3RhbCUyMGNpdHklMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc2MjcxMTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    beds: 5,
    baths: 5,
    sqft: "483",
    type: "Villa"
  }
];

export function FeaturedProperties() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0a0f1e] to-[#1e3a5f]/20">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/40 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">Collection Premium</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl mb-4"
          >
            <span className="text-white">Propriétés </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              en Vedette
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Découvrez notre sélection triée de résidences extraordinaires dans les lieux les plus prestigieux du Congo
          </motion.p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/20 will-change-transform"
            >
              {/* Property Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  loading="lazy"
                  width="800"
                  height="600"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-60" />
                
                {/* Tag */}
                {property.tag && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-xs rounded-full">
                    {property.tag}
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#0a0f1e]/70 backdrop-blur-md text-white text-xs font-medium rounded-full border border-[#d4af37]/40">
                  {property.type}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <h3 className="text-xl text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                  {property.title}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="text-3xl text-[#d4af37] mb-6">
                  {property.price}
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm">{property.beds}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm">{property.baths}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Maximize className="w-4 h-4" />
                    <span className="text-sm">{property.sqft} m²</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link 
                  to={`/propriete/${property.id}`} 
                  className="block w-full mt-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium text-center rounded-lg border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#0a0f1e] transition-all"
                >
                  Voir les Détails
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-bold rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all">
            Voir Toutes les Propriétés
          </button>
        </motion.div>
      </div>
    </section>
  );
}