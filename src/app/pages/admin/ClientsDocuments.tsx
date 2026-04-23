import { useState, useEffect } from "react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import {
  Search, FileText, CheckCircle, XCircle,
  Trash2, AlertTriangle, ExternalLink, Loader2, Filter,
  Lock, RefreshCw, IdCard, Coins, Landmark, FolderOpen,
  ShieldAlert, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Renvoie le nom affiché d'un profil.
 * Tâche 3 : full_name → email → ID tronqué (aucun crash si champs vides)
 */
const displayName = (profile: { full_name?: string | null; email?: string | null; id: string }): string =>
  profile.full_name?.trim() || profile.email?.split("@")[0] || `Utilisateur ${profile.id.slice(0, 8)}`;

/**
 * Initiale sûre pour l'avatar (aucun accès direct à [0] sur une valeur nulle)
 */
const initial = (profile: { full_name?: string | null; email?: string | null }): string => {
  const src = profile.full_name?.trim() || profile.email || "?";
  return src[0].toUpperCase();
};

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ElementType; badgeBg: string; badgeText: string }> = {
  identity:  { label: "Pièce d'Identité",          icon: IdCard,    badgeBg: "bg-blue-50 border-blue-200",    badgeText: "text-blue-700"    },
  finance:   { label: "Justificatifs Financiers",   icon: Coins,     badgeBg: "bg-emerald-50 border-emerald-200", badgeText: "text-emerald-700" },
  land_title:{ label: "Documents Fonciers",         icon: Landmark,  badgeBg: "bg-amber-50 border-amber-200",  badgeText: "text-amber-700"   },
  other:     { label: "Autres Documents",           icon: FolderOpen,badgeBg: "bg-gray-50 border-gray-200",   badgeText: "text-gray-700"    },
};

