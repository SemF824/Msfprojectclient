import { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Lock,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { supabase, useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export default function Settings() {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("account");

  // États pour le changement de mot de passe sécurisé
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleUpdatePasswordWithReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!user?.email) {
      setPasswordError("Session utilisateur invalide.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Veuillez saisir votre mot de passe actuel.");
      return;
    }

    setPasswordLoading(true);

    try {
      if (!supabase) throw new Error("Client Supabase indisponible.");

      // 1. Ré-authentification explicite exigée par GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error("Mot de passe actuel incorrect.");
      }

      // 2. Mise à jour effective du mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setPasswordSuccess("Votre mot de passe a été mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour.";
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Paramètres", path: "/client/settings" },
          ]}
        />
        <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2 font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
            Paramètres
          </span>
        </h1>
        <p className="text-gray-600">Gérez vos préférences et la sécurité de votre compte</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 sm:p-2 flex overflow-x-auto gap-2 no-scrollbar">
        {[
          { id: "account", label: "Compte", icon: User },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Sécurité", icon: Shield },
          { id: "appearance", label: "Apparence", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-[#d4af37] text-[#0a0f1e] font-semibold"
                  : "text-gray-600 hover:bg-gray-100 font-medium"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg p-5 sm:p-6 md:p-8">
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Informations Personnelles
              </h2>
              <p className="text-sm text-gray-500">
                Consultez les données rattachées à votre compte.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Adresse Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Préférences de Communication
              </h2>
              <p className="text-sm text-gray-500">
                Gérez les canaux de transmission de vos dossiers.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm text-[#0a0f1e]">Notifications par email</p>
                    <p className="text-xs text-gray-500">Mises à jour sur vos demandes de devis</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#d4af37]" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-1">
                Mot de passe & Sécurité du Compte
              </h2>
              <p className="text-sm text-gray-500">
                La modification du mot de passe requiert votre mot de passe actuel pour des motifs de sécurité.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">{passwordSuccess}</p>
              </div>
            )}

            {passwordError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-red-700">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleUpdatePasswordWithReauth} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Nouveau mot de passe (min. 8 caractères)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3.5 bg-[#0a0f1e] text-white rounded-xl font-bold text-sm hover:bg-[#151f38] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="text-red-600 font-bold mb-1 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> Zone Dangereuse
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                La clôture de votre compte entraîne l'archivage sécurisé de vos données contractuelles.
              </p>
              <button
                type="button"
                className="flex items-center gap-2 text-red-600 px-4 py-2 border border-red-200 bg-white font-semibold rounded-xl hover:bg-red-50 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clôturer mon compte
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "appearance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e]">Thème de l'interface</h2>
            <p className="text-xs text-gray-500">L'interface utilise le thème institutionnel MSF Congo.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}