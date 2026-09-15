import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Mail,
  Lock,
  ArrowRight,
  Home as HomeIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { Provider } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, userRole, signIn, resetPassword, getUserRole } = useSupabaseAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setSuccessMessage("Votre adresse email a été confirmée avec succès. Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (isAdmin || userRole === "admin" || userRole === "superadmin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/client/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, userRole, navigate]);

  const handleResendConfirmation = async () => {
    const targetEmail = unconfirmedEmail || formData.email;
    if (!targetEmail) return;

    setIsResendingEmail(true);
    try {
      if (!supabase) throw new Error("Client Supabase indisponible.");
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });

      if (resendErr) throw resendErr;
      setSuccessMessage("Un nouvel email de confirmation a été envoyé à votre adresse.");
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Échec du renvoi de l'email.";
      setError(message);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setUnconfirmedEmail(null);

    if (isResetMode) {
      if (!resetPassword) {
        setError("Fonctionnalité de réinitialisation indisponible.");
        setIsLoading(false);
        return;
      }

      const { error: resetErr } = await resetPassword(formData.email);
      if (resetErr) {
        setError(resetErr.message || "Erreur lors de l'envoi de l'email.");
      } else {
        setSuccessMessage("Si cette adresse correspond à un compte actif, un lien de réinitialisation a été envoyé.");
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signInError } = await signIn(
        formData.email,
        formData.password
      );

      if (signInError) {
        const errorMsg = signInError.message.toLowerCase();
        if (errorMsg.includes("email not confirmed") || errorMsg.includes("non confirmé")) {
          setUnconfirmedEmail(formData.email);
          setError("Votre adresse email n'a pas encore été confirmée. Veuillez cliquer sur le lien reçu par email.");
        } else if (errorMsg.includes("invalid login credentials") || errorMsg.includes("identifiants incorrects")) {
          setError("Identifiants incorrects ou compte introuvable.");
        } else {
          setError(signInError.message || "Erreur d'authentification.");
        }
        setIsLoading(false);
        return;
      }

      const role = await getUserRole(data?.user);
      if (role === "admin" || role === "superadmin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/client/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setError(message);
      setIsLoading(false);
    }
  };

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
      if (signInError) throw signInError;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la connexion sociale.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors mb-8"
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-gray-200 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0a0f1e] mb-2 tracking-tight">
              {isResetMode ? "Réinitialisation" : "Espace Client"}
            </h1>
            <p className="text-sm text-gray-500">
              {isResetMode
                ? "Entrez votre email pour recevoir le lien de récupération"
                : "Connectez-vous pour suivre vos démarches immobilières"}
            </p>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                {successMessage}
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700 leading-relaxed">
                  {error}
                </p>
              </div>
              {unconfirmedEmail && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResendingEmail}
                  className="w-full mt-2 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResendingEmail ? "animate-spin" : ""}`} />
                  Renvoyer l'e-mail de confirmation
                </button>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nom@exemple.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-400 focus:bg-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {!isResetMode && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-[#d4af37] hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-400 focus:bg-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 bg-[#0a0f1e] text-white font-semibold rounded-xl hover:bg-[#151f38] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isResetMode ? "Envoyer le lien" : "Se connecter"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {isResetMode && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-gray-500 hover:text-[#0a0f1e] font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          )}

          {!isResetMode && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Ou continuer avec
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  Vous n'avez pas de compte ?{" "}
                  <Link
                    to="/signup"
                    className="font-bold text-[#d4af37] hover:underline"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}