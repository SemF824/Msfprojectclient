import { motion } from "motion/react";
import { TreePine, Building, Shield, Users } from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";

export function Vision() {
  const { t } = useTranslation();

  const visionPoints = [
    {
      icon: Building,
      title: t("vision.point1Title"),
      description: t("vision.point1Desc"),
    },
    {
      icon: TreePine,
      title: t("vision.point2Title"),
      description: t("vision.point2Desc"),
    },
    {
      icon: Shield,
      title: t("vision.point3Title"),
      description: t("vision.point3Desc"),
    },
    {
      icon: Users,
      title: t("vision.point4Title"),
      description: t("vision.point4Desc"),
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#d4af37]/10 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs text-[#d4af37] tracking-wider uppercase">
              {t("vision.badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 font-bold"
          >
            <span className="text-white">{t("vision.title1")} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              {t("vision.title2")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed"
          >
            {t("vision.subtitle")}
          </motion.p>
        </div>

        {/* LA GRILLE ORCHESTRÉE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {visionPoints.map((point, index) => (
            <div
              key={index}
              className="group h-full flex flex-col relative p-6 sm:p-8 bg-white/5 rounded-2xl sm:rounded-3xl border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-[border-color,box-shadow] duration-200 hover:shadow-xl hover:shadow-[#d4af37]/10"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <point.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl sm:text-2xl text-white mb-3 group-hover:text-[#d4af37] transition-colors font-bold">
                {point.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed flex-grow">
                {point.description}
              </p>
              <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="inline-block p-5 sm:p-8 w-full sm:w-auto bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[#d4af37]/20 shadow-xl">
            <p className="text-gray-300 text-sm sm:text-lg mb-2 sm:mb-4">
              <strong className="text-white">Partenaire stratégique de l'État</strong> dans les Zones Économiques Spéciales (ZES)
            </p>
            <p className="text-[#d4af37] text-xs sm:text-base font-medium">
              {t("vision.leader")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
