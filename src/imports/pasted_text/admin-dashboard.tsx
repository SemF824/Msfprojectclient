Agis en tant qu'Architecte React et Expert en Résilience Logicielle. Actuellement, notre AdminDashboard.tsx crashe en production (White Screen of Death) car il ne gère ni les valeurs null de la base de données, ni l'absence potentielle des variables d'environnement Supabase sur Vercel.

Tâche Unique : Remplace l'intégralité du fichier src/app/pages/admin/AdminDashboard.tsx par le code fourni ci-dessous.

Contraintes Strictes :

N'ajoute AUCUNE donnée factice (mock data).

N'ajoute AUCUNE clé Supabase en dur (fallback).

Conserve intacte la logique de redirection (useNavigate) qui renvoie vers / en cas d'erreur critique.

Voici le code complet à injecter :

TypeScript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { 
  FileText, CheckCircle, Clock, 
  ArrowUpRight, ArrowDownRight,
  Building2, DollarSign, Activity, Loader2, AlertCircle
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";

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
          const pending = allData.filter(d => d.status === 'nouveau' || d.status === 'en_cours').length;
          const approved = allData.filter(d => d.status === 'approuve').length;
          const revenue = allData.reduce((acc, curr) => acc + (Number(curr.property_price) || 0), 0);

          setStats({
            pendingRequests: pending,
            potentialRevenue: revenue,
            approvedCount: approved,
            totalRequests: allData.length
          });

          // Tri et extraction des 5 plus récents avec protection anti-crash
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
          setError("Échec de connexion à la base de données.");
          // Éjection vers l'accueil après 3 secondes pour que l'utilisateur comprenne
          setTimeout(() => navigate("/"), 3000); 
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false; // Cleanup pour éviter les fuites de mémoire
    };
  }, [navigate]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500 animate-pulse">Synchronisation des données...</p>
      </div>
    );
  }

  // État d'erreur avec éjection
  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-2xl m-8 shadow-sm border border-red-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#0a0f1e] mb-2">Accès Impossible</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirection vers l'accueil en cours...</span>
        </div>
      </div>
    );
  }

  // Affichage des cartes de statistiques
  const statCards = [
    { title: "Dossiers en Attente", value: stats.pendingRequests, icon: Clock, trend: "+12%", trendUp: true, color: "blue" },
    { title: "Ventes Potentielles", value: `${new Intl.NumberFormat('fr-FR').format(stats.potentialRevenue)} FCFA`, icon: DollarSign, trend: "+8%", trendUp: true, color: "green" },
    { title: "Dossiers Approuvés", value: stats.approvedCount, icon: CheckCircle, trend: "+5%", trendUp: true, color: "purple" },
    { title: "Total Demandes", value: stats.totalRequests, icon: FileText, trend: "+15%", trendUp: true, color: "amber" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-[#0a0f1e] font-bold mb-2">Tableau de Bord</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité MSF Congo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl text-[#0a0f1e] font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activités Récentes (Blindées contre les données nulles) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl text-[#0a0f1e] font-bold mb-6">Activités Récentes</h2>
          <div className="space-y-4">
            {recentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune demande enregistrée pour le moment.
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
                    <div className="w-12 h-12 bg-[#0a0f1e] rounded-full flex items-center justify-center font-bold text-[#d4af37]">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0a0f1e] font-semibold">{firstName} {lastName}</p>
                      <p className="text-sm text-gray-500">Demande pour : {req.property_name || 'Bien non spécifié'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#0a0f1e]">{date}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${status === 'nouveau' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
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
        <div className="bg-[#0a0f1e] rounded-2xl p-6 text-white h-fit">
          <h2 className="text-xl font-bold mb-6">Raccourcis</h2>
          <div className="space-y-3">
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left">
              <Building2 className="w-5 h-5 text-[#d4af37]" />
              <div>
                <p className="text-sm font-semibold">Catalogue Propriétés</p>
                <p className="text-[10px] text-gray-400">Gérer les annonces</p>
              </div>
            </button>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-3 px-4 border border-white/10 text-left">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-semibold">Exporter Données</p>
                <p className="text-[10px] text-gray-400">Rapport CSV</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}