import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, UserPlus, Trash2, Lock, AlertCircle, 
  Loader2, CheckCircle, Search, KeyRound, X
} from "lucide-react";
import { supabase, useSupabaseAuth } from "../../../hooks/useSupabaseAuth";

interface TeamMember {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
}

export default function TeamManagement() {
  const { user } = useSupabaseAuth();
  
  // ── États de vérification & données ──
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // ── États du formulaire d'ajout ──
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("admin");
  
  // ── États du test par mot de passe (Sécurité) ──
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ── Toasts ──
  const [toast, setToast] = useState<{ type: "ok" | "err", text: string } | null>(null);
  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Vérifier si l'utilisateur courant est superadmin et charger l'équipe
  useEffect(() => {
    let isMounted = true;
    const verifyAndLoad = async () => {
      if (!user || !supabase) return;

      // Vérif rôle
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "superadmin") {
        if (isMounted) setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      if (isMounted) setIsSuperAdmin(true);

      // Charger l'équipe (jointure manuelle via profiles pour récupérer l'email)
      const { data: roles } = await supabase.from("user_roles").select("*");
      
      if (roles) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const fullTeam = roles.map(r => {
          const profile = profiles?.find(p => p.id === r.user_id);
          return {
            ...r,
            email: profile?.email || "Email masqué",
            full_name: profile?.full_name || "Utilisateur"
          };
        });
        
        if (isMounted) setTeam(fullTeam);
      }
      if (isMounted) setLoading(false);
    };

    verifyAndLoad();
    return () => { isMounted = false; };
  }, [user]);

  // 2. Le Test par Mot de Passe
  const executeSecureAction = async () => {
    if (!supabase || !user?.email || !pendingAction) return;
    setIsAuthenticating(true);
    setAuthError("");

    try {
      // On tente de reconnecter l'utilisateur pour valider son mot de passe
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: adminPassword,
      });

      if (error) throw new Error("Mot de passe incorrect.");

      // Si le mot de passe est bon, on exécute l'action critique
      await pendingAction();
      
      setAuthModalOpen(false);
      setAdminPassword("");
      setPendingAction(null);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const requirePasswordFor = (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setAuthModalOpen(true);
  };

  // 3. Ajouter un membre
  const handleAddMember = async () => {
    if (!supabase) return;
    
    // a. Trouver le user_id à partir de l'email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newAdminEmail)
      .single();

    if (!profile) {
      showToast("err", "Aucun compte client trouvé avec cet email. L'utilisateur doit d'abord s'inscrire.");
      return;
    }

    // b. Insérer dans user_roles
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: newAdminRole });

    if (error) {
      showToast("err", "Cet utilisateur a déjà un rôle assigné ou une erreur est survenue.");
    } else {
      showToast("ok", "Le nouveau membre a été nommé avec succès.");
      setNewAdminEmail("");
      // Recharger la page (ou l'état) pour mettre à jour la liste
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // 4. Révoquer un membre
  const handleRemoveMember = async (targetUserId: string) => {
    if (!supabase) return;
    if (targetUserId === user?.id) {
      showToast("err", "Vous ne pouvez pas révoquer votre propre accès.");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId);

    if (error) {
      showToast("err", "Erreur lors de la révocation.");
    } else {
      setTeam(team.filter(t => t.user_id !== targetUserId));
      showToast("ok", "Accès administrateur révoqué.");
    }
  };

  // ── Rendu ──
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  // Écran de blocage si non superadmin
  if (isSuperAdmin === false) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Gestion de l'Équipe</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center flex flex-col items-center">
          <Shield className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Accès Restreint</h2>
          <p className="text-red-600">
            L'administration de l'équipe est strictement réservée aux <strong>Super Admins</strong>. 
            Votre niveau d'habilitation actuel ne permet pas de visualiser cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl ${
            toast.type === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.text}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
          <Shield className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Gestion de l'Équipe</h1>
          <p className="text-purple-600 font-medium text-sm">Zone critique sécurisée (Super Admin)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Liste */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#0a0f1e] mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" /> Administrateurs Actifs
            </h2>
            
            <div className="space-y-4">
              {team.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-bold text-[#0a0f1e]">{member.full_name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {member.user_id.slice(0, 8)}...</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      member.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-[#d4af37]/20 text-[#0a0f1e] border-[#d4af37]/40'
                    }`}>
                      {member.role}
                    </span>
                    
                    {member.user_id !== user?.id && (
                      <button 
                        onClick={() => requirePasswordFor(() => handleRemoveMember(member.user_id))}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Révoquer l'accès"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Ajout */}
        <div>
          <div className="bg-gradient-to-b from-[#0a0f1e] to-[#1a2540] rounded-2xl p-6 text-white shadow-xl sticky top-8">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#d4af37]" />
              Nommer un Admin
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              L'utilisateur doit posséder un compte client existant.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2 block">Email du compte</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#d4af37] focus:outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2 block">Niveau d'accès</label>
                <select 
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:border-[#d4af37] focus:outline-none appearance-none"
                >
                  <option value="admin" className="text-gray-900">Admin (Gestion standard)</option>
                  <option value="superadmin" className="text-gray-900">Super Admin (Accès total)</option>
                </select>
              </div>

              <button 
                onClick={() => requirePasswordFor(handleAddMember)}
                disabled={!newAdminEmail}
                className="w-full mt-4 py-3 bg-[#d4af37] hover:bg-[#b8952e] text-[#0a0f1e] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Autoriser l'accès
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de Sécurité (Test Mot de Passe) ── */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAuthModalOpen(false)} 
            />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200"
            >
              <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <KeyRound className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-center text-[#0a0f1e] mb-2">Validation Requise</h3>
              <p className="text-center text-gray-600 mb-6 text-sm">
                Vous vous apprêtez à modifier les privilèges d'accès critiques. Veuillez confirmer votre identité en saisissant votre mot de passe.
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {authError}
                </div>
              )}

              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-[#0a0f1e] mb-6 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                autoFocus
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setAuthModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeSecureAction}
                  disabled={!adminPassword || isAuthenticating}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}