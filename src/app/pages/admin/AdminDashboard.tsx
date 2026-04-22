import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, Users, FileText, DollarSign, 
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  Loader2, ArrowUpRight
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../../hooks/useSupabaseAuth";

export default function AdminDashboard() {
  const { user } = useSupabaseAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    potentialRevenue: 0,
    approvedRequests: 0,
    recentRequests: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!supabase) return;
      setIsLoading(true);

      try {
        // 1. Récupérer toutes les demandes pour les calculs
        const { data: requests, error } = await supabase
          .from('devis_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Calculs dynamiques
        const total = requests?.length || 0;
        const pending = requests?.filter(r => r.status === 'nouveau' || r.status === 'en_cours').length || 0;
        const approved = requests?.filter(r => r.status === 'approuve').length || 0;
        
        // Somme des prix pour les projets non rejetés (Ventes potentielles)
        const revenue = requests?.filter(r => r.status !== 'rejete')
          .reduce((acc, curr) => acc + (Number(curr.property_price) || 0), 0) || 0;

        setStats({
          totalRequests: total,
          pendingRequests: pending,
          potentialRevenue: revenue,
          approvedRequests: approved,
          recentRequests: requests?.slice(0, 5) || [] // Les 5 dernières
        });

      } catch (err) {
        console.error("Erreur Dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: "Chiffre d'Affaires Potentiel",
      value: `${new Intl.NumberFormat('fr-FR').format(stats.potentialRevenue)} FCFA`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      desc: "Total des projets actifs"
    },
    {
      title: "Demandes Totales",
      value: stats.totalRequests,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
      desc: "Dossiers enregistrés"
    },
    {
      title: "En Attente",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
      desc: "Nouveaux et en cours"
    },
    {
      title: "Dossiers Approuvés",
      value: stats.approvedRequests,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-100",
      desc: "Prêts pour transaction"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500">Génération des statistiques réelles...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0a0f1e]">Tableau de Bord</h1>
        <p className="text-gray-600">Bienvenue, {user?.user_metadata?.first_name || "Admin"}. Voici l'état actuel de MSF Congo.</p>
      </div>

      {/* Cartes de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-sm text-gray-500 font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-[#0a0f1e] mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-2">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dernières Activités */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#0a0f1e]">Demandes Récentes</h2>
            <Link to="/demandes" className="text-sm text-[#d4af37] hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentRequests.length > 0 ? (
              stats.recentRequests.map((req) => (
                <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                      {req.client_first_name[0]}{req.client_last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a0f1e]">{req.client_first_name} {req.client_last_name}</p>
                      <p className="text-xs text-gray-500">{req.property_name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    req.status === 'approuve' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">Aucune demande enregistrée.</div>
            )}
          </div>
        </div>

        {/* Aide Rapide / État Système */}
        <div className="bg-gradient-to-br from-[#0a0f1e] to-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
            <BarChart3 className="w-6 h-6 text-[#d4af37]" />
          </div>
          <h2 className="text-xl font-bold mb-4">Analyse de Performance</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Votre taux de conversion actuel est basé sur {stats.approvedRequests} dossiers approuvés sur {stats.totalRequests} demandes totales.
          </p>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status Base de données</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Supabase RLS Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}