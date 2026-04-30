import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Users, FileText,
  CheckCircle, DollarSign, Loader2, Calendar
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "30d" | "1y" | "2y" | "10y";

interface KPI {
  label:    string;
  value:    string | number;
  icon:     React.ElementType;
  color:    string;
  subtitle?: string;
}

interface StatusCount { status: string; count: number; }
interface MonthCount  { month: string;  count: number; }
interface TopProp     { name: string;   count: number; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PERIOD_DAYS: Record<Period, number> = { 
  "30d": 30, 
  "1y": 365, 
  "2y": 730, 
  "10y": 3650 
};

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
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée</div>
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
    const path  = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    return { ...d, path, color: STATUS_COLORS[d.status] ?? "#94a3b8" };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-44 h-44">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5" />
        ))}
        {/* Centre */}
        <circle cx={CX} cy={CY} r="36" fill="white" />
        <text x={CX} y={CY - 6} textAnchor="middle" className="text-xs" fontSize="18" fontWeight="bold" fill="#0a0f1e">{total}</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="10" fill="#6b7280">total</text>
      </svg>
      {/* Légende */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600">{STATUS_LABELS[s.status] ?? s.status} ({s.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Bar chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: MonthCount[] }) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée</div>
  );

  const maxVal    = Math.max(...data.map(d => d.count), 1);
  const CHART_H   = 140;
  const BAR_W     = 20;
  const GAP       = 8;
  const LEFT_PAD  = 28;
  const CHART_W   = data.length * (BAR_W + GAP) + LEFT_PAD;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 40}`} style={{ minWidth: CHART_W, height: CHART_H + 40 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = CHART_H * (1 - f);
          return (
            <g key={i}>
              <line x1={LEFT_PAD} y1={y} x2={CHART_W} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={LEFT_PAD - 4} y={y + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
                {Math.round(maxVal * f)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.count / maxVal) * CHART_H;
          const x    = LEFT_PAD + i * (BAR_W + GAP);
          const y    = CHART_H - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={barH}
                fill="#d4af37" opacity="0.85" rx="3" />
              {d.count > 0 && (
                <text x={x + BAR_W / 2} y={y - 3} textAnchor="middle" fontSize="8" fill="#0a0f1e">
                  {d.count}
                </text>
              )}
              <text x={x + BAR_W / 2} y={CHART_H + 12} textAnchor="middle" fontSize="7.5" fill="#94a3b8">
                {d.month}
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
  const [period,     setPeriod]     = useState<Period>("30d");
  const [isLoading,  setIsLoading]  = useState(true);
  const [kpis,       setKpis]       = useState<KPI[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [monthData,  setMonthData]  = useState<MonthCount[]>([]);
  const [topProps,   setTopProps]   = useState<TopProp[]>([]);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!supabase) return;
      setIsLoading(true);

      const daysAgo = PERIOD_DAYS[period];
      const dateDebut = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [allReqs, periodReqs, allDocs] = await Promise.all([
        supabase.from("devis_requests").select("status, property_price, client_email, property_name, created_at"),
        supabase.from("devis_requests").select("status, property_price, client_email, property_name, created_at").gte("created_at", dateDebut),
        supabase.from("documents").select("id, created_at"),
      ]);

      if (!isMounted) return;

      const reqs      = allReqs.data     || [];
      const pReqs     = periodReqs.data  || [];
      const docs      = allDocs.data     || [];

      // ── KPIs ──
      const totalDemandes = reqs.length;
      const ceMois        = reqs.filter(r => r.created_at >= debutMois).length;
      const valPotentielle= reqs.reduce((s, r) => s + (Number(r.property_price) || 0), 0);
      const nApprouve     = reqs.filter(r => r.status === "approuve").length;
      const tauxApprob    = totalDemandes > 0 ? Math.round((nApprouve / totalDemandes) * 100) : 0;
      const docsTotal     = docs.length;
      const uniqueClients = new Set(reqs.map(r => r.client_email).filter(Boolean)).size;

      setKpis([
        { label: "Total Demandes",       value: totalDemandes,  icon: FileText,    color: "bg-blue-50 text-blue-600" },
        { label: "Ce mois",              value: ceMois,         icon: Calendar,    color: "bg-green-50 text-green-600" },
        { label: "Valeur Potentielle",   value: new Intl.NumberFormat("fr-FR").format(valPotentielle) + " FCFA", icon: DollarSign, color: "bg-amber-50 text-amber-600" },
        { label: "Taux d'Approbation",   value: tauxApprob + "%", icon: CheckCircle, color: "bg-purple-50 text-purple-600" },
        { label: "Documents Uploadés",   value: docsTotal,      icon: BarChart3,   color: "bg-cyan-50 text-cyan-600" },
        { label: "Clients Uniques",      value: uniqueClients,  icon: Users,       color: "bg-rose-50 text-rose-600" },
      ]);

      // ── Statuts (Calculés sur la période sélectionnée) ──
      const statusMap: Record<string, number> = {};
      pReqs.forEach(r => { if (r.status) statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([status, count]) => ({ status, count })));

      // ── Moteur d'Agrégation Dynamique ──
      const timeSeries: Record<string, number> = {};
      const now = new Date();

      // 1. Initialiser l'axe des X pour éviter les trous
      if (period === "30d") {
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          timeSeries[key] = 0;
        }
      } else if (period === "1y" || period === "2y") {
        const monthsCount = period === "1y" ? 12 : 24;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
          timeSeries[key] = 0;
        }
      } else if (period === "10y") {
        for (let i = 9; i >= 0; i--) {
          const key = String(now.getFullYear() - i);
          timeSeries[key] = 0;
        }
      }

      // 2. Remplir avec les données de la période
      pReqs.forEach(r => {
        if (!r.created_at) return;
        const d = new Date(r.created_at);
        let key = "";
        
        if (period === "30d") {
          key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        } else if (period === "1y" || period === "2y") {
          key = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
        } else if (period === "10y") {
          key = String(d.getFullYear());
        }

        if (key in timeSeries) timeSeries[key]++;
      });

      setMonthData(Object.entries(timeSeries).map(([month, count]) => ({ month, count })));

      // ── Top propriétés (Calculé sur tout l'historique) ──
      const propMap: Record<string, number> = {};
      reqs.forEach(r => { if (r.property_name) propMap[r.property_name] = (propMap[r.property_name] || 0) + 1; });
      const top = Object.entries(propMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setTopProps(top);

      setIsLoading(false);
    };

    load();
    return () => { isMounted = false; };
  }, [period]);

  // ─────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <p className="text-gray-500 text-sm animate-pulse">Calcul des statistiques dynamiques…</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Header + Sélecteur période ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Statistiques & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Données calculées en temps réel depuis Supabase</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto">
          {(["30d", "1y", "2y", "10y"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                period === p
                  ? "bg-[#d4af37] text-[#0a0f1e] shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {{ "30d": "30 jours", "1y": "1 an", "2y": "2 ans", "10y": "10 ans" }[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards (2 rangées de 3) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                <p className="text-2xl text-[#0a0f1e] font-bold truncate">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Camembert statuts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg text-[#0a0f1e] font-semibold mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4af37]" />
            Demandes par Statut
            <span className="text-xs text-gray-400 font-normal ml-1">
              ({period === "30d" ? "30 derniers jours" : period === "1y" ? "12 derniers mois" : period === "2y" ? "24 derniers mois" : "10 dernières années"})
            </span>
          </h2>
          <PieChart data={statusData} />
        </div>

        {/* Barres mensuelle */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg text-[#0a0f1e] font-semibold mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#d4af37]" />
            {period === "30d" ? "Évolution journalière" : period === "10y" ? "Évolution annuelle" : "Évolution mensuelle"}
          </h2>
          <BarChart data={monthData} />
        </div>
      </div>

      {/* ── Top Propriétés ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg text-[#0a0f1e] font-semibold mb-5">Top Propriétés Demandées</h2>
        {topProps.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
        ) : (
          <div className="space-y-3">
            {topProps.map((p, i) => {
              const pct = Math.round((p.count / (topProps[0]?.count || 1)) * 100);
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#0a0f1e] font-medium truncate">{p.name}</span>
                      <span className="text-sm font-bold text-[#d4af37] ml-3 flex-shrink-0">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] rounded-full"
                        style={{ width: `${pct}%` }}
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
  );
}