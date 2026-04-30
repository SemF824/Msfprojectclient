// src/app/pages/admin/ClientsDocuments.tsx
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import {
  Search, FileText, CheckCircle, XCircle,
  Trash2, AlertTriangle, ExternalLink, Loader2,
  Lock, RefreshCw, IdCard, Coins, Landmark, FolderOpen,
  ShieldAlert, ChevronDown, ChevronUp, ZoomIn, Download, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BUCKET  = "msf-private-docs";
const TTL     = 120; // 2 minutes pour admin

const isPdf   = (name: string) => /\.pdf$/i.test(name ?? "");
const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name ?? "");

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024)      return bytes + " B";
  if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

// ─── Config catégories & Statuts ──────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; }> = {
  identity:  { label: "Identité", icon: IdCard,    bg: "bg-blue-50", text: "text-blue-600" },
  finance:   { label: "Finance",  icon: Coins,     bg: "bg-emerald-50", text: "text-emerald-600"},
  land_title:{ label: "Foncier",  icon: Landmark,  bg: "bg-amber-50", text: "text-amber-600" },
  other:     { label: "Autre",    icon: FolderOpen,bg: "bg-gray-50", text: "text-gray-600" },
};

const STATUS_STYLES: Record<string, string> = {
  approuve:  "bg-green-100 text-green-700 border-green-200",
  rejete:    "bg-red-100 text-red-700 border-red-200",
  en_attente:"bg-blue-100 text-blue-700 border-blue-200",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  size: number;
  category: string;
  status: string;
  created_at: string;
  storage_path: string;
  admin_comment?: string;
  user_id: string;
}

interface ClientGroup {
  user_id: string;
  email: string;
  full_name: string;
  documents: Document[];
}

