import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Mail, Phone, Clock,
  MoreVertical, CheckCircle2,
  Trash2, ChevronDown, ChevronUp,
  MessageSquare, User, DollarSign, Building2,
  Send, Archive, RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  budget?: string;
  property_type?: string;
  status: 'nouveau' | 'en_cours' | 'traite' | 'archive';
  created_at: string;
}

export default function DemandesManagement() {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const [demandes, setDemandes] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDemandes(data || []);
    } catch (error) {
      console.error("Erreur chargement demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setDemandes(demandes.map(d => d.id === id ? { ...d, status: newStatus as any } : d));
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer définitivement ce prospect ?")) return;
    try {
      const { error } = await supabase.from('contact_requests').delete().eq('id', id);
      if (error) throw error;
      setDemandes(demandes.filter(d => d.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      alert("Erreur suppression.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "tous" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'traite': return "bg-green-100 text-green-700 border-green-200";
      case 'en_cours': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'archive': return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-amber-100 text-[#d4af37] border-amber-200";
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0a0f1e]">Pipeline Prospects</h1>
          <p className="text-gray-500">Flux de conversion MSF Congo en temps réel</p>
        </div>
        <Button onClick={fetchDemandes} variant="outline" size="sm" className="gap-2">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
      </div>

      {/* Filtres stratégiques */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-10 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 focus:ring-[#d4af37]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="nouveau">Nouveaux</option>
          <option value="en_cours">En cours</option>
          <option value="traite">Traités</option>
        </select>
      </div>

      {/* Liste des demandes avec expansion */}
      <div className="space-y-4">
        {loading && demandes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Analyse de la base de données...</div>
        ) : filteredDemandes.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
            Aucun prospect trouvé. Le marketing doit se réveiller.
          </div>
        ) : (
          filteredDemandes.map((demande) => (
            <Card key={demande.id} className={`overflow-hidden transition-all duration-300 border-l-4 ${expandedId === demande.id ? 'border-l-[#d4af37] shadow-md' : 'border-l-transparent'}`}>
              <CardContent className="p-0">
                {/* Header de la ligne (cliquable pour déplier) */}
                <div
                  onClick={() => toggleExpand(demande.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-[#d4af37] font-bold">
                      {demande.name.charAt(0)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1 flex-1">
                      <div className="font-semibold text-[#0a0f1e]">{demande.name}</div>
                      <div className="text-sm text-gray-500 hidden md:block">{demande.subject}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(demande.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(demande.status || 'nouveau')}>
                      {(demande.status || 'nouveau').toUpperCase()}
                    </Badge>
                    {expandedId === demande.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Zone dépliée */}
                <AnimatePresence>
                  {expandedId === demande.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-slate-50/50"
                    >
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Détails techniques */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Informations</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" /> {demande.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" /> {demande.phone}
                            </div>
                            {demande.budget && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" /> Budget: {demande.budget}
                              </div>
                            )}
                            {demande.property_type && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-gray-400" /> Type: {demande.property_type}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Le Message */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Message du Prospect</h4>
                          <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                            {demande.message}
                          </div>

                          {/* Actions de Pipeline */}
                          <div className="flex flex-wrap gap-3 pt-4">
                            <Button
                              size="sm"
                              className="bg-[#d4af37] hover:bg-[#b8952e] gap-2"
                              onClick={() => {
                                const subject = encodeURIComponent(`Réponse: ${demande.subject}`);
                                const body = encodeURIComponent(`Bonjour ${demande.name},\n\n`);
                                // On ajoute le bcc pour le suivi interne
                                window.open(`mailto:${demande.email}?bcc=${adminEmail}&subject=${subject}&body=${body}`);
                              }}
                            >
                              <Send className="w-4 h-4" /> Répondre par Email
                            </Button>

                            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block" />

                            <Button
                              size="sm" variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => updateStatus(demande.id, 'en_cours')}
                            >
                              Marquer "En cours"
                            </Button>

                            <Button
                              size="sm" variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateStatus(demande.id, 'traite')}
                            >
                              Marquer "Traité"
                            </Button>

                            <Button
                              size="sm" variant="ghost"
                              className="text-red-500 hover:bg-red-50 ml-auto"
                              onClick={() => handleDelete(demande.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}