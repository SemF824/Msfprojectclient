import { useState } from "react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Building2, 
  FileText, Calendar, DollarSign, CheckCircle2, XCircle,
  Clock, AlertCircle, Download, Upload, Eye, Trash2,
  MessageSquare, Send, Edit, Save, Briefcase, Home
} from "lucide-react";

export default function DemandeDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState("nouveau");
  const [assignedAgent, setAssignedAgent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Mock data - Complete request details
  const request = {
    id: id || "REQ-001",
    date: "2024-04-17 09:30",
    client: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@email.com",
      phone: "+242 06 458 86 18",
      alternatePhone: "+242 05 587 73 24",
      address: "Avenue de l'Indépendance, Quartier Tié-Tié",
      city: "Pointe-Noire",
      country: "Congo-Brazzaville",
      profession: "Entrepreneur",
      company: "Dupont Trading Sarl",
      monthlyIncome: "2M-5M"
    },
    property: {
      id: "tchikobo-villa-5",
      name: "Villa Tchikobo Prestige",
      price: 295200000,
      type: "Villa de Luxe",
      bedrooms: 5,
      bathrooms: 4,
      surface: 450,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
    },
    requestType: "achat",
    financingNeeded: "oui",
    downPayment: "50000000",
    visitDate: "2024-04-20",
    visitTime: "10h00",
    numberOfPersons: "2",
    message: "Très intéressé par cette propriété. Disponible pour visite cette semaine. Souhaite également connaître les modalités de financement bancaire.",
    status: "nouveau",
    priority: "haute",
    assignedTo: null,
    documents: [
      { name: "CNI.pdf", type: "Carte d'identité", size: "2.4 MB", uploadedAt: "2024-04-17 10:00", status: "pending" },
      { name: "Justificatif_Revenus.pdf", type: "Justificatif de revenus", size: "1.8 MB", uploadedAt: "2024-04-17 10:05", status: "pending" }
    ],
    timeline: [
      { date: "2024-04-17 09:30", event: "Demande créée", user: "Système" },
      { date: "2024-04-17 10:00", event: "Documents téléchargés", user: "Jean Dupont" },
      { date: "2024-04-17 11:15", event: "Demande consultée", user: "Agent Roger" }
    ],
    notes: [
      { date: "2024-04-17 11:20", author: "Agent Roger", content: "Client très motivé. À rappeler cet après-midi pour confirmer visite." }
    ]
  };

  const agents = [
    { id: "1", name: "Agent Roger" },
    { id: "2", name: "Agent Sophie" },
    { id: "3", name: "Agent Marie" },
    { id: "4", name: "Agent Paul" }
  ];

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // In production: Update backend
    console.log("Status updated to:", newStatus);
  };

  const handleAssignAgent = () => {
    if (!assignedAgent) return;
    // In production: Update backend
    console.log("Assigned to:", assignedAgent);
    alert(`Demande assignée à ${assignedAgent}`);
  };

  const handleDocumentAction = (docName: string, action: "approve" | "reject") => {
    console.log(`Document ${docName} ${action === "approve" ? "approuvé" : "rejeté"}`);
    alert(`Document ${action === "approve" ? "approuvé" : "rejeté"} avec succès`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    console.log("Adding note:", newNote);
    setNewNote("");
    alert("Note ajoutée avec succès");
  };

  const handleSendQuote = () => {
    console.log("Sending quote to client");
    alert("Devis envoyé au client par email");
  };

  const getStatusLabel = (s: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nouveau: { text: "Nouveau", color: "bg-blue-100 text-blue-700" },
      en_cours: { text: "En Cours", color: "bg-yellow-100 text-yellow-700" },
      documents: { text: "Vérification Documents", color: "bg-purple-100 text-purple-700" },
      approuve: { text: "Approuvé", color: "bg-green-100 text-green-700" },
      rejete: { text: "Rejeté", color: "bg-red-100 text-red-700" }
    };
    return labels[s] || labels.nouveau;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            to="/demandes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour aux demandes</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl text-[#0a0f1e] mb-2 font-bold">
                Demande {request.id}
              </h1>
              <p className="text-gray-600">
                Reçue le {new Date(request.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendQuote}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <Send className="w-5 h-5" />
                Envoyer Devis
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#d4af37]" />
                Informations Client
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Nom Complet</label>
                  <p className="text-[#0a0f1e] font-medium text-lg">
                    {request.client.firstName} {request.client.lastName}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <a href={`mailto:${request.client.email}`} className="text-[#d4af37] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {request.client.email}
                  </a>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Téléphone Principal</label>
                  <a href={`tel:${request.client.phone}`} className="text-[#d4af37] hover:underline flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {request.client.phone}
                  </a>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Téléphone Alternatif</label>
                  <a href={`tel:${request.client.alternatePhone}`} className="text-[#d4af37] hover:underline flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {request.client.alternatePhone}
                  </a>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">Adresse</label>
                  <p className="text-[#0a0f1e] flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{request.client.address}, {request.client.city}, {request.client.country}</span>
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Profession</label>
                  <p className="text-[#0a0f1e] flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {request.client.profession}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Entreprise</label>
                  <p className="text-[#0a0f1e] flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {request.client.company}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Revenus Mensuels</label>
                  <p className="text-[#0a0f1e] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {request.client.monthlyIncome === "2M-5M" ? "2 000 000 - 5 000 000 FCFA" : request.client.monthlyIncome}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Property Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#d4af37]" />
                Propriété Demandée
              </h2>

              <div className="flex gap-6">
                <img
                  src={request.property.image}
                  alt={request.property.name}
                  className="w-48 h-32 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="text-lg text-[#0a0f1e] font-semibold mb-2">
                    {request.property.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{request.property.type}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Chambres</p>
                      <p className="text-[#0a0f1e] font-semibold">{request.property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Salles de bain</p>
                      <p className="text-[#0a0f1e] font-semibold">{request.property.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Surface</p>
                      <p className="text-[#0a0f1e] font-semibold">{request.property.surface} m²</p>
                    </div>
                  </div>
                  <p className="text-2xl text-[#d4af37] font-bold">
                    {(request.property.price / 1000000).toFixed(1)} M FCFA
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Request Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d4af37]" />
                Détails de la Demande
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Type de Projet</label>
                  <p className="text-[#0a0f1e] font-medium capitalize">{request.requestType}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Financement Nécessaire</label>
                  <p className="text-[#0a0f1e] font-medium capitalize">{request.financingNeeded}</p>
                </div>

                {request.financingNeeded === "oui" && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Apport Personnel</label>
                    <p className="text-[#0a0f1e] font-medium">
                      {parseInt(request.downPayment).toLocaleString()} FCFA
                    </p>
                  </div>
                )}

                {request.visitDate && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Date de Visite Souhaitée</label>
                      <p className="text-[#0a0f1e] font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {request.visitDate} à {request.visitTime}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Nombre de Personnes</label>
                      <p className="text-[#0a0f1e] font-medium">{request.numberOfPersons} personne(s)</p>
                    </div>
                  </>
                )}

                {request.message && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1 block">Message du Client</label>
                    <p className="text-[#0a0f1e] p-4 bg-gray-50 rounded-xl border border-gray-200">
                      {request.message}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-[#0a0f1e] font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d4af37]" />
                  Documents ({request.documents.length})
                </h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0a0f1e] rounded-xl transition-colors">
                  <Upload className="w-4 h-4" />
                  Demander Documents
                </button>
              </div>

              <div className="space-y-3">
                {request.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#0a0f1e] font-medium">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDocumentAction(doc.name, "approve")}
                        className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                        title="Approuver"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDocumentAction(doc.name, "reject")}
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                        title="Rejeter"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {request.documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun document téléchargé</p>
                </div>
              )}
            </motion.div>

            {/* Notes & Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h2 className="text-xl text-[#0a0f1e] font-semibold mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#d4af37]" />
                Notes Internes
              </h2>

              <div className="space-y-4 mb-6">
                {request.notes.map((note, idx) => (
                  <div key={idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{note.author}</span>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                    <p className="text-[#0a0f1e]">{note.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ajouter une note interne..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                />
                <button
                  onClick={handleAddNote}
                  className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Gestion</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En Cours</option>
                    <option value="documents">Vérification Documents</option>
                    <option value="approuve">Approuvé</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Assigner à</label>
                  <select
                    value={assignedAgent}
                    onChange={(e) => setAssignedAgent(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="">Sélectionner un agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.name}>{agent.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignAgent}
                    disabled={!assignedAgent}
                    className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1e] rounded-xl transition-colors"
                  >
                    Assigner
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Priorité</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                      Haute
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Historique</h3>
              
              <div className="space-y-4">
                {request.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      {idx < request.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-[#0a0f1e] font-medium">{item.event}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      <p className="text-xs text-gray-600 mt-1">Par {item.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30 p-6"
            >
              <h3 className="text-lg text-[#0a0f1e] font-semibold mb-4">Actions Rapides</h3>
              
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-[#0a0f1e] border border-gray-200">
                  <Phone className="w-4 h-4 text-[#d4af37]" />
                  Appeler le client
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-[#0a0f1e] border border-gray-200">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  Envoyer un email
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-[#0a0f1e] border border-gray-200">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  Planifier visite
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors text-[#0a0f1e] border border-gray-200">
                  <Download className="w-4 h-4 text-[#d4af37]" />
                  Exporter PDF
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}