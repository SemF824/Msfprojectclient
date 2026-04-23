import {
  Building2, Menu, Search, User, ChevronDown,
  Bell, Heart, Settings, CreditCard, LogOut, X, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";

export function Header() {
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen,   setIsSearchOpen]   = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [unreadCount,    setUnreadCount]    = useState(0);

  const { user, isAdmin, signOut } = useSupabaseAuth();
  const navigate  = useNavigate();
  const isLoggedIn = !!user;

  // ── Notifications non lues en temps réel ──────────────────────────────────
  useEffect(() => {
    if (!user || !supabase) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel("header-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        fetchUnreadCount
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vitrine?search=${encodeURIComponent(searchQuery)}#proprietes`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* ── Logo ────────────────────────────────────────────────────────── */}
          <Link to="/vitrine" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-[#0a0f1e]" />
            </div>
            <div>
              <h1 className="text-xl tracking-tight text-[#0a0f1e] font-bold">MSF CONGO</h1>
              <p className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase font-semibold">Roger ROC</p>
            </div>
          </Link>

          {/* ── Navigation Desktop ──────────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/vitrine"           className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors">Accueil</Link>
            <Link to="/vitrine#proprietes" className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors">Propriétés</Link>
            <Link to="/vitrine/services"  className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors">Services</Link>
            <Link to="/vitrine#apropos"   className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors">À Propos</Link>
            <Link to="/vitrine/contact"   className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors">Contact</Link>
          </nav>

          {/* ── Boutons d'action ────────────────────────────────────────────── */}
          <div className="flex items-center gap-4">

            {/* Recherche dynamique */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Rechercher un bien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 lg:w-64 pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors rounded-full hover:bg-gray-100"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {isLoggedIn ? (
              <>
                {/* Accès Administration */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540] text-[#d4af37] rounded-full border border-[#d4af37]/50 hover:border-[#d4af37] hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all font-semibold text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    ACCÈS ADMINISTRATION
                  </Link>
                )}

                {/* Cloche notifications */}
                <Link
                  to="/client/notifications"
                  className="hidden md:block relative p-2 text-gray-600 hover:text-[#d4af37] transition-colors rounded-full hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>

                {/* Menu utilisateur */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#0a0f1e]" />
                    </div>
                    <span className="text-sm text-[#0a0f1e] font-medium max-w-[100px] truncate">
                      {user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Compte"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl py-2 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50/50 mb-2">
                        <p className="text-[#0a0f1e] font-bold text-sm truncate">
                          {user?.user_metadata?.full_name || user?.user_metadata?.first_name || "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="px-2 space-y-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-[#d4af37]/10 to-transparent text-[#0a0f1e] hover:bg-[#d4af37]/20 transition-colors rounded-xl font-semibold"
                          >
                            <Building2 className="w-4 h-4 text-[#d4af37]" />
                            <span className="text-sm">Espace MSF Congo</span>
                          </Link>
                        )}
                        <Link
                          to="/client/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                        >
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Tableau de bord</span>
                        </Link>
                        <Link
                          to="/client/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Mon Profil</span>
                        </Link>
                        <Link
                          to="/client/favorites"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">Mes Favoris</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 mt-2 px-2 pt-2">
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                          onClick={async () => { await signOut(); setIsUserMenuOpen(false); }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/connexion"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-full font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all transform hover:-translate-y-0.5"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Espace Client</span>
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── Menu Mobile ─────────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              <Link to="/vitrine"            className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
              <Link to="/vitrine#proprietes"  className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}>Propriétés</Link>
              <Link to="/vitrine/services"   className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}>Services</Link>
              <Link to="/vitrine#apropos"    className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}>À Propos</Link>
              <Link to="/vitrine/contact"    className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>

              {isLoggedIn ? (
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Espace MSF Congo</span>
                    </Link>
                  )}
                  <Link to="/client/dashboard"     className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}><Building2 className="w-4 h-4" /><span>Tableau de bord</span></Link>
                  <Link to="/client/profile"       className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}><User className="w-4 h-4" /><span>Mon Profil</span></Link>
                  <Link to="/client/favorites"     className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}><Heart className="w-4 h-4" /><span>Mes Favoris</span></Link>
                  <Link to="/client/notifications" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors" onClick={() => setIsMenuOpen(false)}><Bell className="w-4 h-4" /><span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span></Link>
                  <button
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                    onClick={async () => { await signOut(); setIsMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /><span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/connexion"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-full w-fit font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Espace Client</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
