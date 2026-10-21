// src/app/pages/ClientDocuments.tsx
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Upload,
  FileArchive,
  Filter,
  Loader2,
  IdCard,
  Coins,
  Landmark,
  FolderOpen,
  Download,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import { toast } from "sonner";
import type { Document, DocCategory } from "../../types/database.types";
import { processDocumentForUpload, decryptDocument, type RecipientKeyData } from "../../utils/crypto/documentCrypto";

const BUCKET = "msf-private-docs";
const MAX_SIZE_MB = 25;

const isImage = (name: string) =>
  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name ?? "");
const isPdf = (name: string) => /\.pdf$/i.test(name ?? "");
const safeFilename = (raw: string) => raw.replace(/[^a-zA-Z0-9._\-]/g, "_");
const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1_048_576).toFixed(1) + " Mo";
};

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async (isMounted = true) => {
    if (!authUser || !supabase) return;
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (isMounted) {
        setDocuments(data || []);
      }
    } catch (err) {
      console.error("Erreur de chargement des archives:", err);
    } finally {
      if (isMounted) setIsDataLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDocuments(isMounted);
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleFileUpload = async (file: File) => {
    if (!authUser || !supabase) return;

    if (file.size > MAX_SIZE_MB * 1_048_576) {
      toast.error(`Ce document est trop volumineux (Maximum ${MAX_SIZE_MB} Mo).`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Récupération de la clé E2EE de l'utilisateur
      const { data: clientKey, error: clientKeyErr } = await supabase
        .from("user_public_keys")
        .select("ecdh_pub_key")
        .eq("user_id", authUser.id)
        .single();

      if (clientKeyErr || !clientKey) {
        throw new Error("Vos clés E2EE ne sont pas initialisées. Vous ne pouvez pas chiffrer ce document.");
      }

      setUploadProgress(20);

      // 2. Récupération des administrateurs pour partager l'accès de façon ciblée
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "superadmin"]);

      const adminIds = adminRoles ? adminRoles.map(r => r.user_id) : [];
      let adminKeys: { user_id: string; ecdh_pub_key?: any; ecdh_pub?: any }[] = [];
      
      if (adminIds.length > 0) {
        const { data: keys } = await supabase
          .from("user_public_keys")
          .select("user_id, ecdh_pub_key")
          .in("user_id", adminIds);
        if (keys) adminKeys = keys;
      }

      // 3. Constitution du pool des destinataires
      const clientPubKey = (clientKey as any).ecdh_pub_key || (clientKey as any).ecdh_pub;
      const recipients: RecipientKeyData[] = [
        { recipientId: authUser.id, ecdhPubJwk: clientPubKey }
      ];

      adminKeys.forEach(k => {
        if (k.user_id !== authUser.id) {
          const pubKey = k.ecdh_pub_key || k.ecdh_pub;
          if (pubKey) {
            recipients.push({ recipientId: k.user_id, ecdhPubJwk: pubKey });
          }
        }
      });

      setUploadProgress(30);

      // 4. Chiffrement local via Web Crypto API E2EE
      const encrypted = await processDocumentForUpload(file, recipients);
      setUploadProgress(60);

      // 5. Upload Storage Bucket du BLOB chiffré
      const fname = safeFilename(file.name);
      const storagePath = `${authUser.id}/${docCategory}/${Date.now()}_${fname}`;

      const { data: stored, error: storeErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, encrypted.ciphertextBlob, { upsert: false, contentType: "application/octet-stream" });

      if (storeErr) throw storeErr;
      setUploadProgress(75);

      // 6. Indexation en base de données avec vecteur d'initialisation et signature
      const { data: newDoc, error: dbErr } = await supabase.from("documents").insert({
        user_id: authUser.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: "",
        storage_path: stored.path,
        category: docCategory,
        status: "en_attente",
        iv: encrypted.iv,
        signature: encrypted.signature
      }).select("id").single();

      if (dbErr) throw dbErr;
      setUploadProgress(90);

      // 7. Distribution des clés AES encapsulées à chaque destinataire
      const accessKeysRows = encrypted.accessKeys.map(ak => ({
        document_id: newDoc.id,
        recipient_id: ak.recipientId,
        encrypted_aes_key: ak.encryptedAesKey,
        ephemeral_pub_key: ak.ephemeralPubKey
      }));

      const { error: keysErr } = await supabase.from("document_access_keys").insert(accessKeysRows);
      if (keysErr) throw keysErr;

      setUploadProgress(100);
      toast.success(`"${file.name}" a été chiffré, archivé et sécurisé avec succès.`);
      await fetchDocuments(true);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Échec du chiffrement ou du téléversement du document.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!authUser || !supabase) return;
    
    if (!doc.iv || !doc.signature) {
      toast.error("Ce document n'a pas été chiffré par le protocole E2EE ou est corrompu.");
      return;
    }

    const toastId = toast.loading("Déchiffrement cryptographique en cours...");

    try {
      // 1. Récupérer la clé d'accès (AES enveloppée) du document pour cet utilisateur
      const { data: accessKey, error: accessErr } = await supabase
        .from("document_access_keys")
        .select("*")
        .eq("document_id", doc.id)
        .eq("recipient_id", authUser.id)
        .single();
        
      if (accessErr || !accessKey) throw new Error("Clé d'accès introuvable. Vous n'avez pas l'autorisation.");

      // 2. Récupérer la clé publique ECDSA de l'expéditeur d'origine
      const { data: senderKeys, error: senderErr } = await supabase
        .from("user_public_keys")
        .select("ecdsa_pub_key")
        .eq("user_id", doc.user_id)
        .single();
        
      if (senderErr || !senderKeys) throw new Error("Clé publique de l'expéditeur introuvable.");

      // 3. Télécharger le binaire brut chiffré (Ciphertext)
      const { data: blob, error: downloadErr } = await supabase.storage
        .from(BUCKET)
        .download(doc.storage_path);
        
      if (downloadErr || !blob) throw new Error("Erreur de téléchargement depuis le stockage privé.");

      // 4. Déchiffrement et vérification de la signature ECDSA
      const senderEcdsa = (senderKeys as any).ecdsa_pub_key || (senderKeys as any).ecdsa_pub;
      const ephemeralKey = (accessKey as any).ephemeral_pub_key || (accessKey as any).ephemeral_pub;

      const { fileBlob, isValidSignature } = await decryptDocument(
        blob,
        doc.iv,
        doc.signature,
        senderEcdsa,
        accessKey.encrypted_aes_key,
        ephemeralKey
      );

      if (!isValidSignature) {
        toast.error("ALERTE DE SÉCURITÉ : La signature du document est invalide ! Le fichier a été altéré.", { id: toastId });
        return;
      }

      // 5. Restitution du fichier déchiffré à l'utilisateur
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Document vérifié et déchiffré avec succès.", { id: toastId });
    } catch (err: any) {
      console.error("Échec de déchiffrement:", err);
      toast.error(err.message || "Échec de l'accès au document.", { id: toastId });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-[#0a0f1e] w-full max-w-full overflow-hidden">
      <div className="mb-4 sm:mb-8">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Documents", path: "/client/documents" },
          ]}
        />
        <h1 className="text-2xl sm:text-3xl mt-2 mb-1.5 font-bold tracking-tight">
          Documents Sécurisés
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Stockez et gérez vos justificatifs en toute confidentialité avec chiffrement de bout en bout (E2EE).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Colonne d'ajout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-4">
              Ajouter un document
            </h2>
            <div className="mb-5">
              <label className="text-xs sm:text-sm text-gray-700 font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#d4af37]" />
                Catégorie cible
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {(Object.entries(CATEGORIES) as [DocCategory, any][]).map(
                  ([key, cfg]) => {
                    const Icon = cfg.icon;
                    const active = docCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDocCategory(key)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all text-center h-full min-h-[72px] ${
                          active
                            ? "border-[#d4af37] bg-[#d4af37]/5"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                            active ? "text-[#d4af37]" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                            active ? "text-[#0a0f1e]" : "text-gray-500"
                          }`}
                        >
                          {cfg.label}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragOver
                  ? "border-[#d4af37] bg-[#d4af37]/5"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center py-4 w-full">
                  <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
                  <p className="text-xs font-bold text-[#d4af37] mb-2">
                    Chiffrement & Transfert... {uploadProgress}%
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#d4af37] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 flex-shrink-0">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-bold">
                      Cliquez ou glissez un fichier ici
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-1">
                      Formats PDF, JPG, PNG (Max {MAX_SIZE_MB}Mo)
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* Archives */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
              Mes Archives Sécurisées
            </h2>
            {isDataLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                <p className="text-xs font-medium">
                  Lecture des archives chiffrées...
                </p>
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileArchive}
                title="Aucun document"
                description="Vous n'avez pas encore de document sécurisé."
              />
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileArchive className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm truncate pr-2">
                          {doc.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 capitalize font-medium">
                          {CATEGORIES[doc.category]?.label || doc.category} •{" "}
                          {formatSize(doc.size || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200/60">
                      <span
                        className={`px-2.5 py-1 text-[10px] sm:text-[11px] rounded-full font-bold uppercase border flex-shrink-0 ${
                          doc.status === "approuve"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : doc.status === "rejete"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {doc.status === "approuve"
                          ? "Validé"
                          : doc.status === "rejete"
                            ? "Rejeté"
                            : "En attente"}
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors flex-shrink-0"
                        title="Déchiffrer et télécharger"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
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