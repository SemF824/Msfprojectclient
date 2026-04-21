import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Home, Heart, Calendar, FileText, Calculator, LogOut,
  Bell, Settings, User, Eye, Clock, CheckCircle2,
  AlertCircle, Download, MapPin, TrendingUp,
  Building2, Bed, Bath, Square, Phone, Mail, CreditCard, Inbox
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import type {
  Transaction,
  Appointment,
  Document,
  Notification,
  Favorite,
  DevisRequest,
  DashboardStats
} from "../../types/database.types";

export default function Dashboard() {
  const { user: authUser, isLoading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Guard de chargement
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

  // États pour les vraies données
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [devisRequests, setDevisRequests] = useState<DevisRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Données dynamiques depuis Supabase
  const displayName = authUser?.user_metadata?.full_name
    || authUser?.user_metadata?.first_name
    || authUser?.email?.split('@')[0]
    || 'Utilisateur';
  const displayEmail = authUser?.email || '';

  // Statistiques calculées à partir des vraies données
  const stats = [
    { label: "Demandes Actives", value: devisRequests.filter(r => r.status === 'nouveau' || r.status === 'en_cours').length.toString(), icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Propriétés Favorites", value: favorites.length.toString(), icon: Heart, color: "from-pink-500 to-pink-600" },
    { label: "Visites Planifiées", value: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length.toString(), icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Documents", value: documents.length.toString(), icon: FileText, color: "from-purple-500 to-purple-600" }
  ];

  // Fetching centralisé : récupération de toutes les données en parallèle
  useEffect(() => {
    if (!authUser) return;

    const fetchAllData = async () => {
      setIsDataLoading(true);
      try {
        const userId = authUser.id;
        const userEmail = authUser.email || '';

        // Promise.all pour exécuter toutes les requêtes en parallèle
        const [
          transactionsData,
          appointmentsData,
          documentsData,
          favoritesData,
          devisData,
          notificationsData
        ] = await Promise.all([
          // Transactions
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

          // Rendez-vous
          supabase
            .from('appointments')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true }),

          // Documents
          supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

          // Favoris
          supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId),

          // Demandes de devis
          supabase
            .from('devis_requests')
            .select('*')
            .eq('client_email', userEmail)
            .order('created_at', { ascending: false }),

          // Notifications
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        // Mise à jour des états avec les données ou tableaux vides
        setTransactions(transactionsData.data || []);
        setAppointments(appointmentsData.data || []);
        setDocuments(documentsData.data || []);
        setFavorites(favoritesData.data || []);
        setDevisRequests(devisData.data || []);
        setNotifications(notificationsData.data || []);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchAllData();
  }, [authUser]);

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

  // Fonction dynamique pour les couleurs de statut des transactions
  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Fonction dynamique pour les couleurs de statut des rendez-vous
  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Fonction dynamique pour les labels de statut
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      // Transactions
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      // Appointments
      'scheduled': 'Planifié',
      'confirmed': 'Confirmé',
      // Devis
      'nouveau': 'Nouveau',
      'en_cours': 'En cours',
      'approuve': 'Approuvée',
      'rejete': 'Rejetée'
    };
    return labels[status] || status;
  };

  // Fonction dynamique pour les icônes de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle2;
      case 'payment':
        return CreditCard;
      case 'document':
        return FileText;
      case 'appointment':
        return Calendar;
      case 'warning':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

              {/* Retour au site public */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#d4af37] transition-colors rounded-xl hover:bg-gray-50"
                >
                  <Home className="w-4 h-4" />
                  <span>← Retour au site</span>
                </Link>
              </div>

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
                    <h2 className="text-xl text-[#0a0f1e] font-semibold">Transactions Récentes</h2>
                    <Link
                      to="/transactions"
                      className="text-sm text-[#d4af37] hover:underline flex items-center gap-1"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Voir Tout</span>
                    </Link>
                  </div>
                  {isDataLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <EmptyState
                      icon={CreditCard}
                      title="Aucune transaction"
                      description="Vous n'avez pas encore de transaction en cours."
                    />
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <p className="text-[#0a0f1e] font-medium">{transaction.property_name}</p>
                            <p className="text-sm text-gray-600">{transaction.amount.toLocaleString()} FCFA</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${getTransactionStatusColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Upcoming Appointments */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
                >
                  <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Prochains Rendez-vous</h2>
                  {isDataLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : appointments.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Aucun rendez-vous"
                      description="Vous n'avez pas de rendez-vous planifié pour le moment."
                    />
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-12 h-12 bg-[#d4af37]/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#d4af37]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#0a0f1e] font-medium">{apt.property_name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.time}
                              {apt.agent_name && ` - ${apt.agent_name}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${getAppointmentStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Demandes de Devis</h2>
                {isDataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : devisRequests.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Aucune demande de devis"
                    description="Vous n'avez pas encore soumis de demande de devis."
                  />
                ) : (
                  <div className="space-y-4">
                    {devisRequests.map((request) => (
                      <div key={request.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-[#0a0f1e] text-lg font-medium mb-1">{request.property_name}</h3>
                            <p className="text-gray-600 text-sm">
                              Type: {request.request_type === 'achat' ? 'Achat' : request.request_type === 'location' ? 'Location' : 'Information'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${getTransactionStatusColor(request.status)}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <p className="text-gray-600 text-sm">
                            Soumise le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-[#d4af37] font-medium">
                            {request.property_price.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {isDataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Aucun rendez-vous"
                    description="Vous n'avez pas encore de rendez-vous planifié."
                  />
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => {
                      const dateObj = new Date(apt.date);
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });

                      return (
                        <div key={apt.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-xl flex flex-col items-center justify-center">
                              <span className="text-[#d4af37] text-xs uppercase">{month}</span>
                              <span className="text-[#0a0f1e] text-xl font-semibold">{day}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[#0a0f1e] text-lg font-medium mb-1">{apt.property_name}</h3>
                              <p className="text-gray-600 text-sm mb-2">Heure: {apt.time}</p>
                              {apt.agent_name && (
                                <p className="text-gray-600 text-sm">Agent: {apt.agent_name}</p>
                              )}
                              {apt.notes && (
                                <p className="text-gray-500 text-sm mt-2 italic">{apt.notes}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full border ${getAppointmentStatusColor(apt.status)}`}>
                              {getStatusLabel(apt.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Propriétés Favorites</h2>
                {isDataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="Aucune propriété favorite"
                    description="Vous n'avez pas encore ajouté de propriété à vos favoris."
                  />
                ) : (
                  <div className="space-y-4">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[#0a0f1e] text-lg font-medium mb-1">
                              Propriété ID: {fav.property_id}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Ajoutée le {new Date(fav.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Historique des Transactions</h2>
                {isDataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : transactions.filter(t => t.status === 'completed').length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="Aucun historique"
                    description="Vous n'avez pas encore de transaction terminée."
                  />
                ) : (
                  <div className="space-y-4">
                    {transactions.filter(t => t.status === 'completed').map((transaction) => (
                      <div key={transaction.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-[#0a0f1e] text-lg font-medium">{transaction.property_name}</h3>
                            <p className="text-gray-600 text-sm">
                              Terminée le {new Date(transaction.updated_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className="text-[#d4af37] font-semibold">
                            {transaction.amount.toLocaleString()} FCFA
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Type: {transaction.transaction_type === 'purchase' ? 'Achat' : transaction.transaction_type === 'sale' ? 'Vente' : transaction.transaction_type === 'rental' ? 'Location' : 'Réservation'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
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
                {isDataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Aucun document"
                    description="Vous n'avez pas encore de document disponible."
                  />
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#d4af37]/50 transition-colors">
                        <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[#d4af37]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#0a0f1e] font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">
                            {doc.type} • {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
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