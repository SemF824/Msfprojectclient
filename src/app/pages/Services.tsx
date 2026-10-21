import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Building2, Key, Settings, TrendingUp,
  ArrowRight, Phone, Star, Users
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useTranslation } from "../../context/LanguageContext";

export default function Services() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Building2,
      title: t("services.s1Title"),
      description: t("services.s1Desc"),
      image: "https://images.unsplash.com/photo-1668609268461-4f6a15269ff1?auto=format&fit=crop&w=1080&q=80"
    },
    {
      icon: TrendingUp,
      title: t("services.s2Title"),
      description: t("services.s2Desc"),
      image: "https://images.unsplash.com/photo-1763621569464-409a050b112e?auto=format&fit=crop&w=1080&q=80"
    },
    {
      icon: Key,
      title: t("services.s3Title"),
      description: t("services.s3Desc"),
      image: "https://images.unsplash.com/photo-1721244654394-36a7bc2da288?auto=format&fit=crop&w=1080&q=80"
    },
    {
      icon: Settings,
      title: t("services.s4Title"),
      description: t("services.s4Desc"),
      image: "https://images.unsplash.com/photo-1760072513357-9d450e935a80?auto=format&fit=crop&w=1080&q=80"
    }
  ];

  const steps = [
    {
      number: "01",
      title: t("services.step01"),
      description: t("services.step01Desc")
    },
    {
      number: "02",
      title: t("services.step02"),
      description: t("services.step02Desc")
    },
    {
      number: "03",
      title: t("services.step03"),
      description: t("services.step03Desc")
    },
    {
      number: "04",
      title: t("services.step04"),
      description: t("services.step04Desc")
    },
    {
      number: "05",
      title: t("services.step05"),
      description: t("services.step05Desc")
    }
  ];

  const testimonials = [
    {
      name: "Marie-Claire Okemba",
      role: "Directrice Commerciale",
      text: "MSF Congo a transformé mon rêve en réalité. Service impeccable, propriétés exceptionnelles et équipe très professionnelle.",
      rating: 5
    },
    {
      name: "Jean-Paul Makaya",
      role: "Entrepreneur",
      text: "Investir avec MSF Congo fut la meilleure décision. Leur expertise du marché congolais est inégalée.",
      rating: 5
    },
    {
      name: "Sophie Ndongo",
      role: "Expatriée",
      text: "J'ai trouvé ma villa de rêve à Tchikobo grâce à MSF Congo. Un accompagnement sur mesure du début à la fin.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] opacity-95">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1640109341881-1cd3eaf50909?auto=format&fit=crop&w=1080&q=80"
            alt="Services MSF Congo"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-white">
              {t("services.pageTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">{t("services.pageTitleHighlight")}</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t("services.pageSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              {t("services.rangeTitle")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("services.rangeSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: [0.21, 0.47, 0.32, 0.98]
                  }}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-2xl hover:border-[#d4af37] transition-shadow duration-300 flex flex-col min-h-[520px]"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-200 flex-shrink-0">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      // @ts-ignore : Attributs web standards
                      decoding="async"
                      fetchPriority="low"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 to-transparent" />
                    <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
                      <Icon className="w-8 h-8 text-[#0a0f1e]" />
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl text-[#0a0f1e] mb-4 flex-shrink-0">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex-1">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              {t("services.processTitle")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("services.processSubtitle")}
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                  <span className="text-2xl text-[#0a0f1e] font-bold">{step.number}</span>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-2xl text-[#0a0f1e] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-6 h-6 text-[#d4af37] flex-shrink-0 mt-6" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              {t("services.testimonialsTitle")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("services.testimonialsSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 flex flex-col min-h-[300px] hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4 flex-shrink-0">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#d4af37] fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic flex-1">
                  "{testimonial.text}"
                </p>
                <div className="pt-4 border-t border-gray-200 flex-shrink-0">
                  <p className="text-[#0a0f1e] mb-1 font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl text-white mb-6">
              {t("services.ctaTitle")}
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              {t("services.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-shadow duration-300 font-medium"
              >
                <Users className="w-5 h-5" />
                {t("services.ctaBtn")}
              </Link>
              <a
                href="tel:+242064588618"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-colors duration-300 font-medium"
              >
                <Phone className="w-5 h-5" />
                {t("services.ctaBtnPhone")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
