import { motion } from "motion/react";
import { Construction, Route, Droplet, Building2 } from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";

export function Expertise() {
  const { t } = useTranslation();

  const expertiseAreas = [
    {
      icon: Building2,
      title: t("expertise.area1Title"),
      description: t("expertise.area1Desc"),
      highlights: [
        t("expertise.area1h1"),
        t("expertise.area1h2"),
        t("expertise.area1h3"),
      ],
    },
    {
      icon: Construction,
      title: t("expertise.area2Title"),
      description: t("expertise.area2Desc"),
      highlights: [
        t("expertise.area2h1"),
        t("expertise.area2h2"),
        t("expertise.area2h3"),
      ],
    },
    {
      icon: Route,
      title: t("expertise.area3Title"),
      description: t("expertise.area3Desc"),
      highlights: [
        t("expertise.area3h1"),
        t("expertise.area3h2"),
        t("expertise.area3h3"),
      ],
    },
    {
      icon: Droplet,
      title: t("expertise.area4Title"),
      description: t("expertise.area4Desc"),
      highlights: [
        t("expertise.area4h1"),
        t("expertise.area4h2"),
        t("expertise.area4h3"),
      ],
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
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
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/40 backdrop-blur-md border border-[#d4af37]/30 mb-4"
          >
            <Building2 className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs text-[#d4af37] tracking-wider uppercase">
              {t("expertise.badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl mb-4 font-bold"
          >
            <span className="text-[#0a0f1e]">{t("expertise.title1")} </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              {t("expertise.title2")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-3xl mx-auto text-lg"
          >
            {t("expertise.subtitle")}
          </motion.p>
        </div>

        {/* LA GRILLE DES EXPERTISES */}
        <div className="grid md:grid-cols-2 gap-8">
          {expertiseAreas.map((area, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white rounded-3xl border border-gray-200 hover:border-[#d4af37]/60 transition-[border-color,box-shadow] duration-200 hover:shadow-lg shadow-sm flex flex-col min-h-[350px]"
            >
              <div className="relative mb-6 flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <area.icon className="w-8 h-8 text-[#d4af37]" />
                </div>
              </div>
              <h3 className="text-2xl text-[#0a0f1e] font-bold mb-3 group-hover:text-[#8c7423] transition-colors flex-shrink-0">
                {area.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed flex-1 text-sm sm:text-base">
                {area.description}
              </p>
              <ul className="space-y-2 flex-shrink-0">
                {area.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full flex-shrink-0" />
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block max-w-4xl p-8 bg-white backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl">
            <p className="text-xl text-[#0a0f1e] mb-3">
              <strong className="text-[#d4af37]">{t("expertise.holisticTitle")}</strong>{" "}
              {t("expertise.holisticSuffix")}
            </p>
            <p className="text-gray-600">
              {t("expertise.holisticDesc")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
