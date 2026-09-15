import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { Conversation } from "../../types/database.types";
import { encryptAES } from "../../utils/encryption";
import EncryptedChat from "../components/ui/EncryptedChat";
import Breadcrumb from "../components/Breadcrumb";
import {
  MessageSquare,
  Plus,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FolderLock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ClientMessages() {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modale de création d'une nouvelle conversation
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newFirstMessage, setNewFirstMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: convErr } = await supabase
        .from("conversations")
        .select("*")
        .eq("client_id", user.id)
        .order("updated_at", { ascending: false });

      if (convErr) throw convErr;

      const convList = data || [];
      setConversations(convList);

      // Si aucune sélection et qu'on a des conversations, garder ou présélectionner
      if (convList.length > 0) {
        setSelectedConversation((prev) => {
          if (!prev) return convList[0];
          const found = convList.find((c) => c.id === prev.id);
          return found || convList[0];
        });
      } else {
        setSelectedConversation(null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erreur de chargement des conversations.";
      console.error("Erreur chargement conversations :", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Abonnement Realtime pour la liste des conversations du client
  useEffect(() => {
    if (!supabase || !user?.id) return;

    const channel = supabase
      .channel("client-conversations-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `client_id=eq.${user.id}`,
        },
        () => {
          fetchConversations();
        },
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, fetchConversations]);

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user?.id) return;
    if (!newSubject.trim() || !newFirstMessage.trim()) {
      setCreateError("Veuillez renseigner le sujet et votre premier message.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      // 1. Créer la conversation
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .insert({
          client_id: user.id,
          subject: newSubject.trim(),
          status: "open",
        })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Chiffrer et envoyer le premier message
      const encrypted = encryptAES(newFirstMessage.trim());
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: convData.id,
        sender_id: user.id,
        sender_role: "client",
        content_encrypted: encrypted,
        is_read: false,
      });

      if (msgError) throw msgError;

      setNewSubject("");
      setNewFirstMessage("");
      setIsNewModalOpen(false);

      await fetchConversations();
      setSelectedConversation(convData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la conversation.";
      console.error("Erreur création :", err);
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

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
      {/* HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "Messagerie Sécurisée", path: "/client/messages" },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0f1e] mt-2 flex items-center gap-3">
            <span>Messagerie Sécurisée</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
              <Lock className="w-3.5 h-3.5" />
              AES-256
            </span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Échangez directement et en toute confidentialité avec votre
            conseiller attitré.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#0a0f1e] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle conversation</span>
        </button>
      </div>

      {/* ZONE PRINCIPALE DE MESSAGERIE (SPLIT VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* LISTE DES CONVERSATIONS (COLONNE GAUCHE) */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-lg p-4 flex flex-col ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              <span>Vos échanges ({conversations.length})</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Chargement...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center px-4">
                <FolderLock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">
                  Aucun fil de discussion
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Créez une conversation pour poser vos questions à l'équipe MSF
                  Congo.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                      isSelected
                        ? "bg-amber-50/70 border-[#d4af37] shadow-sm"
                        : "bg-gray-50/70 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          conv.status === "open"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {conv.status === "open" ? "Ouvert" : "Clôturé"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(conv.updated_at || conv.created_at)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#0a0f1e] line-clamp-1">
                      {conv.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#d4af37]" />
                      <span>Échanges chiffrés</span>
                    </p>
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
              {/* Bouton retour mobile pour changer de conversation */}
              <div className="lg:hidden">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a0f1e] font-medium py-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour à la liste des échanges</span>
                </button>
              </div>

              <div className="flex-1 h-[600px]">
                <EncryptedChat
                  conversation={selectedConversation}
                  currentUserId={user?.id || ""}
                  currentUserRole="client"
                  partnerName="Conseiller MSF CONGO"
                />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0f1e]">
                Espace de Messagerie Dédié
              </h3>
              <p className="text-sm text-gray-500 max-w-md mt-1 mb-6">
                Sélectionnez une conversation existante ou créez-en une nouvelle
                pour échanger directement avec nos experts.
              </p>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-5 py-2.5 bg-[#0a0f1e] text-white hover:bg-gray-900 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                <span>Ouvrir un nouveau fil</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALE D'OUVERTURE D'UNE CONVERSATION */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-[#0a0f1e] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-[#0a0f1e] flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      Nouvelle Conversation Sécurisée
                    </h3>
                    <p className="text-xs text-gray-400">
                      Canal chiffré AES-256 avec nos agents
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateConversation}
                className="p-6 space-y-4"
              >
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sujet de votre demande
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Question sur l'acquisition de la Villa Maya"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Votre message initial (chiffré)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Détaillez votre projet, vos questions ou votre disponibilité..."
                    value={newFirstMessage}
                    onChange={(e) => setNewFirstMessage(e.target.value)}
                    className="w-full resize-none p-3.5 text-sm border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none bg-gray-50/50"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                  <span>
                    Votre message sera automatiquement chiffré avant
                    enregistrement dans la base de données.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    disabled={isCreating}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#0a0f1e] font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Initier la conversation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
