import { useState, useEffect, useCallback } from "react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { Conversation } from "../../types/database.types";
import { encryptChatMessage } from "../../utils/crypto/messageCrypto";
import type { RecipientKeyData } from "../../utils/crypto/documentCrypto";
import EncryptedChat from "../components/ui/EncryptedChat";
import Breadcrumb from "../components/Breadcrumb";
import {
  MessageSquare,
  Plus,
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  FolderLock,
  X,
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
      // 1. Récupérer les clés publiques des destinataires (client + admins)
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "superadmin"]);

      const recipientIds = new Set<string>([user.id]);
      (adminRoles || []).forEach((r) => recipientIds.add(r.user_id));

      const { data: publicKeys, error: keyErr } = await supabase
        .from("user_public_keys")
        .select("user_id, ecdh_pub")
        .in("user_id", Array.from(recipientIds));

      if (keyErr || !publicKeys || publicKeys.length === 0) {
        throw new Error("Clés publiques introuvables. Initialisation de sécurité requise.");
      }

      const recipients: RecipientKeyData[] = publicKeys.map((k) => ({
        recipientId: k.user_id,
        ecdhPubJwk: k.ecdh_pub,
      }));

      // 2. Chiffrer et signer le premier message
      const encrypted = await encryptChatMessage(newFirstMessage.trim(), recipients);

      // 3. Créer la conversation
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

      // 4. Insérer le message chiffré
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: convData.id,
          sender_id: user.id,
          sender_role: "client",
          content_encrypted: encrypted.ciphertext,
          iv: encrypted.iv,
          signature: encrypted.signature,
          is_read: false,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // 5. Distribuer les clés d'accès
      const accessKeyRows = encrypted.accessKeys.map((ak) => ({
        message_id: msgData.id,
        recipient_id: ak.recipientId,
        encrypted_aes_key: ak.encryptedAesKey,
        ephemeral_pub: ak.ephemeralPubKey,
      }));

      const { error: accessKeysErr } = await supabase
        .from("message_access_keys")
        .insert(accessKeyRows);

      if (accessKeysErr) throw accessKeysErr;

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
          <h1 className="text-2xl sm:text-3xl mt-2 mb-1.5 font-bold tracking-tight text-[#0a0f1e]">
            Messagerie Confidentielle
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            Échanges protégés par chiffrement de bout en bout (NIST P-256 + ECDSA).
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c29f30] text-[#0a0f1e] font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle conversation
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] h-[calc(100vh-250px)]">
        {/* LISTE DES CONVERSATIONS */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-base text-[#0a0f1e] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              Mes échanges
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {conversations.length} discussion(s)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Chargement de vos conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-3">
                <FolderLock className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-medium">Aucune conversation active.</p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="text-xs font-bold text-[#d4af37] hover:underline"
                >
                  Démarrer un échange
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-[#d4af37]/10 border-l-4 border-[#d4af37]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#0a0f1e] truncate max-w-[180px]">
                        {conv.subject}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatDate(conv.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          conv.status === "open"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {conv.status === "open" ? "Ouvert" : "Clôturé"}
                      </span>
                      <Lock className="w-3 h-3 text-gray-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT VIEW */}
        <div
          className={`lg:col-span-8 h-full flex flex-col ${
            !selectedConversation ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              <div className="lg:hidden mb-2">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour aux conversations
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <EncryptedChat
                  conversation={selectedConversation}
                  currentUserId={user?.id || ""}
                  currentUserRole="client"
                  partnerName={selectedConversation.agent_name || "Conseiller MSF"}
                />
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="font-bold text-base text-gray-700 mb-1">
                Aucune conversation sélectionnée
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Sélectionnez une discussion à gauche pour afficher les messages sécurisés ou commencez un nouvel échange.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODALE DE NOUVELLE CONVERSATION */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-lg text-[#0a0f1e] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Nouvelle conversation chiffrée
                </h3>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateConversation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sujet de votre demande
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Ex: Renseignements acquisition Villa Palmier"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Votre message initial
                  </label>
                  <textarea
                    value={newFirstMessage}
                    onChange={(e) => setNewFirstMessage(e.target.value)}
                    placeholder="Détaillez votre message confidentiel ici..."
                    rows={4}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 text-xs font-bold text-[#0a0f1e] bg-[#d4af37] hover:bg-[#c29f30] rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isCreating ? "Chiffrement en cours..." : "Créer et Chiffrer"}
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