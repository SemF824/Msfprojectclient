import { useState, useEffect, useRef } from "react";

// ─── Stagger variants (anti-clignotement stats) ───────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import {
  Home, Heart, Calendar, FileText, Calculator, LogOut,
  Bell, Settings, User, Clock, AlertCircle, Download,
  Building2, CreditCard,
  Upload, X, ZoomIn, ExternalLink, CloudUpload, CheckCircle,
  FileArchive, Lock, Filter, IdCard, Landmark, Coins, FolderOpen,
  RefreshCw, ShieldAlert
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import type {
  Transaction, Appointment, Document, Notification,
  Favorite, DevisRequest, DocCategory
} from "../../types/database.types";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET          = "msf-private-docs";
const MAX_SIZE_MB     = 10;   // non-images, non-PDF
const PDF_MAX_MB      = 15;   // PDF : limite stricte imposée
const SIGNED_URL_TTL  = 60;   // secondes

// ─── Compression d'image via Canvas API (= browser-image-compression natif) ──
// Redimensionne si > MAX_DIMENSION, réencode JPEG à JPEG_QUALITY.
// Retourne le File compressé si gain > 0, sinon l'original.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY  = 0.82;

const compressImage = (file: File): Promise<File> =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img       = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width  = Math.floor(width  * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed.size < file.size ? compressed : file);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// ─── Configuration des catégories ────────────────────────────────────────────
type CategoryKey = DocCategory | "all";

interface CategoryConfig {
  label:     string;
  icon:      React.ElementType;
  color:     string;   // bg + text Tailwind
  badgeBg:   string;
  badgeText: string;
}

const CATEGORIES: Record<DocCategory, CategoryConfig> = {
  identity: {
    label: "Pièce d'Identité",
    icon:  IdCard,
    color:     "from-blue-500 to-blue-600",
    badgeBg:   "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
  },
  finance: {
    label: "Justificatifs Financiers",
    icon:  Coins,
    color:     "from-emerald-500 to-emerald-600",
    badgeBg:   "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
  },
  land_title: {
    label: "Documents Fonciers",
    icon:  Landmark,
    color:     "from-amber-500 to-amber-600",
    badgeBg:   "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
  },
  other: {
    label: "Autres Documents",
    icon:  FolderOpen,
    color:     "from-gray-500 to-gray-600",
    badgeBg:   "bg-gray-50 border-gray-200",
    badgeText: "text-gray-700",
  },
};

// ─── Helpers fichiers ─────────────────────────────────────────────────────────
const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name ?? "");
const isPdf   = (name: string) => /\.pdf$/i.test(name ?? "");

