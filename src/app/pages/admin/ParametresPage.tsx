import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Lock, Bell, Shield, Database, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, Download, LogOut
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

interface Toast { type: "ok" | "err"; text: string; }
interface UserRole { user_id: string; role: string; email?: string; }

export default function ParametresPage() {
  const { user, signOut } = useSupabaseAuth();

  // ── Mot de passe ──────────────────────────────────────────────────────────
  const [newPassword,   setNewPassword]   = useState("");
  const [showPwd,       setShowPwd]       = useState(false);
  const [pwdLoading,    setPwdLoading]    = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifNewReq,   setNotifNewReq]   = useState(true);
  const [notifDocUp,    setNotifDocUp]    = useState(true);
  const [notifSMS,      setNotifSMS]      = useState(false);

  // ── Sécurité ──────────────────────────────────────────────────────────────
  const [userRoles,     setUserRoles]     = useState<UserRole[]>([]);
  const [rolesLoading,  setRolesLoading]  = useState(true);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast,         setToast]         = useState<Toast | null>(null);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch user_roles ──────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!supabase) { setRolesLoading(false); return; }
      setRolesLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "superadmin"]);
      if (isMounted) {
        setUserRoles(data || []);
        setRolesLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // ── Changer mot de passe ──────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newPassword) return;
    if (newPassword.length < 8) {
      showToast("err", "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) showToast("err", "Erreur : " + error.message);
    else       showToast("ok", "Mot de passe mis à jour avec succès.");
    setNewPassword("");
    setPwdLoading(false);
  };

  // ── Déconnexion globale ───────────────────────────────────────────────────
  const handleGlobalSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut({ scope: "global" });
    showToast("ok", "Déconnecté de toutes les sessions.");
  };

  // ── Export CSV demandes ───────────────────────────────────────────────────
  const handleExportCSV = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("devis_requests").select("*");
    if (error || !data) { showToast("err", "Erreur lors de l'export."); return; }
    const headers = Object.keys(data[0] || {}).join(",");
    const rows    = data.map(r => Object.values(r).join(",")).join("\n");
    const csv     = "\uFEFF" + headers + "\n" + rows;
    const blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url     = URL.createObjectURL(blob);
    const link    = document.createElement("a");
    link.href     = url;
    link.download = `devis_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("ok", "Export CSV lancé.");
  };

  const sectionClass = "bg-white rounded-2xl border border-gray-200 shadow-sm p-6";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
            toast.type === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </motion.div>
      )}

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl text-[#0a0f1e] font-bold">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre compte et les préférences système</p>
      </div>

      <div className="space-y-6">

        {/* ══ MON COMPTE ADMIN ══════════════════════════════════════════════ */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-[#d4af37]/15 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#d4af37]" />
            </div>
            <h2 className="text-[#0a0f1e] font-semibold">Mon Compte Admin</h2>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Nom</p>
                <p className="text-sm text-[#0a0f1e] font-medium">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Administrateur"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Email</p>
                <p className="text-sm text-[#0a0f1e] font-medium">{user?.email || "—"}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!newPassword || pwdLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl text-sm font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Changer le mot de passe
            </button>
          </form>
        </div>

        {/* ══ NOTIFICATIONS ════════════════════════════════════════════════ */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-[#0a0f1e] font-semibold">Notifications Admin</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: "Email lors d'une nouvelle demande",    desc: "Recevoir un email à chaque nouvelle demande de devis",       value: notifNewReq, onChange: setNotifNewReq },
              { label: "Email lors d'un upload de document",   desc: "Recevoir un email quand un client dépose un document",      value: notifDocUp,  onChange: setNotifDocUp  },
              { label: "SMS pour demandes haute priorité",      desc: "Alerte SMS pour les demandes urgentes (UI uniquement)",     value: notifSMS,    onChange: setNotifSMS    },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-[#0a0f1e] font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${item.value ? "bg-[#d4af37]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ══ SÉCURITÉ ══════════════════════════════════════════════════════ */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-[#0a0f1e] font-semibold">Sécurité</h2>
          </div>

          {/* Badge Supabase Auth actif */}
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-5">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">Authentification Supabase Active</p>
          </div>

          {/* Tableau user_roles */}
          <div className="mb-5">
            <p className="text-sm text-gray-700 font-medium mb-3">Comptes avec privilèges administrateur :</p>
            {rolesLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#d4af37]" /></div>
            ) : userRoles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun rôle enregistré dans user_roles</p>
            ) : (
              <div className="space-y-2">
                {userRoles.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-mono text-gray-600 truncate">{r.user_id}</p>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ml-3 ${
                      r.role === "superadmin"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-[#d4af37]/15 text-[#0a0f1e] border-[#d4af37]/30"
                    }`}>
                      {r.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGlobalSignOut}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion de toutes les sessions
          </button>
        </div>

        {/* ══ DONNÉES ══════════════════════════════════════════════════════ */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-[#0a0f1e] font-semibold">Données</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-3 w-full p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all text-left"
            >
              <Download className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
              <div>
                <p className="text-sm text-[#0a0f1e] font-medium">Exporter toutes les demandes</p>
                <p className="text-xs text-gray-500">Génère un fichier CSV de toutes les devis_requests</p>
              </div>
            </button>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Dernière sauvegarde Supabase</p>
                <p className="text-xs text-blue-500">Gérée automatiquement par Supabase (quotidienne)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
