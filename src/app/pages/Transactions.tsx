import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  BadgeDollarSign,
  TrendingUp,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { toast } from "sonner";
import type { Transaction, TransactionStatus, TransactionType } from "../../types/database.types";

export default function Transactions() {
  const { user } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user || !supabase) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!user,
  });

  // Handler d'exportation de relevé de versements au format CSV
  const handleExportStatement = () => {
    if (transactions.length === 0) {
      toast.error("Aucune transaction disponible pour l'exportation.");
      return;
    }

    try {
      const headers = [
        "Référence",
        "Bien Immobilier",
        "Nature",
        "Montant (FCFA)",
        "Statut",
        "Date",
      ];
      const rows = filteredTransactions.map((t) => [
        `"${t.id}"`,
        `"${t.property_name || "Bien MSF Congo"}"`,
        `"${t.description || t.transaction_type || "Versement"}"`,
        t.amount || 0,
        `"${t.status}"`,
        `"${t.created_at || t.date_transaction ? new Date(t.created_at || t.date_transaction!).toLocaleDateString("fr-FR") : ""}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `msf-releve-financier-${user?.id?.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Votre relevé financier a été généré avec succès.");
    } catch (err) {
      toast.error("Échec du traitement d'exportation.");
    }
  };

  // Filtrage combiné côté client
  const filteredTransactions = transactions.filter((transaction) => {
    const safeSearchTerm = searchTerm.toLowerCase();
    const safeId = transaction.id ? transaction.id.toLowerCase() : "";
    const matchesSearch =
      safeId.includes(safeSearchTerm) ||
      (transaction.description && transaction.description.toLowerCase().includes(safeSearchTerm)) ||
      (transaction.property_name && transaction.property_name.toLowerCase().includes(safeSearchTerm));

    const matchesStatus =
      statusFilter === "all" ||
      transaction.status === statusFilter ||
      (statusFilter === "complete" && transaction.status === "completed") ||
      (statusFilter === "en_attente" && (transaction.status === "pending" || transaction.status === "in_progress"));

    return matchesSearch && matchesStatus;
  });

  // Métriques financières calculées selon les contraintes SQL
  const totalInvested = transactions
    .filter((t) => t.status === "complete" || t.status === "completed")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "en_attente" || t.status === "pending" || t.status === "in_progress")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Configuration d'affichage des statuts PostgreSQL (en_attente, complete, echoue)
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "complete":
      case "completed":
        return {
          label: "Confirmé & Réglé",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      case "en_attente":
      case "pending":
      case "in_progress":
        return {
          label: "En attente de validation",
          color: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Clock,
        };
      case "echoue":
      case "cancelled":
        return {
          label: "Rejeté / Annulé",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      default:
        return {
          label: status || "En traitement",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  // Configuration des types de transaction PostgreSQL
  const getTransactionTypeConfig = (type?: string | null) => {
    switch (type) {
      case "acompte":
        return { label: "Acompte de réservation", icon: BadgeDollarSign };
      case "mensualite":
        return { label: "Mensualité / Échéance", icon: Calendar };
      case "solde":
        return { label: "Règlement du solde", icon: CheckCircle2 };
      case "frais":
        return { label: "Frais administratifs / notariés", icon: FileText };
      case "paiement":
      default:
        return { label: "Versement bancaire / caisse", icon: CreditCard };
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb et Titre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "Finances", path: "/client/transactions" },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl text-[#0a0f1e] mt-2 font-bold tracking-tight">
            Suivi Financier & <span className="text-[#d4af37]">Versements</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Historique certifié de vos règlements, acomptes et échéances immobilières.
          </p>
        </div>

        <button
          onClick={handleExportStatement}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#d4af37] hover:text-[#d4af37] transition-all shadow-sm flex-shrink-0"
        >
          <Download className="w-4 h-4" /> Export Relevé
        </button>
      </div>

      {/* Cartes de Synthèse Financière */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total Capital Réglé
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {totalInvested.toLocaleString("fr-FR")} FCFA
            </h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              En cours de validation
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-[#8c7423] tracking-tight">
              {pendingAmount.toLocaleString("fr-FR")} FCFA
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-[#8c7423] border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtrage */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, libellé ou bien immobilier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:flex-initial">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-52 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">Tous les règlements</option>
              <option value="complete">Confirmés & Réglés</option>
              <option value="en_attente">En attente de validation</option>
              <option value="echoue">Rejetés / Annulés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline des Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-4 w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
                >
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-40 sm:w-48" />
                      <div className="h-3 bg-gray-100 rounded w-24 sm:w-32" />
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-28 sm:w-32" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Aucune transaction trouvée"
              description="Aucune opération financière ne correspond à vos critères de recherche."
            />
          ) : (
            filteredTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              const typeConfig = getTransactionTypeConfig(transaction.transaction_type);
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;

              const dateToFormat = transaction.created_at || transaction.date_transaction;
              const formattedDate = dateToFormat
                ? new Date(dateToFormat).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Date inconnue";

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-xl hover:border-[#d4af37]/60 shadow-sm hover:shadow-md transition-[border-color,box-shadow] duration-200 overflow-hidden"
                >
                  <Link
                    to={`/client/transactions/${transaction.id}`}
                    className="block p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl border flex-shrink-0 flex items-center justify-center ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#0a0f1e] truncate">
                            {transaction.property_name || transaction.description || "Versement MSF Congo"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {typeConfig.label} — {transaction.description || "Acquisition immobilière"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1.5 border-t sm:border-0 pt-3 sm:pt-0 border-gray-50 flex-shrink-0">
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-[#8c7423] font-black text-base sm:text-lg">
                            {(Number(transaction.amount) || 0).toLocaleString("fr-FR")} FCFA
                          </p>
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border mt-1 ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mt-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>{typeConfig.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formattedDate}</span>
                      </div>
                      {transaction.invoice_url && (
                        <div className="flex items-center gap-1 text-[#8c7423] font-semibold text-xs">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Reçu disponible</span>
                        </div>
                      )}
                      <div className="text-gray-400 font-mono text-[10px] sm:text-xs ml-auto truncate bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        Réf: {transaction.id.split("-")[0]}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
