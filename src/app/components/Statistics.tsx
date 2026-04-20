import { Award, Building2, Globe, Users } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  {
    icon: Building2,
    value: "2001",
    label: "Année de Création",
    description: "Acteur dans la construction durable au Congo"
  },
  {
    icon: Globe,
    value: "470+",
    label: "Contrats",
    description: "Ils nous ont fait confiance"
  },
  {
    icon: Users,
    value: "92%",
    label: "Taux de Satisfaction",
    description: "Ils sont satisfaits"
  },
  {
    icon: Award,
    value: "5+",
    label: "Projets Majeurs",
    description: "Expérience et Excellence"
  }
];

export function Statistics() {
  return (
    <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group h-full will-change-transform"
              >
                <div className="relative bg-white backdrop-blur-xl rounded-2xl p-8 border border-gray-200 hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#d4af37]/20 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-[#d4af37]" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-4xl text-[#0a0f1e] mb-2 font-bold">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg text-[#d4af37] mb-2 font-semibold">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {stat.description}
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}