import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Upload, FileArchive, Filter, Loader2, IdCard, Coins, Landmark, FolderOpen } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import type { Document, DocCategory } from "../../types/database.types";

const BUCKET = "msf-private-docs";
const MAX_SIZE_MB = 10;
const PDF_MAX_MB = 15;

const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name ?? "");
const isPdf = (name: string) => /\.pdf$/i.test(name ?? "");
const safeFilename = (raw: string) => raw.replace(/[^a-zA-Z0-9._\-]/g, "_");
const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "application/pdf", 
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const CATEGORIES: Record<DocCategory, any> = {
  identity: { label: "Pièce d'Identité", icon: IdCard },
  finance: { label: "Justificatifs Financiers", icon: Coins },
  land_title: { label: "Documents Fonciers", icon: Landmark },
  other: { label: "Autres Documents", icon: FolderOpen },
};

export default function ClientDocuments() {
  const { user: authUser } = useSupabaseAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docCategory, setDocCategory] = useState<DocCategory>("other");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!authUser || !supabase) return;
    const { data } = await supabase.from("documents").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => { fetchDocuments(); }, [authUser]);

  const handleFileUpload = async (file: File) => {
    if (!authUser || !supabase) return;
    setUploadError(null);
    
    if (isPdf(file.name) && file.size > PDF_MAX_MB * 1_048_576) return setUploadError("Ce document PDF est trop lourd.");
    if (!isImage(file.name) && !isPdf(file.name) && file.size > MAX_SIZE_MB * 1_048_576) return setUploadError(`Max ${MAX_SIZE_MB} Mo.`);
    
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const fname = safeFilename(file.name);
      const storagePath = `${authUser.id}/${docCategory}/${Date.now()}_${fname}`;
      
      const { data: stored, error: storeErr } = await supabase.storage.from(BUCKET).upload(storagePath, file, { upsert: false, contentType: file.type });
      if (storeErr) throw storeErr;
      
      setUploadProgress(70);

      const { error: dbErr } = await supabase.from("documents").insert({
        user_id: authUser.id, name: file.name, type: file.type, size: file.size, url: "", storage_path: stored.path, category: docCategory,
      });
      if (dbErr) throw dbErr;

      setUploadProgress(100);
      await fetchDocuments();
      setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 1500);
    } catch (err: any) {
      setUploadError(err?.message || "Erreur d'envoi");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { handleFileUpload(file); e.target.value = ""; } };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "Dashboard", path: "/client/dashboard" }, { label: "Documents", path: "/client/documents" }]} />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Documents Sécurisés</h1>
        <p className="text-gray-600">Stockez et gérez vos documents en toute confidentialité.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <h2 className="text-lg text-[#0a0f1e] font-semibold mb-4">Ajouter un document</h2>
            <div className="mb-5">
              <label className="block text-sm text-gray-700 font-medium mb-3 flex items-center gap-2"><Filter className="w-4 h-4 text-[#d4af37]" />Catégorie</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(CATEGORIES) as [DocCategory, any][]).map(([key, cfg]) => {
                  const Icon = cfg.icon; const active = docCategory === key;
                  return (
                    <button key={key} type="button" onClick={() => setDocCategory(key)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${active ? "border-[#d4af37] bg-[#d4af37]/10" : "border-gray-200 hover:bg-gray-50"}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                      <span className={`text-[10px] font-bold ${active ? 'text-[#0a0f1e]' : 'text-gray-600'}`}>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleDrop} onClick={() => !isUploading && fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${isDragOver ? "border-[#d4af37] bg-[#d4af37]/5" : "border-gray-300 hover:bg-gray-50"}`}>
              {isUploading ? (
                <div className="flex flex-col items-center">
                   <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-2" />
                   <p className="text-sm font-bold text-[#d4af37]">Envoi... {uploadProgress}%</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><Upload className="w-6 h-6 text-gray-500" /></div>
                  <p className="text-sm text-gray-900 font-bold text-center">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-gray-500 font-medium text-center">PDF, JPG, PNG (Max {MAX_SIZE_MB}Mo)</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleFileInput} className="hidden" />
            </div>
            {uploadError && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center font-semibold">{uploadError}</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <h2 className="text-lg text-[#0a0f1e] font-semibold mb-6">Mes Archives</h2>
            {documents.length === 0 ? (
              <EmptyState icon={FileArchive} title="Aucun document" description="Vous n'avez pas encore de document sécurisé." />
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                   <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37]/40 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                         <FileArchive className="w-5 h-5 text-[#d4af37]" />
                       </div>
                       <div>
                         <p className="text-[#0a0f1e] font-bold text-sm">{doc.name}</p>
                         <p className="text-xs text-gray-500 mt-0.5 capitalize font-medium">{CATEGORIES[doc.category]?.label || doc.category} • {formatSize(doc.size || 0)}</p>
                       </div>
                     </div>
                     <span className={`px-3 py-1 text-[10px] rounded-full font-bold uppercase border ${doc.status === 'approuve' ? 'bg-green-100 text-green-700 border-green-200' : doc.status === 'rejete' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {doc.status === 'approuve' ? 'Validé' : doc.status === 'rejete' ? 'Rejeté' : 'En attente'}
                     </span>
                   </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}