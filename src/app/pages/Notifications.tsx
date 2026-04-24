import {
  Bell, Check, Trash2, Filter, ArrowLeft,
  Home, CreditCard, Calendar, MessageSquare,
  TrendingUp, AlertCircle, CheckCircle2, Info,
  X, Settings
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

type NotificationType = "transaction" | "property" | "appointment" | "message" | "alert" | "success" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Paiement Confirmé",
      message: "Votre acompte de 88 556 000 FCFA pour la Villa Tchikobo Prestige a été confirmé avec succès.",
      date: "2026-04-15T09:30:00",
      isRead: false,
      actionUrl: "/transaction/1",
    },
    {
      id: "2",
      type: "appointment",
      title: "Rappel de Rendez-vous",
      message: "Votre visite de la Villa Tchikobo Prestige est prévue demain à 10:00 avec Marie Kengué.",
      date: "2026-04-14T18:00:00",
      isRead: false,
      actionUrl: "/dashboard",
    },
    {
      id: "3",
      type: "property",
      title: "Nouvelle Propriété Disponible",
      message: "Une nouvelle villa de 5 chambres vient d'être ajoutée à Tchikobo, correspondant à vos critères de recherche.",
      date: "2026-04-14T14:20:00",
      isRead: false,
      actionUrl: "/",
    },
    {
      id: "4",
      type: "message",
      title: "Nouveau Message",
      message: "Roger ROC a répondu à votre demande d'information concernant le Lotissement ROC Tchikobo.",
      date: "2026-04-13T16:45:00",
      isRead: true,
      actionUrl: "/dashboard",
    },
    {
      id: "5",
      type: "alert",
      title: "Baisse de Prix",
      message: "Le prix du Terrain Sibiti que vous suivez a été réduit de 15%. Nouveau prix: 47 600 000 FCFA.",
      date: "2026-04-12T11:00:00",
      isRead: true,
      actionUrl: "/propriete/sibiti-terrain-12",
    },
    {
      id: "6",
      type: "transaction",
      title: "Échéance de Paiement",
      message: "Votre prochaine échéance de 44 278 000 FCFA est due le 30 avril 2026.",
      date: "2026-04-10T08:00:00",
      isRead: true,
      actionUrl: "/transactions",
    },
    {
      id: "7",
      type: "info",
      title: "Nouvelle Fonctionnalité",
      message: "Découvrez notre nouveau simulateur de prêt pour estimer vos mensualités de financement immobilier.",
      date: "2026-04-08T10:30:00",
      isRead: true,
      actionUrl: "/dashboard",
    },
    {
      id: "8",
      type: "success",
      title: "Document Disponible",
      message: "Votre contrat de réservation pour la Villa Tchikobo Prestige est prêt à être téléchargé.",
      date: "2026-04-05T15:20:00",
      isRead: true,
      actionUrl: "/dashboard",
    },
  ]);

  const [filterType, setFilterType] = useState<NotificationType | "all">("all");

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "transaction":
        return { icon: CreditCard, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10", textColor: "text-blue-600" };
      case "property":
        return { icon: Home, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-500/10", textColor: "text-purple-600" };
      case "appointment":
        return { icon: Calendar, color: "from-green-500 to-green-600", bgColor: "bg-green-500/10", textColor: "text-green-600" };
      case "message":
        return { icon: MessageSquare, color: "from-pink-500 to-pink-600", bgColor: "bg-pink-500/10", textColor: "text-pink-600" };
      case "alert":
        return { icon: AlertCircle, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-500/10", textColor: "text-orange-600" };
      case "success":
        return { icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-500/10", textColor: "text-emerald-600" };
      case "info":
        return { icon: Info, color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-500/10", textColor: "text-cyan-600" };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = filterType === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Notifications", path: "/notifications" }
          ]} />
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Notifications</span>
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}` : "Aucune nouvelle notification"}
              </p>
            </div>
            <Link
              to="/settings"
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-[#d4af37] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl text-[#0a0f1e] font-semibold">{notifications.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl text-[#0a0f1e] font-semibold">{unreadCount}</p>
                <p className="text-sm text-gray-600">Non Lues</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl text-[#0a0f1e] font-semibold">
                  {notifications.filter(n => n.isRead).length}
                </p>
                <p className="text-sm text-gray-600">Lues</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NotificationType | "all")}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0f1e] focus:border-[#d4af37] focus:outline-none transition-colors"
              >
                <option value="all">Toutes les notifications</option>
                <option value="transaction">Transactions</option>
                <option value="property">Propriétés</option>
                <option value="appointment">Rendez-vous</option>
                <option value="message">Messages</option>
                <option value="alert">Alertes</option>
                <option value="success">Succès</option>
                <option value="info">Informations</option>
              </select>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-[#d4af37] border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  <span>Tout Marquer Lu</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Tout Effacer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-[#0a0f1e] font-semibold mb-2">Aucune notification</h3>
            <p className="text-gray-600">
              {filterType !== "all" 
                ? "Aucune notification de ce type" 
                : "Vous êtes à jour ! Aucune nouvelle notification"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, idx) => {
              const config = getNotificationIcon(notification.type);
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden transition-all ${
                    notification.isRead 
                      ? "border-gray-200" 
                      : "border-[#d4af37]/30 bg-[#d4af37]/5"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-[#0a0f1e] font-semibold">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-[#d4af37] rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center gap-1 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Marquer lu</span>
                              </button>
                            )}
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="px-3 py-1 text-xs bg-[#d4af37] text-[#0a0f1e] rounded-lg hover:shadow-lg transition-all font-medium"
                              >
                                Voir
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl border border-[#d4af37]/30 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="text-[#0a0f1e] font-semibold mb-2">Gérer vos Préférences</h3>
              <p className="text-gray-700 text-sm mb-3">
                Personnalisez les types de notifications que vous souhaitez recevoir dans les paramètres.
              </p>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 text-[#d4af37] hover:underline text-sm font-medium"
              >
                <span>Aller aux Paramètres</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}