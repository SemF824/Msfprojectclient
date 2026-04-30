import { useState, useEffect } from "react";
import { motion, type Variants } from "motion/react";
import { Link } from "react-router";
import { Calendar, FileText, Heart, Lock, Search, Calculator } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import type { Appointment, DevisRequest, Favorite, Document } from "../../types/database.types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Dashboard() {
  const { user: authUser } = useSupabaseAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [appointments,  setAppointments]  = useState<Appointment[]>([]);
  const [devisRequests, setDevisRequests] = useState<DevisRequest[]>([]);
  const [favorites,     setFavorites]     = useState<Favorite[]>([]);
  const [documents,     setDocuments]     = useState<Document[]>([]);

  useEffect(() => {
    if (!authUser || !supabase) return;
    (async () => {
      setIsDataLoading(true);
      try {
        const uid   = authUser.id;
        const email = authUser.email || "";
        const [ap, dv, fv, dc] = await Promise.all([
          supabase.from("appointments").select("*").eq("user_id", uid).order("appointment_date", { ascending: true }),
          supabase.from("devis_requests").select("*").eq("client_email", email).order("created_at", { ascending: false }),
          supabase.from("favorites").select("*").eq("user_id", uid),
          supabase.from("documents").select("*").eq("user_id", uid),
        ]);
        setAppointments(ap?.data  || []);
        setDevisRequests(dv?.data || []);
        setFavorites(fv?.data || []);
        setDocuments(dc?.data || []);
      } catch (e) { console.error("Fetch error:", e); } finally { setIsDataLoading(false); }
    })();
  }, [authUser]);

  const displayName  = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Utilisateur";

  const stats = [
    { label: "Demandes Actives", value: devisRequests.filter(r => r?.status === "nouveau" || r?.status === "en_cours").length.toString(), icon: FileText, color: "from-blue-500 to-blue-600" },
    { label: "Propriétés Favorites", value: favorites.length.toString(), icon: Heart, color: "from-pink-500 to-pink-600" },
    { label: "Visites Planifiées", value: appointments.filter(a => (a as any)?.status === "planifie").length.toString(), icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Documents Sécurisés", value: documents.length.toString(), icon: Lock, color: "from-purple-500 to-purple-600" },
  ];

  const statusLabel = (s: string) => ({ en_attente: "En attente", complete: "Terminée", echoue: "Échouée", planifie: "Planifié", nouveau: "Nouveau", en_cours: "En cours" }[s] ?? s ?? "Inconnu");

  if (isDataLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-1">Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">{displayName.split(" ")[0]}</span></h1>
          <p className="text-gray-500 text-sm">Voici un aperçu de votre activité</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] rounded-2xl shadow-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative z-10">
              <h2 className="text-2xl text-white font-semibold mb-2">Entamer une démarche immobilière</h2>
              <p className="text-gray-300 mb-6 max-w-xl">Prêt à trouver la maison de vos rêves ou à investir ? Explorez nos biens ou contactez un conseiller MSF pour un accompagnement sur-mesure.</p>
              <div className="flex flex-wrap gap-4">
                  <Link to="/vitrine" className="px-6 py-3 bg-[#d4af37] text-[#0a0f1e] font-semibold rounded-xl hover:bg-[#f4e3b2] transition-colors flex items-center gap-2">
                      <Search className="w-5 h-5" /> Explorer les biens
                  </Link>
                  <Link to="/client/loan" className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2">
                      <Calculator className="w-5 h-5" /> Estimer mon prêt
                  </Link>
              </div>
          </div>
      </motion.div>

      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible">
        {stats.map((s, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl text-[#0a0f1e] font-bold">{s.value}</p><p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-[#0a0f1e] font-semibold">Prochains Rendez-vous</h2>
                  <Link to="/client/appointments" className="text-sm text-[#d4af37] hover:underline">Voir tout</Link>
              </div>
              {appointments.length === 0 ? (
                  <EmptyState icon={Calendar} title="Aucun rendez-vous" description="Vous n'avez pas de visite prévue." />
              ) : (
                  <div className="space-y-3">
                      {appointments.slice(0, 3).map(apt => (
                          <div key={apt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-xl flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5 text-[#d4af37]" /></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-[#0a0f1e] font-medium text-sm truncate">{(apt as any).title}</p>
                                  <p className="text-xs text-gray-500">{new Date((apt as any).appointment_date).toLocaleDateString("fr-FR")}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-[#0a0f1e] font-semibold">Demandes Actives</h2>
                  <Link to="/client/requests" className="text-sm text-[#d4af37] hover:underline">Voir tout</Link>
              </div>
              {devisRequests.length === 0 ? (
                  <EmptyState icon={FileText} title="Aucune demande" description="Vous n'avez pas de demande en cours." />
              ) : (
                  <div className="space-y-3">
                      {devisRequests.slice(0, 3).map(r => (
                          <div key={r.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-blue-600" /></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-[#0a0f1e] font-medium text-sm truncate">{r.property_name}</p>
                                  <p className="text-xs text-gray-500 capitalize">{r.status}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </motion.div>
      </div>
    </div>
  );
}