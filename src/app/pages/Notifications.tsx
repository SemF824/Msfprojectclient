import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Settings,
  Loader2,
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Breadcrumb from "../components/Breadcrumb";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { useNotifications, type NotificationType } from "../../hooks/useNotifications";
import { toast } from "sonner";

export default function Notifications() {
  const { user } = useSupabaseAuth();
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const [filterType, setFilterType] = useState<string>("all");

  const getNotificationIcon = (type?: string | null) => {
    switch (type) {
      case "payment":
        return {
          icon: CreditCard,
          label: "Finances & Règlements",
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "document":
        return {
          icon: FileText,
          label: "Documents Notariés",
          bgColor: "bg-[#d4af37]/10 text-[#8c7423] border-[#d4af37]/30",
        };
      case "warning":
        return {
          icon: AlertCircle,
          label: "Échéance & Attention",
          bgColor: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "success":
        return {
          icon: CheckCircle2,
          label: "Validation Réussie",
          bgColor: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "info":
      default:
        return {
          icon: Info,
          label: "Information MSF",
          bgColor: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Notification retirée.");
      fetchNotifications();
    } catch (err) {
      toast.error("Échec de la suppression.");
    }
  };

  const handleClearAll = async () => {
    if (!user || !supabase) return;
    if (!window.confirm("Effacer définitivement l'ensemble de vos notifications ?")) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Centre de notifications vidé.");
      fetchNotifications();
    } catch (err) {
      toast.error("Échec du nettoyage complet.");
    }
  };

  const filteredNotifications =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 text-[#0a0f1e]">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Notifications", path: "/client/notifications" },
          ]}
        />
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Centre de <span className="text-[#d4af37]">Notifications</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isLoading
                ? "Actualisation de vos alertes privées..."
                : unreadCount > 0
                  ? `${unreadCount} notification(s) non lue(s)`
                  : "Toutes vos notifications sont à jour"}
            </p>
          </div>
          <Link
            to="/client/settings"
            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors shadow-sm"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-56 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">Toutes les notifications</option>
              <option value="payment">Règlements & Finances</option>
              <option value="document">Actes & Documents</option>
              <option value="warning">Alertes & Échéances</option>
              <option value="success">Validations & Accords</option>
              <option value="info">Informations générales</option>
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-[#8c7423] border border-[#d4af37]/40 rounded-xl hover:bg-[#d4af37]/10 transition-colors text-xs font-semibold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tout effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
          <p className="text-xs font-medium">Chargement des notifications sécurisées...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center"
        >
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg text-[#0a0f1e] font-bold">Aucune notification</h3>
          <p className="text-gray-400 text-sm mt-1">Vous n'avez aucun message en attente dans cette catégorie.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, idx) => {
            const config = getNotificationIcon(notification.type);
            const Icon = config.icon;
            const dateStr = notification.created_at
              ? new Date(notification.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-[border-color,background-color] duration-150 ${
                  !notification.is_read ? "border-[#d4af37]/60 bg-[#faf8f2]" : "border-gray-200"
                }`}
              >
                <div className="p-4 sm:p-5 flex gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${config.bgColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[#0a0f1e] font-bold text-sm sm:text-base truncate">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-[#d4af37] rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">{dateStr}</p>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#8c7423] hover:bg-[#d4af37]/15 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marquer comme lu</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
