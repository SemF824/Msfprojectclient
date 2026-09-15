import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Mail,
  Phone,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Building2,
  Send,
  RefreshCcw,
  MessageCircle,
  Copy,
  Check,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { decryptAES } from "../../../utils/encryption";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  budget?: string | null;
  property_type?: string | null;
  status: "nouveau" | "en_cours" | "traite" | "archive";
  created_at: string;
}

export default function DemandesManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("tous");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string) || "contact@msfcongo.com";

  const {
    data: demandes = [],
    isLoading,
    refetch,
  } = useQuery<ContactRequest[]>({
    queryKey: ["contact_requests"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        name: decryptAES(item.name || ""),
        email: decryptAES(item.email || ""),
        phone: decryptAES(item.phone || ""),
        subject: decryptAES(item.subject || ""),
        message: decryptAES(item.message || ""),
        budget: item.budget ? decryptAES(item.budget) : null,
        property_type: item.property_type ? decryptAES(item.property_type) : null,
        status: item.status || "nouveau",
        created_at: item.created_at,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: ContactRequest["status"];
    }) => {
      if (!supabase) throw new Error("Supabase non disponible");
      const { error } = await supabase
        .from("contact_requests")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      return { id, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_requests"] });
      toast.success("Statut de la demande actualisé.");
    },
    onError: () => toast.error("Échec de la transition de statut."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase non disponible");
      const { error } = await supabase
        .from("contact_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(
        ["contact_requests"],
        (old: ContactRequest[] | undefined) =>
          old ? old.filter((d) => d.id !== id) : []
      );
      if (expandedId === id) setExpandedId(null);
      toast.success("Prospect supprimé avec succès.");
    },
    onError: () => toast.error("Erreur lors de la suppression du prospect."),
  });

  const updateStatus = (id: string, newStatus: ContactRequest["status"]) =>
    updateStatusMutation.mutate({ id, newStatus });

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer définitivement ce prospect du pipeline ?")) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success("Copié dans le presse-papier");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getCleanPhoneForWhatsApp = (rawPhone: string): string => {
    const cleaned = rawPhone.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) {
      return cleaned.substring(1);
    }
    if (cleaned.startsWith("00")) {
      return cleaned.substring(2);
    }
    return cleaned;
  };

  const filteredDemandes = demandes.filter((d) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(query) ||
      d.email.toLowerCase().includes(query) ||
      d.phone.toLowerCase().includes(query) ||
      d.subject.toLowerCase().includes(query);
    const matchesStatus = filterStatus === "tous" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContactRequest["status"]) => {
    switch (status) {
      case "traite":
        return {
          label: "Traité",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "en_cours":
        return {
          label: "En cours",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "archive":
        return {
          label: "Archivé",
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
      case "nouveau":
      default:
        return {
          label: "Nouveau",
          className: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
        };
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-[#0a0f1e]">
      {/* En-tête de section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0f1e] tracking-tight">
            Pipeline Prospects & Demandes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralisation et traitement des formulaires de contact et demandes publiques
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2 bg-white text-[#0a0f1e] border-gray-200 hover:bg-gray-50 self-start md:self-auto"
          disabled={isLoading}
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email, téléphone ou objet..."
            className="pl-10 border-gray-200 bg-white text-[#0a0f1e] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-gray-200 text-[#0a0f1e] text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts ({demandes.length})</option>
          <option value="nouveau">Nouveaux</option>
          <option value="en_cours">En cours</option>
          <option value="traite">Traités</option>
          <option value="archive">Archivés</option>
        </select>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-3">
            <RefreshCcw className="w-8 h-8 animate-spin text-[#d4af37]" />
            <p className="text-sm font-medium">Chargement des fiches prospects...</p>
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Aucun prospect trouvé selon les critères sélectionnés.
          </div>
        ) : (
          filteredDemandes.map((demande) => {
            const badgeInfo = getStatusBadge(demande.status);
            const cleanPhone = getCleanPhoneForWhatsApp(demande.phone);

            return (
              <Card
                key={demande.id}
                className={`overflow-hidden transition-all duration-200 bg-white border ${
                  expandedId === demande.id
                    ? "border-l-4 border-l-[#d4af37] border-y-gray-200 border-r-gray-200 shadow-md"
                    : "border-gray-200 shadow-sm hover:border-[#d4af37]/50"
                }`}
              >
                <CardContent className="p-0">
                  {/* Barre résumée cliquable */}
                  <div
                    onClick={() => toggleExpand(demande.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors bg-white select-none"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#f4e3b2]/40 border border-[#d4af37]/30 flex items-center justify-center text-[#997a15] font-bold text-sm">
                        {demande.name ? demande.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0.5 flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#0a0f1e] truncate">
                          {demande.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate hidden md:block">
                          {demande.subject}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {format(new Date(demande.created_at), "dd/MM/yyyy HH:mm", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`${badgeInfo.className} border text-xs px-2.5 py-0.5`}>
                        {badgeInfo.label}
                      </Badge>
                      {expandedId === demande.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Vue détaillée de la fiche prospect */}
                  <AnimatePresence>
                    {expandedId === demande.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-slate-50/70"
                      >
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Colonne Coordonnées */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                              Coordonnées du prospect
                            </h4>
                            <div className="space-y-2.5">
                              {/* Email */}
                              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 text-xs text-[#0a0f1e]">
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                  <span className="truncate font-medium">{demande.email}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(demande.email, `email-${demande.id}`)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title="Copier l'email"
                                >
                                  {copiedField === `email-${demande.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Téléphone */}
                              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 text-xs text-[#0a0f1e]">
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                  <span className="font-mono font-medium">{demande.phone}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(demande.phone, `phone-${demande.id}`)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title="Copier le téléphone"
                                >
                                  {copiedField === `phone-${demande.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Budget si renseigné */}
                              {demande.budget && (
                                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200 text-xs text-[#0a0f1e]">
                                  <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                                  <span>Budget : <strong>{demande.budget}</strong></span>
                                </div>
                              )}

                              {/* Type de bien si renseigné */}
                              {demande.property_type && (
                                <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-gray-200 text-xs text-[#0a0f1e]">
                                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                                  <span>Type : <strong>{demande.property_type}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Colonne Message et Actions */}
                          <div className="lg:col-span-2 space-y-4">
                            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                              Message et détails de la demande
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 text-[#0a0f1e] leading-relaxed text-xs whitespace-pre-wrap shadow-sm min-h-[100px]">
                              {demande.message}
                            </div>

                            {/* Barre d'actions */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-2">
                              {/* Action WhatsApp */}
                              {cleanPhone && (
                                <Button
                                  size="sm"
                                  className="bg-[#25D366] text-white hover:bg-[#20ba59] font-medium gap-2 text-xs h-9 px-3"
                                  onClick={() => {
                                    const waMsg = encodeURIComponent(
                                      `Bonjour ${demande.name}, nous faisons suite à votre message transmis à MSF Congo concernant : "${demande.subject}".`
                                    );
                                    window.open(`https://wa.me/${cleanPhone}?text=${waMsg}`, "_blank");
                                  }}
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Contacter sur WhatsApp
                                </Button>
                              )}

                              {/* Action Email */}
                              <Button
                                size="sm"
                                className="bg-[#d4af37] text-[#0a0f1e] hover:bg-[#b8952e] font-medium gap-2 text-xs h-9 px-3"
                                onClick={() => {
                                  const subject = encodeURIComponent(
                                    `MSF Congo - Suite à votre demande : ${demande.subject}`
                                  );
                                  const body = encodeURIComponent(
                                    `Bonjour ${demande.name},\n\nNous avons bien pris connaissance de votre message concernant votre projet.\n\nCordialement,\nL'équipe MSF Congo`
                                  );
                                  window.open(
                                    `mailto:${demande.email}?bcc=${adminEmail}&subject=${subject}&body=${body}`
                                  );
                                }}
                              >
                                <Send className="w-4 h-4" />
                                Répondre par Email
                              </Button>

                              <div className="h-6 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

                              {/* Changement d'état */}
                              {demande.status !== "en_cours" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-700 border-blue-200 bg-white hover:bg-blue-50 text-xs h-9 px-3"
                                  onClick={() => updateStatus(demande.id, "en_cours")}
                                >
                                  En cours
                                </Button>
                              )}

                              {demande.status !== "traite" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50 text-xs h-9 px-3"
                                  onClick={() => updateStatus(demande.id, "traite")}
                                >
                                  Traité
                                </Button>
                              )}

                              {demande.status !== "archive" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-gray-700 border-gray-200 bg-white hover:bg-gray-100 text-xs h-9 px-3 gap-1.5"
                                  onClick={() => updateStatus(demande.id, "archive")}
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  Archiver
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto h-9 px-2.5"
                                onClick={() => handleDelete(demande.id)}
                                title="Supprimer la demande"
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
            );
          })
        )}
      </div>
    </div>
  );
}