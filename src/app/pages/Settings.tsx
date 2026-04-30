import { useState } from "react";
import { motion } from "motion/react";
import {
  User, Bell, Shield, Globe, Lock, Mail, Smartphone, Eye, EyeOff,
  ChevronRight, LogOut, Trash2, Download, Moon, Sun, CreditCard, AlertCircle
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Paramètres", path: "/client/settings" }
        ]} />
        <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Paramètres</span>
        </h1>
        <p className="text-gray-600">Gérez vos préférences et votre compte</p>
      </div>

      {/* Tabs Menu en haut (Adaptation du layout) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex overflow-x-auto gap-2">
        {[
          { id: "account", label: "Compte", icon: User },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Sécurité", icon: Shield },
          { id: "appearance", label: "Apparence", icon: Globe }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-[#d4af37] text-[#0a0f1e] font-medium" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
         {activeTab === "account" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Préférences de Communication</h2>
              <p className="text-sm text-gray-500 mb-4">Gérez la façon dont nous communiquons avec vous.</p>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div><p className="font-medium">Emails Marketing</p><p className="text-sm text-gray-500">Offres et nouveautés</p></div>
                   <input type="checkbox" className="w-5 h-5 text-[#d4af37] rounded focus:ring-[#d4af37]" />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                   <div><p className="font-medium">Alertes SMS</p><p className="text-sm text-gray-500">Rappels de RDV</p></div>
                   <input type="checkbox" defaultChecked className="w-5 h-5 text-[#d4af37] rounded focus:ring-[#d4af37]" />
                 </div>
              </div>
           </motion.div>
         )}

         {activeTab === "security" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Mot de passe et Sécurité</h2>
              <div className="space-y-4">
                 <input type="password" placeholder="Mot de passe actuel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37]" />
                 <input type="password" placeholder="Nouveau mot de passe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#d4af37]" />
                 <button className="px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-medium">Mettre à jour</button>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-red-600 font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Zone Dangereuse</h3>
                <button className="flex items-center gap-2 text-red-600 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors mt-4">
                  <Trash2 className="w-4 h-4" /> Supprimer mon compte
                </button>
              </div>
           </motion.div>
         )}

         {activeTab === "appearance" && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Thème visuel (Bientôt disponible)</h2>
             <div className="flex gap-4">
               <div className="p-4 border-2 border-[#d4af37] rounded-xl bg-gray-50 flex items-center gap-2"><Sun className="w-5 h-5"/> Clair</div>
               <div className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2 opacity-50 cursor-not-allowed"><Moon className="w-5 h-5"/> Sombre</div>
             </div>
           </motion.div>
         )}
      </div>
    </div>
  );
}