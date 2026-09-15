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
  Archive,
  ArchiveRestore,
  Users,
  Shield,
  UserX,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileItem {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
}

interface TeamMember {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
}

export default function AdminMessages() {
  const { user, userRole } = useSupabaseAuth();
  const isSuperAdmin = userRole === "superadmin";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileItem>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  // Filtres
  const [filterStatus, setFilterStatus] = useState<
    "active" | "open" | "closed" | "archived" | "all"
  >("active");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Récupération des membres de l'équipe MSF (Staff)
  const fetchTeamMembers = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesErr) throw rolesErr;

      const staffIds = (roles || []).map((r) => r.user_id);
      if (staffIds.length === 0) return;

      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", staffIds);

      if (profErr) throw profErr;

      const members: TeamMember[] = (roles || []).map((r) => {
        const p = (profs || []).find((prof) => prof.id === r.user_id);
        return {
          user_id: r.user_id,
          role: r.role,
          email: p?.email || "Email masqué",
          full_name: p?.full_name || "Conseiller",
        };
      });

      setTeamMembers(members);
    } catch (err) {
      console.error("Erreur de chargement des membres d'équipe :", err);
    }
  }, []);

  // 2. Récupération des conversations et des profils clients/agents associés
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

      const allUserIds = Array.from(
        new Set([
          ...convList.map((c) => c.client_id),
          ...convList.map((c) => c.agent_id).filter(Boolean),
        ]),
      ) as string[];

      if (allUserIds.length > 0) {
        const { data: profs, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", allUserIds);

        if (!profErr && profs) {
          const map: Record<string, ProfileItem> = {};
          profs.forEach((p) => {
            map[p.id] = p;
          });
          setProfilesMap((prev) => ({ ...prev, ...map }));
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
    fetchTeamMembers();
    fetchConversationsData();
  }, [fetchTeamMembers, fetchConversationsData]);

  // Écoute Realtime sur les conversations
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

  // Actions d'attribution de dossier
  const handleAssignAgent = async (
    convId: string,
    targetAgentId: string | null,
  ) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("conversations")
        .update({
          agent_id: targetAgentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);

      if (error) throw error;

      if (!targetAgentId) {
        toast.info("Dossier remis dans la file d'attente (non assigné).");
      } else if (targetAgentId === user?.id) {
        toast.success("Dossier assigné à vous avec succès !");
      } else {
        const assignedMember = teamMembers.find((m) => m.user_id === targetAgentId);
        const name = assignedMember?.full_name || "le collaborateur";
        toast.success(`Dossier assigné à ${name} avec succès !`);
      }

      await fetchConversationsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'attribution.";
      toast.error(msg);
    }
  };

  // Changement de statut (Ouvert, Clôturé, Archivé)
  const handleStatusChange = async (
    convId: string,
    newStatus: "open" | "closed" | "archived",
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

      if (newStatus === "archived") {
        toast.success("Dossier archivé. La vue a été nettoyée.");
      } else if (newStatus === "closed") {
        toast.success("Conversation clôturée.");
      } else {
        toast.success("Conversation rouverte.");
      }

      await fetchConversationsData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur de mise à jour du statut.";
      toast.error(msg);
    }
  };

  // Calcul du résumé de charge par membre de l'équipe (Workload pour SuperAdmin)
  const teamWorkload = useMemo(() => {
    const stats: Record<
      string,
      { total: number; open: number; archived: number; name: string }
    > = {};

    teamMembers.forEach((m) => {
      stats[m.user_id] = {
        total: 0,
        open: 0,
        archived: 0,
        name: m.full_name || m.email || "Conseiller",
      };
    });

    // Dossiers non assignés
    stats["unassigned"] = {
      total: 0,
      open: 0,
      archived: 0,
      name: "Non assignés",
    };

    conversations.forEach((c) => {
      const key = c.agent_id && stats[c.agent_id] ? c.agent_id : "unassigned";
      if (!stats[key]) {
        stats[key] = { total: 0, open: 0, archived: 0, name: "Autre" };
      }
      stats[key].total += 1;
      if (c.status === "open") stats[key].open += 1;
      if (c.status === "archived") stats[key].archived += 1;
    });

    return stats;
  }, [teamMembers, conversations]);

  // Filtrage combiné (Recherche, Statut, Filtre SuperAdmin / Agent)
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // 1. Filtrage par statut
      if (filterStatus === "active") {
        if (conv.status === "archived") return false;
      } else if (filterStatus === "open") {
        if (conv.status !== "open") return false;
      } else if (filterStatus === "closed") {
        if (conv.status !== "closed") return false;
      } else if (filterStatus === "archived") {
        if (conv.status !== "archived") return false;
      }

      // 2. Filtrage par membre d'équipe (SuperAdmin ou Agent)
      if (selectedAgentFilter === "me") {
        if (conv.agent_id !== user?.id) return false;
      } else if (selectedAgentFilter === "unassigned") {
        if (conv.agent_id) return false;
      } else if (selectedAgentFilter !== "all") {
        if (conv.agent_id !== selectedAgentFilter) return false;
      }

      // 3. Barre de recherche (Nom client, Email client, Sujet)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const client = profilesMap[conv.client_id];
        const assignedAgent = conv.agent_id ? profilesMap[conv.agent_id] : null;
        const name = (client?.full_name || "").toLowerCase();
        const email = (client?.email || "").toLowerCase();
        const agentName = (assignedAgent?.full_name || "").toLowerCase();
        const subject = conv.subject.toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          agentName.includes(q) ||
          subject.includes(q)
        );
      }

      return true;
    });
  }, [
    conversations,
    profilesMap,
    filterStatus,
    selectedAgentFilter,
    searchQuery,
    user?.id,
  ]);

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

  const getAgentName = (agentId?: string | null) => {
    if (!agentId) return null;
    const fromTeam = teamMembers.find((m) => m.user_id === agentId);
    if (fromTeam?.full_name) return fromTeam.full_name;
    const fromMap = profilesMap[agentId];
    if (fromMap?.full_name) return fromMap.full_name;
    if (fromMap?.email) return fromMap.email;
    return "Conseiller MSF";
  };

  return (
    <div className="space-y-6">
      {/* EN-TÊTE PRINCIPALE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0f1e] flex items-center gap-3">
            <span>Messagerie & Suivi des Dossiers</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              AES-256 Actif
            </span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Attribution des dossiers clients, chiffrement de bout en bout et gestion de l'archivage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchTeamMembers();
              fetchConversationsData();
            }}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>

          <span className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {conversations.filter((c) => c.status === "open").length} dossiers
            actifs
          </span>
        </div>
      </div>

      {/* PANNEAU SUPERADMIN : VUE D'ÉQUIPE ET RÉPARTITION DE CHARGE */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-[#0a0f1e] to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-[#d4af37]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-xl text-[#d4af37]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Vue de Direction SuperAdmin</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#d4af37] text-[#0a0f1e] rounded">
                    SuperAdmin
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Visualisez et filtrez les dossiers gérés par chaque membre de l'équipe MSF.
                </p>
              </div>
            </div>

            {/* SÉLECTEUR DE MEMBRE D'ÉQUIPE */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
                <Users className="w-4 h-4 text-[#d4af37]" />
                Filtrer par membre :
              </span>
              <select
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
                className="bg-gray-800 text-white text-xs border border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="all">Tous les collaborateurs ({conversations.length})</option>
                <option value="me">Mes dossiers assignés ({teamWorkload[user?.id || ""]?.total || 0})</option>
                <option value="unassigned">Non assignés ({teamWorkload["unassigned"]?.total || 0})</option>
                <optgroup label="Collaborateurs">
                  {teamMembers.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.full_name} ({teamWorkload[m.user_id]?.open || 0} ouverts / {teamWorkload[m.user_id]?.total || 0} totaux)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* BADGES RAPIDES DE CHARGE PAR COLLABORATEUR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            <button
              onClick={() => setSelectedAgentFilter("unassigned")}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedAgentFilter === "unassigned"
                  ? "bg-amber-500/20 border-amber-400"
                  : "bg-gray-800/60 border-gray-700 hover:bg-gray-800"
              }`}
            >
              <div className="text-[10px] text-amber-400 font-bold uppercase">Non assignés</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {teamWorkload["unassigned"]?.total || 0}
              </div>
              <div className="text-[10px] text-gray-400">
                {teamWorkload["unassigned"]?.open || 0} en attente
              </div>
            </button>

            {teamMembers.map((m) => {
              const stat = teamWorkload[m.user_id] || { total: 0, open: 0, archived: 0 };
              const isSelected = selectedAgentFilter === m.user_id;
              return (
                <button
                  key={m.user_id}
                  onClick={() => setSelectedAgentFilter(isSelected ? "all" : m.user_id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#d4af37]/20 border-[#d4af37]"
                      : "bg-gray-800/60 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="text-[10px] text-gray-300 font-bold truncate">
                    {m.full_name}
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {stat.open}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      / {stat.total}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#d4af37]">
                    {stat.open} ouverts • {stat.archived} archivés
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              placeholder="Rechercher par client, collaborateur, sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* FILTRES PAR STATUT (AVEC ONGLET ARCHIVÉS) */}
          <div className="flex items-center gap-1.5 pb-3 mb-2 border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === "active"
                  ? "bg-[#0a0f1e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Dossiers non archivés (Ouverts & Clôturés)"
            >
              Actifs (
              {conversations.filter((c) => c.status !== "archived").length})
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === "open"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ouverts ({conversations.filter((c) => c.status === "open").length})
            </button>
            <button
              onClick={() => setFilterStatus("closed")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === "closed"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Clôturés ({conversations.filter((c) => c.status === "closed").length})
            </button>
            <button
              onClick={() => setFilterStatus("archived")}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === "archived"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Dossiers déjà traités et archivés"
            >
              Archivés (
              {conversations.filter((c) => c.status === "archived").length})
            </button>
          </div>

          {/* LISTE DES DOSSIERS */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Chargement des flux sécurisés...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center px-4">
                <FolderLock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">
                  Aucun dossier trouvé
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {filterStatus === "archived"
                    ? "Aucun dossier n'a été archivé."
                    : searchQuery
                      ? "Aucun résultat pour cette recherche."
                      : "Aucun échange actif actuellement dans cette vue."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const client = profilesMap[conv.client_id];
                const clientName =
                  client?.full_name || client?.email || "Client";
                const isSelected = selectedConversation?.id === conv.id;
                const isAssignedToMe = conv.agent_id === user?.id;
                const assignedAgentName = getAgentName(conv.agent_id);

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
                        <span className="text-xs font-bold text-[#0a0f1e] truncate max-w-[130px]">
                          {clientName}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          conv.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : conv.status === "archived"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {conv.status === "open"
                          ? "Ouvert"
                          : conv.status === "archived"
                            ? "Archivé"
                            : "Fermé"}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-2">
                      {conv.subject}
                    </h4>

                    {/* BLOC ASSIGNATION & DATE */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-100">
                      <span className="text-gray-400 text-[10px]">
                        {formatDate(conv.updated_at || conv.created_at)}
                      </span>

                      {isAssignedToMe ? (
                        <span className="text-amber-800 bg-amber-100/70 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#d4af37]" />
                          Mon dossier
                        </span>
                      ) : conv.agent_id ? (
                        <span className="text-blue-800 bg-blue-50 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 max-w-[140px] truncate" title={`Assigné à : ${assignedAgentName}`}>
                          <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{assignedAgentName}</span>
                        </span>
                      ) : (
                        <span className="text-orange-700 bg-orange-50 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <UserX className="w-3 h-3 text-orange-500" />
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
              {/* BANDEAU DE CONTEXTE ET ATTRIBUTION */}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Client :</span>
                      <strong className="text-xs text-[#0a0f1e]">
                        {profilesMap[selectedConversation.client_id]?.full_name ||
                          profilesMap[selectedConversation.client_id]?.email ||
                          selectedConversation.client_id}
                      </strong>
                    </div>
                    {profilesMap[selectedConversation.client_id]?.email && (
                      <span className="text-[11px] text-gray-400 block">
                        {profilesMap[selectedConversation.client_id]?.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* GESTION AVANCÉE DE L'ASSIGNATION DU DOSSIER */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-medium text-gray-500">En charge :</span>
                    <select
                      value={selectedConversation.agent_id || ""}
                      onChange={(e) =>
                        handleAssignAgent(
                          selectedConversation.id,
                          e.target.value ? e.target.value : null,
                        )
                      }
                      className="bg-transparent text-xs font-bold text-[#0a0f1e] focus:outline-none cursor-pointer"
                    >
                      <option value="">Non assigné (Libre)</option>
                      {teamMembers.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.full_name} {m.user_id === user?.id ? "(Moi)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedConversation.agent_id !== user?.id && (
                    <button
                      onClick={() =>
                        handleAssignAgent(selectedConversation.id, user?.id || null)
                      }
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      title="M'assigner ce dossier directement"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>M'assigner</span>
                    </button>
                  )}
                </div>
              </div>

              {/* COMPOSANT DE CHAT CHIFFRÉ */}
              <div className="flex-1 h-[580px]">
                <EncryptedChat
                  conversation={selectedConversation}
                  currentUserId={user?.id || ""}
                  currentUserRole={isSuperAdmin ? "superadmin" : "agent"}
                  partnerName={
                    profilesMap[selectedConversation.client_id]?.full_name ||
                    "Client MSF"
                  }
                  onStatusChange={(newStatus) =>
                    handleStatusChange(selectedConversation.id, newStatus)
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
                Sélectionnez un dossier ou une conversation
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                Choisissez un fil de discussion dans la colonne de gauche pour
                consulter le dossier, réassigner le collaborateur ou répondre au client.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}