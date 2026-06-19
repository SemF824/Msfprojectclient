import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, UserPlus, Trash2, Lock,
  Loader2, Search, KeyRound, X
} from "lucide-react";
import { supabase, useSupabaseAuth } from "../../../hooks/useSupabaseAuth";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState<boolean>(true);

  // ── États du formulaire d'ajout ──
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [newAdminRole, setNewAdminRole] = useState<string>("admin");
  
  // ── États du test par mot de passe (Sécurité) ──
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // 1. Vérifier les habilitations et charger l'équipe
  const verifyAndLoadTeam = async (isMounted: boolean) => {
    if (!user || !supabase) return;

    try {
      // Vérification stricte du rôle
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || roleData?.role !== "superadmin") {
        if (isMounted) setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      if (isMounted) setIsSuperAdmin(true);

      // Charger l'équipe (jointure manuelle sécurisée via profiles)
      const { data: roles, error: fetchRolesError } = await supabase.from("user_roles").select("*");
      if (fetchRolesError) throw fetchRolesError;
      
      if (roles) {
        const userIds = roles.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;

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
    } catch (err) {
      console.error("Erreur critique Team Habilitations:", err);
      toast.error("Impossible de synchroniser le registre de sécurité.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    verifyAndLoadTeam(isMounted);
    return () => { isMounted = false; };
  }, [user]);

  // 2. Le Test par Mot de Passe
  const executeSecureAction = async () => {
    if (!supabase || !user?.email || !pendingAction) return;
    setIsAuthenticating(true);
    setAuthError("");

    try {
      // Re-vérification du mot de passe via ré-authentification Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: adminPassword,
      });

      if (error) throw new Error("Accès refusé. Mot de passe incorrect.");

      // Exécution sécurisée de la promesse
      await pendingAction();
      
      setAuthModalOpen(false);
      setAdminPassword("");
      setPendingAction(null);
    } catch (err: any) {
      setAuthError(err.message);
      toast.error(err.message);
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
    
    try {
      // Résolution de l'ID par l'email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("email", newAdminEmail)
        .single();

      if (profileError || !profile) {
        toast.error("Aucun compte trouvé. Le destinataire doit d'abord s'inscrire sur l'application.");
        return;
      }

      // Mutation des droits
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: newAdminRole });

      if (insertError) throw insertError;

      toast.success("Habilitation accordée avec succès.");
      setNewAdminEmail("");
      
      // Mise à jour de l'état local sans recharger la page brutalement
      setTeam(prev => [...prev, { 
        user_id: profile.id, 
        role: newAdminRole, 
        email: profile.email || "Email masqué", 
        full_name: profile.full_name || "Utilisateur" 
      }]);

    } catch (error: any) {
      console.error(error);
      toast.error("Cet utilisateur possède déjà un niveau d'accès assigné.");
    }
  };

  // 4. Révoquer un membre
  const handleRemoveMember = async (targetUserId: string) => {
    if (!supabase) return;
    if (targetUserId === user?.id) {
      toast.error("Opération interdite : vous ne pouvez pas révoquer votre propre accès.");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId);

      if (error) throw error;

      setTeam(prev => prev.filter(t => t.user_id !== targetUserId));
      toast.success("Privilèges administratifs révoqués.");
    } catch (error) {
      console.error(error);
      toast.error("Échec de la révocation de droits.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

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
                  <X className="w-4 h-4" /> {authError}
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
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="button"
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