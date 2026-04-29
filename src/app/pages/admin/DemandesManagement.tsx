import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Filter, Mail, Phone, Calendar,
  ChevronRight, MoreVertical, CheckCircle2,
  Clock, AlertCircle, Trash2, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "../../../hooks/useSupabaseAuth";
import {
  Card, CardContent, CardHeader, CardTitle
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import { Link } from "react-router";

// Définition de l'interface basée sur ton schéma de table réel
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
  const [demandes, setDemandes] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");

  // 1. CHARGEMENT DES VRAIES DONNÉES
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
      console.error("Erreur lors de la récupération des demandes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  // 2. SUPPRESSION D'UNE DEMANDE
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) return;

    try {
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDemandes(demandes.filter(d => d.id !== id));
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch =
      demande.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "tous" || demande.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'traite':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Traité</Badge>;
      case 'en_cours':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">En cours</Badge>;
      case 'archive':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">Archivé</Badge>;
      default:
        return <Badge className="bg-amber-100 text-[#d4af37] hover:bg-amber-100 border-amber-200">Nouveau</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0a0f1e]">Gestion des Demandes</h1>
          <p className="text-gray-500">Gérez les prospects et demandes de contact de MSF Congo</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4" />
          Dernière mise à jour : {format(new Date(), 'HH:mm', { locale: fr })}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{demandes.length}</div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Demandes</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#d4af37]">
              {demandes.filter(d => !d.status || d.status === 'nouveau').length}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Non lues</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un nom, email ou sujet..."
            className="pl-10 border-gray-200 focus:border-[#d4af37]"
            value={searchTerm}
            onChange={(e) => setSearchSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#d4af37] focus:border-[#d4af37] block w-full p-2.5"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="nouveau">Nouveaux</option>
            <option value="en_cours">En cours</option>
            <option value="traite">Traités</option>
          </select>
          <Button variant="outline" onClick={fetchDemandes} className="gap-2">
             Rafraîchir
          </Button>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-400">Chargement des prospects...</div>
        ) : filteredDemandes.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
            Aucune demande ne correspond à vos critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Sujet / Projet</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredDemandes.map((demande) => (
                    <motion.tr
                      key={demande.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-b border-gray-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-[#0a0f1e]">{demande.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" /> {demande.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700">{demande.subject}</div>
                        {demande.property_type && (
                          <div className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {demande.property_type}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {format(new Date(demande.created_at), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(demande.status || 'nouveau')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/demandes/${demande.id}`}>
                              Détails
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(`mailto:${demande.email}`)}>
                                <Mail className="w-4 h-4 mr-2" /> Répondre par mail
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(demande.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}