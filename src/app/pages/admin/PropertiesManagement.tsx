import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize,
  MapPin,
  ArrowUp,
  ArrowDown,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { supabase, useSupabaseAuth } from "../../../hooks/useSupabaseAuth";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image?: string;
  images?: string[]; // Peut contenir des URLs simples ou des JSON sérialisés {url, description}
  description?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  type?: string;
  tag?: string;
  status?: string;
  created_at: string;
}

interface PropertyImage {
  url: string;
  description: string;
}

type FormData = Omit<Property, "id" | "created_at" | "images"> & {
  images: PropertyImage[];
};

// Utilitaires de parsing sécurisé pour les images
const parseImage = (img: string): PropertyImage => {
  try {
    const parsed = JSON.parse(img);
    if (parsed && typeof parsed === "object" && parsed.url) {
      return { url: parsed.url, description: parsed.description || "" };
    }
  } catch {
    // Ignore error, it's a plain URL
  }
  return { url: img, description: "" };
};

const serializeImages = (imgs: PropertyImage[]): string[] => {
  return imgs.map((img) => JSON.stringify(img));
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const STATUS_STYLES: Record<string, string> = {
  disponible: "bg-green-100 text-green-700 border-green-200",
  reserve: "bg-amber-100 text-amber-700 border-amber-200",
  vendu: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reserve: "Réservé",
  vendu: "Vendu",
};

const EMPTY_FORM: FormData = {
  title: "",
  location: "",
  price: 0,
  image: "",
  images: [],
  description: "",
  beds: undefined,
  baths: undefined,
  sqft: undefined,
  type: "villa",
  tag: "",
  status: "disponible",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function PropertiesManagement() {
  const { isAdmin, userRole } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Téléversement d'image depuis l'ordinateur (sélection multiple d'images supportée)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!supabase) {
      toast.error("Client Supabase non initialisé.");
      return;
    }

    setIsUploadingImage(true);
    let uploadedCount = 0;
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`Le fichier "${file.name}" n'est pas une image valide.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`L'image "${file.name}" dépasse 5 Mo.`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("client-documents") // Utilisation du bucket public existant et autorisé "client-documents"
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Erreur d'envoi pour ${file.name}:`, uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("client-documents").getPublicUrl(filePath);

        newUrls.push(publicUrl);
        uploadedCount++;
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          image: prev.image ? prev.image : newUrls[0],
          images: [
            ...(prev.images || []),
            ...newUrls.map((url) => ({ url, description: "" })),
          ],
        }));
        toast.success(`${uploadedCount} image(s) téléversée(s) avec succès !`);
      }
    } catch (err: any) {
      console.error("[ImageUpload] Erreur :", err);
      toast.error(
        `Échec du téléversement : ${err.message || "Erreur inconnue"}`,
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ── Fetch avec React Query ──────────────────────────────────────────────────
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // ── Mutations avec React Query ──────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: async (payload: Partial<Property> & { id?: string }) => {
      if (!supabase) throw new Error("Non connecté");

      if (payload.id) {
        const { id, ...updateData } = payload;
        const { error } = await supabase
          .from("properties")
          .update(updateData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("properties")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["featured-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      toast.success(
        editingProp ? "Propriété mise à jour." : "Nouvelle propriété ajoutée.",
      );
      closeModal();
    },
    onError: (err: any) => {
      toast.error(`Échec de l'opération : ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Non connecté");

      // 1. Nettoyage préventif des dépendances de clés étrangères
      try {
        await supabase.from("favorites").delete().eq("property_id", id);
      } catch (favErr) {
        console.warn(
          "[PropertiesManagement] Nettoyage favoris associé:",
          favErr,
        );
      }

      // 2. Suppression de la propriété
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimisation cache instantanée
      queryClient.setQueryData(
        ["admin-properties"],
        (old: Property[] | undefined) =>
          old ? old.filter((p) => p.id !== deletedId) : [],
      );
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["featured-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      toast.success("Propriété supprimée avec succès du catalogue.");
    },
    onError: (err: any) => {
      toast.error(
        `Erreur de suppression : ${err.message || "Opération impossible"}`,
      );
    },
  });

  // ── Filtres côté client (Mémoïsés) ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        !searchText ||
        p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchText.toLowerCase());
      const matchType = filterType === "all" || p.type === filterType;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [properties, searchText, filterType, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
      title: p.title,
      location: p.location,
      price: p.price,
      image: p.image || "",
      images: (p.images || []).map(parseImage),
      description: p.description || "",
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      type: p.type || "villa",
      tag: p.tag || "",
      status: p.status || "disponible",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProp(null);
  };

  // Actions sur les images
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...(formData.images || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setFormData((f) => ({ ...f, images: newImages }));
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    const removedImg = newImages.splice(index, 1)[0];

    setFormData((f) => ({
      ...f,
      images: newImages,
      // Si on supprime l'image principale, on en prend une autre ou on vide
      image: f.image === removedImg.url ? newImages[0]?.url || "" : f.image,
    }));
  };

  const updateImageDescription = (index: number, description: string) => {
    const newImages = [...(formData.images || [])];
    if (newImages[index]) {
      newImages[index] = { ...newImages[index], description };
      setFormData((f) => ({ ...f, images: newImages }));
    }
  };

  const setAsMainImage = (url: string) => {
    setFormData((f) => ({ ...f, image: url }));
    toast.success("Image principale mise à jour.");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Property> & { id?: string } = {
      ...(editingProp ? { id: editingProp.id } : {}),
      title: formData.title,
      location: formData.location,
      price: Number(formData.price),
      image: formData.image ? formData.image : undefined,
      images: serializeImages(formData.images || []),
      description: formData.description || "",
      beds: formData.beds ? Number(formData.beds) : undefined,
      baths: formData.baths ? Number(formData.baths) : undefined,
      sqft: formData.sqft ? Number(formData.sqft) : undefined,
      type: formData.type,
      tag: formData.tag ? formData.tag : undefined,
      status: formData.status,
    };

    upsertMutation.mutate(payload);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (p: Property) => {
    if (!window.confirm(`Supprimer définitivement "${p.title}" du catalogue ?`))
      return;
    deleteMutation.mutate(p.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">
            Catalogue Propriétés
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} propriété{filtered.length !== 1 ? "s" : ""}{" "}
            trouvée{filtered.length !== 1 ? "s" : ""}
          </p>
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
            onChange={(e) => {
              setSearchText(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            resetPage();
          }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
        >
          <option value="all">Tous les types</option>
          <option value="villa">Villa</option>
          <option value="appartement">Appartement</option>
          <option value="terrain">Terrain</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            resetPage();
          }}
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
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
            >
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
          <p className="text-gray-400 text-sm">
            Modifiez vos filtres ou ajoutez une propriété.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#d4af37]/30 transition-all group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                {p.status && (
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                  >
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
                <p className="text-[#0a0f1e] font-semibold text-sm truncate mb-1">
                  {p.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{p.location}</span>
                </div>
                <p className="text-[#d4af37] font-bold text-sm mb-3">
                  {new Intl.NumberFormat("fr-FR").format(p.price)} FCFA
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  {p.beds && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {p.beds} ch.
                    </span>
                  )}
                  {p.baths && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {p.baths} sdb.
                    </span>
                  )}
                  {p.sqft && (
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3 h-3" />
                      {p.sqft} m²
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#0a0f1e] rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modifier
                  </button>
                  {(isAdmin ||
                    userRole === "admin" ||
                    userRole === "superadmin") && (
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleteMutation.isPending}
                      title="Supprimer la propriété"
                      className="flex items-center justify-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
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
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:border-[#d4af37] text-gray-600 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540]">
                <h2 className="text-white font-semibold">
                  {editingProp
                    ? "Modifier la propriété"
                    : "Ajouter une propriété"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corps modal */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, title: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Villa Prestige Tchikobo"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, type: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="villa">Villa</option>
                      <option value="appartement">Appartement</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Localisation <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, location: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Tchikobo, Brazzaville"
                    />
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Prix FCFA <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="150000000"
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, status: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                      <option value="vendu">Vendu</option>
                    </select>
                  </div>

                  {/* Chambres */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Chambres
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.beds ?? ""}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          beds: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="4"
                    />
                  </div>

                  {/* Salles de bain */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Salles de bain
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baths ?? ""}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          baths: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="3"
                    />
                  </div>

                  {/* Surface */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Surface m²
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sqft ?? ""}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          sqft: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="350"
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Tag (badge)
                    </label>
                    <input
                      value={formData.tag ?? ""}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, tag: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                      placeholder="Coup de cœur"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none resize-none"
                      placeholder="Décrivez les atouts de cette propriété en détail..."
                    />
                  </div>

                  {/* Gestion des Images */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm text-gray-700 font-bold">
                        Galerie Photos
                      </label>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-lg cursor-pointer transition-colors text-xs font-bold">
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter des photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {isUploadingImage && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Téléversement en cours...
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(formData.images || []).map((img, index) => {
                        const url = img.url;
                        const isMain = formData.image === url;
                        return (
                          <div
                            key={index}
                            className={`group flex flex-col bg-white rounded-xl overflow-hidden border-2 transition-all ${
                              isMain
                                ? "border-[#d4af37] ring-2 ring-[#d4af37]/20"
                                : "border-gray-100 hover:border-[#d4af37]/50"
                            }`}
                          >
                            <div className="relative aspect-video">
                              <img
                                src={url}
                                alt={`Propriété ${index}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Overlay d'actions */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-between items-start">
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  {!isMain && (
                                    <button
                                      type="button"
                                      onClick={() => setAsMainImage(url)}
                                      className="p-1.5 bg-white/90 hover:bg-white text-[#0a0f1e] rounded-lg transition-colors shadow-lg"
                                      title="Définir comme principale"
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex justify-center gap-2">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => moveImage(index, "up")}
                                    className="p-1.5 bg-white/90 hover:bg-white text-[#0a0f1e] rounded-lg transition-colors shadow-lg disabled:opacity-50"
                                    title="Reculer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      index ===
                                      (formData.images?.length || 0) - 1
                                    }
                                    onClick={() => moveImage(index, "down")}
                                    className="p-1.5 bg-white/90 hover:bg-white text-[#0a0f1e] rounded-lg transition-colors shadow-lg disabled:opacity-50"
                                    title="Avancer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                                  </button>
                                </div>
                              </div>

                              {isMain && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#d4af37] text-[#0a0f1e] text-[8px] font-black uppercase rounded shadow-sm">
                                  Principale
                                </div>
                              )}
                            </div>

                            {/* Zone description */}
                            <div className="p-2 border-t border-gray-100">
                              <input
                                type="text"
                                placeholder="Description (ex: Salon lumineux)"
                                value={img.description}
                                onChange={(e) =>
                                  updateImageDescription(index, e.target.value)
                                }
                                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}

                      {(!formData.images || formData.images.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-gray-400">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs">Aucune photo téléversée</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={upsertMutation.isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 text-sm"
                  >
                    {upsertMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Enregistrement…
                      </span>
                    ) : editingProp ? (
                      "Enregistrer"
                    ) : (
                      "Ajouter"
                    )}
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
