import { useState } from "react";
import {
  Bell, Check, Trash2, Filter, ArrowLeft,
  Home, CreditCard, Calendar, MessageSquare,
  AlertCircle, CheckCircle2, Info, X, Settings
} from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Breadcrumb from "../components/Breadcrumb";

type NotificationType = "transaction" | "property" | "appointment" | "message" | "alert" | "success" | "info";

interface Notification {
  id: string; type: NotificationType; title: string; message: string; date: string; isRead: boolean; actionUrl?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "success", title: "Paiement Confirmé", message: "Votre acompte de 88 556 000 FCFA a été confirmé.", date: "2026-04-15T09:30:00", isRead: false },
    { id: "2", type: "appointment", title: "Rappel de Rendez-vous", message: "Votre visite est prévue demain à 10:00.", date: "2026-04-14T18:00:00", isRead: false },
  ]);

  const [filterType, setFilterType] = useState<NotificationType | "all">("all");

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "transaction": return { icon: CreditCard, bgColor: "bg-blue-50", textColor: "text-blue-600" };
      case "property": return { icon: Home, bgColor: "bg-purple-50", textColor: "text-purple-600" };
      case "appointment": return { icon: Calendar, bgColor: "bg-green-50", textColor: "text-green-600" };
      case "message": return { icon: MessageSquare, bgColor: "bg-pink-50", textColor: "text-pink-600" };
      case "alert": return { icon: AlertCircle, bgColor: "bg-orange-50", textColor: "text-orange-600" };
      case "success": return { icon: CheckCircle2, bgColor: "bg-emerald-50", textColor: "text-emerald-600" };
      case "info": return { icon: Info, bgColor: "bg-cyan-50", textColor: "text-cyan-600" };
    }
  };

  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  const deleteNotification = (id: string) => setNotifications(notifications.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);

  const filteredNotifications = filterType === "all" ? notifications : notifications.filter(n => n.type === filterType);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumb items={[
          { label: "Dashboard", path: "/client/dashboard" },
          { label: "Notifications", path: "/client/notifications" }
        ]} />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Notifications</span>
            </h1>
            <p className="text-gray-600">{unreadCount > 0 ? `${unreadCount} nouvelle(s)` : "Aucune nouvelle notification"}</p>
          </div>
          <Link to="/client/settings" className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as NotificationType | "all")} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors">
              <option value="all">Toutes</option>
              <option value="transaction">Transactions</option>
              <option value="appointment">Rendez-vous</option>
              <option value="message">Messages</option>
            </select>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 text-[#d4af37] border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-colors text-sm font-medium">
                <Check className="w-4 h-4" /><span>Tout Marquer Lu</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium">
                <X className="w-4 h-4" /><span>Tout Effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-[#0a0f1e] font-semibold mb-2">Aucune notification</h3>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, idx) => {
            const config = getNotificationIcon(notification.type);
            const Icon = config.icon;
            return (
              <motion.div key={notification.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${!notification.isRead ? "border-[#d4af37]/50 bg-yellow-50/10" : "border-gray-200"}`}>
                <div className="p-6 flex gap-4">
                  <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}><Icon className={`w-6 h-6 ${config.textColor}`} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[#0a0f1e] font-semibold">{notification.title}</h3>
                          {!notification.isRead && <span className="w-2 h-2 bg-[#d4af37] rounded-full"></span>}
                        </div>
                        <p className="text-gray-600 text-sm">{notification.message}</p>
                      </div>
                      <button onClick={() => deleteNotification(notification.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      {!notification.isRead && (
                        <button onClick={() => markAsRead(notification.id)} className="flex items-center gap-1 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"><Check className="w-3 h-3" /><span>Lu</span></button>
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