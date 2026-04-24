// src/app/pages/admin/ClientsDocuments.tsx
// FICHIER COMPLET — remplace l'existant intégralement
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import {
  Search, FileText, CheckCircle, XCircle,
  Trash2, AlertTriangle, ExternalLink, Loader2, Filter,
  Lock, RefreshCw, IdCard, Coins, Landmark, FolderOpen,
  ShieldAlert, User, X, ZoomIn, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET  = "msf-private-docs";
const TTL     = 120; // 2 minutes pour admin

const isPdf   = (name: string) => /\.pdf$/i.test(name ?? "");
const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name ?? "");

const displayName = (p: { full_name?: string | null; email?: string | null; id: string }): string =>
  p.full_name?.trim() || p.email?.split("@")[0] || `Utilisateur ${p.id.slice(0, 8)}`;

const initial = (p: { full_name?: string | null; email?: string | null }): string => {
  const src = p.full_name?.trim() || p.email || "?";
  return src[0].toUpperCase();
};

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024)      return bytes + " B";
  if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

// ─── Config catégories ────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, {
  label: string; icon: React.ElementType;
  badgeBg: string; badgeText: string; iconColor: string;
}> = {
  identity:  { label: "Pièce d'Identité",        icon: IdCard,    badgeBg: "bg-blue-50 border-blue-200",    badgeText: "text-blue-700",    iconColor: "text-blue-600"   },
  finance:   { label: "Justificatifs Financiers", icon: Coins,     badgeBg: "bg-emerald-50 border-emerald-200", badgeText: "text-emerald-700", iconColor: "text-emerald-600"},
  land_title:{ label: "Documents Fonciers",       icon: Landmark,  badgeBg: "bg-amber-50 border-amber-200",  badgeText: "text-amber-700",   iconColor: "text-amber-600"  },
  other:     { label: "Autres Documents",         icon: FolderOpen,badgeBg: "bg-gray-50 border-gray-200",   badgeText: "text-gray-700",    iconColor: "text-gray-600"   },
};

const STATUS_STYLES: Record<string, string> = {
  approuve:  "bg-green-100 text-green-700 border-green-200",
  rejete:    "bg-red-100 text-red-700 border-red-200",
  en_attente:"bg-blue-100 text-blue-700 border-blue-200",
};
const STATUS_LABELS: Record<string, string> = {
  approuve:  "Approuvé",
  rejete:    "Rejeté",
  en_attente:"En attente",
};

