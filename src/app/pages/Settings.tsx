import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { 
  ArrowLeft, User, Bell, Shield, Globe, 
  Lock, Mail, Smartphone, Eye, EyeOff,
  Check, X, ChevronRight, LogOut, Trash2,
  Download, Moon, Sun, CreditCard, AlertCircle
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Account Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Notification Preferences
  const [notifTransactions, setNotifTransactions] = useState(true);
  const [notifProperties, setNotifProperties] = useState(true);
  const [notifAppointments, setNotifAppointments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifPriceAlerts, setNotifPriceAlerts] = useState(true);

  // Privacy Settings
  const [profilePublic, setProfilePublic] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [language, setLanguage] = useState("fr");

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tabs = [
    { id: "account", label: "Compte", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "privacy", label: "Confidentialité", icon: Lock },
    { id: "appearance", label: "Apparence", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au Dashboard</span>
          </Link>
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Paramètres</span>
          </h1>
          <p className="text-gray-600">Gérez vos préférences et votre compte</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#d4af37] text-[#0a0f1e]"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === "account" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Informations du Compte</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-[#d4af37]" />
                        <div>
                          <p className="text-[#0a0f1e] font-medium">Profil Utilisateur</p>
                          <p className="text-sm text-gray-600">Jean Dupont</p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="text-[#d4af37] hover:underline flex items-center gap-1"
                      >
                        <span>Modifier</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#d4af37]" />
                        <div>
                          <p className="text-[#0a0f1e] font-medium">Email</p>
                          <p className="text-sm text-gray-600">jean.dupont@email.com</p>
                        </div>
                      </div>
                      <button className="text-[#d4af37] hover:underline">Changer</button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-[#d4af37]" />
                        <div>
                          <p className="text-[#0a0f1e] font-medium">Téléphone</p>
                          <p className="text-sm text-gray-600">+242 06 458 86 18</p>
                        </div>
                      </div>
                      <button className="text-[#d4af37] hover:underline">Changer</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Préférences de Communication</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Notifications Email</p>
                        <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        role="switch"
                        aria-checked={emailNotifications}
                        aria-label="Activer ou désactiver les notifications email"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          emailNotifications ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            emailNotifications ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Notifications SMS</p>
                        <p className="text-sm text-gray-600">Recevoir les notifications par SMS</p>
                      </div>
                      <button
                        onClick={() => setSmsNotifications(!smsNotifications)}
                        role="switch"
                        aria-checked={smsNotifications}
                        aria-label="Activer ou désactiver les notifications SMS"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          smsNotifications ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            smsNotifications ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Notifications Push</p>
                        <p className="text-sm text-gray-600">Recevoir les notifications push</p>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        role="switch"
                        aria-checked={pushNotifications}
                        aria-label="Activer ou désactiver les notifications push"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          pushNotifications ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            pushNotifications ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Emails Marketing</p>
                        <p className="text-sm text-gray-600">Offres spéciales et promotions</p>
                      </div>
                      <button
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        role="switch"
                        aria-checked={marketingEmails}
                        aria-label="Activer ou désactiver les emails marketing"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          marketingEmails ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            marketingEmails ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Préférences de Notifications</h2>
                <p className="text-gray-600 mb-6">Choisissez les notifications que vous souhaitez recevoir</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Transactions</p>
                        <p className="text-sm text-gray-600">Paiements, réservations, échéances</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifTransactions(!notifTransactions)}
                      role="switch"
                      aria-checked={notifTransactions}
                      aria-label="Activer ou désactiver les notifications de transactions"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifTransactions ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notifTransactions ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Nouvelles Propriétés</p>
                        <p className="text-sm text-gray-600">Propriétés correspondant à vos critères</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifProperties(!notifProperties)}
                      role="switch"
                      aria-checked={notifProperties}
                      aria-label="Activer ou désactiver les notifications de nouvelles propriétés"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifProperties ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notifProperties ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Rendez-vous</p>
                        <p className="text-sm text-gray-600">Rappels de visites programmées</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifAppointments(!notifAppointments)}
                      role="switch"
                      aria-checked={notifAppointments}
                      aria-label="Activer ou désactiver les notifications de rendez-vous"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifAppointments ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notifAppointments ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Messages</p>
                        <p className="text-sm text-gray-600">Messages des agents et de MSF Congo</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifMessages(!notifMessages)}
                      role="switch"
                      aria-checked={notifMessages}
                      aria-label="Activer ou désactiver les notifications de messages"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifMessages ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notifMessages ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Alertes de Prix</p>
                        <p className="text-sm text-gray-600">Baisses de prix sur vos favoris</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifPriceAlerts(!notifPriceAlerts)}
                      role="switch"
                      aria-checked={notifPriceAlerts}
                      aria-label="Activer ou désactiver les alertes de prix"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifPriceAlerts ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          notifPriceAlerts ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Changer le Mot de Passe</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2 font-medium">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>

                    <button className="w-full py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-medium hover:shadow-xl transition-all">
                      Mettre à Jour le Mot de Passe
                    </button>
                  </div>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Authentification à Deux Facteurs</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#d4af37]" />
                      <div>
                        <p className="text-[#0a0f1e] font-medium">2FA</p>
                        <p className="text-sm text-gray-600">
                          {twoFactorEnabled ? "Activée" : "Désactivée"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      role="switch"
                      aria-checked={twoFactorEnabled}
                      aria-label="Activer ou désactiver l'authentification à deux facteurs"
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        twoFactorEnabled ? "bg-[#d4af37]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          twoFactorEnabled ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs.
                  </p>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Sessions Actives</h2>
                  <p className="text-gray-600 text-sm mb-4">Gérez vos sessions actives sur différents appareils</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Chrome - Windows</p>
                        <p className="text-sm text-gray-600">Pointe-Noire, Congo • Session actuelle</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-600 border border-green-500/30 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Safari - iPhone</p>
                        <p className="text-sm text-gray-600">Il y a 2 jours</p>
                      </div>
                      <button className="text-red-600 hover:underline text-sm">Déconnecter</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Visibilité du Profil</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Profil Public</p>
                        <p className="text-sm text-gray-600">Rendre mon profil visible aux autres utilisateurs</p>
                      </div>
                      <button
                        onClick={() => setProfilePublic(!profilePublic)}
                        role="switch"
                        aria-checked={profilePublic}
                        aria-label="Activer ou désactiver le profil public"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          profilePublic ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            profilePublic ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Afficher l'Email</p>
                        <p className="text-sm text-gray-600">Montrer mon adresse email sur mon profil</p>
                      </div>
                      <button
                        onClick={() => setShowEmail(!showEmail)}
                        role="switch"
                        aria-checked={showEmail}
                        aria-label="Afficher ou masquer l'email"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          showEmail ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            showEmail ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[#0a0f1e] font-medium">Afficher le Téléphone</p>
                        <p className="text-sm text-gray-600">Montrer mon numéro de téléphone</p>
                      </div>
                      <button
                        onClick={() => setShowPhone(!showPhone)}
                        role="switch"
                        aria-checked={showPhone}
                        aria-label="Afficher ou masquer le téléphone"
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          showPhone ? "bg-[#d4af37]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            showPhone ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Données et Confidentialité</h2>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-[#d4af37]" />
                        <div className="text-left">
                          <p className="text-[#0a0f1e] font-medium">Télécharger mes Données</p>
                          <p className="text-sm text-gray-600">Obtenir une copie de vos données</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#d4af37]" />
                        <div className="text-left">
                          <p className="text-[#0a0f1e] font-medium">Politique de Confidentialité</p>
                          <p className="text-sm text-gray-600">Lire notre politique</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Thème</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-[#d4af37] bg-[#d4af37]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Sun className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-[#0a0f1e] font-medium text-center">Clair</p>
                    </button>

                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-[#d4af37] bg-[#d4af37]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Moon className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-[#0a0f1e] font-medium text-center">Sombre</p>
                    </button>

                    <button
                      onClick={() => setTheme("auto")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        theme === "auto"
                          ? "border-[#d4af37] bg-[#d4af37]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Globe className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
                      <p className="text-[#0a0f1e] font-medium text-center">Auto</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6">Langue</h2>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white backdrop-blur-xl rounded-2xl border-2 border-red-200 shadow-lg p-6 mt-8"
            >
              <h2 className="text-xl text-red-600 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Zone Dangereuse
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-red-600 font-medium">Déconnecter de tous les Appareils</p>
                      <p className="text-sm text-red-500">Fermer toutes les sessions actives</p>
                    </div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-red-600 font-medium">Supprimer mon Compte</p>
                      <p className="text-sm text-red-500">Action irréversible - toutes vos données seront supprimées</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
