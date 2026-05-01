import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft, Download, Printer, Share2,
  CheckCircle2, Clock, XCircle, AlertCircle,
  Building2, MapPin, Calendar, FileText,
  Mail, Phone, User, Loader2
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import type { Transaction } from "../../types/database.types";

export default function TransactionDetail() {
  const { id } = useParams();
  const { user } = useSupabaseAuth();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTransactionDetails = async () => {
      if (!user || !supabase || !id) return;
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id) // SÉCURITÉ FRONT-END
          .single();

        if (error) throw error;
        if (data && isMounted) {
          setTransaction(data);
        }
      } catch (err: any) {
        console.error("Erreur de chargement:", err);
        if (isMounted) setError("Transaction introuvable ou accès refusé.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTransactionDetails();

    return () => { isMounted = false; };
  }, [id, user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": return { icon: CheckCircle2, label: "Complété", title: "Transaction Réussie", color: "bg-green-100 text-green-700 border-green-200" };
      case "pending": return { icon: Clock, label: "En Attente", title: "En attente de paiement", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
      case "in_progress": return { icon: AlertCircle, label: "En Cours", title: "Traitement en cours", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case "cancelled": return { icon: XCircle, label: "Échoué", title: "Transaction Annulée", color: "bg-red-100 text-red-700 border-red-200" };
      default: return { icon: Clock, label: "Inconnu", title: "Statut Inconnu", color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500">Chargement des détails de la transaction...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-[#0a0f1e]">Erreur</h2>
        <p className="text-gray-500">{error || "Transaction non trouvée."}</p>
        <Link to="/client/transactions" className="mt-4 px-6 py-2 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl">
          Retour aux transactions
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;
  const formattedDate = new Date(transaction.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-0">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link 
          to="/client/transactions" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux Transactions</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none p-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center" title="Imprimer">
            <Printer className="w-5 h-5" />
          </button>
          <button className="flex-1 sm:flex-none p-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center" title="Partager">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:bg-[#b8952e] transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 sm:p-6 md:p-8 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 w-full">
                <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${statusConfig.color.replace('text-', 'bg-').replace('border-', 'border-')}`}>
                  <StatusIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${statusConfig.color.split(' ')[1]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl text-[#0a0f1e] font-bold flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="truncate">{statusConfig.title}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* LE CARD DU MONTANT RESPONSIVE */}
            <div className="bg-gradient-to-br from-[#d4af37]/5 to-[#f4e3b2]/10 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#d4af37]/20 relative overflow-hidden">
              <div className="relative z-10 w-full">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Montant Transaction</p>
                {/* Break-words et dimensionnement responsive extrême */}
                <p className="text-2xl sm:text-4xl md:text-5xl font-black text-[#d4af37] mb-2 break-words break-all sm:break-normal leading-tight w-full">
                  {transaction.amount.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-gray-700 text-xs sm:text-sm md:text-base font-medium mt-2">
                  {transaction.transaction_type === 'reservation' ? 'Acompte de réservation' : 'Paiement'} pour {transaction.property_name}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
               <p className="text-xs text-gray-400 font-mono break-all">ID: {transaction.id}</p>
            </div>
          </motion.div>

          {/* Property Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 sm:p-6 md:p-8 min-w-0"
          >
            <h2 className="text-lg sm:text-xl font-bold text-[#0a0f1e] mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37] flex-shrink-0" />
              <span className="truncate">Propriété Concernée</span>
            </h2>
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#0a0f1e] mb-2 break-words">{transaction.property_name}</h3>
              <p className="flex items-start sm:items-center gap-2 text-gray-600 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="break-all">ID: {transaction.property_id}</span>
              </p>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <Link 
                to={`/vitrine/propriete/${transaction.property_id}`} 
                className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#b8952e] font-semibold transition-colors text-sm sm:text-base"
              >
                Voir les détails de la propriété <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Sidebar Information */}
        <div className="space-y-6 w-full min-w-0">
          
          {/* Buyer Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4af37]" /> Titulaire du Compte
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[#0a0f1e] font-bold text-lg truncate">
                  {user?.user_metadata?.full_name || "Client MSF"}
                </p>
              </div>
              <div className="space-y-2">
                <a href={`mailto:${user?.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#d4af37] break-all">
                  <Mail className="w-4 h-4 flex-shrink-0" /> {user?.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-6">Documents</h2>
            <div className="space-y-3 w-full">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#0a0f1e] font-medium rounded-xl transition-colors">
                <FileText className="w-5 h-5 text-[#d4af37] flex-shrink-0" /> <span className="truncate">Télécharger le Reçu</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#0a0f1e] font-medium rounded-xl transition-colors">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" /> <span className="truncate">Recevoir par Email</span>
              </button>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] rounded-3xl border border-[#d4af37]/20 p-5 sm:p-6 text-white"
          >
            <h2 className="text-lg font-bold mb-2">Besoin d'aide ?</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Une question sur cette transaction ? Notre équipe commerciale est à votre disposition.
            </p>
            <Link 
              to="/vitrine/contact"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#d4af37] hover:bg-[#b8952e] text-[#0a0f1e] font-bold rounded-xl transition-colors"
            >
              Contacter le Support
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}