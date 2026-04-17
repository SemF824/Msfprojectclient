import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { 
  Search, Filter, Eye, Download, CheckCircle2, 
  XCircle, Clock, FileText, Phone, Mail, MapPin,
  Calendar, User, Building2, DollarSign, AlertCircle,
  ArrowUpDown, ChevronLeft, ChevronRight
} from "lucide-react";

export default function DemandesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [priorityFilter, setPriorityFilter] = useState("tous");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - Complete quote requests
  const allRequests = [
    {
      id: "REQ-001",
      date: "2024-04-17 09:30",
      client: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@email.com",
        phone: "+242 06 XXX XXXX",
        address: "Avenue de l'Indépendance, Pointe-Noire",
        profession: "Entrepreneur",
        company: "Dupont Sarl"
      },
      property: {
        id: "tchikobo-villa-5",
        name: "Villa Tchikobo Prestige",
        price: 295200000
      },
      requestType: "achat",
      financingNeeded: "oui",
      downPayment: "50000000",
      visitDate: "2024-04-20",
      visitTime: "10h00",
      status: "nouveau",
      priority: "haute",
      message: "Très intéressé par cette propriété. Disponible pour visite cette semaine.",
      assignedTo: null,
      documents: []
    },
    {
      id: "REQ-002",
      date: "2024-04-16 14:15",
      client: {
        firstName: "Marie",
        lastName: "Okemba",
        email: "m.okemba@company.cg",
        phone: "+242 05 XXX XXXX",
        address: "Centre-ville, Pointe-Noire",
        profession: "Cadre",
        company: "Total E&P"
      },
      property: {
        id: "ocean-penthouse",
        name: "Penthouse Ocean Boulevard",
        price: 450000000
      },
      requestType: "achat",
      financingNeeded: "non",
      downPayment: "",
      visitDate: "2024-04-18",
      visitTime: "14h00",
      status: "en_cours",
      priority: "haute",
      message: "Paiement cash possible. Recherche propriété haut standing avec vue océan.",
      assignedTo: "Agent Roger",
      documents: ["CNI", "Justificatif revenus"]
    },
    {
      id: "REQ-003",
      date: "2024-04-16 11:20",
      client: {
        firstName: "Paul",
        lastName: "Nkounkou",
        email: "paul.nk@gmail.com",
        phone: "+242 06 XXX XXXX",
        address: "Mpita, Pointe-Noire",
        profession: "Fonctionnaire",
        company: "Ministère"
      },
      property: {
        id: "cote-sauvage-t4",
        name: "Appartement Côte Sauvage T4",
        price: 185000000
      },
      requestType: "achat",
      financingNeeded: "oui",
      downPayment: "30000000",
      visitDate: "2024-04-19",
      visitTime: "15h00",
      status: "documents",
      priority: "moyenne",
      message: "Besoin de financement bancaire.",
      assignedTo: "Agent Sophie",
      documents: ["CNI", "Bulletins salaire", "Attestation travail"]
    },
    {
      id: "REQ-004",
      date: "2024-04-15 16:45",
      client: {
        firstName: "Sophie",
        lastName: "Mbongo",
        email: "sophie.mbongo@hotmail.fr",
        phone: "+242 05 XXX XXXX",
        address: "Tié-Tié, Pointe-Noire",
        profession: "Commerçante",
        company: "Auto-entrepreneur"
      },
      property: {
        id: "eucalyptus-villa",
        name: "Villa Les Eucalyptus",
        price: 320000000
      },
      requestType: "achat",
      financingNeeded: "peut-etre",
      downPayment: "100000000",
      visitDate: "",
      visitTime: "",
      status: "nouveau",
      priority: "moyenne",
      message: "",
      assignedTo: null,
      documents: []
    },
    {
      id: "REQ-005",
      date: "2024-04-14 10:00",
      client: {
        firstName: "David",
        lastName: "Loukabou",
        email: "d.loukabou@yahoo.fr",
        phone: "+242 06 XXX XXXX",
        address: "Loandjili, Pointe-Noire",
        profession: "Ingénieur",
        company: "ENI Congo"
      },
      property: {
        id: "marina-studio",
        name: "Studio Marina Luxe",
        price: 95000000
      },
      requestType: "achat",
      financingNeeded: "oui",
      downPayment: "20000000",
      visitDate: "2024-04-17",
      visitTime: "11h00",
      status: "approuve",
      priority: "basse",
      message: "Premier achat immobilier.",
      assignedTo: "Agent Roger",
      documents: ["CNI", "Justificatif revenus", "RIB", "Contrat travail"]
    },
    {
      id: "REQ-006",
      date: "2024-04-13 15:30",
      client: {
        firstName: "Chantal",
        lastName: "Massamba",
        email: "c.massamba@gmail.com",
        phone: "+242 05 XXX XXXX",
        address: "Mongo-Pounga, Brazzaville",
        profession: "Médecin",
        company: "CHU Brazzaville"
      },
      property: {
        id: "cote-sauvage-t3",
        name: "Appartement Côte Sauvage T3",
        price: 165000000
      },
      requestType: "location",
      financingNeeded: "non",
      downPayment: "",
      visitDate: "2024-04-22",
      visitTime: "10h00",
      status: "en_cours",
      priority: "basse",
      message: "Mutation à Pointe-Noire prévue en mai.",
      assignedTo: "Agent Sophie",
      documents: ["CNI", "Attestation travail"]
    },
    {
      id: "REQ-007",
      date: "2024-04-12 09:15",
      client: {
        firstName: "Arnaud",
        lastName: "Tchicaya",
        email: "arnaud.t@orange.fr",
        phone: "+242 06 XXX XXXX",
        address: "La Base, Pointe-Noire",
        profession: "Expatrié",
        company: "Chevron"
      },
      property: {
        id: "ocean-penthouse",
        name: "Penthouse Ocean Boulevard",
        price: 450000000
      },
      requestType: "information",
      financingNeeded: "non",
      downPayment: "",
      visitDate: "",
      visitTime: "",
      status: "rejete",
      priority: "basse",
      message: "Demande d'informations générales.",
      assignedTo: "Agent Roger",
      documents: []
    }
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string; icon: any }> = {
      nouveau: { text: "Nouveau", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileText },
      en_cours: { text: "En Cours", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
      documents: { text: "Documents", color: "bg-purple-100 text-purple-700 border-purple-200", icon: FileText },
      approuve: { text: "Approuvé", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
      rejete: { text: "Rejeté", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle }
    };
    return labels[status] || labels.nouveau;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      haute: "text-red-600 font-semibold",
      moyenne: "text-orange-600 font-medium",
      basse: "text-gray-600"
    };
    return colors[priority] || colors.moyenne;
  };

  // Filtering
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = 
      request.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "tous" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "tous" || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    // Simple CSV export
    console.log("Exporting to CSV...");
    alert("Export CSV en cours de développement");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-[#0a0f1e] mb-2 font-bold">
                Demandes de Devis
              </h1>
              <p className="text-gray-600">
                Gérer et suivre toutes les demandes de devis clients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#0a0f1e] rounded-xl transition-colors">
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">Exporter</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all font-medium">
                <FileText className="w-5 h-5" />
                <span className="hidden md:inline">Nouvelle Demande</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, ID, propriété..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
            >
              <option value="tous">Tous les statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_cours">En Cours</option>
              <option value="documents">Documents</option>
              <option value="approuve">Approuvé</option>
              <option value="rejete">Rejeté</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
            >
              <option value="tous">Toutes priorités</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    <button className="flex items-center gap-2 hover:text-[#d4af37]">
                      ID <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Client
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Propriété
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Montant
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Priorité
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Agent
                  </th>
                  <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request, idx) => {
                  const status = getStatusLabel(request.status);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm text-[#0a0f1e] font-semibold">{request.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">{request.date.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">{request.date.split(' ')[1]}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                            <span className="text-[#0a0f1e] font-semibold text-sm">
                              {request.client.firstName[0]}{request.client.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-[#0a0f1e] font-medium">
                              {request.client.firstName} {request.client.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{request.client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700 max-w-[200px] truncate">
                          {request.property.name}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-[#0a0f1e] font-semibold">
                          {(request.property.price / 1000000).toFixed(1)}M FCFA
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700 capitalize">{request.requestType}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.text}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm capitalize ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700">
                          {request.assignedTo || (
                            <span className="text-gray-400 italic">Non assigné</span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/demandes/${request.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-lg transition-colors text-sm font-medium group"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Affichage {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRequests.length)} sur {filteredRequests.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-semibold"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-[#0a0f1e] font-semibold mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres de recherche
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}