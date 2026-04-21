import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Download, Filter, Search,
  CheckCircle2, Clock, XCircle, AlertCircle,
  Calendar, CreditCard, Smartphone, Building2, TrendingUp
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

type TransactionStatus = "completed" | "pending" | "failed" | "processing";
type PaymentMethod = "mobile_money" | "bank_transfer" | "card" | "cash";

interface Transaction {
  id: string;
  propertyName: string;
  propertyId: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  date: string;
  transactionId: string;
  type: "reservation" | "installment" | "full_payment";
  installmentNumber?: number;
  totalInstallments?: number;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    propertyName: "Villa Tchikobo Prestige",
    propertyId: "tchikobo-villa-5",
    amount: 88556000,
    status: "completed",
    paymentMethod: "bank_transfer",
    date: "2026-04-12",
    transactionId: "TRX-20260412-001",
    type: "reservation",
  },
  {
    id: "2",
    propertyName: "Villa Tchikobo Prestige",
    propertyId: "tchikobo-villa-5",
    amount: 44278000,
    status: "completed",
    paymentMethod: "mobile_money",
    date: "2026-04-01",
    transactionId: "TRX-20260401-045",
    type: "installment",
    installmentNumber: 1,
    totalInstallments: 4,
  },
  {
    id: "3",
    propertyName: "Appartement Résidences Caraïbes",
    propertyId: "caraibes-apt-12",
    amount: 35424000,
    status: "processing",
    paymentMethod: "bank_transfer",
    date: "2026-04-14",
    transactionId: "TRX-20260414-089",
    type: "reservation",
  },
  {
    id: "4",
    propertyName: "Penthouse Cité de 17",
    propertyId: "cite17-penthouse-3",
    amount: 20992000,
    status: "pending",
    paymentMethod: "card",
    date: "2026-04-13",
    transactionId: "TRX-20260413-122",
    type: "installment",
    installmentNumber: 2,
    totalInstallments: 10,
  },
  {
    id: "5",
    propertyName: "Terrain Lotissement ROC Tchikobo",
    propertyId: "roc-terrain-45",
    amount: 12000000,
    status: "failed",
    paymentMethod: "mobile_money",
    date: "2026-04-10",
    transactionId: "TRX-20260410-078",
    type: "reservation",
  },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Complété",
          color: "bg-green-500/20 text-green-600 border-green-500/30",
          iconColor: "text-green-600",
        };
      case "pending":
        return {
          icon: Clock,
          label: "En Attente",
          color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
          iconColor: "text-yellow-600",
        };
      case "processing":
        return {
          icon: AlertCircle,
          label: "En Cours",
          color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
          iconColor: "text-blue-600",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Échoué",
          color: "bg-red-500/20 text-red-600 border-red-500/30",
          iconColor: "text-red-600",
        };
    }
  };

  const getPaymentMethodConfig = (method: PaymentMethod) => {
    switch (method) {
      case "mobile_money":
        return { icon: Smartphone, label: "Mobile Money" };
      case "bank_transfer":
        return { icon: Building2, label: "Virement Bancaire" };
      case "card":
        return { icon: CreditCard, label: "Carte Bancaire" };
      case "cash":
        return { icon: TrendingUp, label: "Espèces" };
    }
  };

  const getTransactionTypeLabel = (transaction: Transaction) => {
    if (transaction.type === "reservation") return "Réservation";
    if (transaction.type === "full_payment") return "Paiement Intégral";
    if (transaction.type === "installment") {
      return `Échéance ${transaction.installmentNumber}/${transaction.totalInstallments}`;
    }
    return "Paiement";
  };

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = transaction.propertyName
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredTransactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      label: "Total Payé",
      value: `${totalAmount.toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Transactions",
      value: filteredTransactions.length.toString(),
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "En Attente",
      value: filteredTransactions.filter(t => t.status === "pending").length.toString(),
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Complétées",
      value: filteredTransactions.filter(t => t.status === "completed").length.toString(),
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Transactions", path: "/transactions" }
          ]} />
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
            Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Transactions</span>
          </h1>
          <p className="text-gray-600">Historique de vos paiements et réservations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <p className="text-2xl text-[#0a0f1e] mb-1 font-semibold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par propriété ou ID de transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] placeholder-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "all")}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complété</option>
                <option value="pending">En Attente</option>
                <option value="processing">En Cours</option>
                <option value="failed">Échoué</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl text-[#0a0f1e] font-semibold">
              Historique des Transactions ({filteredTransactions.length})
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 text-[#d4af37] border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Exporter</span>
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Aucune transaction trouvée</p>
              </div>
            ) : (
              filteredTransactions.map((transaction, idx) => {
                const statusConfig = getStatusConfig(transaction.status);
                const paymentConfig = getPaymentMethodConfig(transaction.paymentMethod);
                const StatusIcon = statusConfig.icon;
                const PaymentIcon = paymentConfig.icon;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/transaction/${transaction.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color.replace('text-', 'bg-').replace('/20', '/10')}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[#0a0f1e] font-medium truncate">
                                {transaction.propertyName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {getTransactionTypeLabel(transaction)}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-[#d4af37] font-semibold whitespace-nowrap">
                                {transaction.amount.toLocaleString()} FCFA
                              </p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full border mt-1 ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <PaymentIcon className="w-4 h-4" />
                              <span>{paymentConfig.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(transaction.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="text-gray-400">
                              {transaction.transactionId}
                            </div>
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
    </div>
  );
}
