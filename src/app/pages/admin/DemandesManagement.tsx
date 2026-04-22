import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  useSupabaseAuth,
  supabase,
} from "../../../hooks/useSupabaseAuth";

export default function DemandesManagement() {
  const { userRole } = useSupabaseAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [priorityFilter, setPriorityFilter] = useState("tous");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Récupération des données réelles depuis Supabase
  useEffect(() => {
    const fetchDemandes = async () => {
      if (!supabase) return;

      setIsLoadingData(true);
      try {
        const { data, error } = await supabase
          .from("devis_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transformation pour correspondre aux besoins de l'affichage
        const formattedData =
          data?.map((d) => ({
            id: d.id.substring(0, 8).toUpperCase(),
            raw_id: d.id,
            date: new Date(d.created_at).toLocaleString(
              "fr-FR",
            ),
            client: {
              firstName: d.client_first_name,
              lastName: d.client_last_name,
              email: d.client_email,
              phone: d.client_phone,
              profession: d.client_profession,
            },
            property: {
              name: d.property_name,
              price: d.property_price,
            },
            requestType: d.request_type,
            status: d.status || "nouveau",
            priority: d.priority || "moyenne",
            assignedTo: d.assigned_to,
          })) || [];

        setRequests(formattedData);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des devis:",
          err,
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDemandes();
  }, []);

  // Action de suppression (Veto Superadmin)
  const handleDelete = async (
    id: string,
    raw_id: string,
    clientName: string,
  ) => {
    if (!supabase) return;

    if (
      window.confirm(
        `Action irréversible : Supprimer définitivement la demande ${id} de ${clientName} ?`,
      )
    ) {
      try {
        const { error } = await supabase
          .from("devis_requests")
          .delete()
          .eq("id", raw_id);

        if (error) throw error;

        // Mise à jour locale de l'état
        setRequests((prev) =>
          prev.filter((req) => req.raw_id !== raw_id),
        );
      } catch (err) {
        alert(
          "Erreur de suppression : Vous n'avez probablement pas les droits suffisants ou un problème réseau est survenu.",
        );
        console.error(err);
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      { text: string; color: string; icon: any }
    > = {
      nouveau: {
        text: "Nouveau",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: FileText,
      },
      en_cours: {
        text: "En Cours",
        color:
          "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock,
      },
      documents: {
        text: "Documents",
        color:
          "bg-purple-100 text-purple-700 border-purple-200",
        icon: FileText,
      },
      approuve: {
        text: "Approuvé",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
      },
      rejete: {
        text: "Rejeté",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      },
    };
    return labels[status] || labels.nouveau;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      haute: "text-red-600 font-semibold",
      moyenne: "text-orange-600 font-medium",
      basse: "text-gray-600",
    };
    return colors[priority] || colors.moyenne;
  };

  // Filtrage
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.client.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.client.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.property.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "tous" ||
      request.status === statusFilter;
    const matchesPriority =
      priorityFilter === "tous" ||
      request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredRequests.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
                Base de données en temps réel - MSF Congo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#0a0f1e] rounded-xl transition-colors">
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">
                  Exporter CSV
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client ou un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
              />
            </div>

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

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
            >
              <option value="tous">Toutes priorités</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>
        </motion.div>

        {/* Table / Loading State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden min-h-[400px]"
        >
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
              <p className="text-gray-500 animate-pulse">
                Chargement des dossiers...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                      ID
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
                      Prix
                    </th>
                    <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                      Statut
                    </th>
                    <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                      Priorité
                    </th>
                    <th className="text-left py-4 px-6 text-sm text-gray-600 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => {
                    const status = getStatusLabel(
                      request.status,
                    );
                    const StatusIcon = status.icon;
                    return (
                      <tr
                        key={request.raw_id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-[#0a0f1e]">
                          {request.id}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {request.date}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-[#0a0f1e]">
                              {request.client.firstName}{" "}
                              {request.client.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.client.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {request.property.name}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#0a0f1e]">
                          {new Intl.NumberFormat(
                            "fr-FR",
                          ).format(request.property.price)}{" "}
                          FCFA
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${status.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.text}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-sm capitalize ${getPriorityColor(request.priority)}`}
                          >
                            {request.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/demandes/${request.raw_id}`}
                              className="p-2 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>

                            {/* Bouton de veto exclusif au Superadmin */}
                            {userRole === "superadmin" && (
                              <button
                                onClick={() =>
                                  handleDelete(
                                    request.id,
                                    request.raw_id,
                                    `${request.client.firstName} ${request.client.lastName}`,
                                  )
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingData && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(1, prev - 1),
                    )
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingData && filteredRequests.length === 0 && (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">
                Aucune demande ne correspond à vos critères
              </h3>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}