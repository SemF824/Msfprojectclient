import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Building2, Lock, Mail, AlertCircle, Shield } from "lucide-react";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await signIn(formData.email, formData.password);

      if (authError) {
        setError("Identifiants incorrects. Accès admin uniquement.");
        setIsLoading(false);
        return;
      }

      // Verify admin role - the hook will check user_metadata.role
      // If user is admin, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full"
      >
        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Shield className="w-5 h-5 text-[#d4af37]" />
            <span className="text-white font-medium">Espace Sécurisé Admin</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-[#0a0f1e]" />
            </div>
            <h1 className="text-2xl text-[#0a0f1e] font-bold mb-2">
              MSF CONGO
            </h1>
            <p className="text-sm text-[#d4af37] tracking-[0.2em] uppercase mb-4">
              Roger ROC
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
            <p className="text-gray-600">
              Panneau d'Administration
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Erreur de connexion</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Info Security */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 font-medium mb-2 text-sm">🔐 Accès Sécurisé :</p>
            <p className="text-blue-700 text-xs">Connexion via Supabase Auth avec vérification du rôle administrateur.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Email Administrateur
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors"
                  placeholder="admin@msfcongo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-[#0a0f1e] border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                "Se Connecter"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Accès réservé au personnel MSF Congo
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © 2024 MSF Congo - Tous droits réservés
            </p>
          </div>
        </div>

        {/* Back to Client Site */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
          >
            ← Retour au site public
          </a>
        </div>
      </motion.div>
    </div>
  );
}
