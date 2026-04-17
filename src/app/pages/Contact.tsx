import { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin, Phone, Mail, Clock, Send,
  Building2, MessageSquare, User, DollarSign,
  Home, CheckCircle2, Users, AlertCircle
} from "lucide-react";
import { z } from "zod";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { supabase } from "../../hooks/useSupabaseAuth";

// Validation schema avec Zod
const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z.string()
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone trop long"),
  subject: z.string()
    .min(1, "Veuillez sélectionner un sujet"),
  propertyType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères")
});

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    propertyType: "",
    budget: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Validation stricte avec Zod AVANT l'insertion
      const validationResult = contactFormSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setSubmitError(firstError.message);
        setIsSubmitting(false);
        return;
      }

      // Rate limiting: prevent spam submissions (1 minute cooldown)
      const lastSubmit = localStorage.getItem('last_contact_submit');
      const now = Date.now();
      if (lastSubmit && now - parseInt(lastSubmit) < 60000) {
        setSubmitError('Veuillez attendre 1 minute avant d\'envoyer un nouveau message.');
        setIsSubmitting(false);
        return;
      }

      // TODO: Intégrer un token reCAPTCHA v3/Turnstile ici avant l'insertion Supabase

      // Insert contact request into Supabase
      const { error } = await supabase
        .from('contact_requests')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            property_type: formData.propertyType || null,
            budget: formData.budget || null,
            message: formData.message,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        throw error;
      }

      // Save timestamp for rate limiting
      localStorage.setItem('last_contact_submit', now.toString());

      // Success
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        propertyType: "",
        budget: "",
        message: ""
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setSubmitError("Erreur lors de l'envoi du formulaire. Veuillez réessayer ou nous contacter directement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      content: "Immeuble Maisons Sans Frontières\n1 place Antonetti, 7ème étage\nCentre-ville, Pointe-Noire, Congo\nB.P. : 1 320",
      link: null
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+242 06 458 86 18\n+242 05 587 73 24",
      link: "tel:+242064588618"
    },
    {
      icon: Mail,
      title: "Email",
      content: "promotions@msfcongo.com",
      link: "mailto:promotions@msfcongo.com"
    },
    {
      icon: Clock,
      title: "Horaires d'ouverture",
      content: "Lundi - Samedi\n9h30 - 18h30",
      link: null
    }
  ];

  const subjectOptions = [
    "Achat de propriété",
    "Location haut de gamme",
    "Investissement immobilier",
    "Construction sur mesure",
    "Gestion immobilière",
    "Évaluation de propriété",
    "Autre demande"
  ];

  const propertyTypes = [
    "Villa de luxe",
    "Appartement haut de gamme",
    "Terrain constructible",
    "Immeuble commercial",
    "Résidence côtière",
    "Autre"
  ];

  const budgetRanges = [
    "Moins de 100 000 000 FCFA",
    "100 000 000 - 200 000 000 FCFA",
    "200 000 000 - 500 000 000 FCFA",
    "500 000 000 - 1 000 000 000 FCFA",
    "Plus de 1 000 000 000 FCFA"
  ];

  const team = [
    {
      name: "Roger ROC",
      role: "Fondateur – Président Directeur Général",
      image: "https://images.unsplash.com/photo-1642257834579-eee89ff3e9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBleGVjdXRpdmUlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYyODQ1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Chems Roc",
      role: "Responsable Départemental Brazzaville",
      image: "https://images.unsplash.com/photo-1642257834579-eee89ff3e9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwcHJvZmVzc2lvbmFsJTIwYnVzaW5lc3MlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYyODQ1MTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Mireille LOLA",
      role: "Responsable Administratif et Commercial",
      image: "https://images.unsplash.com/photo-1760320483844-3d808de62def?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHN1aXR8ZW58MXx8fHwxNzc2Mjg0NTE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Elie LIBALI",
      role: "Directeur des Ressources Humaines",
      image: "https://images.unsplash.com/photo-1642257834579-eee89ff3e9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBleGVjdXRpdmUlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYyODQ1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Naji KHALIL",
      role: "Directeur des Projets",
      image: "https://images.unsplash.com/photo-1642257834579-eee89ff3e9fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwcHJvZmVzc2lvbmFsJTIwYnVzaW5lc3MlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYyODQ1MTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] opacity-95">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1714601344981-75e003bc5d18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZyUyMGRvd250b3dufGVufDF8fHx8MTc3NjI4Mzg5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Contact MSF Congo"
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
              Contactez-<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Nous</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Notre équipe d'experts est à votre écoute pour concrétiser vos projets immobiliers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-[#0a0f1e]" />
                  </div>
                  <h3 className="text-lg text-[#0a0f1e] mb-3">
                    {info.title}
                  </h3>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-gray-600 hover:text-[#d4af37] transition-colors whitespace-pre-line break-words block"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line break-words">
                      {info.content}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Main Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8"
            >
              <h2 className="text-3xl text-[#0a0f1e] mb-2">
                Envoyez-nous un Message
              </h2>
              <p className="text-gray-600 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
              </p>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">Message envoyé avec succès ! Nous vous contacterons bientôt.</p>
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
                {/* Name */}
                <div>
                  <label className="block text-sm text-[#0a0f1e] mb-2">
                    Nom Complet *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom complet"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#0a0f1e] mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#0a0f1e] mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+242 06 xxx xxxx"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm text-[#0a0f1e] mb-2">
                    Type de Demande *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      {subjectOptions.map((option, idx) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Property Type & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#0a0f1e] mb-2">
                      Type de Propriété
                    </label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un type</option>
                        {propertyTypes.map((type, idx) => (
                          <option key={idx} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#0a0f1e] mb-2">
                      Budget Estimé
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un budget</option>
                        {budgetRanges.map((range, idx) => (
                          <option key={idx} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm text-[#0a0f1e] mb-2">
                    Votre Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Décrivez votre projet ou posez vos questions..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer le Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map & Office Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Map Placeholder */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="h-80 bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
                      <p className="text-[#0a0f1e] mb-2">Carte Interactive</p>
                      <p className="text-sm text-gray-600">1 place Antonetti, 7ème étage</p>
                      <p className="text-sm text-gray-600">Pointe-Noire, Congo</p>
                    </div>
                  </div>
                  {/* In production, replace with Google Maps iframe */}
                </div>
              </div>

              {/* Office Image */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="relative h-64">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBwcm9mZXNzaW9uYWwlMjBoYW5kc2hha2V8ZW58MXx8fHwxNzc2MjgzODk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Bureau MSF Congo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl mb-2">Visitez Notre Bureau</h3>
                    <p className="text-gray-200">Découvrez nos propriétés dans un cadre professionnel</p>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-br from-[#0a0f1e] via-[#1e3a5f] to-[#0a0f1e] rounded-2xl border border-[#d4af37]/20 p-8 text-white">
                <Building2 className="w-12 h-12 text-[#d4af37] mb-4" />
                <h3 className="text-2xl mb-4">Rencontrez Nos Experts</h3>
                <p className="text-gray-300 mb-6">
                  Notre équipe est disponible pour vous accueillir et vous conseiller sur vos projets immobiliers. 
                  Prenez rendez-vous dès aujourd'hui.
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

      {/* Team Section */}
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
              <span className="text-sm text-[#d4af37]">L'Équipe Dirigeante</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-[#0a0f1e] mb-4">
              Rencontrez Notre Équipe
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Une équipe expérimentée et dévouée à la réussite de vos projets immobiliers
            </p>
          </motion.div>

          {/* Roger ROC - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="group bg-white rounded-3xl border-2 border-[#d4af37] shadow-2xl overflow-hidden hover:shadow-[#d4af37]/20 transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative h-96 md:h-full overflow-hidden">
                  <ImageWithFallback
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/60 to-transparent" />
                </div>
                <div className="p-8 md:p-12">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] rounded-lg mb-4">
                    <span className="text-xs text-[#0a0f1e] uppercase tracking-wide">Fondateur</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl text-[#0a0f1e] mb-3">
                    {team[0].name}
                  </h3>
                  <p className="text-[#d4af37] text-xl mb-6">
                    {team[0].role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Visionnaire et leader de MSF Congo depuis 2001, Roger ROC a bâti une entreprise de référence dans la construction durable et l'immobilier de luxe au Congo.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Collaborators - Grid 2x2 */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl md:text-3xl text-[#0a0f1e] text-center mb-12">
              Nos Collaborateurs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.slice(1).map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-2xl hover:border-[#d4af37] transition-all duration-300"
                >
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-[#0a0f1e]/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-2xl text-[#0a0f1e] mb-2">
                      {member.name}
                    </h3>
                    <p className="text-[#d4af37] text-sm mb-4">
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}