// ─── Types toast ─────────────────────────────────────────────────────────────
interface ToastItem { id: string; type: "ok" | "err" | "warn"; text: string; }

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsDocuments() {
  const [search,        setSearch]        = useState("");
  const [users,         setUsers]         = useState<any[]>([]);
  const [selectedUser,  setSelectedUser]  = useState<any>(null);
  const [userDocs,      setUserDocs]      = useState<any[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [filterCat,     setFilterCat]     = useState<string>("all");

  // ── Toasts (bas droite) ──────────────────────────────────────────────────
  const [toasts,        setToasts]        = useState<ToastItem[]>([]);
  const addToast = useCallback((type: ToastItem["type"], text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // ── Preview image ─────────────────────────────────────────────────────────
  const [previewDoc,    setPreviewDoc]    = useState<any>(null);
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null);
  const [previewLoading,setPreviewLoading]= useState(false);
  const [previewError,  setPreviewError]  = useState<string | null>(null);

  // ── Loader overlay ────────────────────────────────────────────────────────
  const [actionBusy,    setActionBusy]    = useState(false);
  const [loadingSig,    setLoadingSig]    = useState<string | null>(null);

  // ── Reject dialog inline ─────────────────────────────────────────────────
  const [rejectDocId,   setRejectDocId]   = useState<string | null>(null);
  const [rejectReason,  setRejectReason]  = useState("");

  // ─────────────────────────────────────────────────────────────────────────
  // Recherche clients avec debounce 300ms
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (search.length < 2) { setUsers([]); return; }

    const timer = setTimeout(async () => {
      if (!supabase) return;
      const isUUID  = UUID_RE.test(search.trim());
      const orFilter = isUUID
        ? `full_name.ilike.%${search}%,email.ilike.%${search}%,id.eq.${search}`
        : `full_name.ilike.%${search}%,email.ilike.%${search}%`;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .or(orFilter)
        .limit(6);

      if (error) { console.error("[ClientsDocuments] profiles:", error.message); return; }

      setUsers(
        (data || []).map(u => ({
          ...u,
          full_name: u.full_name?.trim() || null,
          email:     u.email || null,
        }))
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ─────────────────────────────────────────────────────────────────────────
  const loadUserDocs = async (user: any) => {
    if (!supabase) return;
    setIsLoading(true);
    setSelectedUser(user);
    setUsers([]);
    setSearch(displayName(user));
    setFilterCat("all");

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("[ClientsDocuments] documents:", error.message);
    setUserDocs(data || []);
    setIsLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTER — URL signée 120 secondes
  // ─────────────────────────────────────────────────────────────────────────
  const openSecure = async (doc: any) => {
    if (!supabase) return;
    if (!doc.storage_path) {
      addToast("err", "Ce document n'a pas de chemin de stockage enregistré.");
      return;
    }
    setLoadingSig(doc.id);

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, TTL);

    setLoadingSig(null);

    if (error || !data?.signedUrl) {
      addToast("err", `Accès refusé : ${error?.message || "URL non générée"}`);
      return;
    }

    if (isPdf(doc.name)) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } else if (isImage(doc.name)) {
      // Ouvrir modal de prévisualisation
      setPreviewDoc(doc);
      setPreviewUrl(data.signedUrl);
      setPreviewError(null);
    } else {
      // Autre format → download
      const link = document.createElement("a");
      link.href     = data.signedUrl;
      link.download = doc.name;
      link.click();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Renouveler URL signée dans la modal
  // ─────────────────────────────────────────────────────────────────────────
  const renewPreviewUrl = async () => {
    if (!supabase || !previewDoc?.storage_path) return;
    setPreviewLoading(true);
    setPreviewError(null);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(previewDoc.storage_path, TTL);
    if (error || !data?.signedUrl) {
      setPreviewError(error?.message || "Impossible de renouveler le lien.");
    } else {
      setPreviewUrl(data.signedUrl);
    }
    setPreviewLoading(false);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDER
  // ─────────────────────────────────────────────────────────────────────────
  const approveDoc = async (docId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("documents")
      .update({ status: "approuve", admin_comment: null })
      .eq("id", docId);
    if (!error) {
      setUserDocs(ds => ds.map(d => d.id === docId ? { ...d, status: "approuve", admin_comment: null } : d));
      addToast("ok", "Document approuvé ✓");
    } else {
      addToast("err", "Erreur : " + error.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // REJETER avec commentaire (dialog inline)
  // ─────────────────────────────────────────────────────────────────────────
  const confirmReject = async () => {
    if (!supabase || !rejectDocId) return;
    const { error } = await supabase
      .from("documents")
      .update({ status: "rejete", admin_comment: rejectReason || "Document non conforme." })
      .eq("id", rejectDocId);
    if (!error) {
      setUserDocs(ds => ds.map(d => d.id === rejectDocId ? { ...d, status: "rejete", admin_comment: rejectReason || "Document non conforme." } : d));
      addToast("warn", "Document rejeté");
    } else {
      addToast("err", "Erreur : " + error.message);
    }
    setRejectDocId(null);
    setRejectReason("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUPPRIMER (storage + DB)
  // ─────────────────────────────────────────────────────────────────────────
  const deleteDoc = async (doc: any) => {
    if (!window.confirm(`Supprimer définitivement "${doc.name}" ?`)) return;
    if (!supabase) return;
    setActionBusy(true);

    // 1. Storage
    if (doc.storage_path) {
      const { error: stErr } = await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      if (stErr) console.warn("[ClientsDocuments] storage remove:", stErr.message);
    }

    // 2. DB
    const { error: dbErr } = await supabase.from("documents").delete().eq("id", doc.id);
    if (!dbErr) {
      setUserDocs(ds => ds.filter(d => d.id !== doc.id));
      addToast("err", `"${doc.name}" supprimé.`);
    } else {
      addToast("err", "Erreur DB : " + dbErr.message);
    }
    setActionBusy(false);
  };

  // Filtre côté client
  const filteredDocs = filterCat === "all"
    ? userDocs
    : userDocs.filter(d => d.category === filterCat);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto relative">

      {/* ── Loader overlay actions longues ── */}
      {actionBusy && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
            <p className="text-[#0a0f1e] font-medium">Suppression en cours…</p>
          </div>
        </div>
      )}

      {/* ── Toasts (bas droite) ── */}
      <div className="fixed bottom-6 right-6 z-[250] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, y: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium min-w-[220px] ${
                t.type === "ok"   ? "bg-green-50 border-green-200 text-green-700"  :
                t.type === "warn" ? "bg-amber-50 border-amber-200 text-amber-700"  :
                                    "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {t.type === "ok"   ? <CheckCircle   className="w-4 h-4 flex-shrink-0" /> :
               t.type === "warn" ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> :
                                   <ShieldAlert   className="w-4 h-4 flex-shrink-0" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── En-tête ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-xl flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#0a0f1e]" />
        </div>
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Archives Documentaires</h1>
          <p className="text-sm text-gray-500">
            Consultation sécurisée · URL signée {TTL}s · Bucket privé{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{BUCKET}</code>
          </p>
        </div>
      </div>

      {/* ── Recherche client + autocomplete ── */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher un client par nom, email ou UUID…"
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#d4af37] focus:outline-none transition-shadow text-[#0a0f1e] placeholder:text-gray-400 text-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); if (!e.target.value) setSelectedUser(null); }}
        />

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

        {/* ── Dossier client ── */}
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
                    <h2 className="text-xl text-[#0a0f1e] font-bold">Dossier de {displayName(selectedUser)}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedUser.email || selectedUser.id}</p>
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

              {/* Documents */}
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
                    const cat      = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.other;
                    const CatIcon  = cat.icon;
                    const docStatus= doc.status || "en_attente";
                    const showReject = rejectDocId === doc.id;

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:border-[#d4af37]/30 transition-colors group"
                      >
                        {/* Ligne principale */}
                        <div className="flex items-center gap-4 p-4">
                          {/* Icône catégorie */}
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 border ${cat.badgeBg}`}>
                            <CatIcon className={`w-5 h-5 ${cat.iconColor}`} />
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

                            {/* Consulter */}
                            <button
                              onClick={() => openSecure(doc)}
                              disabled={loadingSig === doc.id || !doc.storage_path}
                              title={isPdf(doc.name) ? "Ouvrir PDF" : isImage(doc.name) ? "Aperçu image" : "Télécharger"}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[#0a0f1e] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 rounded-lg transition-colors disabled:opacity-40 text-xs font-medium"
                            >
                              {loadingSig === doc.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : isImage(doc.name)
                                ? <ZoomIn className="w-3.5 h-3.5 text-[#d4af37]" />
                                : <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                              }
                              Voir
                            </button>

                            {/* Valider */}
                            <button
                              onClick={() => approveDoc(doc.id)}
                              title="Approuver"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>

                            {/* Rejeter */}
                            <button
                              onClick={() => { setRejectDocId(doc.id); setRejectReason(""); }}
                              title="Rejeter avec commentaire"
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => deleteDoc(doc)}
                              title="Supprimer définitivement"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* ── Dialog rejet inline ── */}
                        <AnimatePresence>
                          {showReject && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-amber-200 bg-amber-50/50 pt-3">
                                <p className="text-xs font-semibold text-amber-700 mb-2">Raison du rejet</p>
                                <textarea
                                  rows={2}
                                  placeholder="Ex: Document illisible, veuillez renvoyer"
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-amber-400 focus:outline-none resize-none"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={confirmReject}
                                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors"
                                  >
                                    Confirmer le rejet
                                  </button>
                                  <button
                                    onClick={() => setRejectDocId(null)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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

        {/* ── Panneau latéral droit ── */}
        <div className="space-y-6">

          {/* Rappel procédures */}
          <div className="bg-[#0a0f1e] rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#d4af37]" /> Rappel des procédures
            </h3>
            <ul className="text-sm space-y-3 text-gray-400">
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Vérifier la validité des dates d'expiration.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Les justificatifs financiers doivent dater de moins de 3 mois.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> En cas de flou sur une image, utiliser le bouton rejet.</li>
              <li className="flex gap-2"><span className="text-[#d4af37]">•</span> Tout accès génère une URL signée valable {TTL}s (non partageable).</li>
            </ul>
          </div>

          {/* Légende catégories */}
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
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
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

          {/* Message si pas de client */}
          {!selectedUser && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm text-center">
              <User className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Recherchez un client pour afficher les statistiques de son dossier.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ MODAL PRÉVISUALISATION IMAGE ══════════════════════════ */}
      <AnimatePresence>
        {previewDoc && isImage(previewDoc.name) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{previewDoc.name}</p>
                    <p className="text-gray-400 text-xs">
                      {CATEGORY_LABELS[previewDoc.category]?.label ?? "Document"} · {formatSize(previewDoc.size || 0)} · URL expire dans {TTL}s
                    </p>
                  </div>
                </div>
                <button onClick={closePreview} className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-3">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corps */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50 min-h-[300px]">
                {previewLoading && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
                    <p className="text-sm text-gray-500">Renouvellement de l'URL…</p>
                  </div>
                )}
                {!previewLoading && previewError && (
                  <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                    <p className="text-sm text-gray-500">{previewError}</p>
                    <button onClick={renewPreviewUrl} className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-[#0a0f1e] rounded-xl text-sm font-medium">
                      <RefreshCw className="w-4 h-4" /> Réessayer
                    </button>
                  </div>
                )}
                {!previewLoading && !previewError && previewUrl && (
                  <img
                    src={previewUrl}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
                    style={{ maxWidth: "90vw", maxHeight: "85vh" }}
                    onError={() => setPreviewError("Impossible de charger l'image. L'URL a peut-être expiré.")}
                  />
                )}
              </div>

              {/* Pied */}
              {!previewLoading && !previewError && previewUrl && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#d4af37]" />
                    Lien sécurisé · expire dans {TTL} secondes
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={previewUrl}
                      download={previewDoc.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </a>
                    <button
                      onClick={renewPreviewUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f1e] text-[#d4af37] rounded-lg text-xs font-medium hover:bg-[#1a2540] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renouveler le lien
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
