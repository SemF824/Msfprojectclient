import { useState, useEffect } from "react";
import {
  Bell, Check, Trash2, Filter,
  Home, CreditCard, Calendar, MessageSquare,
  AlertCircle, CheckCircle2, Info, X, Settings, Loader2
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Breadcrumb from "../components/Breadcrumb";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { toast } from "sonner";

type NotificationType = "transaction" | "property" | "appointment" | "message" | "alert" | "success" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  user_id: string;
}

export default function Notifications() {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");

  // ── Synchronisation Réelle Supabase ────────────────────────────────────────
  useEffect(() => {
    if (!user || !supabase) return;
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        if (isMounted) setIsLoading(true);
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) throw error;
        
        if (isMounted) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.error("Erreur notifications:", err);
        toast.error("Impossible de récupérer vos notifications.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNotifications();
    return () => { isMounted = false; };
  }, [user]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "transaction": return { icon: CreditCard, bgColor: "bg-blue-50", textColor: "text-blue-600" };
      case "property":    return { icon: Home, bgColor: "bg-purple-50", textColor: "text-purple-600" };
      case "appointment": return { icon: Calendar, bgColor: "bg-green-50", textColor: "text-green-600" };
      case "message":     return { icon: MessageSquare, bgColor: "bg-pink-50", textColor: "text-pink-600" };
      case "alert":       return { icon: AlertCircle, bgColor: "bg-orange-50", textColor: "text-orange-600" };
      case "success":     return { icon: CheckCircle2, bgColor: "bg-emerald-50", textColor: "text-emerald-600" };
      default:            return { icon: Info, bgColor: "bg-cyan-50", textColor: "text-cyan-600" };
    }
  };

  // ── Actions Unitaires & Globales ───────────────────────────────────────────
  const markAsRead = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ isRead: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Échec de la mise à jour de la notification.");
    }
  };

  const markAllAsRead = async () => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ isRead: true })
        .eq("user_id", user.id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications ont été marquées comme lues.");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour globale.");
    }
  };

  const deleteNotification = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification effacée.");
    } catch (err) {
      toast.error("Échec de la suppression.");
    }
  };

  const clearAll = async () => {
    if (!user || !supabase) return;
    if (!window.confirm("Effacer définitivement l'intégralité de vos notifications ?")) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setNotifications([]);
      toast.success("Centre de notifications vidé.");
    } catch (err) {
      toast.error("Échec du nettoyage complet.");
    }
  };

  const filteredNotifications = filterType === "all" ? notifications : notifications.filter(n => n.type === filterType);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 text-[#0a0f1e]">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Notifications", path: "/client/notifications" }
        ]} />
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Notifications</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isLoading ? "Vérification du flux..." : unreadCount > 0 ? `${unreadCount} nouvelle(s) alerte(s)` : "Aucune nouvelle notification"}
            </p>
          </div>
          <Link to="/client/settings" className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors shadow-sm">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as NotificationType | "all")} 
              className="w-full sm:w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors bg-white cursor-pointer"
            >
              <option value="all">Toutes</option>
              <option value="transaction">Transactions</option>
              <option value="appointment">Rendez-vous</option>
              <option value="message">Messages</option>
              <option value="alert">Alertes système</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 text-[#d4af37] border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-colors text-xs font-semibold">
                <Check className="w-4 h-4" /><span>Tout Marquer Lu</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-xs font-semibold">
                <X className="w-4 h-4" /><span>Tout Effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
          <p className="text-xs font-medium">Récupération de vos alertes sécurisées...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg text-[#0a0f1e] font-semibold">Aucune notification</h3>
          <p className="text-gray-400 text-sm mt-1">Votre historique est totalement à jour.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, idx) => {
            const config = getNotificationIcon(notification.type);
            const Icon = config.icon;
            return (
              <motion.div 
                key={notification.id} 
                initial={{ opacity: 0, x: -16 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: idx * 0.04 }} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${!notification.isRead ? "border-[#d4af37]/50 bg-[#d4af37]/5" : "border-gray-200"}`}
              >
                <div className="p-5 flex gap-4">
                  <div className={`w-11 h-11 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100`}><Icon className={`w-5 h-5 ${config.textColor}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[#0a0f1e] font-bold text-sm sm:text-base truncate">{notification.title}</h3>
                          {!notification.isRead && <span className="w-2 h-2 bg-[#d4af37] rounded-full flex-shrink-0"></span>}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
                      </div>
                      <button onClick={() => deleteNotification(notification.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-50">
                      <p className="text-xs text-gray-400 font-medium">{new Date(notification.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      {!notification.isRead && (
                        <button onClick={() => markAsRead(notification.id)} className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"><Check className="w-3.5 h-3.5" /><span>Lu</span></button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}