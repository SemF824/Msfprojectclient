import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Plus, Search, Filter, Edit2, Trash2,
  X, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  Bed, Bath, Maximize, Tag, MapPin, DollarSign
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  type?: string;
  tag?: string;
  status?: string;
  created_at: string;
}

type FormData = Omit<Property, "id" | "created_at">;

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const STATUS_STYLES: Record<string, string> = {
  disponible: "bg-green-100 text-green-700 border-green-200",
  reserve:    "bg-amber-100 text-amber-700 border-amber-200",
  vendu:      "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reserve:    "Réservé",
  vendu:      "Vendu",
};

const EMPTY_FORM: FormData = {
  title: "", location: "", price: 0,
  image: "", beds: undefined, baths: undefined,
  sqft: undefined, type: "villa", tag: "", status: "disponible",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function PropertiesManagement() {
  const { userRole } = useSupabaseAuth();

  const [properties,    setProperties]    = useState<Property[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [searchText,    setSearchText]    = useState("");
  const [filterType,    setFilterType]    = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [page,          setPage]          = useState(0);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingProp,   setEditingProp]   = useState<Property | null>(null);
  const [formData,      setFormData]      = useState<FormData>(EMPTY_FORM);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [toast,         setToast]         = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      if (!supabase) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (isMounted) {
        if (!error) setProperties(data || []);
        setIsLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtres côté client ────────────────────────────────────────────────────
  const filtered = properties.filter(p => {
    const matchSearch = !searchText || p.title?.toLowerCase().includes(searchText.toLowerCase()) || p.location?.toLowerCase().includes(searchText.toLowerCase());
    const matchType   = filterType === "all"   || p.type === filterType;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProp(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditingProp(p);
    setFormData({
      title: p.title, location: p.location, price: p.price,
      image: p.image || "", beds: p.beds, baths: p.baths,
      sqft: p.sqft, type: p.type || "villa", tag: p.tag || "",
      status: p.status || "disponible",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProp(null); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsSubmitting(true);

    const payload = {
      title:    formData.title,
      location: formData.location,
      price:    Number(formData.price),
      image:    formData.image || null,
      beds:     formData.beds  ? Number(formData.beds)  : null,
      baths:    formData.baths ? Number(formData.baths) : null,
      sqft:     formData.sqft  ? Number(formData.sqft)  : null,
      type:     formData.type,
      tag:      formData.tag || null,
      status:   formData.status,
    };

    if (editingProp) {
      const { error } = await supabase.from("properties").update(payload).eq("id", editingProp.id);
      if (error) { showToast("err", "Erreur : " + error.message); }
      else {
        setProperties(ps => ps.map(p => p.id === editingProp.id ? { ...p, ...payload } : p));
        showToast("ok", "Propriété mise à jour.");
        closeModal();
      }
    } else {
      const { data, error } = await supabase.from("properties").insert(payload).select().single();
      if (error) { showToast("err", "Erreur : " + error.message); }
      else {
        setProperties(ps => [data, ...ps]);
        showToast("ok", "Propriété ajoutée.");
        closeModal();
      }
    }
    setIsSubmitting(false);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (p: Property) => {
    if (!window.confirm(`Supprimer "${p.title}" ?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from("properties").delete().eq("id", p.id);
    if (!error) {
      setProperties(ps => ps.filter(x => x.id !== p.id));
      showToast("ok", `"${p.title}" supprimée.`);
    } else {
      showToast("err", "Erreur : " + error.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
              toast.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Catalogue Propriétés</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} propriété{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
        >
          <Plus className="w-5 h-5" /> Ajouter une propriété
        </button>
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, localisation…"
            value={searchText}
            onChange={e => { setSearchText(e.target.value); resetPage(); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); resetPage(); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
        >
          <option value="all">Tous les types</option>
          <option value="villa">Villa</option>
          <option value="appartement">Appartement</option>
          <option value="terrain">Terrain</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); resetPage(); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="reserve">Réservé</option>
          <option value="vendu">Vendu</option>
        </select>
      </div>

      {/* ── Grille ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <Building2 className="w-16 h-16 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucune propriété trouvée</p>
          <p className="text-gray-400 text-sm">Modifiez vos filtres ou ajoutez une propriété.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#d4af37]/30 transition-all group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                {p.status && (
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                )}
                {p.tag && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/90 text-[#0a0f1e]">
                    {p.tag}
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="p-4">
                <p className="text-[#0a0f1e] font-semibold text-sm truncate mb-1">{p.title}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{p.location}</span>
                </div>
                <p className="text-[#d4af37] font-bold text-sm mb-3">
                  {new Intl.NumberFormat("fr-FR").format(p.price)} FCFA
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  {p.beds  && <span className="flex items-center gap-1"><Bed      className="w-3 h-3" />{p.beds} ch.</span>}
                  {p.baths && <span className="flex items-center gap-1"><Bath     className="w-3 h-3" />{p.baths} sdb.</span>}
                  {p.sqft  && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{p.sqft} m²</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#0a0f1e] rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modifier
                  </button>
                  {userRole === "superadmin" && (
                    <button
                      onClick={() => handleDelete(p)}
                      className="flex items-center justify-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:border-[#d4af37] text-gray-600 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:border-[#d4af37] text-gray-600 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════ MODAL AJOUT / ÉDITION ══════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540]">
                <h2 className="text-white font-semibold">{editingProp ? "Modifier la propriété" : "Ajouter une propriété"}</h2>
                <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corps modal */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Titre <span className="text-red-500">*</span></label>
                    <input
                      required value={formData.title}
                      onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Villa Prestige Tchikobo"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="villa">Villa</option>
                      <option value="appartement">Appartement</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Localisation <span className="text-red-500">*</span></label>
                    <input
                      required value={formData.location}
                      onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Tchikobo, Brazzaville"
                    />
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Prix FCFA <span className="text-red-500">*</span></label>
                    <input
                      required type="number" min="0" value={formData.price || ""}
                      onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="150000000"
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Statut</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                      <option value="vendu">Vendu</option>
                    </select>
                  </div>

                  {/* Chambres */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Chambres</label>
                    <input
                      type="number" min="0" value={formData.beds ?? ""}
                      onChange={e => setFormData(f => ({ ...f, beds: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="4"
                    />
                  </div>

                  {/* Salles de bain */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Salles de bain</label>
                    <input
                      type="number" min="0" value={formData.baths ?? ""}
                      onChange={e => setFormData(f => ({ ...f, baths: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="3"
                    />
                  </div>

                  {/* Surface */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Surface m²</label>
                    <input
                      type="number" min="0" value={formData.sqft ?? ""}
                      onChange={e => setFormData(f => ({ ...f, sqft: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="350"
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Tag (badge)</label>
                    <input
                      value={formData.tag ?? ""}
                      onChange={e => setFormData(f => ({ ...f, tag: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Coup de cœur"
                    />
                  </div>

                  {/* URL image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">URL Image (optionnel)</label>
                    <input
                      type="url" value={formData.image ?? ""}
                      onChange={e => setFormData(f => ({ ...f, image: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button" onClick={closeModal}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…
                      </span>
                    ) : editingProp ? "Enregistrer" : "Ajouter"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
