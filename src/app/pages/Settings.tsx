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
  Eye,
  EyeOff,
  ChevronRight,
  LogOut,
  Trash2,
  Download,
  Moon,
  Sun,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Paramètres", path: "/client/settings" },
          ]}
        />
        <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
            Paramètres
          </span>
        </h1>
        <p className="text-gray-600">Gérez vos préférences et votre compte</p>
      </div>

      {/* Tabs Menu en haut (Adaptation du layout) */}
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
              <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg p-5 sm:p-6 md:p-8">
        {activeTab === "account" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Informations Personnelles
              </h2>
              <p className="text-sm text-gray-500">
                Consultez et modifiez les informations liées à votre profil.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all text-sm text-gray-500"
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+242 06 xxx xx xx"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button className="w-full sm:w-auto px-6 py-3 bg-[#0a0f1e] text-white rounded-xl font-medium hover:bg-[#1a2540] transition-colors text-sm shadow-sm">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Préférences de Communication
              </h2>
              <p className="text-sm text-gray-500">
                Gérez la façon dont nous communiquons avec vous.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gray-50 border border-gray-100 rounded-xl gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0a0f1e] mb-0.5">
                      Emails Marketing
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Recevez nos dernières offres immobilières et nouveautés
                      exclusives.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-auto sm:ml-0">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d4af37]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gray-50 border border-gray-100 rounded-xl gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0a0f1e] mb-0.5">
                      Alertes SMS (Important)
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Rappels de rendez-vous et urgences concernant vos
                      dossiers.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-auto sm:ml-0">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#d4af37]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Mot de passe et Sécurité
              </h2>
              <p className="text-sm text-gray-500">
                Mettez à jour votre mot de passe pour sécuriser votre compte.
              </p>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Mot de passe actuel"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-colors text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37] focus:bg-white transition-colors text-sm"
                />
              </div>
              <button className="w-full px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-bold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all text-sm">
                Mettre à jour le mot de passe
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Zone Dangereuse
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Une fois votre compte supprimé, il n'y a pas de retour en
                arrière possible. Soyez certain de votre choix.
              </p>
              <button className="flex items-center justify-center w-full sm:w-auto gap-2 text-red-600 px-5 py-2.5 border border-red-200 bg-white font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors text-sm">
                <Trash2 className="w-4 h-4" /> Supprimer mon compte
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "appearance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-bold mb-2">
                Thème de l'interface
              </h2>
              <p className="text-sm text-gray-500">
                Personnalisez l'apparence de votre espace client MSF Congo.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4">
              <button className="p-4 sm:p-6 border-2 border-[#d4af37] rounded-xl bg-white flex flex-col items-center justify-center gap-3 relative shadow-sm">
                <div className="absolute top-3 right-3 w-3 h-3 bg-[#d4af37] rounded-full"></div>
                <Sun className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4af37]" />
                <span className="font-bold text-[#0a0f1e] text-sm">
                  Mode Clair
                </span>
              </button>
              <button className="p-4 sm:p-6 border-2 border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 opacity-60 cursor-not-allowed transition-colors hover:border-gray-200">
                <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                <span className="font-medium text-gray-500 text-sm">
                  Mode Sombre
                </span>
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-semibold absolute bottom-2">
                  Bientôt
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
