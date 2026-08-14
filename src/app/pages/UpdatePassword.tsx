import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Key, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "../../hooks/useSupabaseAuth";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est bien arrivé ici via un lien de réinitialisation
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Lien de réinitialisation invalide ou expiré.");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Erreur système de base de données.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate("/client/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Impossible de mettre à jour le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-6 h-6 text-[#d4af37]" />
        </div>
        <h2 className="text-2xl font-bold text-center text-[#0a0f1e] mb-2">Nouveau Mot de Passe</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Saisissez votre nouveau mot de passe sécurisé.
        </p>

        {success ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>Mot de passe mis à jour avec succès !</span>
            </div>
            <p className="text-sm text-gray-500">Redirection vers votre espace...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0a0f1e] text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-70"
            >
              {loading ? "Mise à jour..." : "Enregistrer"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}