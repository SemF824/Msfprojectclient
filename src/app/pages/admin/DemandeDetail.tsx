import { useState } from "react";
import { motion } from "motion/react";
import { Link, useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Eye,
  Trash2,
  MessageSquare,
  Send,
  Save,
  Briefcase,
  Home,
  RefreshCcw,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { decryptDevisRequest } from "../../../utils/devisEncryption";
import type { DevisRequest, Property } from "../../../types/database.types";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export default function DemandeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newNote, setNewNote] = useState("");
  const [internalNotes, setInternalNotes] = useState<string[]>([]);

  // 1. Chargement de la demande de devis réelle depuis Supabase
  const {
    data: devis,
    isLoading: isLoadingDevis,
    error: devisError,
    refetch,
  } = useQuery<DevisRequest | null>({
    queryKey: ["admin_devis_detail", id],
    queryFn: async () => {
      if (!supabase || !id) return null;
      const { data, error } = await supabase
        .from("devis_requests")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const decrypted = decryptDevisRequest(data);
      return decrypted;
    },
    enabled: Boolean(id),
  });

  // 2. Chargement de la propriété associée pour afficher les visuels et caractéristiques
  const { data: property } = useQuery<Property | null>({
    queryKey: ["property_detail_for_devis", devis?.property_id],
    queryFn: async () => {
      if (!supabase || !devis?.property_id) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", devis.property_id)
        .maybeSingle();

      if (error) return null;
      return data || null;
    },
    enabled: Boolean(devis?.property_id),
  });

  // 3. Mutation de mise à jour du statut
  const statusMutation = useMutation({
    mutationFn: async (newStatus: DevisRequest["status"]) => {
      if (!supabase || !id) throw new Error("Supabase non initialisé");
      const { error } = await supabase
        .from("devis_requests")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.setQueryData(
        ["admin_devis_detail", id],
        (old: DevisRequest | null | undefined) =>
          old ? { ...old, status: newStatus } : old,
      );
      queryClient.invalidateQueries({ queryKey: ["admin_devis_requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      toast.success("Statut de la demande actualisé.");
    },
    onError: (err: any) => {
      toast.error(`Erreur : ${err.message || "Impossible de mettre à jour le statut."}`);
    },
  });

  // 4. Enregistrement de note interne (stockage local sécurisé)
  const handleAddNote = () => {
    if (!newNote.trim() || !id) return;
    const formatted = `[${format(new Date(), "dd/MM/yyyy HH:mm")}] ${newNote.trim()}`;
    const updated = [...internalNotes, formatted];
    setInternalNotes(updated);
    try {
      localStorage.setItem(`msf_devis_notes_${id}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setNewNote("");
    toast.success("Note interne enregistrée.");
  };

  useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(`msf_devis_notes_${id}`);
      if (saved) {
        setInternalNotes(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [id]);

  const getCleanPhoneForWhatsApp = (rawPhone?: string): string => {
    if (!rawPhone) return "";
    const cleaned = rawPhone.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+")) return cleaned.substring(1);
    if (cleaned.startsWith("00")) return cleaned.substring(2);
    return cleaned;
  };

  const getStatusLabel = (s: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nouveau: { text: "Nouveau", color: "bg-blue-100 text-blue-700 border-blue-200" },
      en_cours: { text: "En Cours", color: "bg-amber-100 text-amber-700 border-amber-200" },
      documents: { text: "Vérif. Documents", color: "bg-purple-100 text-purple-700 border-purple-200" },
      approuve: { text: "Approuvé", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      rejete: { text: "Rejeté", color: "bg-rose-100 text-rose-700 border-rose-200" },
    };
    return labels[s] || { text: s, color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  if (isLoadingDevis) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <RefreshCcw className="w-10 h-10 animate-spin text-[#d4af37]" />
        <p className="text-sm font-medium text-gray-600">
          Chargement du dossier de devis...
        </p>
      </div>
    );
  }

  if (devisError || !devis) {
    return (
      <div className="min-h-[70vh] p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-[#0a0f1e] mb-2">
          Demande de devis introuvable
        </h1>
        <p className="text-gray-500 mb-6">
          La demande recherchée n'existe pas ou a été supprimée du pipeline.
        </p>
        <Button
          onClick={() => navigate("/admin/demandes")}
          className="bg-[#0a0f1e] text-white hover:bg-[#1a233a] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux demandes
        </Button>
      </div>
    );
  }

  const clientFullName = `${devis.client_first_name || ""} ${devis.client_last_name || ""}`.trim() || "Client non renseigné";
  const cleanPhone = getCleanPhoneForWhatsApp(devis.client_phone);
  const statusInfo = getStatusLabel(devis.status);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto text-[#0a0f1e]">
      {/* ── En-tête avec navigation arrière ── */}
      <div className="mb-8">
        <Link
          to="/admin/demandes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour au pipeline des demandes</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl text-[#0a0f1e] font-bold tracking-tight">
                Dossier de Devis #{devis.id.slice(0, 8)}
              </h1>
              <Badge className={`${statusInfo.color} border px-3 py-1 text-xs font-semibold`}>
                {statusInfo.text}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Reçu le{" "}
              {format(new Date(devis.created_at), "dd MMMM yyyy 'à' HH:mm", {
                locale: fr,
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            )}
            <a
              href={`mailto:${devis.client_email}?subject=Votre demande de devis pour ${devis.property_name || "votre projet"} - MSF Congo&body=Bonjour ${clientFullName},%0D%0A%0D%0ANous faisons suite à votre demande de devis...`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-md transition-all font-semibold text-sm cursor-pointer"
            >
              <Send className="w-4 h-4" /> Répondre / Envoyer Devis
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations Client */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-[#d4af37]" />
              Identité & Coordonnées Client
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Nom Complet</span>
                <p className="text-gray-900 font-semibold text-base">{clientFullName}</p>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Adresse Email</span>
                <a
                  href={`mailto:${devis.client_email}`}
                  className="text-[#997a15] hover:underline font-medium flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  {devis.client_email}
                </a>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Téléphone Principal</span>
                <a
                  href={`tel:${devis.client_phone}`}
                  className="text-gray-900 font-medium flex items-center gap-1.5 hover:text-[#997a15]"
                >
                  <Phone className="w-4 h-4 text-gray-400" />
                  {devis.client_phone || "Non renseigné"}
                </a>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Téléphone Secondaire</span>
                <span className="text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {devis.client_alternate_phone || "Non renseigné"}
                </span>
              </div>

              <div className="md:col-span-2">
                <span className="text-xs text-gray-400 block mb-0.5">Localisation / Adresse</span>
                <p className="text-gray-800 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>
                    {[devis.client_address, devis.client_city, devis.client_country]
                      .filter(Boolean)
                      .join(", ") || "Non renseignée"}
                  </span>
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Profession & Activité</span>
                <p className="text-gray-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {devis.client_profession || "Non renseignée"}
                  {devis.client_company && ` (${devis.client_company})`}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Revenus Mensuels Estimés</span>
                <p className="text-gray-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {devis.client_monthly_income || "Non renseignés"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Propriété Concernée */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Home className="w-5 h-5 text-[#d4af37]" />
              Bien Immobilier Concerné
            </h2>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {property?.image || property?.images?.[0] ? (
                <img
                  src={property.image || property.images?.[0]}
                  alt={devis.property_name}
                  className="w-full sm:w-44 h-32 object-cover rounded-xl border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-full sm:w-44 h-32 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <Building2 className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-xs">Photo non disponible</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-lg text-[#0a0f1e] font-bold mb-1">
                  {devis.property_name || property?.title || "Propriété MSF"}
                </h3>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {property?.location || "Pointe-Noire, Congo"}
                </p>

                {property && (
                  <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-slate-50 rounded-lg p-2.5 text-center text-xs border border-gray-100">
                    <div>
                      <span className="text-gray-400 block">Chambres</span>
                      <span className="font-bold text-[#0a0f1e]">{property.bedrooms || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Bains</span>
                      <span className="font-bold text-[#0a0f1e]">{property.bathrooms || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Surface</span>
                      <span className="font-bold text-[#0a0f1e]">{property.surface ? `${property.surface} m²` : "-"}</span>
                    </div>
                  </div>
                )}

                <div className="text-xl font-bold text-[#997a15]">
                  {devis.property_price
                    ? `${new Intl.NumberFormat("fr-FR").format(devis.property_price)} FCFA`
                    : property?.price
                    ? `${new Intl.NumberFormat("fr-FR").format(property.price)} FCFA`
                    : "Prix sur demande"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modalités & Message du client */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-5 h-5 text-[#d4af37]" />
              Modalités de la Demande
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Type d'opération</span>
                <p className="text-gray-900 font-semibold capitalize">
                  {devis.request_type || "Achat"}
                </p>
              </div>

              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Financement sollicité</span>
                <p className="text-gray-900 font-semibold capitalize">
                  {devis.financing_needed || "Non spécifié"}
                </p>
              </div>

              {devis.down_payment_amount ? (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Apport Personnel prévu</span>
                  <p className="text-[#997a15] font-bold">
                    {new Intl.NumberFormat("fr-FR").format(devis.down_payment_amount)} FCFA
                  </p>
                </div>
              ) : null}

              {devis.visit_date ? (
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">Visite souhaitée</span>
                  <p className="text-gray-900 font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {devis.visit_date} {devis.visit_time ? `à ${devis.visit_time}` : ""}
                    {devis.number_of_persons ? ` (${devis.number_of_persons} pers.)` : ""}
                  </p>
                </div>
              ) : null}

              {devis.message && (
                <div className="md:col-span-2 pt-2">
                  <span className="text-xs text-gray-400 block mb-1">Message & Précisions</span>
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                    {devis.message}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Notes Internes / Mémo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#d4af37]" />
              Notes Internes & Suivi
            </h2>

            {internalNotes.length > 0 ? (
              <div className="space-y-2 mb-4">
                {internalNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed"
                  >
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4 italic">
                Aucune note interne enregistrée pour ce dossier.
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Ajouter une consigne ou une note pour l'équipe..."
                className="flex-1 px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:outline-none focus:border-[#d4af37]"
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || saveNoteMutation.isPending}
                size="sm"
                className="bg-[#0a0f1e] text-white hover:bg-[#1a233a] cursor-pointer"
              >
                {saveNoteMutation.isPending ? "Ajout..." : "Enregistrer"}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Colonne Latérale (1/3) : Pilotage du statut & Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6"
          >
            <h3 className="text-base font-bold text-[#0a0f1e] mb-4">
              Traitement du Dossier
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                  Statut du pipeline
                </label>
                <select
                  value={devis.status || "nouveau"}
                  onChange={(e) =>
                    statusMutation.mutate(e.target.value as DevisRequest["status"])
                  }
                  disabled={statusMutation.isPending}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] font-semibold focus:outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En Cours de Traitement</option>
                  <option value="documents">Attente / Vérif. Documents</option>
                  <option value="approuve">Approuvé / Devis Transmis</option>
                  <option value="rejete">Rejeté / Sans Suite</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 block mb-2">Actions rapides</span>
                <div className="space-y-2">
                  <a
                    href={`tel:${devis.client_phone}`}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                  >
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    Appeler ({devis.client_phone || "N/A"})
                  </a>

                  <a
                    href={`mailto:${devis.client_email}?subject=Dossier de Devis MSF Congo - ${devis.property_name || ""}`}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                  >
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    Envoyer un courriel
                  </a>
                </div>
              </div>

              {/* Mentions et Consentements RGPD */}
              <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conditions générales acceptées</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Consentement de contact confirmé</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
