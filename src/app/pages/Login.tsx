import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  Lock,
  ArrowRight,
  Home as HomeIcon,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { Provider } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn } = useSupabaseAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/client/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(
        formData.email,
        formData.password,
      );

      if (signInError) {
        setError(signInError.message || "Identifiants incorrects");
        setIsLoading(false);
        return;
      }

      // La redirection sera gérée par le useEffect
      navigate("/client/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  // Fonction pour la connexion via les réseaux sociaux
  const handleSocialLogin = async (provider: Provider) => {
    try {
      if (!supabase) {
        setError("Erreur : Le client Supabase n'est pas configuré.");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/client/dashboard`,
        },
      });
      if (signInError) {
        throw signInError;
      }
    } catch (err: any) {
      console.error("Erreur de connexion sociale:", err);
      setError(err.message || "Erreur lors de la connexion sociale.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden flex items-center justify-center px-6 py-12">
      {/* Background Pattern */}
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

      {/* Decorative Blurs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#1e3a5f]/30 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors mb-8"
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-sm">Retour à l'accueil</span>
        </Link>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white backdrop-blur-2xl rounded-3xl border border-gray-200 p-8 md:p-10 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h1 className="text-3xl md:text-4xl mb-2">
              <span className="text-gray-900">Bon retour sur </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                MSF Congo
              </span>
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre espace client
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-2"
              >
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-2"
              >
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d4af37] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 bg-white text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0"
                />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="text-[#d4af37] hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Se Connecter</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Social Logins — Boutons Conformes aux Chartes Officielles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {/* BOUTON GOOGLE OFFICIEL (Quadrichrome + Libellé conforme) */}
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Google</span>
            </button>

            {/* BOUTON FACEBOOK OFFICIEL (Bleu Meta officiel + Libellé conforme) */}
            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-semibold">Facebook</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link
                to="/signup"
                className="text-[#d4af37] hover:underline font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée • Vos données sont protégées
          </p>
        </motion.div>
      </div>
    </div>
  );
}
