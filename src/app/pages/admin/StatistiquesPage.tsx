import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Users, FileText,
  CheckCircle, DollarSign, Loader2, Calendar, RefreshCcw, Info
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeScale = "jour" | "semaine" | "mois" | "trimestre" | "annee";

interface KPI {
  label:    string;
  value:    string | number;
  icon:     React.ElementType;
  color:    string;
  subtitle: string;
}

interface StatusCount { status: string; count: number; }
interface TimeData    { label: string;  count: number; }
interface TopProp     { name: string;   count: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  nouveau:    "#3b82f6",
  en_cours:   "#d4af37",
  documents:  "#8b5cf6",
  approuve:   "#22c55e",
  rejete:     "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  nouveau:   "Nouveau",
  en_cours:  "En cours",
  documents: "Documents",
  approuve:  "Approuvé",
  rejete:    "Rejeté",
};

// ─── SVG Pie chart ────────────────────────────────────────────────────────────
function PieChart({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-medium">Aucune donnée sur cette période</div>
  );

  const CX = 100; const CY = 100; const R = 80;
  let cumAngle = -Math.PI / 2;

  const slices = data.map(d => {
    const angle = (d.count / total) * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    const x1 = CX + R * Math.cos(start);
    const y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(cumAngle);
    const y2 = CY + R * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    // Si c'est 100% (un seul statut), on dessine un cercle complet
    if (d.count === total) {
      return { ...d, path: `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R} Z`, color: STATUS_COLORS[d.status] ?? "#94a3b8" };
    }
    const path  = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    return { ...d, path, color: STATUS_COLORS[d.status] ?? "#94a3b8" };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-sm">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" className="transition-all hover:opacity-80 cursor-pointer" />
        ))}
        {/* Centre pour effet Donut */}
        <circle cx={CX} cy={CY} r="45" fill="white" />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="22" fontWeight="900" fill="#0a0f1e">{total}</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fontWeight="500" fill="#6b7280">Total</text>
      </svg>
      {/* Légende Dynamique */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-semibold text-gray-700">{STATUS_LABELS[s.status] ?? s.status} <span className="text-gray-400 ml-1">({s.count})</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Bar chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: TimeData[] }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-medium">Aucune donnée</div>
  );

  const maxVal    = Math.max(...data.map(d => d.count), 1);
  const CHART_H   = 160;
  const BAR_W     = Math.max(12, Math.min(30, 600 / data.length)); // Largeur dynamique
  const GAP       = 10;
  const LEFT_PAD  = 35;
  const CHART_W   = data.length * (BAR_W + GAP) + LEFT_PAD;

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 50}`} style={{ minWidth: "100%", height: CHART_H + 50 }}>
        {/* Lignes de repère (Y-Axis) */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = CHART_H * (1 - f);
          return (
            <g key={i}>
              <line x1={LEFT_PAD} y1={y} x2={CHART_W} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
              <text x={LEFT_PAD - 8} y={y + 4} textAnchor="end" fontSize="10" fontWeight="600" fill="#94a3b8">
                {Math.round(maxVal * f)}
              </text>
            </g>
          );
        })}
        {/* Barres (Données) */}
        {data.map((d, i) => {
          const barH = (d.count / maxVal) * CHART_H;
          const x    = LEFT_PAD + i * (BAR_W + GAP);
          const y    = CHART_H - barH;
          return (
            <g key={i} className="group">
              <rect x={x} y={y} width={BAR_W} height={barH} fill="#d4af37" className="transition-all duration-300 group-hover:opacity-80" rx="4" />
              {d.count > 0 && (
                <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0a0f1e" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count}
                </text>
              )}
              <text x={x + BAR_W / 2} y={CHART_H + 20} textAnchor="middle" fontSize="9" fontWeight="500" fill="#6b7280" transform={data.length > 15 ? `rotate(45 ${x + BAR_W / 2} ${CHART_H + 20})` : ""}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StatistiquesPage() {
  const [scale, setScale]           = useState<TimeScale>("jour");
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [kpis, setKpis]             = useState<KPI[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [chartData, setChartData]   = useState<TimeData[]>([]);
  const [topProps, setTopProps]     = useState<TopProp[]>([]);

  const loadData = async (showRefreshSpinner = false) => {
    if (!supabase) return;
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Récupération de l'historique complet pour un vrai pilotage
      const [allReqsResponse, allDocsResponse] = await Promise.all([
        supabase.from("devis_requests").select("status, property_price, client_email, property_name, created_at").order('created_at', { ascending: true }),
        supabase.from("documents").select("id, created_at"),
      ]);

      const reqs = allReqsResponse.data || [];
      const docs = allDocsResponse.data || [];

      // ── MOTEUR D'ÉCHELLE TEMPORELLE (X-Axis Generation) ──
      const timeSeries: Record<string, number> = {};
      const now = new Date();

      if (scale === "jour") {
        // 30 derniers jours
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          timeSeries[`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
        }
      } else if (scale === "semaine") {
        // 12 dernières semaines
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 7 * 86400000);
          const day = d.getDay() || 7;
          d.setDate(d.getDate() - day + 1); // Lundi
          timeSeries[`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
        }
      } else if (scale === "mois") {
        // 12 derniers mois
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          timeSeries[`${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`] = 0;
        }
      } else if (scale === "trimestre") {
        // 8 derniers trimestres (2 ans)
        for (let i = 7; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
          const q = Math.floor(d.getMonth() / 3) + 1;
          timeSeries[`T${q} ${String(d.getFullYear()).slice(-2)}`] = 0;
        }
      } else if (scale === "annee") {
        // 5 dernières années
        for (let i = 4; i >= 0; i--) {
          timeSeries[String(now.getFullYear() - i)] = 0;
        }
      }

      // ── FILTRAGE DES STATUTS ET PEUPLEMENT DU GRAPHIQUE ──
      const statusMap: Record<string, number> = {};
      const validKeys = Object.keys(timeSeries);
      
      reqs.forEach(r => {
        if (!r.created_at) return;
        const d = new Date(r.created_at);
        let key = "";

        // Calcul de la clé d'agrégation selon l'échelle
        if (scale === "jour") {
          key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        } else if (scale === "semaine") {
          const day = d.getDay() || 7;
          const monday = new Date(d);
          monday.setDate(d.getDate() - day + 1);
          key = `${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")}`;
        } else if (scale === "mois") {
          key = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
        } else if (scale === "trimestre") {
          const q = Math.floor(d.getMonth() / 3) + 1;
          key = `T${q} ${String(d.getFullYear()).slice(-2)}`;
        } else if (scale === "annee") {
          key = String(d.getFullYear());
        }

        // Si la donnée rentre dans l'échelle de temps affichée, on l'ajoute
        if (key in timeSeries) {
          timeSeries[key]++;
          if (r.status) statusMap[r.status] = (statusMap[r.status] || 0) + 1;
        }
      });

      setChartData(Object.entries(timeSeries).map(([label, count]) => ({ label, count })));
      setStatusData(Object.entries(statusMap).map(([status, count]) => ({ status, count })));

      // ── CALCUL DES KPIs GLOBAUX ──
      const totalDemandes = reqs.length;
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const ceMois = reqs.filter(r => r.created_at >= debutMois).length;
      const valPotentielle = reqs.reduce((s, r) => s + (Number(r.property_price) || 0), 0);
      const nApprouve = reqs.filter(r => r.status === "approuve").length;
      const tauxApprob = totalDemandes > 0 ? Math.round((nApprouve / totalDemandes) * 100) : 0;
      const uniqueClients = new Set(reqs.map(r => r.client_email).filter(Boolean)).size;

      setKpis([
        { label: "Total Demandes", value: totalDemandes, icon: FileText, color: "bg-blue-50 text-blue-600", subtitle: "Toutes les requêtes enregistrées" },
        { label: "Demandes ce mois", value: ceMois, icon: Calendar, color: "bg-green-50 text-green-600", subtitle: `Depuis le 1er ${now.toLocaleString('fr-FR', {month: 'long'})}` },
        { label: "Valeur Pipeline", value: new Intl.NumberFormat("fr-FR").format(valPotentielle) + " FCFA", icon: DollarSign, color: "bg-amber-50 text-amber-600", subtitle: "Somme des budgets estimés" },
        { label: "Taux d'Approbation", value: tauxApprob + "%", icon: CheckCircle, color: "bg-purple-50 text-purple-600", subtitle: `Dossiers validés (${nApprouve}) / Total` },
        { label: "Documents Reçus", value: docs.length, icon: BarChart3, color: "bg-cyan-50 text-cyan-600", subtitle: "Pièces justificatives uploadées" },
        { label: "Base Prospects", value: uniqueClients, icon: Users, color: "bg-rose-50 text-rose-600", subtitle: "Adresses emails uniques" },
      ]);

      // ── TOP PROPRIÉTÉS ──
      const propMap: Record<string, number> = {};
      reqs.forEach(r => { if (r.property_name) propMap[r.property_name] = (propMap[r.property_name] || 0) + 1; });
      setTopProps(Object.entries(propMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5));

    } catch (err) {
      console.error("Erreur Statistiques:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [scale]);

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Extraction des données de performance…</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── HEADER & CONTRÔLES TEMPORELS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-black tracking-tight">Analytics MSF</h1>
          <p className="text-gray-500 mt-1">Pilotez votre croissance avec des données précises.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
            {(["jour", "semaine", "mois", "trimestre", "annee"] as TimeScale[]).map(s => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  scale === s
                    ? "bg-white text-[#0a0f1e] shadow-md ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => loadData(true)}
            className="flex items-center justify-center w-10 h-10 bg-[#0a0f1e] text-[#d4af37] rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
            title="Forcer l'actualisation"
          >
            <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPIs (Avec légendes explicites) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-[#d4af37]/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${kpi.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1 text-gray-400 group-hover:text-[#d4af37] transition-colors" title={kpi.subtitle}>
                  <Info className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl text-[#0a0f1e] font-black tracking-tight">{kpi.value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{kpi.label}</p>
                <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2">{kpi.subtitle}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── GRAPHIQUES ET DONNÉES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graphique d'évolution (Prend les 2/3 de l'espace) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl text-[#0a0f1e] font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#d4af37]" />
                Volume de Demandes
              </h2>
              <p className="text-sm text-gray-500 mt-1">Évolution filtrée par <strong className="text-[#0a0f1e] uppercase">{scale}</strong></p>
            </div>
          </div>
          <BarChart data={chartData} />
        </div>

        {/* Camembert (1/3 de l'espace) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center">
          <div className="w-full mb-6">
            <h2 className="text-xl text-[#0a0f1e] font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#d4af37]" /> Répartition
            </h2>
            <p className="text-sm text-gray-500 mt-1">Statut des demandes sur la période affichée</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <PieChart data={statusData} />
          </div>
        </div>

        {/* Top Propriétés (Pleine largeur en bas) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl text-[#0a0f1e] font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#d4af37]" /> Le Top 5 des Propriétés
          </h2>
          {topProps.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8 bg-gray-50 rounded-xl border border-dashed">Aucune donnée disponible pour établir un classement.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {topProps.map((p, i) => {
                const pct = Math.round((p.count / (topProps[0]?.count || 1)) * 100);
                return (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-8 h-8 rounded-full bg-[#0a0f1e] text-[#d4af37] font-black flex items-center justify-center flex-shrink-0 shadow-md">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base text-[#0a0f1e] font-bold truncate">{p.name}</span>
                        <span className="text-sm font-black text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-lg ml-3 flex-shrink-0">{p.count} leads</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}