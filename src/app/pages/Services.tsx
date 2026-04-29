import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Building2, Key, Settings, TrendingUp, Banknote,
  Hammer, FileSearch, ArrowRight, CheckCircle2,
  Phone, Star, Users
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Services() {
  const services = [
    {
      icon: Building2,
      title: "Trouver la Maison qui Vous Convient",
      description: "Toute notre équipe est à votre écoute et se tient à votre disposition pour vous conseiller et vous aider à trouver la maison qui correspond à votre attente et budget. En toute confidentialité vous aurez la possibilité d'obtenir un devis détaillé et un planning prévisionnel des travaux à réaliser.",
      image: "https://images.unsplash.com/photo-1668609268461-4f6a15269ff1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY29uc3RydWN0aW9uJTIwd29ya2VycyUyMGJ1aWxkaW5nJTIwc2l0ZXxlbnwxfHx8fDE3NzYyODQ0OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: TrendingUp,
      title: "Investir dans des Opérations Immobilières de MSF",
      description: "Nous sommes à votre écoute et intervenons en conseil dans vos choix, afin de maximiser vos investissements immobiliers au Congo et en Afrique Centrale.",
      image: "https://images.unsplash.com/photo-1763621569464-409a050b112e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwaW52ZXN0bWVudCUyMHBsYW5uaW5nJTIwZG9jdW1lbnR8ZW58MXx8fHwxNzc2Mjg0NDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: Key,
      title: "Vente à Terme et Sur Plan",
      description: "Nous vous proposons la vente à terme et sur plan selon votre choix, vous permettant d'acquérir votre propriété selon vos possibilités financières.",
      image: "https://images.unsplash.com/photo-1721244654394-36a7bc2da288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGNvbnN0cnVjdGlvbiUyMGJsdWVwcmludHxlbnwxfHx8fDE3NzYyODQ0OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: Settings,
      title: "Ameublement et Décoration",
      description: "En collaboration avec nos partenaires, nous vous proposons l'ameublement et la décoration de votre maison pour un intérieur à votre image.",
      image: "https://images.unsplash.com/photo-1760072513357-9d450e935a80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwaW50ZXJpb3IlMjBkZWNvcmF0aW9uJTIwZnVybml0dXJlfGVufDF8fHx8MTc3NjI4NDQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Consultation Gratuite",
      description: "Rencontrez nos experts pour définir vos besoins et votre budget"
    },
    {
      number: "02",
      title: "Sélection Personnalisée",
      description: "Nous identifions les propriétés correspondant à vos critères"
    },
    {
      number: "03",
      title: "Visites Guidées",
      description: "Découvrez vos propriétés coup de cœur avec nos conseillers"
    },
    {
      number: "04",
      title: "Négociation & Financement",
      description: "Nous négocions pour vous et facilitons votre financement"
    },
    {
      number: "05",
      title: "Signature & Livraison",
      description: "Finalisation sécurisée et accompagnement jusqu'à la remise des clés"
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
            src="https://images.unsplash.com/photo-1640109341881-1cd3eaf50909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlJTIwb2ZmaWNlJTIwbW9kZXJufGVufDF8fHx8MTc3NjI4Mzg5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
              Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Services</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              MSF Congo vous accompagne à chaque étape de votre projet immobilier avec expertise,
              professionnalisme et un service client d'excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid - OPTIMISÉ POUR ÉVITER LE FLICKERING */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              Une Gamme Complète de Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Des solutions immobilières sur mesure pour répondre à tous vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-2xl hover:border-[#d4af37] transition-all duration-300 flex flex-col min-h-[520px]"
                >
                  {/* Image Section - Hauteur fixe pour éviter le layout shift */}
                  <div className="relative h-64 overflow-hidden bg-gray-200 flex-shrink-0">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 to-transparent" />
                    <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
                      <Icon className="w-8 h-8 text-[#0a0f1e]" />
                    </div>
                  </div>

                  {/* Content Section - Remplit l'espace disponible */}
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
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              Comment Acheter en 5 Étapes
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Un processus simple et transparent pour concrétiser votre projet immobilier
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              Ce Que Disent Nos Clients
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              La satisfaction de nos clients est notre plus belle récompense
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 flex flex-col min-h-[300px]"
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
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl text-white mb-6">
              Prêt à Démarrer Votre Projet ?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Nos experts sont à votre disposition pour une consultation gratuite et personnalisée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all font-medium"
              >
                <Users className="w-5 h-5" />
                Demander une Consultation
              </Link>
              <a
                href="tel:+242064588618"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-medium"
              >
                <Phone className="w-5 h-5" />
                +242 06 458 8618
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
