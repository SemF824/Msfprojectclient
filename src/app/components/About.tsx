import { motion } from "motion/react";
import { Building2, Globe, Award, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback"; // OPTIMISATION WEB
import { useTranslation } from "../../context/LanguageContext";

export function About() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#d4af37]/10 backdrop-blur-md border border-[#d4af37]/30 mb-4 sm:mb-6">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
              <span className="text-[10px] sm:text-xs text-[#d4af37] tracking-wider uppercase font-semibold">
                {t("about.badge")}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 leading-tight">
              <span className="text-white block sm:inline">
                {t("about.title1")}{" "}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                {t("about.title2")}
              </span>
            </h2>

            <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              {t("about.p1")}
            </p>

            <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base hidden sm:block">
              {t("about.p2")}
            </p>

            <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              {t("about.p3")}
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#d4af37]/20 flex flex-col items-center sm:items-start text-center sm:text-left">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37] mb-2 sm:mb-3" />
                <div className="text-2xl sm:text-3xl text-white font-bold mb-1">
                  {t("about.statFounded")}
                </div>
                <div className="text-[10px] sm:text-sm text-gray-400 font-medium">
                  {t("about.statFoundedLabel")}
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#d4af37]/20 flex flex-col items-center sm:items-start text-center sm:text-left">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37] mb-2 sm:mb-3" />
                <div className="text-2xl sm:text-3xl text-white font-bold mb-1">
                  {t("about.statYears")}
                </div>
                <div className="text-[10px] sm:text-sm text-gray-400 font-medium">
                  {t("about.statYearsLabel")}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-square sm:aspect-[4/5] lg:aspect-auto lg:h-[600px] w-full max-w-md mx-auto lg:max-w-none">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwZGV2ZWxvcG1lbnQlMjBhZnJpY2F8ZW58MXx8fHwxNzc2MjcxMTA0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Architecture Moderne et Développement Urbain par MSF"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-[#0a0f1e]/20 to-transparent" />

              {/* Floating Card */}
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 p-4 sm:p-6 bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#d4af37]/30">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0a0f1e]" />
                  </div>
                  <div>
                    <h4 className="text-white text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
                      {t("about.csr")}
                    </h4>
                    <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm leading-snug">
                      {t("about.csrDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-2xl sm:blur-3xl" />
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-tr from-[#d4af37]/20 to-transparent rounded-full blur-2xl sm:blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
