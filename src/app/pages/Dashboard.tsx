import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Home, Heart, Calendar, FileText, Calculator, LogOut,
  Bell, Settings, User, Eye, Clock, CheckCircle2,
  AlertCircle, Download, MapPin, TrendingUp,
  Building2, Bed, Bath, Square, Phone, Mail, CreditCard
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { user: authUser, isLoading } = useSupabaseAuth();

  const displayName = authUser?.user_metadata?.full_name
    || authUser?.email?.split('@')[0]
    || 'Utilisateur';
  const displayEmail = authUser?.email || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Mock data
  const stats = [
    { label: "Demandes Actives", value: "3", icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Propriétés Favorites", value: "7", icon: Heart, color: "from-pink-500 to-pink-600" },
    { label: "Visites Planifiées", value: "2", icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Documents", value: "5", icon: FileText, color: "from-purple-500 to-purple-600" }
  ];

  const requests = [
    {
      id: 1,
      property: "Villa Tchikobo Prestige",
      location: "Tchikobo, Pointe-Noire",
      status: "En cours",
      date: "2026-04-10",
      price: "295 200 000 FCFA"
    },
    {
      id: 2,
      property: "Appartement Résidences Caraïbes",
      location: "Centre-Ville, Pointe-Noire",
      status: "En attente",
      date: "2026-04-08",
      price: "118 080 000 FCFA"
    },
    {
      id: 3,
      property: "Penthouse Cité de 17",
      location: "Brazzaville",
      status: "Approuvée",
      date: "2026-04-05",
      price: "209 920 000 FCFA"
    }
  ];

  const appointments = [
    {
      id: 1,
      property: "Villa Tchikobo Prestige",
      date: "2026-04-18",
      time: "10:00",
      agent: "Marie Kengué",
      status: "Confirmé"
    },
    {
      id: 2,
      property: "Appartement Résidences Caraïbes",
      date: "2026-04-20",
      time: "14:30",
      agent: "Paul Mbemba",
      status: "En attente"
    }
  ];

  const visitHistory = [
    {
      id: 1,
      property: "Villa Oyo Gardens",
      date: "2026-04-05",
      rating: 5,
      notes: "Très belle propriété, excellent emplacement"
    },
    {
      id: 2,
      property: "Terrain Sibiti",
      date: "2026-03-28",
      rating: 4,
      notes: "Bon terrain, à considérer"
    }
  ];

  const documents = [
    { id: 1, name: "Contrat Villa Tchikobo.pdf", type: "Contrat", date: "2026-04-12", size: "2.4 MB" },
    { id: 2, name: "Plan Financement.xlsx", type: "Finance", date: "2026-04-10", size: "856 KB" },
    { id: 3, name: "Certificat Propriété.pdf", type: "Certificat", date: "2026-04-08", size: "1.2 MB" },
    { id: 4, name: "Attestation Visite.pdf", type: "Attestation", date: "2026-04-05", size: "456 KB" },
    { id: 5, name: "Devis Travaux.pdf", type: "Devis", date: "2026-04-03", size: "1.8 MB" }
  ];

  const [loanAmount, setLoanAmount] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [loanTerm, setLoanTerm] = useState(20);
  const [interestRate, setInterestRate] = useState(7.5);

  // Calculate monthly payment with validation
  const calculateMonthlyPayment = () => {
    const principal = loanAmount - downPayment;

    // Validation: prevent division by zero and negative values
    if (principal <= 0 || loanTerm <= 0 || interestRate < 0) {
      return 0;
    }

    // If interest rate is 0, calculate simple division
    if (interestRate === 0) {
      const numberOfPayments = loanTerm * 12;
      return (principal / numberOfPayments).toFixed(2);
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment.toFixed(2);
  };

  const handleLogout = () => {
    navigate("/connexion");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours":
      case "Confirmé":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "En attente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Approuvée":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
              {/* User Profile */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-[#0a0f1e]" />
                </div>
                <h3 className="text-[#0a0f1e] text-lg font-semibold">{displayName}</h3>
                <p className="text-gray-600 text-sm">{displayEmail}</p>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 mb-4 text-sm text-gray-500 hover:text-[#d4af37] transition-colors border border-gray-200 rounded-xl hover:border-[#d4af37]/50"
              >
                <Home className="w-4 h-4" />
                <span>Retour au site</span>
              </Link>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "overview" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Vue d'ensemble</span>
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "requests" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Mes Demandes</span>
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "favorites" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favoris</span>
                </button>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "appointments" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Rendez-vous</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "history" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>Historique</span>
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "documents" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Documents</span>
                </button>
                <button
                  onClick={() => setActiveTab("loan")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === "loan" 
                      ? "bg-[#d4af37] text-[#0a0f1e]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                  <span>Simulateur Prêt</span>
                </button>
              </nav>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200 space-y-2">
                <Link
                  to="/profile"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Mon Profil</span>
                </Link>
                <Link
                  to="/favorites"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>Mes Favoris</span>
                </Link>
                <Link
                  to="/notifications"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </Link>
                <Link
                  to="/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Paramètres</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
                  Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">{displayName.split(' ')[0]}</span>
                </h1>
                <p className="text-gray-600">Voici un aperçu de votre activité</p>
              </div>
              <button className="relative p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors shadow-sm">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-3xl text-[#0a0f1e] mb-1 font-semibold">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Recent Requests */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl text-[#0a0f1e] font-semibold">Demandes Récentes</h2>
                    <Link
                      to="/transactions"
                      className="text-sm text-[#d4af37] hover:underline flex items-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Voir Transactions</span>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex-1">
                          <p className="text-[#0a0f1e] font-medium">{request.property}</p>
                          <p className="text-sm text-gray-600">{request.location}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Upcoming Appointments */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
                >
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Prochains Rendez-vous</h2>
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-[#d4af37]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#0a0f1e] font-medium">{apt.property}</p>
                          <p className="text-sm text-gray-600">{apt.date} à {apt.time} - {apt.agent}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Demandes</h2>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-[#0a0f1e] text-lg font-medium mb-1">{request.property}</h3>
                          <p className="text-gray-600 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {request.location}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">Soumise le {request.date}</p>
                        <p className="text-[#d4af37] font-medium">{request.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Rendez-vous</h2>
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-[#d4af37]/20 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-[#d4af37] text-xs">{apt.date.split('-')[1]}</span>
                          <span className="text-[#0a0f1e] text-xl font-semibold">{apt.date.split('-')[2]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#0a0f1e] text-lg font-medium mb-1">{apt.property}</h3>
                          <p className="text-gray-600 text-sm mb-2">Heure: {apt.time}</p>
                          <p className="text-gray-600 text-sm">Agent: {apt.agent}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Historique des Visites</h2>
                <div className="space-y-4">
                  {visitHistory.map((visit) => (
                    <div key={visit.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-[#0a0f1e] text-lg font-medium">{visit.property}</h3>
                          <p className="text-gray-600 text-sm">Visitée le {visit.date}</p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < visit.rating ? "text-[#d4af37]" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{visit.notes}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Documents</h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#d4af37]/50 transition-colors">
                      <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#d4af37]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#0a0f1e] font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.type} • {doc.size} • {doc.date}</p>
                      </div>
                      <button className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loan Calculator Tab */}
            {activeTab === "loan" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Simulateur de Prêt</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Inputs */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Montant Total (FCFA)</label>
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Apport Initial (FCFA)</label>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Durée (années)</label>
                      <input
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Taux d'Intérêt (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30">
                      <p className="text-gray-700 text-sm mb-2">Mensualité Estimée</p>
                      <p className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] font-bold">
                        {Number(calculateMonthlyPayment()).toLocaleString()} FCFA
                      </p>
                      <p className="text-gray-600 text-xs mt-2">par mois pendant {loanTerm} ans</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-600">Montant Emprunté</span>
                        <span className="text-[#0a0f1e] font-medium">{(loanAmount - downPayment).toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-600">Intérêts Totaux</span>
                        <span className="text-[#0a0f1e] font-medium">{((Number(calculateMonthlyPayment()) * loanTerm * 12) - (loanAmount - downPayment)).toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="text-gray-600">Coût Total</span>
                        <span className="text-[#d4af37] font-semibold">{(Number(calculateMonthlyPayment()) * loanTerm * 12 + downPayment).toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-medium hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all">
                      Demander un Financement
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">
                    ℹ️ <strong>Note:</strong> Ce simulateur fournit une estimation. Les conditions réelles peuvent varier selon votre profil et la banque partenaire.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}