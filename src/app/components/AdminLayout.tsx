import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Building2, LayoutDashboard, FileText, Users, Home,
  BarChart3, Settings, LogOut, Menu, X, Bell, Search,
  ChevronDown, Shield, UserCog, FolderOpen
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadContactsCount, setUnreadContactsCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useSupabaseAuth();

  // Navigation de base pour tous les admins
  const baseNavigation = [
    { name: "Dashboard",            href: "/admin/dashboard",    icon: LayoutDashboard },
    { name: "Demandes de Devis",    href: "/admin/demandes",     icon: FileText },
    { name: "Propriétés",           href: "/admin/proprietes",   icon: Building2 },
    { name: "Clients",              href: "/admin/clients",      icon: Users },
    { name: "Archives Documents",   href: "/admin/documents",    icon: FolderOpen },
    { name: "Statistiques",         href: "/admin/statistiques", icon: BarChart3 },
    { name: "Paramètres",           href: "/admin/parametres",   icon: Settings }
  ];

  // Liens supplémentaires réservés au superadmin
  const superadminNavigation = [
    { name: "Gestion de l'Équipe",  href: "/admin/equipe",   icon: UserCog,  superadminOnly: true },
    { name: "Paramètres Système",   href: "/admin/systeme",  icon: Shield,   superadminOnly: true }
  ];

  // Combiner les navigations selon le rôle
  const navigation = userRole === 'superadmin'
    ? [...baseNavigation, ...superadminNavigation]
    : baseNavigation;

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  // Récupérer le nom complet de l'utilisateur
  const userFirstName = user?.user_metadata?.first_name || user?.user_metadata?.firstName || '';
  const userLastName = user?.user_metadata?.last_name || user?.user_metadata?.lastName || '';
  const userFullName = `${userFirstName} ${userLastName}`.trim() || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Administrateur';
  const userInitials = (userFirstName[0] || '') + (userLastName[0] || '') || user?.email?.substring(0, 2).toUpperCase() || 'AD';

  // Badge de rôle avec couleur
  const getRoleBadge = () => {
    if (userRole === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full">
          <Shield className="w-3 h-3" />
          SUPERADMIN
        </span>
      );
    }
    if (userRole === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d4af37]/20 text-[#0a0f1e] border border-[#d4af37]/40 text-[10px] font-bold rounded-full">
          ADMIN
        </span>
      );
    }
    return null;
  };

  // Moteur de Notifications (contact_requests)
  useEffect(() => {
    if (!supabase) return;

    const fetchUnreadContacts = async () => {
      // Re-vérification stricte pour le compilateur TypeScript dans la closure
      if (!supabase) return; 
      
      const { count, error } = await supabase
        .from('contact_requests')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.nouveau,status.is.null');

      if (!error && count !== null) {
        setUnreadContactsCount(count);
      }
    };

    fetchUnreadContacts();

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_requests' },
        () => fetchUnreadContacts()
      )
      .subscribe();

    return () => {
      // Re-vérification pour la fonction de nettoyage
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // SÉCURITÉ : Déconnexion forcée
  const handlePublicSiteReturn = async () => {
    if (window.confirm("SÉCURITÉ : Retourner sur le site public va détruire votre session Administrateur. Voulez-vous vous déconnecter et continuer ?")) {
      await signOut();
      navigate('/vitrine');
    }
  };

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
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#0a0f1e]" />
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
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none w-64"
              />
            </div>

            {/* Notifications Dynamiques */}
            <Link to="/admin/demandes" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#d4af37] transition-colors" />
              {unreadContactsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                  {unreadContactsCount > 9 ? '9+' : unreadContactsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                  <span className="text-[#0a0f1e] font-semibold text-sm">
                    {userInitials}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-sm text-[#0a0f1e] font-medium">
                    {userFullName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {getRoleBadge()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-[#0a0f1e] font-semibold">
                      {userFullName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">{user?.email || ""}</p>
                    {getRoleBadge()}
                  </div>
                  <Link
                    to="/admin/parametres"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-sm">Paramètres</span>
                  </Link>
                  {userRole === 'superadmin' && (
                    <>
                      <Link
                        to="/admin/equipe"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCog className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Gestion de l'Équipe</span>
                      </Link>
                      <Link
                        to="/admin/systeme"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm">Paramètres Système</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsUserMenuOpen(false);
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
        } overflow-hidden flex flex-col`}
      >
        <div className="p-4">
          {/* Bouton retour au site public AVEC DÉCONNEXION */}
          <button
            onClick={handlePublicSiteReturn}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all border border-red-100 font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Quitter (Déconnexion)</span>
          </button>
        </div>

        <nav className="px-4 pb-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            // Conversion stricte en booléen pour apaiser TypeScript
            const isSuperadminOnly = 'superadminOnly' in item ? Boolean(item.superadminOnly) : false;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  active
                    ? isSuperadminOnly
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-[#d4af37] text-[#0a0f1e] shadow-md shadow-[#d4af37]/20'
                    : isSuperadminOnly
                    ? 'text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-sm">{item.name}</span>
                {/* L'évaluation est maintenant strictement booléenne */}
                {isSuperadminOnly && !active && (
                  <Shield className="w-4 h-4 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats in Sidebar */}
        <div className="p-4 mt-auto border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm text-[#0a0f1e] font-bold mb-3">Aujourd'hui</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Nouvelles demandes</span>
                <span className="text-sm text-[#0a0f1e] font-black">{unreadContactsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Visites planifiées</span>
                <span className="text-sm text-[#0a0f1e] font-black">0</span>
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
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}