interface ToastItem { id: string; type: "ok" | "err" | "warn"; text: string; }

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsDocuments() {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((type: ToastItem["type"], text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // Actions states
  const [actionBusy, setActionBusy] = useState(false);
  const [loadingSig, setLoadingSig] = useState<string | null>(null);
  
  // Reject Dialog
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Preview
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ─── Chargement Global ──────────────────────────────────────────────────────
  const loadData = async () => {
    if (!supabase) return;
    setIsLoading(true);

    try {
      // 1. Récupérer tous les documents
      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;
      if (!docsData || docsData.length === 0) {
        setClientGroups([]);
        return;
      }

      // 2. Extraire les user_id uniques
      const userIds = [...new Set(docsData.map(d => d.user_id))];

      // 3. Récupérer les profils correspondants
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // 4. Grouper les documents par client
      const groups: ClientGroup[] = profilesData.map(profile => ({
        user_id: profile.id,
        email: profile.email || "Email inconnu",
        full_name: profile.full_name || "Client non nommé",
        documents: docsData.filter(d => d.user_id === profile.id)
      }));

      // Trier : Clients avec documents en attente en premier
      groups.sort((a, b) => {
        const aPending = a.documents.some(d => d.status === 'en_attente');
        const bPending = b.documents.some(d => d.status === 'en_attente');
        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;
        return b.documents.length - a.documents.length; // Sinon par nb de docs
      });

      setClientGroups(groups);
    } catch (error: any) {
      console.error("Erreur chargement:", error);
      addToast("err", "Erreur lors du chargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Actions sur les documents ──────────────────────────────────────────────
  const toggleExpand = (userId: string) => {
    setExpandedClients(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const openSecure = async (doc: Document) => {
    if (!supabase || !doc.storage_path) return;
    setLoadingSig(doc.id);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, TTL);
    setLoadingSig(null);

    if (error || !data?.signedUrl) {
      addToast("err", `Accès refusé : ${error?.message}`);
      return;
    }

    if (isPdf(doc.name)) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } else if (isImage(doc.name)) {
      setPreviewDoc(doc);
      setPreviewUrl(data.signedUrl);
    } else {
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = doc.name;
      link.click();
    }
  };

  const approveDoc = async (docId: string, userId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from("documents").update({ status: "approuve", admin_comment: null }).eq("id", docId);
    if (!error) {
      updateLocalDocStatus(docId, userId, "approuve", null);
      addToast("ok", "Document approuvé");
    } else addToast("err", error.message);
  };

  const confirmReject = async () => {
    if (!supabase || !rejectDocId) return;
    // Trouver le userId
    let uId = "";
    clientGroups.forEach(g => { if (g.documents.some(d => d.id === rejectDocId)) uId = g.user_id; });

    const { error } = await supabase.from("documents").update({ status: "rejete", admin_comment: rejectReason }).eq("id", rejectDocId);
    if (!error) {
      updateLocalDocStatus(rejectDocId, uId, "rejete", rejectReason);
      addToast("warn", "Document rejeté");
    } else addToast("err", error.message);
    
    setRejectDocId(null); setRejectReason("");
  };

  const deleteDoc = async (doc: Document, userId: string) => {
    if (!window.confirm(`Supprimer définitivement ${doc.name} ?`)) return;
    if (!supabase) return;
    setActionBusy(true);

    if (doc.storage_path) await supabase.storage.from(BUCKET).remove([doc.storage_path]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    
    if (!error) {
      setClientGroups(prev => prev.map(g => {
        if (g.user_id === userId) return { ...g, documents: g.documents.filter(d => d.id !== doc.id) };
        return g;
      }));
      addToast("err", "Document supprimé");
    } else addToast("err", error.message);
    
    setActionBusy(false);
  };

  const updateLocalDocStatus = (docId: string, userId: string, status: string, comment: string | null) => {
    setClientGroups(prev => prev.map(g => {
      if (g.user_id === userId) {
        return {
          ...g,
          documents: g.documents.map(d => d.id === docId ? { ...d, status, admin_comment: comment || undefined } : d)
        };
      }
      return g;
    }));
  };

  // ─── Filtrage ───────────────────────────────────────────────────────────────
  const filteredGroups = clientGroups.filter(g => 
    g.full_name.toLowerCase().includes(search.toLowerCase()) || 
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto relative">
      
      {/* ── Loader Overlay ── */}
      {actionBusy && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
            <p className="text-[#0a0f1e] font-medium">Traitement en cours…</p>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div className="fixed bottom-6 right-6 z-[250] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
                t.type === "ok" ? "bg-green-50 border-green-200 text-green-700" :
                t.type === "warn" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center border border-[#d4af37]/20">
            <Lock className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h1 className="text-3xl text-[#0a0f1e] font-bold">Vérification Documents</h1>
            <p className="text-sm text-gray-500">Validez les pièces justificatives des clients.</p>
          </div>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-[#d4af37] focus:outline-none"
        />
      </div>

      {/* ── Liste Accordéon ── */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            Aucun document client trouvé.
          </div>
        ) : (
          filteredGroups.map(group => {
            const isExpanded = expandedClients.has(group.user_id);
            const pendingCount = group.documents.filter(d => d.status === 'en_attente').length;

            return (
              <div key={group.user_id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all">
                
                {/* En-tête Client (Cliquable) */}
                <div 
                  onClick={() => toggleExpand(group.user_id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0a0f1e] text-[#d4af37] rounded-full flex items-center justify-center font-bold text-lg">
                      {group.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0a0f1e]">{group.full_name}</h3>
                      <p className="text-sm text-gray-500">{group.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {pendingCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                        {pendingCount} en attente
                      </span>
                    )}
                    <span className="text-sm text-gray-500 font-medium">{group.documents.length} document(s)</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Liste des documents du client */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-3">
                        {group.documents.map(doc => {
                          const cat = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.other;
                          const showReject = rejectDocId === doc.id;

                          return (
                            <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.bg}`}>
                                    <cat.icon className={`w-5 h-5 ${cat.text}`} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-[#0a0f1e]">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{cat.label} • {formatSize(doc.size)} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                    {doc.admin_comment && <p className="text-xs text-red-500 mt-1">Raison du rejet: {doc.admin_comment}</p>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${STATUS_STYLES[doc.status] || STATUS_STYLES.en_attente}`}>
                                    {doc.status === "en_attente" ? "En attente" : doc.status}
                                  </span>

                                  <button onClick={() => openSecure(doc)} disabled={loadingSig === doc.id} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Voir">
                                    {loadingSig === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ZoomIn className="w-4 h-4" />}
                                  </button>
                                  
                                  <button onClick={() => approveDoc(doc.id, group.user_id)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors" title="Valider">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>

                                  <button onClick={() => { setRejectDocId(doc.id); setRejectReason(""); }} className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors" title="Rejeter">
                                    <AlertTriangle className="w-4 h-4" />
                                  </button>

                                  <button onClick={() => deleteDoc(doc, group.user_id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Supprimer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Reject Inline */}
                              {showReject && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                                  <input type="text" placeholder="Raison du rejet..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border border-amber-200 rounded-md focus:outline-none focus:border-amber-400" />
                                  <button onClick={confirmReject} className="px-3 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-md hover:bg-amber-600">Confirmer</button>
                                  <button onClick={() => setRejectDocId(null)} className="px-3 py-1.5 bg-white text-gray-600 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Annuler</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Preview Image ── */}
      <AnimatePresence>
        {previewDoc && previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => {setPreviewDoc(null); setPreviewUrl(null);}}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="relative bg-white rounded-2xl overflow-hidden max-w-3xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 bg-slate-900 text-white">
                <h3 className="font-semibold text-sm truncate pr-4">{previewDoc.name}</h3>
                <button onClick={() => {setPreviewDoc(null); setPreviewUrl(null);}}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 overflow-auto flex justify-center bg-gray-50">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md" />
              </div>
              <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                <a href={previewUrl} download={previewDoc.name} className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl text-sm">
                  <Download className="w-4 h-4" /> Télécharger
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}