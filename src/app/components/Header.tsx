import {
  Building2,
  Menu,
  Search,
  User,
  ChevronDown,
  Bell,
  Heart,
  Settings,
  CreditCard,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { CurrencySelector } from "./CurrencySelector";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "../../context/LanguageContext";

export function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isAdmin, signOut } = useSupabaseAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 z-50">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-[#0a0f1e]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl tracking-tight text-[#0a0f1e] font-bold">
                MSF CONGO
              </h1>
              <p className="text-[8px] sm:text-[10px] text-[#d4af37] tracking-[0.2em] uppercase font-semibold">
                Roger ROC
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/properties"
              className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              {t("nav.properties")}
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              {t("nav.services")}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          {/* Actions & Sélecteurs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sélecteurs Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSelector />
              <CurrencySelector />
            </div>

            {/* Recherche dynamique */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    autoFocus
                    type="text"
                    placeholder={t("nav.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-32 sm:w-48 lg:w-64 pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2 bg-gray-100 border-none rounded-full text-xs sm:text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 sm:right-3 text-gray-400 hover:text-red-500"
                    aria-label={t("nav.closeSearch")}
                  >
                    <X
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      aria-hidden="true"
                    />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-[#d4af37] transition-colors rounded-full hover:bg-gray-100"
                  aria-label={t("nav.openSearch")}
                >
                  <Search
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    aria-hidden="true"
                  />
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
                    aria-label="Accès Administration"
                  >
                    <Shield className="w-4 h-4" />
                    ACCÈS ADMINISTRATION
                  </Link>
                )}

                {/* Cloche notifications */}
                <Link
                  to="/client/notifications"
                  className="hidden md:block relative p-2 text-gray-600 hover:text-[#d4af37] transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Vos notifications"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </Link>

                {/* Menu utilisateur */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menu utilisateur"
                  >
                    <div
                      className="w-7 h-7 bg-gradient-to-br from-[#d4af37] to-[#f4e3b2] rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <User className="w-3.5 h-3.5 text-[#0a0f1e]" />
                    </div>
                    <span className="text-sm text-[#0a0f1e] font-medium max-w-[100px] truncate">
                      {user?.user_metadata?.first_name ||
                        user?.email?.split("@")[0] ||
                        "Compte"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl py-2 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50/50 mb-2">
                        <p className="text-[#0a0f1e] font-bold text-sm truncate">
                          {user?.user_metadata?.full_name ||
                            user?.user_metadata?.first_name ||
                            "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="px-2 space-y-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-[#d4af37]/10 to-transparent text-[#0a0f1e] hover:bg-[#d4af37]/20 transition-colors rounded-xl font-semibold"
                            aria-label={t("nav.adminSpace")}
                          >
                            <Building2 className="w-4 h-4 text-[#d4af37]" />
                            <span className="text-sm">{t("nav.adminSpace")}</span>
                          </Link>
                        )}
                        <Link
                          to="/client/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                          aria-label={t("nav.dashboard")}
                        >
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {t("nav.dashboard")}
                          </span>
                        </Link>
                        <Link
                          to="/client/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                          aria-label={t("nav.myProfile")}
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {t("nav.myProfile")}
                          </span>
                        </Link>
                        <Link
                          to="/client/favorites"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0a0f1e] transition-colors rounded-xl"
                          aria-label={t("nav.myFavorites")}
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {t("nav.myFavorites")}
                          </span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 mt-2 px-2 pt-2">
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                          onClick={async () => {
                            await signOut();
                            setIsUserMenuOpen(false);
                          }}
                          aria-label={t("nav.logout")}
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          <span className="text-sm">{t("nav.logout")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-full font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all transform hover:-translate-y-0.5"
                aria-label={t("nav.clientSpace")}
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">{t("nav.clientSpace")}</span>
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-[#d4af37] transition-colors"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 absolute left-0 right-0 bg-white px-4 shadow-xl">
            <div className="mb-3 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("nav.language")}
              </span>
              <LanguageSelector />
            </div>

            <div className="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("nav.currency")}
              </span>
              <CurrencySelector />
            </div>

            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/properties"
                className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.properties")}
              </Link>
              <Link
                to="/services"
                className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.services")}
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-600 hover:text-[#d4af37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>

              {isLoggedIn ? (
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{t("nav.adminSpace")}</span>
                    </Link>
                  )}
                  <Link
                    to="/client/dashboard"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                  <Link
                    to="/client/profile"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{t("nav.myProfile")}</span>
                  </Link>
                  <Link
                    to="/client/favorites"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    <span>{t("nav.myFavorites")}</span>
                  </Link>
                  <Link
                    to="/client/notifications"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="w-4 h-4" />
                    <span>
                      {t("nav.notifications")} {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                  </Link>
                  <button
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                    onClick={async () => {
                      await signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-full w-fit font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{t("nav.clientSpace")}</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}