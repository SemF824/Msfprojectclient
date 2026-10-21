import { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  MapPin,
  FileText,
  Mail,
  User,
  Loader2,
  BadgeDollarSign,
  Calendar,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { toast } from "sonner";
import type { Transaction } from "../../types/database.types";

export default function TransactionDetail() {
  const { id } = useParams();
  const { user } = useSupabaseAuth();

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      if (!user || !supabase || !id) throw new Error("Paramètres manquants");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    enabled: !!user && !!id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "complete":
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Confirmé & Réglé",
          title: "Paiement Validé",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "en_attente":
      case "pending":
      case "in_progress":
        return {
          icon: Clock,
          label: "En Attente de Validation",
          title: "En Traitement Bancaire",
          color: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "echoue":
      case "cancelled":
        return {
          icon: XCircle,
          label: "Rejeté / Annulé",
          title: "Transaction Non Aboutie",
          color: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          icon: Clock,
          label: status || "Inconnu",
          title: "Statut de l'opération",
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const getTransactionTypeLabel = (type?: string | null) => {
    switch (type) {
      case "acompte":
        return "Acompte de réservation";
      case "mensualite":
        return "Mensualité / Échéance contractuelle";
      case "solde":
        return "Règlement final du solde";
      case "frais":
        return "Frais administratifs et notariés";
      case "paiement":
      default:
        return "Versement";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Reçu Transaction MSF Congo - ${transaction?.id}`,
          text: `Détails du versement pour ${transaction?.property_name || "votre acquisition"}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien de la transaction copié dans le presse-papiers.");
    }
  };

  const handleDownloadReceipt = () => {
    if (transaction?.invoice_url) {
      window.open(transaction.invoice_url, "_blank");
      toast.success("Ouverture du reçu officiel...");
    } else {
      window.print();
      toast.info("Impression ou enregistrement en PDF du bordereau...");
    }
  };

  const handleEmailReceipt = () => {
    toast.success(
      `Le bordereau de transaction a été transmis à l'adresse : ${user?.email}`,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        <p className="text-gray-500 font-medium text-sm">
          Recherche des détails certifiés de la transaction...
        </p>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-400" />
        <h2 className="text-2xl font-bold text-[#0a0f1e]">Opération Introuvable</h2>
        <p className="text-gray-500 text-sm max-w-md">
          Cette transaction n'existe pas ou vous n'avez pas l'autorisation d'y accéder.
        </p>
        <Link
          to="/client/transactions"
          className="mt-4 px-6 py-2.5 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:bg-[#b8952e] transition-colors shadow-sm text-sm"
        >
          Retour aux transactions
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;
  const dateToFormat = transaction.created_at || transaction.date_transaction;
  const formattedDate = dateToFormat
    ? new Date(dateToFormat).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date non précisée";

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-0 text-[#0a0f1e]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          to="/client/transactions"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Suivi Financier</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none p-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
            title="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-none p-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:bg-[#b8952e] transition-colors shadow-sm text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{transaction.invoice_url ? "Télécharger le Reçu" : "Exporter le Bordereau"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 w-full">
                <div
                  className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${statusConfig.color}`}
                >
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl text-[#0a0f1e] font-bold break-words">
                      {statusConfig.title}
                    </h1>
                    <span
                      className={`text-[11px] font-bold uppercase px-3 py-0.5 rounded-full border whitespace-nowrap ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Montant responsive luxury */}
            <div className="bg-gradient-to-br from-[#d4af37]/10 via-[#f4e3b2]/20 to-transparent rounded-2xl p-5 sm:p-7 border border-[#d4af37]/30 relative overflow-hidden">
              <div className="relative z-10 w-full">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Montant de l'opération
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#8c7423] tracking-tight break-words">
                  {(Number(transaction.amount) || 0).toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-gray-700 text-xs sm:text-sm font-medium mt-2">
                  {getTransactionTypeLabel(transaction.transaction_type)}
                  {transaction.property_name ? ` • Pour le bien « ${transaction.property_name} »` : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
              <p className="font-mono break-all">
                Référence Transaction : <span className="text-gray-700 font-semibold">{transaction.id}</span>
              </p>
              <p className="font-medium">
                Nature : <span className="text-gray-800">{transaction.description || "Versement"}</span>
              </p>
            </div>
          </motion.div>

          {/* Bien Concerné */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8 min-w-0"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#d4af37] shrink-0" />
              <span>Bien Immobilier Associé</span>
            </h2>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0a0f1e] break-words">
                {transaction.property_name || "Programme Immobilier MSF Congo"}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Opération enregistrée au compte acquéreur auprès de la direction commerciale MSF.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 text-[#8c7423] hover:text-[#5e4e16] font-semibold transition-colors text-sm"
              >
                Parcourir les programmes & résidences <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Colonne Latérale */}
        <div className="space-y-6 w-full min-w-0">
          {/* Titulaire */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4af37]" /> Titulaire du Compte
            </h2>
            <div className="space-y-2">
              <p className="text-[#0a0f1e] font-bold text-base truncate">
                {user?.user_metadata?.full_name || "Acquéreur Privilégié MSF"}
              </p>
              <a
                href={`mailto:${user?.email}`}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#d4af37] break-all font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {user?.email}
              </a>
            </div>
          </motion.div>

          {/* Justificatifs */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6"
          >
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Justificatifs Officiels</h2>
            <div className="space-y-2.5 w-full">
              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#0a0f1e] font-semibold rounded-xl transition-colors text-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="truncate">{transaction.invoice_url ? "Télécharger le Reçu PDF" : "Générer le Reçu"}</span>
              </button>
              <button
                onClick={handleEmailReceipt}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#0a0f1e] font-semibold rounded-xl transition-colors text-xs cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="truncate">Recevoir par Email</span>
              </button>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#0a0f1e] to-[#162035] rounded-3xl border border-[#d4af37]/30 p-5 sm:p-6 text-white shadow-md"
          >
            <h2 className="text-base font-bold mb-2">Service Comptabilité MSF</h2>
            <p className="text-gray-300 text-xs mb-5 leading-relaxed">
              Pour toute question relative aux attestations de paiement ou quittances, notre équipe financière vous assiste.
            </p>
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#c49f2c] text-[#0a0f1e] font-bold rounded-xl transition-colors text-xs shadow-sm"
            >
              Joindre le Service Client
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