const safeFilename  = (raw: string) => raw.replace(/[^a-zA-Z0-9._\-]/g, "_");
const formatSize    = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024)        return bytes + " B";
  if (bytes < 1_048_576)   return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user: authUser, isLoading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // ── Données ───────────────────────────────────────────────────────────────
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [transactions,  setTransactions]  = useState<Transaction[]>([]);
  const [appointments,  setAppointments]  = useState<Appointment[]>([]);
  const [documents,     setDocuments]     = useState<Document[]>([]);
  const [favorites,     setFavorites]     = useState<Favorite[]>([]);
  const [devisRequests, setDevisRequests] = useState<DevisRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const [docCategory,    setDocCategory]    = useState<DocCategory>("other");
  const [isUploading,    setIsUploading]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError,    setUploadError]    = useState<string | null>(null);
  const [uploadSuccess,  setUploadSuccess]  = useState(false);
  const [isDragOver,     setIsDragOver]     = useState(false);
  const [compressInfo,   setCompressInfo]   = useState<string | null>(null);

  // ── Filtre documents ──────────────────────────────────────────────────────
  const [docFilter, setDocFilter] = useState<CategoryKey>("all");

  // ── Preview sécurisé ──────────────────────────────────────────────────────
  const [previewDoc,       setPreviewDoc]       = useState<Document | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError,     setPreviewError]     = useState<string | null>(null);

  // ── Simulateur ────────────────────────────────────────────────────────────
  const [loanAmount,   setLoanAmount]   = useState(450_000);
  const [downPayment,  setDownPayment]  = useState(90_000);
  const [loanTerm,     setLoanTerm]     = useState(20);
  const [interestRate, setInterestRate] = useState(7.5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Guard chargement auth ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  // ── Identité affichée ─────────────────────────────────────────────────────
  const displayName  = authUser?.user_metadata?.full_name
    || authUser?.user_metadata?.first_name
    || authUser?.email?.split("@")[0] || "Utilisateur";
  const displayEmail = authUser?.email || "";

  const stats = [
    { label: "Demandes Actives",     value: (devisRequests).filter(r => r?.status === "nouveau" || r?.status === "en_cours").length.toString(), icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Propriétés Favorites", value: favorites.length.toString(),                                                                          icon: Heart,    color: "from-pink-500 to-pink-600" },
    { label: "Visites Planifiées",   value: (appointments).filter(a => (a as any)?.status === "planifie").length.toString(),                      icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Documents Sécurisés",  value: documents.length.toString(),                                                                           icon: Lock,     color: "from-purple-500 to-purple-600" },
  ];

  // ── Fetching ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    (async () => {
      setIsDataLoading(true);
      try {
        const uid   = authUser.id;
        const email = authUser.email || "";
        const [tr, ap, dc, fv, dv, nt] = await Promise.all([
          supabase.from("transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).catch(() => ({ data: [] })),
          supabase.from("appointments").select("*").eq("user_id", uid).order("appointment_date", { ascending: true }).catch(() => ({ data: [] })),
          supabase.from("documents").select("*").eq("user_id", uid).order("created_at", { ascending: false }).catch(() => ({ data: [] })),
          supabase.from("favorites").select("*").eq("user_id", uid).catch(() => ({ data: [] })),
          supabase.from("devis_requests").select("*").eq("client_email", email).order("created_at", { ascending: false }).catch(() => ({ data: [] })),
          supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10).catch(() => ({ data: [] })),
        ]);
        setTransactions(tr?.data  || []);
        setAppointments(ap?.data  || []);
        setDocuments(   dc?.data  || []);
        setFavorites(   fv?.data  || []);
        setDevisRequests(dv?.data || []);
        setNotifications(nt?.data || []);
      } catch (e) { console.error("Fetch error:", e); }
      finally { setIsDataLoading(false); }
    })();
  }, [authUser]);

  const refreshDocuments = async () => {
    if (!authUser) return;
    const { data } = await supabase.from("documents").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  // ═════════════════════════════════════════════════════════════════════════
  // UPLOAD — bucket privé msf-private-docs
  // Chemin : {userId}/{category}/{timestamp}_{filename}
  // ═════════════════════════════════════════════════════════════════════════
  // UPLOAD — Garde PDF + Compression images + Bucket privé catégorisé
  // ═════════════════════════════════════════════════════════════════════════
  const handleFileUpload = async (file: File) => {
    if (!authUser || !supabase) return;

    setUploadError(null);
    setUploadSuccess(false);
    setCompressInfo(null);

    // ── GARDE 1 : PDF trop lourd → message métier explicite ──────────────
    if (isPdf(file.name) && file.size > PDF_MAX_MB * 1_048_576) {
      setUploadError(
        "Ce document est trop lourd. Veuillez le compresser sur un outil en ligne avant de l'envoyer pour garantir la sécurité du transfert."
      );
      return;
    }

    // ── GARDE 2 : Autres fichiers non-image > 10 Mo ───────────────────────
    if (!isImage(file.name) && !isPdf(file.name) && file.size > MAX_SIZE_MB * 1_048_576) {
      setUploadError(`Le fichier ne doit pas dépasser ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulation de progression réseau
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 80) { clearInterval(interval); return prev; }
        return Math.min(prev + Math.random() * 14, 80);
      });
    }, 160);

    try {
      // ── COMPRESSION IMAGE via Canvas API ─────────────────────────────────
      // Équivalent de browser-image-compression : redimension + JPEG 0.82
      let fileToUpload = file;
      if (isImage(file.name)) {
        const originalSize = file.size;
        fileToUpload = await compressImage(file);
        const savings = Math.round((1 - fileToUpload.size / originalSize) * 100);
        if (savings > 3) {
          setCompressInfo(
            `✦ Image optimisée : ${formatSize(originalSize)} → ${formatSize(fileToUpload.size)} (−${savings}%)`
          );
        }
      }

      // ── Chemin sécurisé et catégorisé ───────────────────────────────────
      const fname       = safeFilename(fileToUpload.name);
      const storagePath = `${authUser.id}/${docCategory}/${Date.now()}_${fname}`;

      const { data: stored, error: storeErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileToUpload, {
          upsert:       false,
          cacheControl: "3600",
          contentType:  fileToUpload.type,
        });

      clearInterval(interval);
      if (storeErr) throw storeErr;
      setUploadProgress(90);

      // ── Insertion en base avec storage_path + category ───────────────────
      const { error: dbErr } = await supabase.from("documents").insert({
        user_id:      authUser.id,
        name:         file.name,           // nom original affiché
        type:         fileToUpload.type,
        size:         fileToUpload.size,   // taille post-compression
        url:          "",                  // bucket privé → pas d'URL publique
        storage_path: stored.path,         // chemin pour createSignedUrl
        category:     docCategory,
      });

      if (dbErr) throw dbErr;

      setUploadProgress(100);
      setUploadSuccess(true);
      await refreshDocuments();
      setTimeout(() => { setIsUploading(false); setUploadProgress(0); setUploadSuccess(false); }, 2000);

    } catch (err: any) {
      clearInterval(interval);
      setUploadError(err?.message || "Erreur lors de l'envoi du fichier.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { handleFileUpload(file); e.target.value = ""; }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // PREVIEW SÉCURISÉ — URL signée de 60 secondes
  // ═════════════════════════════════════════════════════════════════════════
  const handlePreview = async (doc: Document) => {
    if (!supabase || !doc.storage_path) {
      setPreviewError("Chemin de stockage introuvable pour ce document.");
      return;
    }

    setPreviewDoc(doc);
    setPreviewSignedUrl(null);
    setPreviewError(null);
    setIsLoadingPreview(true);

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.storage_path, SIGNED_URL_TTL);

      if (error || !data?.signedUrl) throw error ?? new Error("URL signée non générée.");

      if (isPdf(doc.name)) {
        // PDF → nouvel onglet propre (iframe bloqué par X-Frame-Options sur certains navigateurs)
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        // Ferme la modal s'il n'y en a pas pour les PDF
        setPreviewDoc(null);
      } else {
        // Image → modal interne
        setPreviewSignedUrl(data.signedUrl);
      }
    } catch (err: any) {
      setPreviewError(err?.message || "Impossible de générer le lien sécurisé.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewSignedUrl(null);
    setPreviewError(null);
    setIsLoadingPreview(false);
  };

  // ── Simulateur ────────────────────────────────────────────────────────────
  const monthlyPayment = () => {
    const p = loanAmount - downPayment;
    if (p <= 0 || loanTerm <= 0) return 0;
    if (interestRate === 0) return +(p / (loanTerm * 12)).toFixed(2);
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;
    return +(p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2);
  };

  const handleLogout = async () => { await signOut(); navigate("/connexion"); };

  // ── Helpers statuts ───────────────────────────────────────────────────────
  const txColor = (s: string) => ({
    en_attente: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    complete:   "bg-green-500/20 text-green-400 border-green-500/30",
    echoue:     "bg-red-500/20 text-red-400 border-red-500/30",
  }[s] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30");

  const apColor = (s: string) => ({
    planifie: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    termine:  "bg-green-500/20 text-green-400 border-green-500/30",
    annule:   "bg-red-500/20 text-red-400 border-red-500/30",
  }[s] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30");

  const statusLabel = (s: string) => ({
    en_attente: "En attente", complete: "Terminée", echoue: "Échouée",
    planifie: "Planifié", termine: "Terminé", annule: "Annulé",
    nouveau: "Nouveau", en_cours: "En cours", approuve: "Approuvée", rejete: "Rejetée",
  }[s] ?? s ?? "Inconnu");

  const unread = notifications.filter(n => !(n as any)?.is_read).length;

  // ── Documents filtrés ─────────────────────────────────────────────────────
  const filteredDocs = docFilter === "all"
    ? documents
    : documents.filter(d => d.category === docFilter);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ════════ SIDEBAR ════════ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-[#0a0f1e]" />
                </div>
                <h3 className="text-[#0a0f1e] text-lg font-semibold">{displayName}</h3>
                <p className="text-gray-500 text-sm truncate">{displayEmail}</p>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <Link to="/vitrine" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#d4af37] transition-colors rounded-xl hover:bg-gray-50">
                  <Home className="w-4 h-4" /><span>← Retour au site</span>
                </Link>
              </div>

              <nav className="space-y-1.5 mb-6">
                {[
                  { id: "overview",     icon: Home,       label: "Vue d'ensemble" },
                  { id: "requests",     icon: FileText,   label: "Mes Demandes" },
                  { id: "favorites",    icon: Heart,      label: "Favoris" },
                  { id: "appointments", icon: Calendar,   label: "Rendez-vous" },
                  { id: "history",      icon: Clock,      label: "Historique" },
                  { id: "documents",    icon: Lock,       label: "Documents Sécurisés" },
                  { id: "loan",         icon: Calculator, label: "Simulateur Prêt" },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                      activeTab === item.id
                        ? "bg-[#d4af37] text-[#0a0f1e] shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-gray-200 space-y-1">
                <Link to="/client/profile"       className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><User className="w-4 h-4" />Mon Profil</Link>
                <Link to="/client/favorites"     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Heart className="w-4 h-4" />Mes Favoris</Link>
                <Link to="/client/notifications" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Bell className="w-4 h-4" />Notifications</Link>
                <Link to="/client/settings"      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Settings className="w-4 h-4" />Paramètres</Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* ════════ CONTENU ════════ */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-1">
                  Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">{displayName.split(" ")[0]}</span>
                </h1>
                <p className="text-gray-500 text-sm">Voici un aperçu de votre activité</p>
              </div>
              <Link to="/client/notifications" className="relative p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors shadow-sm group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">{unread}</span>
                )}
              </Link>
            </div>

            {/* ── ONGLET : Vue d'ensemble ─────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={i} variants={itemVariants}
                        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl text-[#0a0f1e] font-bold">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg text-[#0a0f1e] font-semibold">Transactions Récentes</h2>
                    <Link to="/client/transactions" className="text-sm text-[#d4af37] hover:underline flex items-center gap-1"><CreditCard className="w-4 h-4" />Voir tout</Link>
                  </div>
                  {isDataLoading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                  ) : transactions.length === 0 ? (
                    <EmptyState icon={CreditCard} title="Aucune transaction" description="Vous n'avez pas encore de transaction en cours." />
                  ) : (
                    <div className="space-y-2">
                      {transactions.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-[#0a0f1e] font-medium text-sm">{(t as any).property_name || "Propriété inconnue"}</p>
                            <p className="text-xs text-gray-500">{((t as any).amount || 0).toLocaleString()} FCFA</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${txColor((t as any).status || "")}`}>
                            {statusLabel((t as any).status || "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-lg text-[#0a0f1e] font-semibold mb-4">Prochains Rendez-vous</h2>
                  {isDataLoading ? (
                    <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                  ) : appointments.length === 0 ? (
                    <EmptyState icon={Calendar} title="Aucun rendez-vous" description="Aucun rendez-vous planifié pour le moment." />
                  ) : (
                    <div className="space-y-2">
                      {appointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-10 h-10 bg-[#d4af37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-[#d4af37]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#0a0f1e] font-medium text-sm truncate">{(apt as any).title || "Rendez-vous"}</p>
                            <p className="text-xs text-gray-500">{new Date((apt as any).appointment_date || new Date()).toLocaleDateString("fr-FR")} {(apt as any).agent_name ? `— ${(apt as any).agent_name}` : ""}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border flex-shrink-0 ${apColor((apt as any).status || "")}`}>
                            {statusLabel((apt as any).status || "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* ── ONGLET : Demandes ───────────────────────────────────────── */}
            {activeTab === "requests" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Demandes de Devis</h2>
                {isDataLoading ? <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                : devisRequests.length === 0 ? <EmptyState icon={FileText} title="Aucune demande" description="Vous n'avez pas encore soumis de demande de devis." />
                : (
                  <div className="space-y-4">
                    {devisRequests.map(r => (
                      <div key={r.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-[#0a0f1e] font-medium">{r.property_name || "Propriété"}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Type : {r.request_type === "achat" ? "Achat" : r.request_type === "location" ? "Location" : "Information"}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full border ${txColor(r.status || "")}`}>{statusLabel(r.status || "")}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Soumise le {new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                          <p className="text-sm text-[#d4af37] font-medium">{(r.property_price || 0).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ONGLET : Rendez-vous ────────────────────────────────────── */}
            {activeTab === "appointments" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Rendez-vous</h2>
                {isDataLoading ? <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                : appointments.length === 0 ? <EmptyState icon={Calendar} title="Aucun rendez-vous" description="Aucun rendez-vous planifié." />
                : (
                  <div className="space-y-4">
                    {appointments.map(apt => {
                      const d = new Date((apt as any).appointment_date || new Date());
                      return (
                        <div key={apt.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-[#d4af37]/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-[#d4af37] text-[10px] uppercase">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                              <span className="text-[#0a0f1e] font-bold text-lg">{d.getDate()}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[#0a0f1e] font-medium">{(apt as any).title || "Rendez-vous"}</h3>
                              <p className="text-xs text-gray-500 mt-1">{(apt as any).appointment_time || ""}{(apt as any).agent_name ? ` — ${(apt as any).agent_name}` : ""}</p>
                              {(apt as any).notes && <p className="text-xs text-gray-400 mt-1 italic">{(apt as any).notes}</p>}
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full border ${apColor((apt as any).status || "")}`}>{statusLabel((apt as any).status || "")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ONGLET : Favoris ────────────────────────────────────────── */}
            {activeTab === "favorites" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Mes Propriétés Favorites</h2>
                {isDataLoading ? <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                : favorites.length === 0 ? <EmptyState icon={Heart} title="Aucune propriété favorite" description="Ajoutez des propriétés à vos favoris." />
                : (
                  <div className="space-y-4">
                    {favorites.map(f => (
                      <div key={f.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="text-[#0a0f1e] font-medium">Propriété #{f.property_id}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Ajoutée le {new Date(f.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ONGLET : Historique ──────────────────────────────────────── */}
            {activeTab === "history" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Historique des Transactions</h2>
                {isDataLoading ? <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                : transactions.filter(t => (t as any).status === "complete").length === 0 ? <EmptyState icon={Clock} title="Aucun historique" description="Pas encore de transaction terminée." />
                : (
                  <div className="space-y-4">
                    {transactions.filter(t => (t as any).status === "complete").map(t => (
                      <div key={t.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-[#0a0f1e] font-medium">{(t as any).property_name}</h3>
                          <span className="text-[#d4af37] font-semibold">{((t as any).amount || 0).toLocaleString()} FCFA</span>
                        </div>
                        <p className="text-xs text-gray-500">Terminée le {new Date(t.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                ONGLET : DOCUMENTS SÉCURISÉS
            ══════════════════════════════════════════════════════════════ */}
            {activeTab === "documents" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                {/* ── Bandeau sécurité ── */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540] rounded-xl border border-[#d4af37]/30">
                  <div className="w-9 h-9 bg-[#d4af37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Espace documentaire sécurisé</p>
                    <p className="text-gray-400 text-xs">Vos documents sont stockés dans un bucket privé chiffré. L'accès est généré via URL signée de {SIGNED_URL_TTL}s.</p>
                  </div>
                </div>

                {/* ── Zone d'upload catégorisée ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                  <h2 className="text-lg text-[#0a0f1e] font-semibold mb-1">Déposer un document</h2>
                  <p className="text-xs text-gray-500 mb-5">PDF, images, Word, Excel — max {MAX_SIZE_MB} Mo · Stockage : <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{BUCKET}</code></p>

                  {/* ── Sélecteur de catégorie ── */}
                  <div className="mb-5">
                    <label className="block text-sm text-gray-700 font-medium mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#d4af37]" />
                      Catégorie du document <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(Object.entries(CATEGORIES) as [DocCategory, CategoryConfig][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const active = docCategory === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setDocCategory(key)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                              active
                                ? "border-[#d4af37] bg-[#d4af37]/8 shadow-sm"
                                : "border-gray-200 hover:border-[#d4af37]/50 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${cfg.color}`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`text-xs leading-tight ${active ? "text-[#0a0f1e] font-semibold" : "text-gray-600"}`}>
                              {cfg.label}
                            </span>
                            {active && <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />}
                          </button>
                        );
                      })}
                    </div>
                    {/* Chemin de stockage calculé */}
                    <div className="mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-[10px] text-gray-400 font-mono">
                        📁 {BUCKET} / <span className="text-gray-600">{authUser?.id?.slice(0, 8)}…</span> / <span className="text-[#d4af37] font-semibold">{docCategory}</span> / timestamp_fichier
                      </p>
                    </div>
                  </div>

                  {/* ── Drag & Drop ── */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      isDragOver      ? "border-[#d4af37] bg-[#d4af37]/5 scale-[1.01]"
                      : isUploading   ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                      : uploadSuccess ? "border-green-400 bg-green-50"
                      :                 "border-gray-300 hover:border-[#d4af37]/60 hover:bg-gray-50"
                    }`}
                  >
                    {isUploading    ? <CloudUpload className="w-10 h-10 text-[#d4af37] animate-bounce" />
                    : uploadSuccess  ? <CheckCircle className="w-10 h-10 text-green-500" />
                    :                  <Upload className={`w-10 h-10 ${isDragOver ? "text-[#d4af37]" : "text-gray-300"}`} />}

                    <div className="text-center">
                      {isUploading    ? <p className="text-sm text-gray-600">Chiffrement et envoi vers <strong>{BUCKET}</strong>…</p>
                      : uploadSuccess  ? <p className="text-sm text-green-700 font-medium">Document envoyé avec succès !</p>
                      : isDragOver    ? <p className="text-sm text-[#d4af37] font-medium">Déposez le fichier ici</p>
                      : (
                        <>
                          <p className="text-sm text-gray-600 font-medium">Glissez-déposez votre fichier ici</p>
                          <p className="text-xs text-gray-400 mt-1">ou cliquez pour sélectionner</p>
                          <p className="text-xs text-[#d4af37] mt-1 font-medium">
                            Catégorie : {CATEGORIES[docCategory].label}
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  {/* Barre de progression */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-gray-500">Téléchargement sécurisé…</span>
                          <span className="text-xs font-bold text-[#d4af37]">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.25 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Succès de compression image */}
                  {compressInfo && !uploadError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-emerald-700 flex-1">{compressInfo}</p>
                      <button onClick={() => setCompressInfo(null)}><X className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-600" /></button>
                    </motion.div>
                  )}

                  {/* Erreur upload */}
                  {uploadError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600 flex-1">{uploadError}</p>
                      <button onClick={() => setUploadError(null)}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                    </motion.div>
                  )}

                  {!isUploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-medium hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Sélectionner et envoyer
                    </button>
                  )}
                </div>

                {/* ── Liste des documents ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg text-[#0a0f1e] font-semibold">
                      Mes Documents <span className="text-sm text-gray-400 font-normal">({filteredDocs.length})</span>
                    </h2>
                    <button onClick={refreshDocuments} className="p-2 text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors" title="Rafraîchir">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filtres catégories */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                    {([["all", "Tous"] as const, ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label] as const)]).map(([key, label]) => {
                      const active = docFilter === key;
                      return (
                        <button key={key} onClick={() => setDocFilter(key as CategoryKey)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                            active
                              ? "bg-[#d4af37] text-[#0a0f1e] border-[#d4af37]"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#d4af37]/50"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {isDataLoading ? (
                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>
                  ) : filteredDocs.length === 0 ? (
                    <EmptyState icon={FileText} title="Aucun document" description="Déposez votre premier document ci-dessus." />
                  ) : (
                    <div className="space-y-2">
                      {filteredDocs.map(doc => {
                        const cat    = doc.category && CATEGORIES[doc.category] ? CATEGORIES[doc.category] : CATEGORIES.other;
                        const CatIcon = cat.icon;
                        const ext    = (doc.name || "").split(".").pop()?.toLowerCase() ?? "";
                        const hasPath = !!doc.storage_path;

                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37]/30 transition-colors group"
                          >
                            {/* Icône catégorie */}
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${cat.color}`}>
                              {isPdf(doc.name)
                                ? <FileArchive className="w-5 h-5 text-white" />
                                : <CatIcon className="w-5 h-5 text-white" />
                              }
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[#0a0f1e] font-medium text-sm truncate">{doc.name || "Document"}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cat.badgeBg} ${cat.badgeText}`}>
                                  {cat.label}
                                </span>
                                <span className="text-[10px] text-gray-400">{ext.toUpperCase()} · {formatSize(doc.size || 0)} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}</span>
                              </div>
                            </div>

                            {/* Actions (visibles au hover) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {hasPath && (
                                <button
                                  onClick={() => handlePreview(doc)}
                                  disabled={isLoadingPreview}
                                  title={isPdf(doc.name) ? "Ouvrir le PDF (URL sécurisée)" : "Prévisualiser (URL sécurisée)"}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0f1e] text-[#d4af37] rounded-lg text-xs font-medium hover:bg-[#1a2540] transition-colors disabled:opacity-50"
                                >
                                  {isLoadingPreview && previewDoc?.id === doc.id
                                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    : isPdf(doc.name)
                                    ? <ExternalLink className="w-3.5 h-3.5" />
                                    : <ZoomIn className="w-3.5 h-3.5" />
                                  }
                                  Consulter
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── ONGLET : Simulateur ──────────────────────────────────────── */}
            {activeTab === "loan" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <h2 className="text-2xl text-[#0a0f1e] font-semibold mb-6">Simulateur de Prêt</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-5">
                    {[
                      { label: "Montant Total (FCFA)", val: loanAmount,   setter: setLoanAmount,   step: undefined },
                      { label: "Apport Initial (FCFA)", val: downPayment,  setter: setDownPayment,  step: undefined },
                      { label: "Durée (années)",        val: loanTerm,     setter: setLoanTerm,     step: undefined },
                      { label: "Taux d'Intérêt (%)",    val: interestRate, setter: setInterestRate, step: "0.1"    },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-sm text-gray-600 mb-1.5">{f.label}</label>
                        <input
                          type="number"
                          value={f.val}
                          step={f.step}
                          onChange={e => f.setter(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-5">
                    <div className="p-6 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30">
                      <p className="text-gray-600 text-sm mb-2">Mensualité Estimée</p>
                      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
                        {monthlyPayment().toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-gray-500 mt-2">par mois pendant {loanTerm} ans</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        ["Montant Emprunté",  (loanAmount - downPayment).toLocaleString() + " FCFA", "text-[#0a0f1e]"],
                        ["Intérêts Totaux",   ((monthlyPayment() * loanTerm * 12) - (loanAmount - downPayment)).toLocaleString() + " FCFA", "text-[#0a0f1e]"],
                        ["Coût Total",        (monthlyPayment() * loanTerm * 12 + downPayment).toLocaleString() + " FCFA", "text-[#d4af37] font-semibold"],
                      ].map(([l, v, cls]) => (
                        <div key={l} className="flex justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-gray-600 text-sm">{l}</span>
                          <span className={`text-sm ${cls}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-medium hover:shadow-xl hover:shadow-[#d4af37]/30 transition-all">
                      Contacter un Conseiller
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">ℹ️ <strong>Note :</strong> Ce simulateur fournit une estimation. Les conditions réelles varient selon votre profil.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — PRÉVISUALISATION SÉCURISÉE
          Déclenché uniquement pour les images (PDF → nouvel onglet)
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {previewDoc && !isPdf(previewDoc.name) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl max-h-[92vh] flex flex-col"
            >
              {/* ── En-tête modal ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-[#d4af37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{previewDoc.name}</p>
                    <p className="text-gray-400 text-xs">
                      {CATEGORIES[previewDoc.category]?.label ?? "Document"} · {formatSize(previewDoc.size || 0)} · URL expire dans {SIGNED_URL_TTL}s
                    </p>
                  </div>
                </div>
                <button onClick={closePreview} className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-3">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Corps modal ── */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50 min-h-[300px]">

                {/* Chargement URL signée */}
                {isLoadingPreview && (
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Génération de l'URL sécurisée…</p>
                    <p className="text-xs text-gray-400">Connexion au bucket <code className="bg-gray-100 px-1 rounded">{BUCKET}</code></p>
                  </div>
                )}

                {/* Erreur URL signée */}
                {!isLoadingPreview && previewError && (
                  <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[#0a0f1e] font-medium mb-1">Accès refusé</p>
                      <p className="text-sm text-gray-500">{previewError}</p>
                    </div>
                    <button
                      onClick={() => handlePreview(previewDoc)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-[#0a0f1e] rounded-xl text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4" /> Réessayer
                    </button>
                  </div>
                )}

                {/* Image via URL signée */}
                {!isLoadingPreview && !previewError && previewSignedUrl && isImage(previewDoc.name) && (
                  <img
                    src={previewSignedUrl}
                    alt={previewDoc.name}
                    className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"
                    onError={() => setPreviewError("Impossible de charger l'image. L'URL a peut-être expiré.")}
                  />
                )}

                {/* Fallback : format non supporté en aperçu */}
                {!isLoadingPreview && !previewError && previewSignedUrl && !isImage(previewDoc.name) && (
                  <div className="text-center">
                    <FileArchive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Format non prévisualisable.</p>
                    <a
                      href={previewSignedUrl}
                      download={previewDoc.name}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" /> Télécharger
                    </a>
                  </div>
                )}
              </div>

              {/* ── Pied modal ── */}
              {!isLoadingPreview && !previewError && previewSignedUrl && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#d4af37]" />
                    Lien sécurisé · expire dans {SIGNED_URL_TTL} secondes
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={previewSignedUrl}
                      download={previewDoc.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </a>
                    <button
                      onClick={() => handlePreview(previewDoc)}
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
