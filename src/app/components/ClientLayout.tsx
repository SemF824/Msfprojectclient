import { Link, useNavigate, useLocation, Outlet } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import {
  Home, Heart, Calendar, FileText, Calculator, LogOut,
  Bell, Settings, User, Clock, Lock
} from "lucide-react";

export default function ClientLayout() {
  const { user: authUser, isLoading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      </div>
    );
  }

  const displayName  = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Utilisateur";
  const displayEmail = authUser?.email || "";

  const handleLogout = async () => {
    await signOut();
    navigate("/connexion");
  };

  const navItems = [
    { id: "/client/dashboard", icon: Home, label: "Vue d'ensemble" },
    { id: "/client/requests", icon: FileText, label: "Mes Demandes" },
    { id: "/client/favorites", icon: Heart, label: "Favoris" },
    { id: "/client/appointments", icon: Calendar, label: "Rendez-vous" },
    { id: "/client/history", icon: Clock, label: "Historique" },
    { id: "/client/documents", icon: Lock, label: "Documents Sécurisés" },
    { id: "/client/loan", icon: Calculator, label: "Simulateur Prêt" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-[#0a0f1e]" />
                </div>
                <h3 className="text-[#0a0f1e] text-lg font-semibold">{displayName}</h3>
                <p className="text-gray-500 text-sm truncate">{displayEmail}</p>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <Link to="/vitrine" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#d4af37] transition-colors rounded-xl hover:bg-gray-50">
                  <Home className="w-4 h-4" /><span>← Retour au site</span>
                </Link>
              </div>

              <nav className="space-y-1.5 mb-6">
                {navItems.map(item => (
                  <Link 
                    key={item.id} 
                    to={item.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                      location.pathname === item.id || location.pathname.startsWith(item.id + '/')
                        ? "bg-[#d4af37] text-[#0a0f1e] shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="pt-4 border-t border-gray-200 space-y-1">
                <Link to="/client/profile" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><User className="w-4 h-4" />Mon Profil</Link>
                <Link to="/client/notifications" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Bell className="w-4 h-4" />Notifications</Link>
                <Link to="/client/settings" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><Settings className="w-4 h-4" />Paramètres</Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}