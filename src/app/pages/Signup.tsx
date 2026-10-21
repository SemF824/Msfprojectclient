import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Mail, Lock, User, MapPin, ArrowRight,
  Home as HomeIcon, Eye, EyeOff, Calendar,
  ChevronLeft, Loader2, AlertCircle
} from "lucide-react";
import { supabase } from "../../hooks/useSupabaseAuth";
import { z } from "zod";
import { PhoneInput } from "../components/ui/PhoneInput";
import { isValidPhone } from "../../utils/phone";
import { useTranslation } from "../../context/LanguageContext";

export const phoneSchema = z.string().refine(
  (val) => isValidPhone(val, "CG") || isValidPhone(val),
  { message: "Numéro de téléphone invalide." }
);

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePhoneChange = (_formatted: string, _isValid: boolean, e164: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: e164 || _formatted,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return setError("Erreur de connexion au serveur.");
    
    if (!formData.phone || (!isValidPhone(formData.phone, "CG") && !isValidPhone(formData.phone))) {
      setError("Veuillez saisir un numéro de téléphone international valide.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            city: formData.city,
            birth_date: formData.birthDate,
            role: 'client',
            grace_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      });

      if (signUpError) {
        if (signUpError.status === 400 || signUpError.status === 401 || signUpError.message.includes('already registered')) {
            throw new Error("Cette adresse email est déjà utilisée ou invalide.");
        }
        throw signUpError;
      }

      if (data.session) {
        await supabase.auth.signOut();
      }
      
      setStep(3);
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Erreur lors de l'inscription.");
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors mb-8">
          <HomeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{t("login.backHome")}</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-gray-200 p-8 md:p-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl mb-4">
              <User className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h1 className="text-3xl font-bold text-[#0a0f1e] mb-2">
              {step === 1 ? t("signup.credentials") : step === 2 ? t("signup.profile") : t("signup.verification")}
            </h1>
            <div className="flex justify-center gap-2 mt-4">
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-[#d4af37]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-[#d4af37]' : 'bg-gray-200'}`} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                    <input type="text" placeholder={t("signup.firstName")} required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className={inputClasses} />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                    <input type="text" placeholder={t("signup.lastName")} required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className={inputClasses} />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                  <input type="email" placeholder={t("signup.email")} required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClasses} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                    <input type={showPassword ? "text" : "password"} placeholder={t("signup.password")} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputClasses} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d4af37]">
                      {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                    <input type="password" placeholder={t("signup.confirmPassword")} required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={inputClasses} />
                  </div>
                </div>

                {error && <div className="text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle size={16}/>{error}</div>}

                <button type="submit" className="w-full py-4 bg-[#0a0f1e] text-[#d4af37] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black hover:shadow-xl transition-all group">
                  {t("signup.nextStep")} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                  <input type="date" required value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className={inputClasses} />
                  <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t("signup.birthDate")}</label>
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-end">
                  <div className="w-full">
                    <PhoneInput
                      id="phone"
                      name="phone"
                      label={t("signup.phone")}
                      required
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      defaultCountry="CG"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                    <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`${inputClasses} appearance-none`} required>
                      <option value="">{t("signup.city")}</option>
                      <option value="pointe-noire">Pointe-Noire</option>
                      <option value="brazzaville">Brazzaville</option>
                      <option value="dolisie">Dolisie</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer group">
                  <input type="checkbox" required checked={formData.acceptTerms} onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})} className="mt-1 accent-[#d4af37] w-4 h-4" />
                  <span className="group-hover:text-[#0a0f1e] transition-colors">{t("signup.acceptTerms")}</span>
                </label>

                {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100"><AlertCircle size={16}/>{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setStep(1)} className="py-4 border border-gray-200 rounded-xl font-bold text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                    <ChevronLeft size={18}/> {t("signup.back")}
                  </button>
                  <button type="submit" disabled={isLoading} className="py-4 bg-[#0a0f1e] text-[#d4af37] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black hover:shadow-xl transition-all disabled:opacity-50">
                    {isLoading ? <Loader2 className="animate-spin" /> : t("signup.finalize")}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#0a0f1e] mb-4">{t("signup.checkEmails")}</h3>
                <p className="text-gray-600 mb-8">{t("signup.checkEmailsDesc")}</p>
                <Link to="/login" className="inline-block px-8 py-3 bg-[#0a0f1e] text-[#d4af37] rounded-xl font-bold hover:shadow-lg transition-all">{t("signup.goToLogin")}</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t("signup.haveAccount")}{' '}
              <Link to="/login" className="font-bold text-[#0a0f1e] hover:text-[#d4af37] underline underline-offset-4">
                {t("signup.login")}
              </Link>
            </p>
        </div>
      </div>
    </div>
  );
}