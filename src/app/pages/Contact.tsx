import React, { useState, memo } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  MessageSquare,
  User,
  DollarSign,
  Home,
  CheckCircle2,
  Users,
  AlertCircle,
} from "lucide-react";
import { z } from "zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PhoneInput } from "../components/ui/PhoneInput";
import { supabase } from "../../hooks/useSupabaseAuth";
import { useCurrency } from "../../context/CurrencyContext";
import { useTranslation } from "../../context/LanguageContext";
import { isValidPhone } from "../../utils/phone";

export const phoneSchema = z.string().refine(
  (val) => isValidPhone(val, "CG") || isValidPhone(val),
  { message: "Numéro de téléphone invalide." }
);

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z
    .string()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z
    .string()
    .min(6, "Numéro de téléphone invalide")
    .refine((val) => isValidPhone(val, "CG") || isValidPhone(val), {
      message: "Numéro de téléphone international invalide.",
    }),
  subject: z.string().min(1, "Veuillez sélectionner un sujet"),
  propertyType: z.string().optional(),
  budget: z.string().optional(),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

// Déclaré à l'extérieur et mémoïsé pour éviter les rechargements d'iframe lors des frappes au clavier
const GoogleMap = memo(function GoogleMap() {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className="h-80 bg-gray-100 relative flex items-center justify-center rounded-xl"
        aria-label="Carte interactive non disponible"
      >
        <div className="text-center">
          <MapPin
            className="w-16 h-16 text-[#d4af37] mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-[#0a0f1e] mb-2 font-medium">Carte Interactive</p>
          <p className="text-sm text-gray-600">6R2W+J28, Pointe-Noire</p>
          <p className="text-sm text-gray-600">Congo-Brazzaville</p>
          <p className="text-xs text-gray-400 mt-2">
            Configurez VITE_GOOGLE_MAPS_API_KEY pour activer
          </p>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Maisons+Sans+Frontieres+Pointe-Noire+Congo&language=fr`;

  return (
    <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Localisation MSF Congo"
      />
    </div>
  );
});

export default function Contact() {
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { formatPrice, currency } = useCurrency();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    propertyType: "",
    budget: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!supabase) {
      setSubmitError("Erreur système : connexion au serveur impossible.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!executeRecaptcha) {
        setSubmitError(
          "Le système de sécurité n'est pas encore initialisé. Veuillez patienter.",
        );
        setIsSubmitting(false);
        return;
      }

      const token = await executeRecaptcha("contact_form_submit");

      if (!token) {
        setSubmitError(
          "Échec de la vérification de sécurité. Veuillez rafraîchir la page.",
        );
        setIsSubmitting(false);
        return;
      }

      const validationResult = contactFormSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        setSubmitError(firstError.message);
        setIsSubmitting(false);
        return;
      }

      const lastSubmit = localStorage.getItem("last_contact_submit");
      const now = Date.now();
      if (lastSubmit && now - parseInt(lastSubmit) < 60000) {
        setSubmitError(
          "Veuillez attendre 1 minute avant d'envoyer un nouveau message.",
        );
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "submit-contact",
        {
          body: {
            token: token,
            formData: formData,
          },
        },
      );

      if (error) {
        let serverErrorMsg = error.message;
        // Extraction du message d'erreur JSON précis retourné par Deno
        if ("context" in error && (error as any).context?.json) {
          try {
            const body = await (error as any).context.json();
            if (body?.error) serverErrorMsg = body.error;
          } catch {
            // Utilise error.message par défaut
          }
        }
        throw new Error(serverErrorMsg);
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("last_contact_submit", now.toString());
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        propertyType: "",
        budget: "",
        message: "",
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      setSubmitError(
        error.message ||
          "Erreur lors de l'envoi du formulaire. Veuillez réessayer ou nous contacter directement.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (_formatted: string, _isValid: boolean, e164: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: e164 || _formatted,
    }));
  };

  // VARIANTS ORCHESTRATION GRILLES
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      content:
        "Immeuble Maisons Sans Frontières\n1 place Antonetti, 7ème étage\nCentre-ville, Pointe-Noire, Congo\nB.P. : 1 320",
      link: null,
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+242 06 458 86 18\n+242 05 587 73 24",
      link: "tel:+242064588618",
    },
    {
      icon: Mail,
      title: "Email",
      content: "promotions@msfcongo.com",
      link: "mailto:promotions@msfcongo.com",
    },
    {
      icon: Clock,
      title: "Horaires d'ouverture",
      content: "Lundi - Samedi\n9h30 - 18h30",
      link: null,
    },
  ];

  const subjectOptions = [
    "Achat de propriété",
    "Location haut de gamme",
    "Investissement immobilier",
    "Construction sur mesure",
    "Gestion immobilière",
    "Évaluation de propriété",
    "Autre demande",
  ];

  const propertyTypes = [
    "Villa de luxe",
    "Appartement haut de gamme",
    "Terrain constructible",
    "Immeuble commercial",
    "Résidence côtière",
    "Autre",
  ];

  const budgetRanges = [
    {
      value: `Moins de ${formatPrice(100000000, false)}${currency !== "XAF" ? " (100M FCFA)" : ""}`,
      label: `Moins de ${formatPrice(100000000, false)}${currency !== "XAF" ? " (≈ 100M FCFA)" : ""}`,
    },
    {
      value: `${formatPrice(100000000, false)} - ${formatPrice(200000000, false)}${currency !== "XAF" ? " (100M - 200M FCFA)" : ""}`,
      label: `${formatPrice(100000000, false)} - ${formatPrice(200000000, false)}${currency !== "XAF" ? " (≈ 100M - 200M FCFA)" : ""}`,
    },
    {
      value: `${formatPrice(200000000, false)} - ${formatPrice(500000000, false)}${currency !== "XAF" ? " (200M - 500M FCFA)" : ""}`,
      label: `${formatPrice(200000000, false)} - ${formatPrice(500000000, false)}${currency !== "XAF" ? " (≈ 200M - 500M FCFA)" : ""}`,
    },
    {
      value: `${formatPrice(500000000, false)} - ${formatPrice(1000000000, false)}${currency !== "XAF" ? " (500M - 1 Mrd FCFA)" : ""}`,
      label: `${formatPrice(500000000, false)} - ${formatPrice(1000000000, false)}${currency !== "XAF" ? " (≈ 500M - 1 Mrd FCFA)" : ""}`,
    },
    {
      value: `Plus de ${formatPrice(1000000000, false)}${currency !== "XAF" ? " (1 Mrd FCFA)" : ""}`,
      label: `Plus de ${formatPrice(1000000000, false)}${currency !== "XAF" ? " (≈ 1 Mrd FCFA)" : ""}`,
    },
  ];

  const team = [
    {
      name: "Roger ROC",
      role: "Fondateur – Président Directeur Général",
      image:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1080&q=80",
    },
    {
      name: "Chems ROC",
      role: "Responsable Départemental Brazzaville",
      image:
        "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=1080&q=80",
    },
    {
      name: "Mireille LOLA",
      role: "Responsable Administratif et Commercial",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1080&q=80",
    },
    {
      name: "Elie LIBALI",
      role: "Directeur des Ressources Humaines",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1080&q=80",
    },
    {
      name: "Naji KHALIL",
      role: "Directeur des Projets",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1080&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] opacity-95">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1714601344981-75e003bc5d18?auto=format&fit=crop&w=1080&q=80"
            alt="Contact MSF Congo"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-white">
              {t("contact.pageTitle")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                {t("contact.pageTitleHighlight")}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t("contact.pageSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg p-5 sm:p-6 text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0a0f1e]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#0a0f1e] mb-2 sm:mb-3">
                    {info.title}
                  </h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-gray-600 hover:text-[#d4af37] transition-colors whitespace-pre-line break-words block text-sm sm:text-base"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line break-words text-sm sm:text-base">
                      {info.content}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8"
            >
              <h2 className="text-3xl text-[#0a0f1e] mb-2">
                Envoyez-nous un Message
              </h2>
              <p className="text-gray-600 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans
                les plus brefs délais
              </p>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">
                    Message envoyé avec succès ! Nous vous contacterons bientôt.
                  </p>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{submitError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                  >
                    Nom Complet *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom complet"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                    >
                      Email *
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors"
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div>
                    <PhoneInput
                      id="phone"
                      name="phone"
                      label="Téléphone"
                      required
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      defaultCountry="CG"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                  >
                    Type de Demande *
                  </label>
                  <div className="relative">
                    <MessageSquare
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                      aria-required="true"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      {subjectOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="propertyType"
                      className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                    >
                      Type de Propriété
                    </label>
                    <div className="relative">
                      <Home
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un type</option>
                        {propertyTypes.map((type, idx) => (
                          <option key={idx} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                    >
                      Budget Estimé
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un budget</option>
                        {budgetRanges.map((range, idx) => (
                          <option key={idx} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm text-[#0a0f1e] mb-2 font-medium"
                  >
                    Votre Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Décrivez votre projet ou posez vos questions..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none transition-colors resize-none"
                    aria-required="true"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Envoyer le message de contact"
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-bold rounded-xl hover:shadow-xl hover:shadow-[#d4af37]/40 focus:ring-4 focus:ring-[#d4af37]/50 focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div
                        className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                      ></div>
                      Vérification et envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Envoyer le Message
                    </>
                  )}
                </button>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-gray-400">
                    Protégé par reCAPTCHA. Les{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Règles de confidentialité
                    </a>{" "}
                    et les{" "}
                    <a
                      href="https://policies.google.com/terms"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Conditions d'utilisation
                    </a>{" "}
                    de Google s'appliquent.
                  </span>
                </div>
              </form>
            </motion.div>

            {/* Map & Office Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <GoogleMap />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="relative h-64">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1080&q=80"
                    alt="Bureau MSF Congo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl mb-2">Visitez Notre Bureau</h3>
                    <p className="text-gray-200">
                      Découvrez nos propriétés dans un cadre professionnel
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] rounded-2xl border border-[#d4af37]/20 p-8 text-white">
                <Building2 className="w-12 h-12 text-[#d4af37] mb-4" />
                <h3 className="text-2xl mb-4">Rencontrez Nos Experts</h3>
                <p className="text-gray-300 mb-6">
                  Notre équipe est disponible pour vous accueillir et vous
                  conseiller sur vos projets immobiliers. Prenez rendez-vous dès
                  aujourd'hui.
                </p>
                <a
                  href="tel:+242064588618"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Appeler Maintenant
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section - Disposition Pyramide sans clignotement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 rounded-full mb-4">
              <Users className="w-5 h-5 text-[#d4af37]" />
              <span className="text-sm font-semibold text-[#d4af37]">
                {t("contact.sectionTeam")}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              {t("contact.meetTeam")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("contact.meetTeamSub")}
            </p>
          </motion.div>

          {/* Sommet de la Pyramide : Roger ROC - Grand format en vedette */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="group bg-white rounded-3xl border-2 border-[#d4af37] shadow-xl hover:shadow-2xl hover:shadow-[#d4af37]/20 transition-[box-shadow,border-color] duration-300 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative h-96 md:h-full min-h-[360px] overflow-hidden">
                  <ImageWithFallback
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/40 to-transparent" />
                </div>
                <div className="p-8 md:p-12">
                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] rounded-full mb-4 shadow-sm">
                    <span className="text-xs font-bold text-[#0a0f1e] uppercase tracking-wider">
                      {t("contact.founderBadge")}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#0a0f1e] mb-2">
                    {team[0].name}
                  </h3>
                  <p className="text-[#d4af37] text-lg font-semibold mb-6">
                    {team[0].role}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {t("contact.founderDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Base de la Pyramide : 4 Collaborateurs en 2 par 2 */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-[#0a0f1e]">
                {t("contact.collaborators")}
              </h3>
              <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.slice(1).map((member, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:border-[#d4af37] transition-[box-shadow,border-color] duration-300 overflow-hidden"
                >
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/85 via-[#0a0f1e]/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h4 className="text-2xl font-bold mb-1">{member.name}</h4>
                      <p className="text-sm font-medium text-[#d4af37]">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}