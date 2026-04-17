import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { 
  ArrowLeft, Download, CheckCircle2, Calendar, 
  CreditCard, MapPin, Building2, User, Mail, Phone,
  FileText, Printer, Share2
} from "lucide-react";

export default function TransactionDetail() {
  const { id } = useParams();

  // Mock transaction data - in production this would come from backend
  const transaction = {
    id: id || "1",
    transactionId: "TRX-20260412-001",
    propertyName: "Villa Tchikobo Prestige",
    propertyLocation: "Lotissement ROC Tchikobo, Pointe-Noire",
    propertyId: "tchikobo-villa-5",
    amount: 88556000,
    status: "completed",
    paymentMethod: "bank_transfer",
    date: "2026-04-12",
    time: "14:32:15",
    type: "reservation",
    description: "Acompte de réservation pour Villa Tchikobo Prestige (30% du prix total)",
    
    buyer: {
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "+242 06 458 86 18",
    },

    property: {
      totalPrice: 295200000,
      surface: 450,
      bedrooms: 5,
      bathrooms: 4,
    },

    payment: {
      bankName: "BGFI Bank Congo",
      accountNumber: "**** **** **** 1234",
      reference: "BGFI-20260412-MSF-001",
      processingFee: 10000,
    },

    timeline: [
      {
        status: "Initié",
        date: "2026-04-12 14:30:00",
        description: "Transaction initiée par le client",
      },
      {
        status: "Validé",
        date: "2026-04-12 14:31:45",
        description: "Vérification des informations bancaires",
      },
      {
        status: "En Cours",
        date: "2026-04-12 14:32:00",
        description: "Traitement du paiement en cours",
      },
      {
        status: "Complété",
        date: "2026-04-12 14:32:15",
        description: "Paiement reçu et confirmé",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux Transactions</span>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
                Détails de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Transaction</span>
              </h1>
              <p className="text-gray-600">{transaction.transactionId}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:shadow-xl transition-all font-medium">
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl text-[#0a0f1e] font-semibold">Transaction Réussie</h2>
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 border border-green-500/30 rounded-full text-sm">
                      Complété
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {new Date(transaction.date + ' ' + transaction.time).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-xl border border-[#d4af37]/30">
                <p className="text-gray-700 text-sm mb-2">Montant Payé</p>
                <p className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] font-bold">
                  {transaction.amount.toLocaleString()} FCFA
                </p>
                <p className="text-gray-600 text-sm mt-2">{transaction.description}</p>
              </div>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-xl text-[#0a0f1e] font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#d4af37]" />
                Propriété
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[#0a0f1e] font-medium text-lg mb-1">{transaction.propertyName}</h4>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {transaction.propertyLocation}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl text-[#0a0f1e] font-semibold">{transaction.property.surface}m²</p>
                    <p className="text-sm text-gray-600">Surface</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl text-[#0a0f1e] font-semibold">{transaction.property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Chambres</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl text-[#0a0f1e] font-semibold">{transaction.property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Salles de bain</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-lg text-[#d4af37] font-semibold">{transaction.property.totalPrice.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Prix Total</p>
                  </div>
                </div>

                <Link
                  to={`/propriete/${transaction.propertyId}`}
                  className="inline-flex items-center gap-2 text-[#d4af37] hover:underline"
                >
                  <span>Voir les détails de la propriété</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-xl text-[#0a0f1e] font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#d4af37]" />
                Informations de Paiement
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Méthode de Paiement</span>
                  <span className="text-[#0a0f1e] font-medium">Virement Bancaire</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Banque</span>
                  <span className="text-[#0a0f1e] font-medium">{transaction.payment.bankName}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Compte</span>
                  <span className="text-[#0a0f1e] font-medium">{transaction.payment.accountNumber}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Référence</span>
                  <span className="text-[#0a0f1e] font-medium">{transaction.payment.reference}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Frais de Traitement</span>
                  <span className="text-[#0a0f1e] font-medium">{transaction.payment.processingFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/30">
                  <span className="text-gray-700 font-medium">Total</span>
                  <span className="text-[#d4af37] font-bold text-lg">
                    {(transaction.amount + transaction.payment.processingFee).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-xl text-[#0a0f1e] font-semibold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                Chronologie de la Transaction
              </h3>
              <div className="space-y-4">
                {transaction.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${idx === transaction.timeline.length - 1 ? 'bg-green-500' : 'bg-[#d4af37]'}`} />
                      {idx < transaction.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#0a0f1e] font-medium">{event.status}</p>
                        {idx === transaction.timeline.length - 1 && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buyer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#d4af37]" />
                Acheteur
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[#0a0f1e] font-medium">{transaction.buyer.name}</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 mt-0.5 text-[#d4af37]" />
                  <span>{transaction.buyer.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 mt-0.5 text-[#d4af37]" />
                  <span>{transaction.buyer.phone}</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                  <FileText className="w-5 h-5 text-[#d4af37]" />
                  <span>Télécharger le Reçu</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                  <Printer className="w-5 h-5 text-[#d4af37]" />
                  <span>Imprimer</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5 text-[#d4af37]" />
                  <span>Envoyer par Email</span>
                </button>
              </div>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30 p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Notre équipe est disponible pour vous aider.
              </p>
              <Link
                to="/contact"
                className="block w-full text-center px-4 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-medium hover:shadow-xl transition-all"
              >
                Contacter le Support
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
