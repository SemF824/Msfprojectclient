import { Award, Building2, Globe, Users } from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";

export function Statistics() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Building2,
      value: "2001",
      label: t("statistics.founded"),
      description: t("statistics.foundedDesc"),
    },
    {
      icon: Globe,
      value: "470+",
      label: t("statistics.contracts"),
      description: t("statistics.contractsDesc"),
    },
    {
      icon: Users,
      value: "92%",
      label: t("statistics.satisfaction"),
      description: t("statistics.satisfactionDesc"),
    },
    {
      icon: Award,
      value: "5+",
      label: t("statistics.projects"),
      description: t("statistics.projectsDesc"),
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-[#d4af37]/60 transition-[border-color,box-shadow] duration-200 hover:shadow-lg shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/20 flex items-center justify-center mb-5 text-[#8c7423]">
                    <Icon className="w-6 h-6 text-[#8c7423]" />
                  </div>
                  <div className="text-3xl sm:text-4xl text-[#0a0f1e] mb-1 font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-base text-[#8c7423] mb-2 font-semibold">
                    {stat.label}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {stat.description}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-[#8c7423] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  <span>{t("statistics.reference")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
