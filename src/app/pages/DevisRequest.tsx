import { useState } from "react";
import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ArrowLeft, FileText, User, Mail, Phone, MapPin,
  Building2, Calendar, MessageSquare, Send, CheckCircle2,
  Bed, Bath, Square, Home, Briefcase, CreditCard, Users
} from "lucide-react";
import { supabase } from "../../hooks/useSupabaseAuth";

export default function DevisRequest() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mock property data
  const property = {
    id: propertyId || "tchikobo-villa-5",
    title: "Villa Tchikobo Prestige",
    location: "Tchikobo, Pointe-Noire",
    price: 295200000,
    priceLabel: "295 200 000 FCFA",
    type: "Villa de Luxe",
    bedrooms: 5,
    bathrooms: 4,
    surface: 450,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
  };

  // Form state
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    
    // Adresse
    address: "",
    city: "",
    country: "Congo-Brazzaville",
    
    // Informations professionnelles
    profession: "",
    company: "",
    monthlyIncome: "",
    
    // Type de demande
    requestType: "achat", // achat, location, information
    financingNeeded: "oui",
    downPaymentAmount: "",
    
    // Visite
    visitDate: "",
    visitTime: "",
    numberOfPersons: "1",
    
    // Message
    message: "",
    
    // Conditions
    acceptTerms: false,
    acceptContact: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Insert into Supabase
      const { error } = await supabase
        .from('devis_requests')
        .insert([{
          client_first_name: formData.firstName,
          client_last_name: formData.lastName,
          client_email: formData.email,
          client_phone: formData.phone,
          client_alternate_phone: formData.alternatePhone || null,
          client_address: formData.address,
          client_city: formData.city,
          client_country: formData.country,
          client_profession: formData.profession,
          client_company: formData.company || null,
          property_id: property.id,
          property_name: property.title,
          property_price: property.price,
          request_type: formData.requestType,
          financing_needed: formData.financingNeeded,
          down_payment_amount: formData.downPaymentAmount
            ? parseInt(formData.downPaymentAmount) : null,
          visit_date: formData.visitDate || null,
          visit_time: formData.visitTime || null,
          number_of_persons: parseInt(formData.numberOfPersons),
          message: formData.message || null,
          status: 'nouveau',
          priority: 'normale',
          terms_accepted: formData.acceptTerms,
          contact_accepted: formData.acceptContact
        }]);

      if (error) throw error;

      // Show success
      setIsSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error('Error submitting devis:', error);
      setSubmitError('Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl text-[#0a0f1e] font-bold mb-4">
            Demande de Devis Envoyée !
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Merci pour votre demande concernant <strong>{property.title}</strong>.
          </p>
          <p className="text-gray-700 mb-8">
            Notre équipe MSF Congo vous contactera sous <strong>24-48 heures</strong> pour vous présenter un devis personnalisé et organiser une visite si vous le souhaitez.
          </p>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium"
            >
              Retour au Dashboard
            </Link>
            <p className="text-sm text-gray-500">
              Redirection automatique dans 3 secondes...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/propriete/${property.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à la propriété</span>
          </Link>
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
            Demander un <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Devis</span>
          </h1>
          <p className="text-gray-600">Remplissez ce formulaire pour recevoir une proposition personnalisée</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations Personnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Informations Personnelles</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Jean"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Téléphone Principal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="+242 06 XXX XXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Téléphone Alternatif
                    </label>
                    <input
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="+242 05 XXX XXXX"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Adresse */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Adresse</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Adresse Complète <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Avenue de l'Indépendance, Quartier..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Pointe-Noire"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Pays</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Informations Professionnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Informations Professionnelles</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Profession <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.profession}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Entrepreneur, Cadre, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Entreprise</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Revenus Mensuels (Optionnel)
                    </label>
                    <select
                      value={formData.monthlyIncome}
                      onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    >
                      <option value="">Préférer ne pas répondre</option>
                      <option value="0-500k">Moins de 500 000 FCFA</option>
                      <option value="500k-1M">500 000 - 1 000 000 FCFA</option>
                      <option value="1M-2M">1 000 000 - 2 000 000 FCFA</option>
                      <option value="2M-5M">2 000 000 - 5 000 000 FCFA</option>
                      <option value="5M+">Plus de 5 000 000 FCFA</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Type de Demande */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Type de Demande</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Type de Projet <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.requestType}
                      onChange={(e) => handleInputChange("requestType", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    >
                      <option value="achat">Achat</option>
                      <option value="location">Location</option>
                      <option value="information">Demande d'information</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Financement Nécessaire ?
                    </label>
                    <select
                      value={formData.financingNeeded}
                      onChange={(e) => handleInputChange("financingNeeded", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    >
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="peut-etre">Peut-être</option>
                    </select>
                  </div>

                  {formData.financingNeeded === "oui" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Apport Personnel Estimé (FCFA)
                      </label>
                      <input
                        type="text"
                        value={formData.downPaymentAmount}
                        onChange={(e) => handleInputChange("downPaymentAmount", e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                        placeholder="Ex: 50 000 000"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Visite */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Programmation de Visite (Optionnel)</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Date Souhaitée</label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => handleInputChange("visitDate", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Heure Souhaitée</label>
                    <select
                      value={formData.visitTime}
                      onChange={(e) => handleInputChange("visitTime", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    >
                      <option value="">Sélectionner</option>
                      <option value="10h00">10h00</option>
                      <option value="11h00">11h00</option>
                      <option value="14h00">14h00</option>
                      <option value="15h00">15h00</option>
                      <option value="16h00">16h00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Nombre de Personnes</label>
                    <select
                      value={formData.numberOfPersons}
                      onChange={(e) => handleInputChange("numberOfPersons", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                    >
                      <option value="1">1 personne</option>
                      <option value="2">2 personnes</option>
                      <option value="3">3 personnes</option>
                      <option value="4+">4+ personnes</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl text-[#0a0f1e] font-semibold">Message Additionnel</h2>
                </div>

                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors resize-none"
                  placeholder="Indiquez-nous toute information complémentaire qui pourrait nous aider à mieux vous servir..."
                />
              </motion.div>

              {/* Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                    />
                    <span className="text-sm text-gray-700">
                      J'accepte les <a href="#" className="text-[#d4af37] hover:underline">conditions générales</a> et la <a href="#" className="text-[#d4af37] hover:underline">politique de confidentialité</a> de MSF Congo. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptContact}
                      onChange={(e) => handleInputChange("acceptContact", e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                    />
                    <span className="text-sm text-gray-700">
                      J'accepte d'être contacté par MSF Congo concernant cette demande et les offres immobilières.
                    </span>
                  </label>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer la Demande de Devis</span>
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Récapitulatif</h3>
              
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />

              <h4 className="text-[#0a0f1e] font-semibold mb-2">{property.title}</h4>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" />
                {property.location}
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {property.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.bathrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  {property.surface}m²
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Prix indicatif</p>
                <p className="text-2xl text-[#d4af37] font-bold">{property.priceLabel}</p>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30 p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Besoin d'Aide ?</h3>
              <div className="space-y-3">
                <a 
                  href="tel:+242064588618"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <p className="text-sm font-medium">+242 06 458 86 18</p>
                    <p className="text-xs text-gray-500">Lun-Sam 9h30-18h30</p>
                  </div>
                </a>
                <a 
                  href="mailto:promotions@msfcongo.com"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#d4af37] transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-sm">promotions@msfcongo.com</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
