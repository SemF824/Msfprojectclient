import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  FileText, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight,
  Building2, DollarSign, Activity, Loader2, Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { Link } from "react-router";
import { toast } from "sonner";

// ─── Stagger variants (anti-clignotement) ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ─── Colour map statique (Tailwind purge-safe) ─────────────────────────────────
const colorMap: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600"   },
  green:  { bg: "bg-green-50",  text: "text-green-600"  },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600"  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // ── États Globaux ──
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalProperties: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Fetch Global & Parallèle (React 18 Architecture) ──
  const fetchDashboardData = async (isMounted: boolean) => {
    if (!supabase) return;
    try {
      if (isMounted) setLoading(true);

      const [requestsRes, propertiesRes] = await Promise.all([
        supabase
          .from("devis_requests")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
      ]);

      if (requestsRes.error) throw requestsRes.error;
      if (propertiesRes.error) throw propertiesRes.error;

      const allRequests = requestsRes.data || [];
      const totalProps = propertiesRes.count || 0;

      const pending = allRequests.filter(r => r.status === "nouveau" || r.status === "en_cours").length;
      const approved = allRequests.filter(r => r.status === "approuve").length;

      if (isMounted) {
        setStats({
          totalRequests: allRequests.length,
          pendingRequests: pending,
          approvedRequests: approved,
          totalProperties: totalProps,
        });
        setRecentRequests(allRequests.slice(0, 5));
      }
    } catch (error: any) {
      console.error("Erreur Dashboard:", error);
      toast.error("Impossible de synchroniser les indicateurs de performance du tableau de bord.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDashboardData(isMounted);
    return () => { isMounted = false; };
  }, []);

  // ── Export CSV Sécurisé ──
  const exportToCSV = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("devis_requests").select("*");
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("Aucune donnée disponible pour l'exportation.");
        return;
      }

      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row =>
        Object.values(row)
          .map(value => typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value)
          .join(",")
      ).join("\n");

      const csvContent = "\uFEFF" + headers + "\n" + rows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `msf-pipeline-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Registre des transactions exporté avec succès.");
    } catch (error: any) {
      console.error(error);
      toast.error("Échec de la génération du fichier d'export CSV.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
        <p className="text-sm text-gray-500 animate-pulse font-medium">Compilation analytique en cours...</p>
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Demandes", value: stats.totalRequests, icon: FileText, color: "blue", desc: "Flux global des opportunités" },
    { title: "En attente / Cours", value: stats.pendingRequests, icon: Clock, color: "amber", desc: "Dossiers en cours d'analyse" },
    { title: "Dossiers Approuvés", value: stats.approvedRequests, icon: CheckCircle, color: "green", desc: "Projets validés MSF Congo" },
    { title: "Biens Actifs", value: stats.totalProperties, icon: Building2, color: "purple", desc: "Annonces en ligne au catalogue" },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a0f1e] tracking-tight">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm mt-1">Supervision globale et performance opérationnelle</p>
        </div>
        <div className="text-xs font-semibold px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 text-gray-600 flex items-center gap-2 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" /> 
          Système connecté • {format(new Date(), "dd MMMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* ── KPIs Grille ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => {
          const Theme = colorMap[card.color] || colorMap.blue;
          return (
            <motion.div key={i} variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">{card.title}</p>
                  <h3 className="text-3xl font-black text-[#0a0f1e] tracking-tight group-hover:text-[#d4af37] transition-colors">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl border border-gray-100 ${Theme.bg} ${Theme.text} shadow-sm`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 font-medium border-t border-gray-50 pt-3">{card.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Contenu Central ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#0a0f1e]">Demandes Récentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dernières entrées du pipeline prospects</p>
            </div>
            <button onClick={() => navigate("/admin/demandes")} className="text-xs font-bold text-[#d4af37] hover:text-[#b8952e] flex items-center gap-1 bg-[#d4af37]/5 px-3 py-1.5 rounded-lg transition-all">
              Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100 flex-1">
            {recentRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-400 text-sm">
                Aucune demande en attente dans le flux de conversion.
              </div>
            ) : (
              recentRequests.map((req) => {
                const statusColors: Record<string, string> = {
                  nouveau: "bg-blue-50 text-blue-700 border-blue-100",
                  en_cours: "bg-amber-50 text-amber-700 border-amber-100",
                  approuve: "bg-green-50 text-green-700 border-green-100",
                  rejete: "bg-red-50 text-red-700 border-red-100",
                };
                const status = req.status || "nouveau";
                return (
                  <div key={req.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-[#0a0f1e] truncate">{req.property_name || "Nom non renseigné"}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span className="font-medium text-gray-600 truncate max-w-[150px]">{req.client_email}</span>
                        <span>•</span>
                        <span>{format(new Date(req.created_at), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {req.property_price && (
                        <span className="text-xs font-bold text-[#0a0f1e] bg-gray-100 px-2.5 py-1 rounded-md">
                          {new Intl.NumberFormat("fr-FR").format(req.property_price)} FCFA
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
                        {status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Raccourcis / Actions Rapides */}
        <div className="bg-[#0a0f1e] rounded-2xl p-6 text-white h-fit shadow-lg border border-white/5">
          <h2 className="text-xl font-bold mb-6 tracking-tight">Raccourcis</h2>
          <div className="space-y-3">
            <Link to="/admin/proprietes" className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left group block">
              <Building2 className="w-5 h-5 text-[#d4af37] border border-white/10 bg-white/5 p-1 rounded-md" />
              <div>
                <p className="text-sm font-semibold group-hover:text-[#d4af37] transition-colors">Catalogue Propriétés</p>
                <p className="text-[10px] text-gray-400">Gérer l'index des annonces</p>
              </div>
            </Link>
            
            <button onClick={exportToCSV} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left group">
              <Download className="w-5 h-5 text-blue-400 border border-white/10 bg-white/5 p-1 rounded-md" />
              <div>
                <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors">Exporter Données</p>
                <p className="text-[10px] text-gray-400">Extraire le registre complet (CSV)</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}