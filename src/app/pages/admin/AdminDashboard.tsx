import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { 
  FileText, Users, Building2, TrendingUp, Clock, 
  CheckCircle2, AlertCircle, DollarSign, Calendar,
  ArrowUp, ArrowDown, Eye, Filter, Search,
  Download, BarChart3, PieChart, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7days");

  // Mock statistics
  const stats = [
    { 
      label: "Demandes de Devis", 
      value: "47", 
      change: "+12%", 
      trend: "up",
      icon: FileText, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Ventes Conclues", 
      value: "8", 
      change: "+25%", 
      trend: "up",
      icon: CheckCircle2, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    { 
      label: "En Négociation", 
      value: "15", 
      change: "-5%", 
      trend: "down",
      icon: Clock, 
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    { 
      label: "Chiffre d'Affaires", 
      value: "2.4M", 
      change: "+18%", 
      trend: "up",
      icon: DollarSign, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  // Recent quote requests
  const recentRequests = [
    {
      id: "REQ-001",
      client: "Jean Dupont",
      property: "Villa Tchikobo Prestige",
      amount: "295 200 000 FCFA",
      status: "nouveau",
      date: "2024-04-17",
      priority: "haute"
    },
    {
      id: "REQ-002",
      client: "Marie Okemba",
      property: "Penthouse Ocean Boulevard",
      amount: "450 000 000 FCFA",
      status: "en_cours",
      date: "2024-04-16",
      priority: "moyenne"
    },
    {
      id: "REQ-003",
      client: "Paul Nkounkou",
      property: "Appartement Côte Sauvage T4",
      amount: "185 000 000 FCFA",
      status: "documents",
      date: "2024-04-16",
      priority: "basse"
    },
    {
      id: "REQ-004",
      client: "Sophie Mbongo",
      property: "Villa Les Eucalyptus",
      amount: "320 000 000 FCFA",
      status: "nouveau",
      date: "2024-04-15",
      priority: "haute"
    },
    {
      id: "REQ-005",
      client: "David Loukabou",
      property: "Studio Marina Luxe",
      amount: "95 000 000 FCFA",
      status: "approuve",
      date: "2024-04-14",
      priority: "moyenne"
    }
  ];

  // Top performing properties
  const topProperties = [
    { name: "Villa Tchikobo Prestige", requests: 12, conversions: 3, revenue: "885M FCFA" },
    { name: "Penthouse Ocean Boulevard", requests: 8, conversions: 2, revenue: "900M FCFA" },
    { name: "Les Eucalyptus", requests: 15, conversions: 2, revenue: "640M FCFA" },
    { name: "Côte Sauvage", requests: 20, conversions: 1, revenue: "185M FCFA" }
  ];

  // Upcoming tasks
  const upcomingTasks = [
    { title: "Visite Villa Tchikobo - Jean Dupont", date: "Aujourd'hui 10h00", type: "visite" },
    { title: "Validation documents - Marie Okemba", date: "Aujourd'hui 14h30", type: "documents" },
    { title: "Rendez-vous signature - Paul Nkounkou", date: "Demain 09h00", type: "signature" },
    { title: "Appel suivi - Sophie Mbongo", date: "Demain 15h00", type: "appel" }
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nouveau: { text: "Nouveau", color: "bg-blue-100 text-blue-700" },
      en_cours: { text: "En Cours", color: "bg-yellow-100 text-yellow-700" },
      documents: { text: "Documents", color: "bg-purple-100 text-purple-700" },
      approuve: { text: "Approuvé", color: "bg-green-100 text-green-700" },
      rejete: { text: "Rejeté", color: "bg-red-100 text-red-700" }
    };
    return labels[status] || labels.nouveau;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      haute: { text: "Haute", color: "text-red-600" },
      moyenne: { text: "Moyenne", color: "text-orange-600" },
      basse: { text: "Basse", color: "text-gray-600" }
    };
    return labels[priority] || labels.moyenne;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-[#0a0f1e] font-bold mb-2">
                Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Admin</span>
              </h1>
              <p className="text-gray-600">Bienvenue sur votre espace de gestion MSF Congo</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
              >
                <option value="24h">Dernières 24h</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="3months">3 derniers mois</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all font-medium">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl text-[#0a0f1e] font-bold mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requests Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-[#0a0f1e] font-semibold">Demandes Récentes</h2>
                <Link 
                  to="/demandes"
                  className="text-[#d4af37] hover:text-[#b8941f] text-sm font-medium"
                >
                  Voir tout →
                </Link>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client, propriété..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:border-[#d4af37] transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtrer
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Client</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Propriété</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Montant</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Statut</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Priorité</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((request, idx) => {
                      const status = getStatusLabel(request.status);
                      const priority = getPriorityLabel(request.priority);
                      return (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#0a0f1e] font-medium">{request.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-[#0a0f1e] font-medium">{request.client}</p>
                              <p className="text-xs text-gray-500">{request.date}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-700">{request.property}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-[#0a0f1e] font-medium">{request.amount}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-sm font-medium ${priority.color}`}>
                              {priority.text}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Link
                              to={`/admin/demandes/${request.id}`}
                              className="flex items-center gap-1 text-[#d4af37] hover:text-[#b8941f] text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Voir
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Top Properties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-[#0a0f1e] font-semibold">Propriétés les Plus Demandées</h2>
                <Link 
                  to="/admin/statistiques"
                  className="text-[#d4af37] hover:text-[#b8941f] text-sm font-medium"
                >
                  Analytics →
                </Link>
              </div>

              <div className="space-y-4">
                {topProperties.map((property, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <h3 className="text-[#0a0f1e] font-medium mb-2">{property.name}</h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>{property.requests} demandes</span>
                        <span>{property.conversions} conversions</span>
                        <span className="text-[#d4af37] font-medium">{property.revenue}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl text-[#0a0f1e] font-bold">
                        {Math.round((property.conversions / property.requests) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Taux conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Actions Rapides</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/demandes"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[#0a0f1e] font-medium">Demandes de Devis</span>
                </Link>
                <Link
                  to="/admin/proprietes"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[#0a0f1e] font-medium">Gérer Propriétés</span>
                </Link>
                <Link
                  to="/admin/clients"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-[#0a0f1e] font-medium">Base Clients</span>
                </Link>
                <Link
                  to="/admin/statistiques"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-[#0a0f1e] font-medium">Statistiques</span>
                </Link>
              </div>
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-4">Tâches à Venir</h2>
              <div className="space-y-3">
                {upcomingTasks.map((task, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.type === 'visite' ? 'bg-blue-500' :
                        task.type === 'documents' ? 'bg-purple-500' :
                        task.type === 'signature' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-[#0a0f1e] font-medium mb-1">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {task.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-[#d4af37]" />
                <h2 className="text-xl text-[#0a0f1e] font-semibold">Activité</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nouveaux clients</span>
                  <span className="text-[#0a0f1e] font-semibold">+12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis envoyés</span>
                  <span className="text-[#0a0f1e] font-semibold">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Visites planifiées</span>
                  <span className="text-[#0a0f1e] font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de conversion</span>
                  <span className="text-green-600 font-semibold">17%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}