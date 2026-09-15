import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, useSupabaseAuth } from "../../../hooks/useSupabaseAuth";
import { Conversation } from "../../../types/database.types";
import EncryptedChat from "../../components/ui/EncryptedChat";
import {
  MessageSquare,
  Search,
  Lock,
  UserCheck,
  FolderLock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileItem {
  id: string;
  email?: string;
  full_name?: string;
}

export default function AdminMessages() {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileItem>>({});
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConversationsData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: convs, error: convErr } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (convErr) throw convErr;

      const convList: Conversation[] = convs || [];
      setConversations(convList);

      const clientIds = Array.from(new Set(convList.map((c) => c.client_id)));

      if (clientIds.length > 0) {
        const { data: profs, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", clientIds);

        if (!profErr && profs) {
          const map: Record<string, ProfileItem> = {};
          profs.forEach((p) => {
            map[p.id] = p;
          });
          setProfilesMap(map);
        }
      }

      if (convList.length > 0) {
        setSelectedConversation((prev) => {
          if (!prev) return convList[0];
          const match = convList.find((c) => c.id === prev.id);
          return match || convList[0];
        });
      } else {
        setSelectedConversation(null);
      }
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

  const handleAssignToMe = async (convId: string) => {
    if (!supabase || !user?.id) return;
    try {
      const { error } = await supabase
        .from("conversations")
        .update({
          agent_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);

      if (error) throw error;
      toast.success("Dossier assigné avec succès !");
      await fetchConversationsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'attribution.";
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (
    convId: string,
    newStatus: "open" | "closed",
  ) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("conversations")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);

      if (error) throw error;
      toast.success(
        newStatus === "closed"
          ? "Conversation clôturée."
          : "Conversation rouverte.",
      );
      await fetchConversationsData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur de mise à jour du statut.";
      toast.error(msg);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (filterStatus !== "all" && conv.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const client = profilesMap[conv.client_id];
        const name = (client?.full_name || "").toLowerCase();
        const email = (client?.email || "").toLowerCase();
        const subject = conv.subject.toLowerCase();
        return name.includes(q) || email.includes(q) || subject.includes(q);
      }
      return true;
    });
  }, [conversations, profilesMap, filterStatus, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0f1e] flex items-center gap-3">
            <span>Messagerie & Support Client</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              AES-256 Actif
            </span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Gérez et répondez de manière sécurisée et chiffrée aux demandes de
            vos clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConversationsData}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>

          <span className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
              className="w-full pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d4af37]"
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
                        <span className="text-gray-500 italic">Assigné</span>
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

        {/* ZONE DE CHAT SÉLECTIONNÉE (COLONNE DROITE) */}
        <div
          className={`lg:col-span-8 flex flex-col ${
            !selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <div className="flex flex-col h-full space-y-3">
              {/* Barre de contexte Agent */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="lg:hidden">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Client :</span>
                    <strong className="text-xs text-[#0a0f1e] ml-1">
                      {profilesMap[selectedConversation.client_id]?.full_name ||
                        profilesMap[selectedConversation.client_id]?.email ||
                        selectedConversation.client_id}
                    </strong>
                    {profilesMap[selectedConversation.client_id]?.email && (
                      <span className="text-[11px] text-gray-400 ml-2">
                        ({profilesMap[selectedConversation.client_id]?.email})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConversation.agent_id !== user?.id && (
                    <button
                      onClick={() => handleAssignToMe(selectedConversation.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>M'assigner ce dossier</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 h-[580px]">
                <EncryptedChat
                  conversation={selectedConversation}
                  currentUserId={user?.id || ""}
                  currentUserRole="agent"
                  partnerName={
                    profilesMap[selectedConversation.client_id]?.full_name ||
                    "Client MSF"
                  }
                  onStatusChange={(newStatus) =>
                    handleToggleStatus(selectedConversation.id, newStatus)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0f1e]">
                Sélectionnez une conversation
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Choisissez un fil de discussion dans la colonne de gauche pour
                déchiffrer et répondre aux messages du client.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}