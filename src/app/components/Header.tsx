import { Building2, Menu, Search, User, ChevronDown, Bell, Heart, Settings, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();
  const isLoggedIn = !!user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0a0f1e]" />
            </div>
            <div>
              <h1 className="text-xl tracking-tight text-black">MSF CONGO</h1>
              <p className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase">Roger ROC</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
              Accueil
            </Link>
            <a href="/#proprietes" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
              Propriétés
            </a>
            <Link to="/services" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
              Services
            </Link>
            <a href="/#apropos" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
              À Propos
            </a>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-[#d4af37] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <Link 
                  to="/notifications"
                  className="hidden md:block relative p-2 text-gray-600 hover:text-[#d4af37] transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                {/* User Menu */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-[#0a0f1e]" />
                    </div>
                    <span className="text-sm text-[#0a0f1e] font-medium">{user?.email?.split('@')[0] ?? 'Mon compte'}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-[#0a0f1e] font-semibold">{user?.email?.split('@')[0] ?? 'Utilisateur'}</p>
                        <p className="text-sm text-gray-600">{user?.email ?? ''}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Building2 className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Mon Profil</span>
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Mes Favoris</span>
                        </Link>
                        <Link
                          to="/transactions"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <CreditCard className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Transactions</span>
                        </Link>
                        <Link
                          to="/notifications"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Bell className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Notifications</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-sm">Paramètres</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          onClick={async () => {
                            await signOut();
                            setIsUserMenuOpen(false);
                          }}
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
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Espace Client</span>
              </Link>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
                Accueil
              </Link>
              <a href="/#proprietes" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
                Propriétés
              </a>
              <Link to="/services" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
                Services
              </Link>
              <a href="/#apropos" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
                À Propos
              </a>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">
                Contact
              </Link>
              
              {isLoggedIn ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors mb-3">
                      <Building2 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors mb-3">
                      <User className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors mb-3">
                      <Heart className="w-4 h-4" />
                      <span>Mes Favoris</span>
                    </Link>
                    <Link to="/transactions" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors mb-3">
                      <CreditCard className="w-4 h-4" />
                      <span>Transactions</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors mb-3">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </Link>
                  </div>
                </>
              ) : (
                <Link 
                  to="/connexion"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-lg w-fit"
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