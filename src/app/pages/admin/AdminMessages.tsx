import { useState, useEffect, useCallback, useMemo } from "react";
import { useSupabaseAuth, supabase } from "../../../hooks/useSupabaseAuth";
import { Conversation } from "../../../types/database.types";
import EncryptedChat from "../../components/ui/EncryptedChat";
import {
  MessageSquare,
  Search,
  ShieldCheck,
  Lock,
  User,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderLock,
  Filter,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface ClientProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function AdminMessages() {
  const { user, userRole } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ClientProfile>>(
    {},
  );
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Récupération de toutes les conversations et des profils associés
  const fetchConversationsData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. Récupération des conversations
      const { data: convData, error: convErr } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (convErr) throw convErr;

      const convList: Conversation[] = convData || [];
      setConversations(convList);

      // 2. Récupération des profils des clients impliqués
      const clientIds = Array.from(
        new Set(convList.map((c) => c.client_id).filter(Boolean)),
      );
      if (clientIds.length > 0) {
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", clientIds);

        if (!profErr && profData) {
          const map: Record<string, ClientProfile> = {};
          profData.forEach((p) => {
            map[p.id] = p;
          });
          setProfilesMap(map);
        }
      }

      // Conserver ou synchroniser la conversation sélectionnée
      setSelectedConversation((prev) => {
        if (!prev) return convList[0] || null;
        const currentInList = convList.find((c) => c.id === prev.id);
        return currentInList || convList[0] || null;
      });
    } catch (err: unknown) {
      console.error("Erreur chargement des conversations admin :", err);
      toast.error("Impossible de charger les conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversationsData();
  }, [fetchConversationsData]);

  // Abonnement Realtime global aux conversations
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("admin-conversations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          fetchConversationsData();
        },
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchConversationsData]);

  // Assignation de la conversation au conseiller connecté
  const handleAssignToMe = async (convId: string) => {
    if (!supabase || !user?.id) return;
    setAssigningId(convId);
    try {
      const { error } = await supabase
        .from("conversations")
        .update({
          agent_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);

      if (error) throw error;

      toast.success("Vous êtes maintenant assigné à cette conversation.");
      await fetchConversationsData();
    } catch (err: unknown) {
      console.error("Erreur lors de l'assignation :", err);
      toast.error("Erreur lors de l'assignation.");
    } finally {
      setAssigningId(null);
    }
  };

  // Clôture ou réouverture de conversation
  const handleToggleStatus = async (newStatus: "open" | "closed") => {
    if (!supabase || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedConversation.id);

      if (error) throw error;

      toast.success(
        newStatus === "open"
          ? "Conversation réouverte."
          : "Conversation clôturée.",
      );
      await fetchConversationsData();
    } catch (err: unknown) {
      console.error("Erreur mise à jour statut :", err);
      toast.error("Impossible de modifier le statut de la conversation.");
    }
  };

  // Filtrage des conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const client = profilesMap[conv.client_id];
      const matchStatus =
        filterStatus === "all" ? true : conv.status === filterStatus;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchStatus;

      const matchSubject = conv.subject.toLowerCase().includes(q);
      const matchClientName = client?.full_name?.toLowerCase().includes(q);
      const matchClientEmail = client?.email?.toLowerCase().includes(q);

      return (
        matchStatus && (matchSubject || matchClientName || matchClientEmail)
      );
    });
  }, [conversations, profilesMap, filterStatus, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const selectedClient = selectedConversation
    ? profilesMap[selectedConversation.client_id]
    : null;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0a0f1e] flex items-center gap-3">
            <span>Messagerie Sécurisée Clients</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256 E2E
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez les échanges chiffrés en direct avec les acquéreurs et
            investisseurs de MSF CONGO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">
            {conversations.filter((c) => c.status === "open").length}{" "}
            discussions ouvertes
          </span>
        </div>
      </div>

      {/* CADRE PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* LISTE ET FILTRES DES CONVERSATIONS (COLONNE GAUCHE) */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* BARRE DE RECHERCHE */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par client, email ou sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* FILTRES PAR STATUT */}
          <div className="flex items-center gap-1.5 pb-3 mb-2 border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-[#0a0f1e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Toutes ({conversations.length})
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === "open"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ouvertes (
              {conversations.filter((c) => c.status === "open").length})
            </button>
            <button
              onClick={() => setFilterStatus("closed")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === "closed"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Clôturées (
              {conversations.filter((c) => c.status === "closed").length})
            </button>
          </div>

          {/* LISTE DÉROULANTE */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Chargement des flux...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center px-4">
                <FolderLock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">
                  Aucune conversation
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery
                    ? "Aucun résultat pour cette recherche."
                    : "Aucun échange actif actuellement."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const client = profilesMap[conv.client_id];
                const clientName =
                  client?.full_name || client?.email || "Client";
                const isSelected = selectedConversation?.id === conv.id;
                const isAssignedToMe = conv.agent_id === user?.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? "bg-amber-50/80 border-[#d4af37] shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {clientName[0]?.toUpperCase() || "C"}
                        </div>
                        <span className="text-xs font-bold text-[#0a0f1e] truncate max-w-[140px]">
                          {clientName}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          conv.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {conv.status === "open" ? "Ouvert" : "Fermé"}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                      {conv.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>
                        {formatDate(conv.updated_at || conv.created_at)}
                      </span>
                      {isAssignedToMe ? (
                        <span className="text-[#b89528] font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Mon dossier
                        </span>
                      ) : conv.agent_id ? (
                        <span className="text-gray-500">Assigné</span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          Non assigné
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CADRE DU CHAT SÉLECTIONNÉ (COLONNE DROITE) */}
        <div
          className={`lg:col-span-8 flex flex-col ${
            !selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <div className="flex flex-col h-full space-y-3">
              {/* Entête avec options d'assignation et profil du client */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="lg:hidden">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-[#d4af37] font-bold flex items-center justify-center text-sm">
                    {selectedClient?.full_name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0a0f1e]">
                      {selectedClient?.full_name || "Client"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      {selectedClient?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedClient.email}
                        </span>
                      )}
                      {selectedClient?.phone && (
                        <span>• {selectedClient.phone}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConversation.agent_id !== user?.id && (
                    <button
                      onClick={() => handleAssignToMe(selectedConversation.id)}
                      disabled={assigningId === selectedConversation.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>
                        {assigningId === selectedConversation.id
                          ? "Attribution..."
                          : "Prendre en charge"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* CHAT CHIFFRÉ EN TEMPS RÉEL */}
              <div className="flex-1 h-[560px]">
                <EncryptedChat
                  conversation={selectedConversation}
                  currentUserId={user?.id || ""}
                  currentUserRole={
                    (userRole as "agent" | "admin" | "superadmin") || "admin"
                  }
                  partnerName={selectedClient?.full_name || "Client MSF"}
                  onStatusChange={handleToggleStatus}
                />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-base font-bold text-[#0a0f1e]">
                Sélectionnez un échange
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Choisissez une conversation dans la colonne de gauche pour
                consulter l'historique chiffré et répondre au client en temps
                réel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
