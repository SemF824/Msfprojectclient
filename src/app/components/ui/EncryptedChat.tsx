import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { Conversation, EncryptedMessage } from "../../../types/database.types";
import { encryptChatMessage, decryptChatMessage } from "../../../utils/crypto/messageCrypto";
import { RecipientKeyData } from "../../../utils/crypto/documentCrypto";
import {
  Send,
  ShieldCheck,
  CheckCheck,
  Check,
  User,
  RefreshCw,
  Lock,
} from "lucide-react";

interface EncryptedChatProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserRole: "client" | "agent" | "admin" | "superadmin";
  partnerName?: string;
  onStatusChange?: (
    newStatus: "open" | "closed" | "archived",
  ) => Promise<void> | void;
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
      console.error("Erreur lors de la mise à jour des accusés de lecture :", err);
    }
  }, [conversation.id, currentUserId]);

  const decryptMessageRow = async (
    msg: any,
    accessKeyMap: Record<string, any>,
    publicKeysMap: Record<string, any>
  ): Promise<EncryptedMessage> => {
    const accessKey = accessKeyMap[msg.id];
    const senderPubKey = publicKeysMap[msg.sender_id];

    if (!msg.iv || !msg.signature || !accessKey || !senderPubKey) {
      const { text } = await decryptChatMessage(msg.content_encrypted);
      return {
        ...msg,
        decrypted_content: text,
        is_verified: false,
      };
    }

    try {
      const senderEcdsaPub = senderPubKey.ecdsa_pub_key || senderPubKey.ecdsa_pub;
      const { text, isValidSignature } = await decryptChatMessage(
        msg.content_encrypted,
        msg.iv,
        msg.signature,
        senderEcdsaPub,
        accessKey.encrypted_aes_key,
        accessKey.ephemeral_pub
      );
      return {
        ...msg,
        decrypted_content: text,
        is_verified: isValidSignature,
      };
    } catch {
      return {
        ...msg,
        decrypted_content: "[Impossible de déchiffrer ce message]",
        is_verified: false,
      };
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!supabase || !conversation.id) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Récupération des messages
      const { data: rawMessages, error: fetchErr } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      const messageList = rawMessages || [];
      if (messageList.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const messageIds = messageList.map((m) => m.id);
      const senderIds = Array.from(new Set(messageList.map((m) => m.sender_id)));

      // 2. Clés d'accès de l'utilisateur connecté
      const { data: accessKeys } = await supabase
        .from("message_access_keys")
        .select("*")
        .in("message_id", messageIds)
        .eq("recipient_id", currentUserId);

      const accessKeyMap: Record<string, any> = {};
      (accessKeys || []).forEach((ak) => {
        accessKeyMap[ak.message_id] = ak;
      });

      // 3. Clés publiques des expéditeurs
      const { data: publicKeys } = await supabase
        .from("user_public_keys")
        .select("user_id, ecdsa_pub_key")
        .in("user_id", senderIds);

      const publicKeysMap: Record<string, any> = {};
      (publicKeys || []).forEach((pk) => {
        publicKeysMap[pk.user_id] = pk;
      });

      // 4. Déchiffrement local
      const decryptedList = await Promise.all(
        messageList.map((m) => decryptMessageRow(m, accessKeyMap, publicKeysMap))
      );

      setMessages(decryptedList);
      setTimeout(() => scrollToBottom(false), 50);
      await markMessagesAsRead();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement des messages.";
      console.error("Erreur chargement messages :", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [conversation.id, currentUserId, markMessagesAsRead, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Écoute des nouveaux messages Realtime
  useEffect(() => {
    if (!supabase || !conversation.id) return;
    const client = supabase;

    const channel = client
      .channel(`chat-conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.sender_id === currentUserId) return;

          // Récupérer la clé publique de l'expéditeur et la clé d'accès avec retry anti-concurrence
          let accessKey = null;
          for (let attempt = 0; attempt < 4; attempt++) {
            const { data } = await client
              .from("message_access_keys")
              .select("*")
              .eq("message_id", newMsg.id)
              .eq("recipient_id", currentUserId)
              .maybeSingle();
            if (data) {
              accessKey = data;
              break;
            }
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 250));
            }
          }

          const { data: pk } = await client
            .from("user_public_keys")
            .select("user_id, ecdsa_pub_key")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          const decrypted = await decryptMessageRow(
            newMsg,
            accessKey ? { [newMsg.id]: accessKey } : {},
            pk ? { [pk.user_id]: pk } : {}
          );

          setMessages((prev) => {
            if (prev.some((m) => m.id === decrypted.id)) return prev;
            return [...prev, decrypted];
          });

          markMessagesAsRead();
          setTimeout(() => scrollToBottom(true), 50);
        }
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
                ? { ...msg, is_read: updatedMsg.is_read }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [conversation.id, currentUserId, markMessagesAsRead, scrollToBottom]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || sending || !supabase) return;

    if (conversation.status === "closed" || conversation.status === "archived") {
      setError("Cette conversation est clôturée ou archivée.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // 1. Détermination des destinataires (Client + Admins / Superadmins)
      const recipientIds = new Set<string>([currentUserId, conversation.client_id]);
      if (conversation.agent_id) recipientIds.add(conversation.agent_id);

      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "superadmin"]);

      (adminRoles || []).forEach((r) => recipientIds.add(r.user_id));

      const { data: keysData, error: keysErr } = await supabase
        .from("user_public_keys")
        .select("user_id, ecdh_pub_key")
        .in("user_id", Array.from(recipientIds));

      if (keysErr || !keysData || keysData.length === 0) {
        throw new Error("Clés publiques des participants introuvables.");
      }

      const recipients: RecipientKeyData[] = keysData.map((k: any) => ({
        recipientId: k.user_id,
        ecdhPubJwk: k.ecdh_pub_key || k.ecdh_pub,
      }));

      // 2. Chiffrement E2EE & Signature ECDSA
      const encrypted = await encryptChatMessage(cleanText, recipients);

      // 3. Insertion du message
      const { data: insertedMsg, error: insertErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUserId,
          sender_role: currentUserRole,
          content_encrypted: encrypted.ciphertext,
          iv: encrypted.iv,
          signature: encrypted.signature,
          is_read: false,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 4. Insertion des clés d'accès par destinataire
      const accessKeyRows = encrypted.accessKeys.map((ak) => ({
        message_id: insertedMsg.id,
        recipient_id: ak.recipientId,
        encrypted_aes_key: ak.encryptedAesKey,
        ephemeral_pub: ak.ephemeralPubKey,
      }));

      const { error: accessKeysInsertErr } = await supabase
        .from("message_access_keys")
        .insert(accessKeyRows);

      if (accessKeysInsertErr) throw accessKeysInsertErr;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation.id);

      setInputText("");

      const addedMsg: EncryptedMessage = {
        ...insertedMsg,
        decrypted_content: cleanText,
        is_verified: true,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === addedMsg.id)) return prev;
        return [...prev, addedMsg];
      });
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'envoi du message.";
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

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* En-tête */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                {partnerName}
              </h3>
              <span title="Chiffrement E2EE & Signature ECC actifs" className="inline-flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] sm:max-w-xs">
              {conversation.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onStatusChange && isStaff && (
            <button
              onClick={() => onStatusChange(conversation.status === "closed" ? "open" : "closed")}
              className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-gray-600"
            >
              {conversation.status === "closed" ? "Rouvrir" : "Clôturer"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 text-red-700 text-xs border-b border-red-100 text-center font-medium">
          {error}
        </div>
      )}

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#d4af37]" />
            <span className="text-xs">Déchiffrement des échanges...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Lock className="w-8 h-8 text-[#d4af37]" />
            <p className="text-xs text-center font-medium">
              Début de la conversation chiffrée de bout en bout.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                    isMe
                      ? "bg-[#0a0f1e] text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.decrypted_content}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {msg.is_verified && (
                      <span className="flex items-center text-emerald-500 font-medium mr-1" title="Signature vérifiée">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> Signé
                      </span>
                    )}
                    <span>{formatMessageTime(msg.created_at)}</span>
                    {isMe && (
                      msg.is_read ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Saisie */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            conversation.status === "closed"
              ? "Cette conversation est clôturée."
              : "Écrivez votre message chiffré..."
          }
          disabled={conversation.status === "closed" || sending}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending || conversation.status === "closed"}
          className="bg-[#d4af37] hover:bg-[#c29f30] text-[#0a0f1e] font-bold p-2.5 rounded-xl disabled:opacity-40 transition-colors flex items-center justify-center"
        >
          {sending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}