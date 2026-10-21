import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate } from "react-router";
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
  RefreshCcw,
  MessageCircle,
  Copy,
  Check,
  Eye,
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
import { decryptDevisRequests } from "../../../utils/devisEncryption";
import type { DevisRequest } from "../../../types/database.types";

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

// Déchiffrement sécurisé avec détection du préfixe CryptoJS Salted_
const safeDecrypt = (text: string | null | undefined): string => {
  if (!text) return "";
  if (typeof text === "string" && text.startsWith("U2FsdGVkX1")) {
    try {
      return decryptAES(text);
    } catch {
      return text;
    }
  }
  return text;
};

export default function DemandesManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Onglet actif : "devis" (par défaut) ou "contacts"
  const activeTab = searchParams.get("tab") === "contacts" ? "contacts" : "devis";
  const setActiveTab = (tab: "devis" | "contacts") => {
    setSearchParams({ tab });
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("tous");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. REQUÊTE : Demandes de Devis (devis_requests)
  // ───────────────────────────────────────────────────────────────────────────
  const {
    data: devisList = [],
    isLoading: isLoadingDevis,
    refetch: refetchDevis,
  } = useQuery<DevisRequest[]>({
    queryKey: ["admin_devis_requests"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("devis_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ? decryptDevisRequests(data) : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const updateDevisStatusMutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: DevisRequest["status"];
    }) => {
      if (!supabase) throw new Error("Supabase non disponible");
      const { error } = await supabase
        .from("devis_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return { id, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_devis_requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      toast.success("Statut du devis actualisé.");
    },
    onError: () => toast.error("Échec de la mise à jour du devis."),
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. REQUÊTE : Messages de Contact (contact_requests)
  // ───────────────────────────────────────────────────────────────────────────
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    refetch: refetchContacts,
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
        name: safeDecrypt(item.name),
        email: safeDecrypt(item.email),
        phone: safeDecrypt(item.phone),
        subject: safeDecrypt(item.subject),
        message: safeDecrypt(item.message),
        budget: item.budget ? safeDecrypt(item.budget) : null,
        property_type: item.property_type ? safeDecrypt(item.property_type) : null,
        status: item.status || "nouveau",
        created_at: item.created_at,
      }));
    },
    staleTime: 1000 * 60 * 2,
  });

  const updateContactStatusMutation = useMutation({
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
      toast.success("Statut du message actualisé.");
    },
    onError: () => toast.error("Échec de la mise à jour du statut."),
  });

  const deleteContactMutation = useMutation({
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
          old ? old.filter((d) => d.id !== id) : [],
      );
      if (expandedId === id) setExpandedId(null);
      toast.success("Message supprimé avec succès.");
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  // Utilitaires de nettoyage et copie
  const getCleanPhoneForWhatsApp = (rawPhone: string): string => {
    const cleaned = rawPhone.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned.substring(1);
    if (cleaned.startsWith("00")) return cleaned.substring(2);
    return cleaned;
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success("Copié dans le presse-papier");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtrage Devis
  const filteredDevis = useMemo(() => {
    return devisList.filter((d) => {
      const q = searchTerm.toLowerCase();
      const clientName = `${d.client_first_name || ""} ${d.client_last_name || ""}`.toLowerCase();
      const matchesSearch =
        clientName.includes(q) ||
        (d.client_email || "").toLowerCase().includes(q) ||
        (d.client_phone || "").toLowerCase().includes(q) ||
        (d.property_name || "").toLowerCase().includes(q);
      const matchesStatus = filterStatus === "tous" || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [devisList, searchTerm, filterStatus]);

  // Filtrage Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "tous" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approuve":
      case "traite":
        return {
          label: status === "approuve" ? "Approuvé" : "Traité",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "en_cours":
        return {
          label: "En cours",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "documents":
        return {
          label: "Vérif. Docs",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "rejete":
        return {
          label: "Rejeté",
          className: "bg-rose-50 text-rose-700 border-rose-200",
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

  const isLoading = activeTab === "devis" ? isLoadingDevis : isLoadingContacts;
  const handleRefetch = () => {
    if (activeTab === "devis") refetchDevis();
    else refetchContacts();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-[#0a0f1e]">
      {/* ── En-tête de section ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0f1e] tracking-tight">
            Pipeline Prospects & Demandes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion centralisée des demandes de devis et formulaires de contact MSF Congo
          </p>
        </div>
        <Button
          onClick={handleRefetch}
          variant="outline"
          size="sm"
          className="gap-2 bg-white text-[#0a0f1e] border-gray-200 hover:bg-gray-50 self-start md:self-auto cursor-pointer"
          disabled={isLoading}
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* ── Sélecteur d'onglets (Devis vs Contacts) ── */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => {
            setActiveTab("devis");
            setFilterStatus("tous");
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "devis"
              ? "border-[#d4af37] text-[#0a0f1e]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Building2 className="w-4 h-4 text-[#d4af37]" />
          Demandes de Devis Immobilier
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-[#b8952e] font-bold border border-amber-200">
            {devisList.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("contacts");
            setFilterStatus("tous");
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "contacts"
              ? "border-[#d4af37] text-[#0a0f1e]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Mail className="w-4 h-4 text-[#d4af37]" />
          Messages de Contact
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-gray-600 font-bold border border-gray-200">
            {contacts.length}
          </span>
        </button>
      </div>

      {/* ── Barre de recherche et filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={
              activeTab === "devis"
                ? "Rechercher par client, email, téléphone ou propriété..."
                : "Rechercher par nom, email, téléphone ou objet..."
            }
            className="pl-10 border-gray-200 bg-white text-[#0a0f1e] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-gray-200 text-[#0a0f1e] text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] outline-none cursor-pointer"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">
            Tous les statuts ({activeTab === "devis" ? devisList.length : contacts.length})
          </option>
          <option value="nouveau">Nouveaux</option>
          <option value="en_cours">En cours</option>
          {activeTab === "devis" && <option value="documents">Vérification Documents</option>}
          <option value={activeTab === "devis" ? "approuve" : "traite"}>
            {activeTab === "devis" ? "Approuvés" : "Traités"}
          </option>
          {activeTab === "devis" && <option value="rejete">Rejetés</option>}
          {activeTab === "contacts" && <option value="archive">Archivés</option>}
        </select>
      </div>

      {/* ── CONTENU DE L'ONGLET : DEMANDES DE DEVIS ── */}
      {activeTab === "devis" && (
        <div className="space-y-4">
          {isLoadingDevis ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-3">
              <RefreshCcw className="w-8 h-8 animate-spin text-[#d4af37]" />
              <p className="text-sm font-medium">Chargement des demandes de devis...</p>
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              Aucune demande de devis ne correspond aux critères sélectionnés.
            </div>
          ) : (
            filteredDevis.map((devis) => {
              const badgeInfo = getStatusBadge(devis.status || "nouveau");
              const clientFullName = `${devis.client_first_name || ""} ${devis.client_last_name || ""}`.trim() || "Client non renseigné";
              const cleanPhone = devis.client_phone ? getCleanPhoneForWhatsApp(devis.client_phone) : "";

              return (
                <Card
                  key={devis.id}
                  className="overflow-hidden transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:border-[#d4af37]/60 hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* En-tête Client & Propriété */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/40 border border-[#d4af37]/30 flex items-center justify-center text-[#997a15] font-bold text-base">
                          {clientFullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-[#0a0f1e] break-words">
                              {clientFullName}
                            </h3>
                            <Badge className={`${badgeInfo.className} border text-[11px] px-2 py-0.5`}>
                              {badgeInfo.label}
                            </Badge>
                            {devis.priority === "haute" && (
                              <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                                Priorité Haute
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                              {devis.property_name || "Bien immobilier"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {format(new Date(devis.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                            </span>
                            {devis.property_price && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-[#997a15]">
                                  {new Intl.NumberFormat("fr-FR").format(devis.property_price)} FCFA
                                </span>
                              </>
                            )}
                          </div>

                          {/* Coordonnées & mini-message */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{devis.client_email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{devis.client_phone || "Non renseigné"}</span>
                            </div>
                          </div>

                          {devis.message && (
                            <p className="mt-2 text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                              « {devis.message} »
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center pt-2 lg:pt-0">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Ouvrir WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <select
                          value={devis.status || "nouveau"}
                          onChange={(e) =>
                            updateDevisStatusMutation.mutate({
                              id: devis.id,
                              newStatus: e.target.value as DevisRequest["status"],
                            })
                          }
                          className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 font-medium focus:outline-none focus:border-[#d4af37] cursor-pointer"
                        >
                          <option value="nouveau">Nouveau</option>
                          <option value="en_cours">En cours</option>
                          <option value="documents">Vérif. Docs</option>
                          <option value="approuve">Approuvé</option>
                          <option value="rejete">Rejeté</option>
                        </select>

                        <Button
                          onClick={() => navigate(`/admin/demandes/${devis.id}`)}
                          size="sm"
                          className="gap-1.5 bg-[#0a0f1e] text-white hover:bg-[#1a233a] cursor-pointer font-medium text-xs px-3"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                          Détails & Devis
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── CONTENU DE L'ONGLET : MESSAGES DE CONTACT ── */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          {isLoadingContacts ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-3">
              <RefreshCcw className="w-8 h-8 animate-spin text-[#d4af37]" />
              <p className="text-sm font-medium">Chargement des messages de contact...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              Aucun message de contact ne correspond aux critères sélectionnés.
            </div>
          ) : (
            filteredContacts.map((demande) => {
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
                      onClick={() => setExpandedId(expandedId === demande.id ? null : demande.id)}
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

                    {/* Détails déroulants */}
                    <AnimatePresence>
                      {expandedId === demande.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-100 bg-slate-50/70 p-6 space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Email */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                              <div className="truncate mr-2">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                  Email
                                </span>
                                <span className="text-sm text-gray-800 font-medium truncate block">
                                  {demande.email}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(demande.email, `email-${demande.id}`);
                                }}
                              >
                                {copiedField === `email-${demande.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </Button>
                            </div>

                            {/* Téléphone */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                              <div className="truncate mr-2">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                  Téléphone
                                </span>
                                <span className="text-sm text-gray-800 font-medium truncate block">
                                  {demande.phone || "Non renseigné"}
                                </span>
                              </div>
                              {demande.phone && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(demande.phone, `phone-${demande.id}`);
                                  }}
                                >
                                  {copiedField === `phone-${demande.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Type de propriété souhaité */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Type de bien
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-gray-800">
                                <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                                {demande.property_type || "Non spécifié"}
                              </div>
                            </div>

                            {/* Budget envisagé */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                                Budget indicatif
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-gray-800">
                                <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
                                {demande.budget || "Non spécifié"}
                              </div>
                            </div>
                          </div>

                          {/* Message complet */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                              Message transmis
                            </span>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {demande.message}
                            </p>
                          </div>

                          {/* Barre d'action basse */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                              )}
                              <a
                                href={`mailto:${demande.email}?subject=Suite à votre demande - MSF Congo`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-gray-500" />
                                Répondre par Email
                              </a>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={demande.status}
                                onChange={(e) =>
                                  updateContactStatusMutation.mutate({
                                    id: demande.id,
                                    newStatus: e.target.value as ContactRequest["status"],
                                  })
                                }
                                className="text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-gray-700 font-medium focus:outline-none focus:border-[#d4af37] cursor-pointer"
                              >
                                <option value="nouveau">Nouveau</option>
                                <option value="en_cours">En cours</option>
                                <option value="traite">Traité</option>
                                <option value="archive">Archiver</option>
                              </select>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (window.confirm("Supprimer ce message de contact ?")) {
                                    deleteContactMutation.mutate(demande.id);
                                  }
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
      )}
    </div>
  );
}
