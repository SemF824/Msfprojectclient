import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { encryptAES, decryptAES } from "../../../utils/encryption";
import { Conversation, EncryptedMessage } from "../../../types/database.types";
import {
  Send,
  Lock,
  ShieldCheck,
  CheckCheck,
  Check,
  Clock,
  User,
  AlertCircle,
  Archive,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EncryptedChatProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserRole: "client" | "agent" | "admin" | "superadmin";
  partnerName?: string;
  onStatusChange?: (newStatus: "open" | "closed") => Promise<void> | void;
}

export default function EncryptedChat({
  conversation,
  currentUserId,
  currentUserRole,
  partnerName = "Conseiller MSF",
  onStatusChange,
}: EncryptedChatProps) {
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStaff = currentUserRole !== "client";

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const markMessagesAsRead = useCallback(async () => {
    if (!supabase || !conversation.id || !currentUserId) return;
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", currentUserId)
        .eq("is_read", false);
    } catch (err) {
      console.error(
        "Erreur lors de la mise à jour des accusés de lecture :",
        err,
      );
    }
  }, [conversation.id, currentUserId]);

  // Chargement initial des messages
  const fetchMessages = useCallback(async () => {
    if (!supabase || !conversation.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      const decryptedList: EncryptedMessage[] = (data || []).map((msg) => ({
        ...msg,
        decrypted_content: decryptAES(msg.content_encrypted),
      }));

      setMessages(decryptedList);
      setTimeout(() => scrollToBottom(false), 50);
      await markMessagesAsRead();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur de chargement des messages.";
      console.error("Erreur chargement messages :", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversation.id, markMessagesAsRead, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Abonnement Realtime Supabase
  useEffect(() => {
    if (!supabase || !conversation.id) return;

    const channel = supabase
      .channel(`chat-conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as EncryptedMessage;
          const decryptedMsg: EncryptedMessage = {
            ...newMsg,
            decrypted_content: decryptAES(newMsg.content_encrypted),
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === decryptedMsg.id)) return prev;
            return [...prev, decryptedMsg];
          });

          if (newMsg.sender_id !== currentUserId) {
            markMessagesAsRead();
          }

          setTimeout(() => scrollToBottom(true), 50);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const updatedMsg = payload.new as EncryptedMessage;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id
                ? {
                    ...msg,
                    is_read: updatedMsg.is_read,
                    decrypted_content:
                      msg.decrypted_content ||
                      decryptAES(updatedMsg.content_encrypted),
                  }
                : msg,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversation.id, currentUserId, markMessagesAsRead, scrollToBottom]);

  // Envoi d'un message chiffré
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || sending || !supabase) return;

    if (conversation.status === "closed") {
      setError(
        "Cette conversation est clôturée. Vous ne pouvez plus envoyer de message.",
      );
      return;
    }

    setSending(true);
    setError(null);

    try {
      const encrypted = encryptAES(cleanText);

      const { data, error: insertErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          sender_role: currentUserRole,
          content_encrypted: encrypted,
          is_read: false,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Mise à jour de l'horodatage de la conversation
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);

      setInputText("");

      if (data) {
        const addedMsg: EncryptedMessage = {
          ...data,
          decrypted_content: cleanText,
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === addedMsg.id)) return prev;
          return [...prev, addedMsg];
        });
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi du message.";
      console.error("Erreur envoi message :", err);
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "client":
        return "Client";
      case "agent":
        return "Conseiller MSF";
      case "admin":
        return "Administrateur";
      case "superadmin":
        return "Direction MSF";
      default:
        return "Interlocuteur";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* HEADER DU CHAT */}
      <div className="bg-[#0a0f1e] text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] flex items-center justify-center text-[#0a0f1e] font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-base">
                {partnerName}
              </h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                  conversation.status === "open"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-gray-700 text-gray-300 border border-gray-600"
                }`}
              >
                {conversation.status === "open" ? "En cours" : "Clôturée"}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-xs md:max-w-md">
              Sujet : {conversation.subject}
            </p>
          </div>
        </div>

        {/* BADGE DE CHIFFREMENT ET ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256 Chiffré</span>
          </div>

          {isStaff && onStatusChange && (
            <button
              onClick={() =>
                onStatusChange(
                  conversation.status === "open" ? "closed" : "open",
                )
              }
              className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition-colors flex items-center gap-1.5"
              title={
                conversation.status === "open"
                  ? "Clôturer le fil"
                  : "Rouvrir la conversation"
              }
            >
              <Archive className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden md:inline">
                {conversation.status === "open" ? "Clôturer" : "Rouvrir"}
              </span>
            </button>
          )}

          <button
            onClick={fetchMessages}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Rafraîchir les messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BANNIÈRE D'INFORMATION DE SÉCURITÉ */}
      <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
          <span>
            Les échanges au sein de cette session sont chiffrés de bout en bout.
            Aucun intermédiaire ne peut lire vos données en clair.
          </span>
        </div>
      </div>

      {/* ZONE CENTRALE DE DÉFILEMENT DES MESSAGES */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50 to-gray-50 min-h-[350px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500 font-medium">
                Déchiffrement sécurisé en cours...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center mb-3">
              <Lock className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h4 className="text-base font-semibold text-[#0a0f1e] mb-1">
              Canal de discussion privé ouvert
            </h4>
            <p className="text-xs text-gray-500 max-w-sm">
              Initiez la conversation. Vos messages seront automatiquement
              sécurisés et chiffrés avec la clé AES-256 de MSF CONGO.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`text-[10px] mb-1 font-medium text-gray-500 flex items-center gap-1 ${
                      isMe ? "pr-1" : "pl-1"
                    }`}
                  >
                    <span>{isMe ? "Vous" : getRoleLabel(msg.sender_role)}</span>
                    <span>•</span>
                    <span>{formatMessageTime(msg.created_at)}</span>
                  </div>

                  <div
                    className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                      isMe
                        ? "bg-[#0a0f1e] text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.decrypted_content || "Message chiffré illisible"}
                    </p>

                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      <Lock className="w-2.5 h-2.5 opacity-60" />
                      {isMe && (
                        <span>
                          {msg.is_read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE DE SAISIE */}
      <div className="p-4 bg-white border-t border-gray-200">
        {conversation.status === "closed" ? (
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-xl text-center text-xs text-gray-600 font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Cette conversation a été clôturée. Pour reprendre contact, ouvrez
              une nouvelle demande.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Écrivez votre message chiffré... (Entrée pour envoyer)"
                rows={2}
                disabled={sending}
                className="w-full resize-none p-3 pr-10 text-sm border border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder:text-gray-400 bg-gray-50/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div
                className="absolute right-3 bottom-3 text-gray-400"
                title="Chiffrement matériel AES-256 actif"
              >
                <Lock className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="h-[54px] px-5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#0a0f1e] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Envoyer</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
