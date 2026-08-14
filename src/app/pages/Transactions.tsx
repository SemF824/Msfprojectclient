import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Download, Filter, Search,
  CheckCircle2, Clock, XCircle, AlertCircle,
  Calendar, CreditCard, Smartphone, Building2, TrendingUp, Loader2
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { toast } from "sonner";
import type { Transaction } from "../../types/database.types";

type TransactionStatus = "completed" | "pending" | "cancelled" | "in_progress";

export default function Transactions() {
  const { user } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Moteur de requête réel Supabase (React 18 Pattern)
  useEffect(() => {
    if (!user || !supabase) return;
    let isMounted = true;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data && isMounted) {
          setTransactions(data);
        }
      } catch (err: any) {
        console.error("Erreur de synchronisation financière:", err);
        toast.error("Impossible de récupérer l'historique de vos transactions.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
    return () => { isMounted = false; };
  }, [user]);

  // Handler d'exportation de reçu au format CSV sécurisé
  const handleExportStatement = () => {
    if (transactions.length === 0) {
      toast.error("Aucune transaction disponible pour l'exportation.");
      return;
    }

    try {
      const headers = ["ID Transaction", "Description", "Montant (FCFA)", "Méthode", "Statut", "Date"];
      const rows = filteredTransactions.map(t => [
        `"${t.id}"`,
        `"${t.description || "Transaction immobilière"}"`,
        t.amount,
        `"${t.payment_method || "Non spécifiée"}"`,
        `"${t.status}"`,
        `"${new Date(t.created_at).toLocaleDateString('fr-FR')}"`
      ].join(","));

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `msf-releve-${user?.id?.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Votre relevé de compte a été généré avec succès.");
    } catch (err) {
      toast.error("Échec du traitement d'exportation.");
    }
  };

  // Filtrage combiné côté client
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.property_name && transaction.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Métriques financières calculées à la volée
  const totalInvested = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status === "pending" || t.status === "in_progress")
    .reduce((sum, t) => sum + t.amount, 0);

  // Configuration d'affichage Purge-Safe Tailwind
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Complété", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 };
      case "pending":
        return { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
      case "in_progress":
        return { label: "En cours", color: "bg-blue-50 text-blue-700 border-blue-200", icon: TrendingUp };
      case "cancelled":
        return { label: "Annulé", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle };
      default:
        return { label: "Inconnu", color: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle };
    }
  };

  const getPaymentMethodConfig = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
      case "credit_card":
        return { label: "Carte de Crédit", icon: CreditCard };
      case "mobile_money":
      case "momo":
      case "airtel_money":
        return { label: "Mobile Money", icon: Smartphone };
      case "bank_transfer":
      case "virement":
        return { label: "Virement Bancaire", icon: Building2 };
      default:
        return { label: "Paiement Agence", icon: CreditCard };
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb et Titre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <Breadcrumb items={[{ label: "Dashboard", path: "/client/dashboard" }, { label: "Finances", path: "/client/transactions" }]} />
          <h1 className="text-2xl sm:text-3xl text-[#0a0f1e] mt-2 font-bold tracking-tight">Suivi Financier</h1>
          <p className="text-gray-500 text-sm">Consultez l'historique de vos versements et acomptes immobiliers</p>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Capital Versé</p>
            <h3 className="text-xl sm:text-2xl font-black text-green-600 tracking-tight">
              {totalInvested.toLocaleString('fr-FR')} FCFA
            </h3>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Encours / En attente</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
              {pendingAmount.toLocaleString('fr-FR')} FCFA
            </h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
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
            placeholder="Rechercher par ID, libellé ou bien immobilier..."
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
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-48 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline des Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
              <p className="text-xs font-medium">Interrogation des registres financiers...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Aucune transaction"
              description="Aucune opération financière ne correspond à vos critères de recherche."
            />
          ) : (
            filteredTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              const paymentConfig = getPaymentMethodConfig(transaction.payment_method || "");
              const StatusIcon = statusConfig.icon;
              const PaymentIcon = paymentConfig.icon;

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-xl hover:border-[#d4af37]/40 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <Link to={`/client/transactions/${transaction.id}`} className="block p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl border flex-shrink-0 flex items-center justify-center ${statusConfig.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#0a0f1e] truncate">
                            {transaction.property_name || transaction.description || "Versement MSF Congo"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            Libellé : {transaction.description || "Acompte d'acquisition"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 border-t sm:border-0 pt-3 sm:pt-0 border-gray-50 flex-shrink-0">
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className="text-[#d4af37] font-black text-base sm:text-lg break-words">
                            {transaction.amount.toLocaleString('fr-FR')} FCFA
                          </p>
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border mt-1 ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mt-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5"><PaymentIcon className="w-3.5 h-3.5 text-gray-400" /><span>{paymentConfig.label}</span></div>
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /><span>{new Date(transaction.created_at).toLocaleDateString('fr-FR')}</span></div>
                      <div className="text-gray-400 font-mono text-[10px] sm:text-xs ml-auto truncate bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">ID: {transaction.id.split('-')[0]}...</div>
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