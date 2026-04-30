import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  FileText, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight,
  Building2, DollarSign, Activity, Loader2, AlertCircle, Download
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../../../hooks/useSupabaseAuth";
import { Link } from "react-router"; // Corrigé depuis react-router-dom pour Vite moderne si configuré

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
  const [stats, setStats] = useState({
    pendingRequests: 0,
    potentialRevenue: 0,
    approvedCount: 0,
    totalRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      // 1. Vérification du câblage Supabase
      if (!supabase) {
        console.error("CRITICAL: Client Supabase non initialisé (Variables d'environnement manquantes).");
        if (isMounted) navigate("/");
        return;
      }

      setIsLoading(true);

      try {
        // 2. Récupération des vraies données
        const { data: allData, error: dataError } = await supabase
          .from('devis_requests')
          .select('status, property_price, created_at, client_first_name, client_last_name, property_name');

        if (dataError) throw dataError;

        if (allData && isMounted) {
          // Calculs sécurisés
          const pending = allData.filter(d => !d.status || d.status === 'nouveau' || d.status === 'en_cours').length;
          const approved = allData.filter(d => d.status === 'approuve' || d.status === 'traite').length;

          let revenue = 0;
          allData.forEach(req => {
            // Nettoyer les chaînes de caractères si le prix contient des espaces ou la mention FCFA
            if (req.property_price) {
              const cleanPrice = String(req.property_price).replace(/[^0-9]/g, '');
              const numPrice = parseInt(cleanPrice, 10);
              if (!isNaN(numPrice)) revenue += numPrice;
            }
          });

          setStats({
            pendingRequests: pending,
            potentialRevenue: revenue,
            approvedCount: approved,
            totalRequests: allData.length
          });

          // Tri et extraction des 5 plus récents
          const latest = allData
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 5);

          setRecentRequests(latest);
        }
      } catch (err: any) {
        console.error("Erreur critique Dashboard:", err);
        if (isMounted) {
          setError("Échec de connexion à la base de données pour les devis.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [navigate]);

  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  // Export CSV Fonctionnel
  const exportToCSV = async () => {
    const { data } = await supabase.from('devis_requests').select('*');
    if (!data || data.length === 0) return alert("Aucune donnée à exporter.");

    const headers = ['Date', 'Client', 'Propriété', 'Prix', 'Statut'];
    const csvData = data.map(req => [
      format(new Date(req.created_at), 'dd/MM/yyyy HH:mm'),
      `"${req.client_first_name} ${req.client_last_name}"`,
      `"${req.property_name || 'Non spécifié'}"`,
      `"${req.property_price || 0}"`,
      `"${req.status || 'nouveau'}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MSF_Devis_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500 animate-pulse">Synchronisation des données du Dashboard...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-2xl m-8 shadow-sm border border-red-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#0a0f1e] mb-2">Impossible de charger les statistiques</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-lg">Réessayer</button>
      </div>
    );
  }

  // Affichage des cartes de statistiques
  const statCards = [
    { title: "Dossiers en Attente",  value: stats.pendingRequests, icon: Clock,        trend: "Actifs", trendUp: true,  color: "blue"   },
    { title: "Ventes Potentielles",  value: formatCurrency(stats.potentialRevenue), icon: DollarSign, trend: "Pipeline",  trendUp: true,  color: "green"  },
    { title: "Dossiers Approuvés",   value: stats.approvedCount,   icon: CheckCircle,  trend: "Validés",  trendUp: true,  color: "purple" },
    { title: "Total Demandes",       value: stats.totalRequests,   icon: FileText,     trend: "Global", trendUp: true,  color: "amber"  },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-[#0a0f1e] font-bold mb-2">Tableau de Bord</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité MSF Congo.</p>
      </div>

      {/* ── Stat cards avec stagger ── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => {
          const colors = colorMap[stat.color] ?? colorMap.blue;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl text-[#0a0f1e] font-bold truncate" title={String(stat.value)}>{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activités Récentes (Blindées contre les données nulles) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-[#0a0f1e] font-bold">Derniers Devis (Réels)</h2>
            <Link to="/admin/demandes" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                Aucun devis enregistré pour le moment.
              </div>
            ) : (
              recentRequests.map((req, i) => {
                const firstName = req.client_first_name || 'Client';
                const lastName = req.client_last_name || 'Inconnu';
                const initials = (`${firstName.charAt(0)}${lastName.charAt(0)}`).toUpperCase();
                const status = req.status || 'nouveau';
                const date = req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : '-';

                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-[#0a0f1e] rounded-full flex items-center justify-center font-bold text-[#d4af37] flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0a0f1e] font-semibold truncate">{firstName} {lastName}</p>
                      <p className="text-sm text-gray-500 truncate">Demande pour : {req.property_name || 'Bien non spécifié'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-[#0a0f1e]">{date}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${status === 'nouveau' ? 'bg-amber-100 text-amber-700' : status === 'approuve' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="bg-[#0a0f1e] rounded-2xl p-6 text-white h-fit shadow-lg">
          <h2 className="text-xl font-bold mb-6">Raccourcis</h2>
          <div className="space-y-3">
            <Link to="/admin/proprietes" className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left group block">
              <Building2 className="w-5 h-5 text-[#d4af37]" />
              <div>
                <p className="text-sm font-semibold group-hover:text-[#d4af37] transition-colors">Catalogue Propriétés</p>
                <p className="text-[10px] text-gray-400">Gérer les annonces</p>
              </div>
            </Link>
            <button onClick={exportToCSV} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left group">
              <Download className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors">Exporter Données</p>
                <p className="text-[10px] text-gray-400">Rapport complet (CSV)</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}