const STATUS_STYLES: Record<string, string> = {
  approuve: "bg-green-100 text-green-700 border-green-200",
  rejete:   "bg-red-100 text-red-700 border-red-200",
  en_attente: "bg-blue-100 text-blue-700 border-blue-200",
};
const STATUS_LABELS: Record<string, string> = {
  approuve: "Approuvé",
  rejete:   "Rejeté",
  en_attente: "En attente",
};

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024)       return bytes + " B";
  if (bytes < 1_048_576)  return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsDocuments() {
  const [search,       setSearch]       = useState("");
  const [users,        setUsers]        = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDocs,     setUserDocs]     = useState<any[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [signedUrls,   setSignedUrls]   = useState<Record<string, string>>({});
  const [loadingSig,   setLoadingSig]   = useState<string | null>(null);
  const [filterCat,    setFilterCat]    = useState<string>("all");
  const [actionMsg,    setActionMsg]    = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ─── Tâche 3 : Recherche robuste sur profiles ────────────────────────────
  // - Fallback full_name → email
  // - Filtre UUID uniquement si la saisie en est un (évite l'erreur Postgres)
  useEffect(() => {
    if (search.length < 2) { setUsers([]); return; }

    const timer = setTimeout(async () => {
      // Construction dynamique du filtre .or()
      const isUUID = UUID_RE.test(search.trim());
      const orFilter = isUUID
        ? `full_name.ilike.%${search}%,email.ilike.%${search}%,id.eq.${search}`
        : `full_name.ilike.%${search}%,email.ilike.%${search}%`;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")   // on récupère toujours l'email pour le fallback
        .or(orFilter)
        .limit(6);

      if (error) { console.error("[ClientsDocuments] profiles fetch:", error.message); return; }

      // Normalisation : garantit que displayName() ne crashera jamais
      setUsers(
        (data || []).map(u => ({
          ...u,
          full_name: u.full_name?.trim() || null,
          email:     u.email     || null,
        }))
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ─── Chargement des documents du client ──────────────────────────────────
  const loadUserDocs = async (user: any) => {
    setIsLoading(true);
    setSelectedUser(user);
    setUsers([]);
    setSearch(displayName(user));
    setFilterCat("all");
    setSignedUrls({});

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("[ClientsDocuments] documents fetch:", error.message);
    setUserDocs(data || []);
    setIsLoading(false);
  };

  // ─── URL signée sécurisée pour consultation admin ────────────────────────
  const openSecure = async (doc: any) => {
    if (!doc.storage_path) {
      setActionMsg({ type: "err", text: "Ce document n'a pas de chemin de stockage enregistré." });
      return;
    }
    setLoadingSig(doc.id);
    const { data, error } = await supabase.storage
      .from("msf-private-docs")
      .createSignedUrl(doc.storage_path, 120); // 2 min pour l'admin

    if (error || !data?.signedUrl) {
      setActionMsg({ type: "err", text: `Accès refusé : ${error?.message || "URL non générée"}` });
    } else {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      setSignedUrls(prev => ({ ...prev, [doc.id]: data.signedUrl }));
    }
    setLoadingSig(null);
  };

  // ─── Actions Admin ────────────────────────────────────────────────────────
  const updateDocStatus = async (docId: string, status: string, comment?: string) => {
    const { error } = await supabase
      .from("documents")
      .update({ status, admin_comment: comment })
      .eq("id", docId);

    if (!error) {
      setUserDocs(docs => docs.map(d => d.id === docId ? { ...d, status, admin_comment: comment } : d));
      setActionMsg({ type: "ok", text: `Statut mis à jour : ${STATUS_LABELS[status] ?? status}` });
    } else {
      setActionMsg({ type: "err", text: `Erreur : ${error.message}` });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const deleteDoc = async (doc: any) => {
    if (!window.confirm(`Supprimer définitivement "${doc.name}" ?`)) return;

    // 1. Suppression du bucket si chemin disponible
    if (doc.storage_path) {
      const { error: storageErr } = await supabase.storage
        .from("msf-private-docs")
        .remove([doc.storage_path]);
      if (storageErr) console.warn("[ClientsDocuments] storage remove:", storageErr.message);
    }

    // 2. Suppression en base
    const { error: dbErr } = await supabase.from("documents").delete().eq("id", doc.id);
    if (!dbErr) {
      setUserDocs(docs => docs.filter(d => d.id !== doc.id));
      setActionMsg({ type: "ok", text: `"${doc.name}" supprimé.` });
    } else {
      setActionMsg({ type: "err", text: `Erreur DB : ${dbErr.message}` });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Filtre catégorie côté client
  const filteredDocs = filterCat === "all"
    ? userDocs
    : userDocs.filter(d => d.category === filterCat);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#0a0f1e]" />
        </div>
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Archives Documentaires</h1>
          <p className="text-sm text-gray-500">Consultation sécurisée via URL signée · Bucket privé <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">msf-private-docs</code></p>
        </div>
      </div>

      {/* ── Toast action ── */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${
              actionMsg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {actionMsg.type === "ok" ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <span className="text-sm">{actionMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Barre de recherche + autocomplete ── */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un client par nom, email ou UUID…"
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#d4af37] focus:outline-none transition-shadow"
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setSelectedUser(null); }}
        />

        {/* Résultats autocomplete */}
        <AnimatePresence>
          {users.length > 0 && !selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
            >
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => loadUserDocs(u)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37] font-bold flex-shrink-0">
                    {initial(u)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0a0f1e] truncate">{displayName(u)}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">{u.email || u.id}</p>
                  </div>
                  {!u.full_name && (
                    <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                      sans nom
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Dossier du client sélectionné ── */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

              {/* Header dossier */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 rounded-xl flex items-center justify-center text-[#d4af37] font-bold text-lg border border-[#d4af37]/20">
                    {initial(selectedUser)}
                  </div>
                  <div>
                    <h2 className="text-xl text-[#0a0f1e] font-bold">
                      Dossier de {displayName(selectedUser)}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {selectedUser.email || selectedUser.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadUserDocs(selectedUser)}
                    className="p-2 text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"
                    title="Rafraîchir"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedUser(null); setSearch(""); setUserDocs([]); }}
                    className="text-sm text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Filtres catégorie */}
              <div className="flex gap-2 flex-wrap mb-5">
                {[["all", "Tous"], ...Object.entries(CATEGORY_LABELS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCat(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterCat === key
                        ? "bg-[#d4af37] text-[#0a0f1e] border-[#d4af37]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#d4af37]/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Liste documents */}
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
                  <p className="text-sm text-gray-400">Chargement du dossier…</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-20 text-center">
                  <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun document dans cette catégorie.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocs.map(doc => {
                    const cat   = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.other;
                    const CatIcon = cat.icon;
                    const docStatus = doc.status || "en_attente";

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37]/30 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Icône catégorie */}
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border ${cat.badgeBg}`}>
                            <CatIcon className={`w-5 h-5 ${cat.badgeText}`} />
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#0a0f1e] truncate">{doc.name || "Sans nom"}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${cat.badgeBg} ${cat.badgeText}`}>
                                {cat.label}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${STATUS_STYLES[docStatus] || STATUS_STYLES.en_attente}`}>
                                {STATUS_LABELS[docStatus] ?? docStatus}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {formatSize(doc.size || 0)} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            {doc.admin_comment && (
                              <p className="text-xs text-amber-600 mt-1 italic">💬 {doc.admin_comment}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">

                            {/* Consulter (URL signée 120s) */}
                            <button
                              onClick={() => openSecure(doc)}
                              disabled={loadingSig === doc.id || !doc.storage_path}
                              title="Consulter (URL signée)"
                              className="p-2 text-[#0a0f1e] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors disabled:opacity-40"
                            >
                              {loadingSig === doc.id
                                ? <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                                : <ExternalLink className="w-4 h-4 text-[#d4af37]" />
                              }
                            </button>

                            {/* Valider */}
                            <button
                              onClick={() => updateDocStatus(doc.id, "approuve")}
                              title="Valider le document"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            {/* Demander retransmission */}
                            <button
                              onClick={() => updateDocStatus(doc.id, "rejete", "Qualité insuffisante — veuillez renvoyer.")}
                              title="Rejeter / demander un meilleur document"
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>

                            {/* Supprimer (storage + DB) */}
                            <button
                              onClick={() => deleteDoc(doc)}
                              title="Supprimer définitivement"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400">
              <User className="w-10 h-10 text-gray-200" />
              <p className="text-sm">Recherchez un client pour accéder à son dossier</p>
            </div>
          )}
        </div>

        {/* ── Panneau latéral ── */}
        <div className="space-y-6">

          {/* Aide-mémoire procédures */}
          <div className="bg-[#0a0f1e] rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#d4af37]" /> Rappel des procédures
            </h3>
            <ul className="text-sm space-y-3 text-gray-400">
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Vérifier la validité des dates d'expiration.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Les justificatifs financiers doivent dater de moins de 3 mois.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> En cas de flou sur une image, utiliser le bouton "Alerte" pour rejeter.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Tout accès génère une URL signée valable 2 min (non partageable).</li>
            </ul>
          </div>

          {/* Légende des catégories */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-sm text-[#0a0f1e] font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#d4af37]" /> Types de documents
            </h3>
            <div className="space-y-2.5">
              {Object.entries(CATEGORY_LABELS).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.badgeBg}`}>
                      <Icon className={`w-4 h-4 ${cfg.badgeText}`} />
                    </div>
                    <span className={`text-xs font-medium ${cfg.badgeText}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats dossier courant */}
          {selectedUser && !isLoading && (
            <div className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl p-5 border border-[#d4af37]/30">
              <h3 className="text-sm text-[#0a0f1e] font-semibold mb-4">Dossier courant</h3>
              <div className="space-y-2">
                {Object.entries(CATEGORY_LABELS).map(([key, cfg]) => {
                  const count = userDocs.filter(d => d.category === key).length;
                  if (count === 0) return null;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{cfg.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badgeBg} ${cfg.badgeText}`}>{count}</span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-[#d4af37]/20 mt-2">
                  <span className="text-xs text-gray-600 font-semibold">Total</span>
                  <span className="text-sm text-[#0a0f1e] font-bold">{userDocs.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
