import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Building2, LayoutDashboard, FileText, Users, Home,
  BarChart3, Settings, LogOut, Menu, X, Bell, Search,
  ChevronDown
} from "lucide-react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Demandes de Devis", href: "/demandes", icon: FileText },
    { name: "Propriétés", href: "/proprietes", icon: Building2 },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Statistiques", href: "/statistiques", icon: BarChart3 },
    { name: "Paramètres", href: "/parametres", icon: Settings }
  ];

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg tracking-tight text-[#0a0f1e] font-bold">MSF CONGO</h1>
                <p className="text-[8px] text-[#d4af37] tracking-[0.2em] uppercase">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#d4af37] focus:outline-none w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                  <span className="text-[#0a0f1e] font-semibold text-sm">
                    {user?.email?.substring(0, 2).toUpperCase() || "AD"}
                  </span>
                </div>
                <span className="hidden md:block text-sm text-[#0a0f1e] font-medium">
                  {user?.email || "Administrateur"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-[#0a0f1e] font-semibold">
                      {user?.user_metadata?.name || "Administrateur"}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email || ""}</p>
                  </div>
                  <Link
                    to="/parametres"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-sm">Paramètres</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate('/admin', { replace: true });
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full mt-2 border-t border-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] font-semibold shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats in Sidebar */}
        <div className="p-4 mt-8">
          <div className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-xl border border-[#d4af37]/30 p-4">
            <h3 className="text-sm text-[#0a0f1e] font-semibold mb-3">Aujourd'hui</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Nouvelles demandes</span>
                <span className="text-sm text-[#0a0f1e] font-bold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Visites planifiées</span>
                <span className="text-sm text-[#0a0f1e] font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Documents à vérifier</span>
                <span className="text-sm text-orange-600 font-bold">8</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}