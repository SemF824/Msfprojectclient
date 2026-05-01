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
import type { Transaction } from "../../types/database.types";

type TransactionStatus = "completed" | "pending" | "cancelled" | "in_progress";

export default function Transactions() {
  const { user } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Moteur de requête réel Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      if (!user || !supabase) return;
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id) // SÉCURITÉ FRONT-END
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && isMounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des transactions:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTransactions();

    return () => { isMounted = false; };
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": return { icon: CheckCircle2, label: "Complété", color: "bg-green-500/10 text-green-600 border-green-500/30", iconColor: "text-green-600" };
      case "pending": return { icon: Clock, label: "En Attente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", iconColor: "text-yellow-600" };
      case "in_progress": return { icon: AlertCircle, label: "En Cours", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", iconColor: "text-blue-600" };
      case "cancelled": return { icon: XCircle, label: "Annulé", color: "bg-red-500/10 text-red-600 border-red-500/30", iconColor: "text-red-600" };
      default: return { icon: Clock, label: "Inconnu", color: "bg-gray-100 text-gray-600 border-gray-200", iconColor: "text-gray-600" };
    }
  };

  const getPaymentMethodConfig = (method: string) => {
    switch (method) {
      case "mobile_money": return { icon: Smartphone, label: "Mobile Money" };
      case "bank_transfer": return { icon: Building2, label: "Virement Bancaire" };
      case "card": return { icon: CreditCard, label: "Carte Bancaire" };
      case "cash": return { icon: TrendingUp, label: "Espèces" };
      default: return { icon: CreditCard, label: "Standard" };
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + (t.amount || 0), 0);

  const stats = [
    { label: "Total Payé", value: `${totalAmount.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: "from-green-500 to-green-600" },
    { label: "Transactions", value: filteredTransactions.length.toString(), icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: "En Attente", value: filteredTransactions.filter(t => t.status === "pending").length.toString(), icon: Clock, color: "from-yellow-500 to-yellow-600" },
    { label: "Complétées", value: filteredTransactions.filter(t => t.status === "completed").length.toString(), icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Transactions", path: "/client/transactions" }
        ]} />
        <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2 font-bold break-words">
          Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Transactions</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">Historique de vos paiements et réservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-5 h-5 text-white" /></div>
              <p className="text-xl sm:text-2xl text-[#0a0f1e] mb-1 font-semibold truncate" title={stat.value}>{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher par propriété ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors text-sm" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "all")} className="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors cursor-pointer text-sm">
              <option value="all">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En Attente</option>
              <option value="in_progress">En Cours</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden min-w-0">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl text-[#0a0f1e] font-semibold">Historique ({filteredTransactions.length})</h2>
          <button className="flex items-center gap-2 px-3 py-2 text-[#d4af37] border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-colors">
            <Download className="w-4 h-4" /><span className="text-sm">Exporter</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Chargement de vos transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center"><AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 text-sm">Aucune transaction trouvée</p></div>
          ) : (
            filteredTransactions.map((transaction, idx) => {
              const statusConfig = getStatusConfig(transaction.status);
              const paymentConfig = getPaymentMethodConfig((transaction as any).paymentMethod || "bank_transfer");
              const StatusIcon = statusConfig.icon;
              const PaymentIcon = paymentConfig.icon;
              
              return (
                <motion.div key={transaction.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Link to={`/client/transaction/${transaction.id}`} className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors w-full min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full min-w-0">
                      
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.color.replace('text-', 'bg-').replace('/10', '/10')}`}>
                        <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[#0a0f1e] font-bold text-sm sm:text-base truncate">{transaction.property_name}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">{transaction.transaction_type.replace('_', ' ')}</p>
                          </div>
                          
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-[#d4af37] font-black text-base sm:text-lg break-words">
                              {transaction.amount.toLocaleString('fr-FR')} FCFA
                            </p>
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border mt-1 ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1.5"><PaymentIcon className="w-3.5 h-3.5" /><span>{paymentConfig.label}</span></div>
                          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{new Date(transaction.created_at).toLocaleDateString('fr-FR')}</span></div>
                          <div className="text-gray-400 font-mono text-[10px] sm:text-xs truncate">ID: {transaction.id.split('-')[0]}...</div>
                        </div>
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