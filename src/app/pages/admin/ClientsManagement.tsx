import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Search, Download, X, Loader2,
  Mail, Phone, MapPin, Calendar, FileText,
  ChevronRight, Star, User
} from "lucide-react";
import { supabase } from "../../../hooks/useSupabaseAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  profession?: string | null;
  company?: string | null;
  created_at?: string;
  // calculés
  demandesCount: number;
  lastActivity: string | null;
}

interface DevisRequest {
  id: string;
  client_email: string;
  property_name?: string;
  property_price?: number;
  request_type?: string;
  status?: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getVipBadge = (count: number) => {
  if (count === 0) return { label: "Prospect", classes: "bg-gray-100 text-gray-600 border-gray-200" };
  if (count <= 2)  return { label: "Client",   classes: "bg-blue-100 text-blue-700 border-blue-200" };
  return              { label: "VIP",       classes: "bg-amber-100 text-amber-700 border-amber-200" };
};

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "—";

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsManagement() {
  const [clients,       setClients]       = useState<Client[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [searchText,    setSearchText]    = useState("");
  const [selectedClient,setSelectedClient]= useState<Client | null>(null);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [clientReqs,    setClientReqs]    = useState<DevisRequest[]>([]);
  const [isDrawerLoad,  setIsDrawerLoad]  = useState(false);

  // ── Fetch clients (profiles + demandes) ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!supabase) return;
      setIsLoading(true);

      // 1. Profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, city, profession, company, created_at")
        .order("created_at", { ascending: false });

      // 2. Devis requests pour compter les demandes et la dernière activité
      const { data: allReqs } = await supabase
        .from("devis_requests")
        .select("client_email, created_at");

      if (!isMounted) return;

      // Fusionner
      const reqsMap: Record<string, { count: number; lastDate: string | null }> = {};
      (allReqs || []).forEach(r => {
        if (!r.client_email) return;
        const e = r.client_email;
        if (!reqsMap[e]) reqsMap[e] = { count: 0, lastDate: null };
        reqsMap[e].count++;
        if (!reqsMap[e].lastDate || r.created_at > reqsMap[e].lastDate!) {
          reqsMap[e].lastDate = r.created_at;
        }
      });

      const merged: Client[] = (profiles || []).map(p => {
        const info = p.email ? reqsMap[p.email] : undefined;
        return {
          ...p,
          demandesCount: info?.count ?? 0,
          lastActivity:  info?.lastDate ?? p.created_at ?? null,
        };
      });

      // Si aucun profil, déduire depuis devis_requests
      if (merged.length === 0 && allReqs && allReqs.length > 0) {
        const uniqueEmails = [...new Set(allReqs.map(r => r.client_email).filter(Boolean))];
        const fallback: Client[] = uniqueEmails.map(email => ({
          id:            email,
          email,
          full_name:     null,
          phone:         null,
          city:          null,
          demandesCount: reqsMap[email]?.count ?? 0,
          lastActivity:  reqsMap[email]?.lastDate ?? null,
        }));
        setClients(fallback);
      } else {
        setClients(merged);
      }

      setIsLoading(false);
    };

    load();
    return () => { isMounted = false; };
  }, []);

  // ── Filtre recherche côté client ───────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchText.trim()) return clients;
    const q = searchText.toLowerCase();
    return clients.filter(c =>
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  }, [clients, searchText]);

  // ── Ouvrir le panneau client ───────────────────────────────────────────────
  const openDrawer = async (client: Client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
    setClientReqs([]);
    setIsDrawerLoad(true);

    if (!supabase || !client.email) { setIsDrawerLoad(false); return; }

    const { data } = await supabase
      .from("devis_requests")
      .select("*")
      .eq("client_email", client.email)
      .order("created_at", { ascending: false });

    setClientReqs(data || []);
    setIsDrawerLoad(false);
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Nom", "Email", "Téléphone", "Ville", "Demandes", "Dernière activité", "Statut"];
    const rows = filtered.map(c => {
      const badge = getVipBadge(c.demandesCount);
      return [
        c.full_name ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.city ?? "",
        c.demandesCount,
        fmtDate(c.lastActivity),
        badge.label,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `clients-msf-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const displayName = (c: Client) =>
    c.full_name?.trim() || c.email?.split("@")[0] || `Utilisateur ${c.id.slice(0, 8)}`;

  const initials = (c: Client) => {
    const src = c.full_name?.trim() || c.email || "?";
    return src[0].toUpperCase();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-[#0a0f1e] font-bold">Base Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? "Chargement…" : `${filtered.length} client${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-medium hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>
      </div>

      {/* ── Recherche ── */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone, ville…"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0a0f1e] placeholder:text-gray-400 focus:border-[#d4af37] focus:outline-none transition-colors shadow-sm"
        />
      </div>

      {/* ── Tableau ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
            <p className="text-gray-400 text-sm">Chargement des clients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-3 text-center">
            <Users className="w-14 h-14 text-gray-200" />
            <p className="text-gray-400 font-medium">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Nom", "Email", "Téléphone", "Ville", "Demandes", "Dernière activité", "Statut", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => {
                  const badge = getVipBadge(c.demandesCount);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openDrawer(c)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#d4af37]/15 rounded-full flex items-center justify-center text-[#d4af37] font-bold text-sm flex-shrink-0">
                            {initials(c)}
                          </div>
                          <span className="text-[#0a0f1e] font-medium truncate max-w-[140px]">{displayName(c)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{c.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.city  ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-[#0a0f1e] font-bold">{c.demandesCount}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(c.lastActivity)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════ PANNEAU LATÉRAL DROIT ══════════════════════ */}
      <AnimatePresence>
        {drawerOpen && selectedClient && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header drawer */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0a0f1e] to-[#1a2540]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center text-[#d4af37] font-bold">
                    {initials(selectedClient)}
                  </div>
                  <div>
                    <p className="text-white font-semibold truncate max-w-[180px]">{displayName(selectedClient)}</p>
                    <p className="text-gray-400 text-xs">{getVipBadge(selectedClient.demandesCount).label}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Infos client */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informations</h3>
                  {[
                    { icon: Mail,     value: selectedClient.email,    label: "Email" },
                    { icon: Phone,    value: selectedClient.phone,    label: "Téléphone" },
                    { icon: MapPin,   value: selectedClient.city,     label: "Ville" },
                    { icon: Calendar, value: fmtDate(selectedClient.created_at), label: "Inscrit le" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <row.icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">{row.label}</p>
                        <p className="text-sm text-[#0a0f1e] font-medium">{row.value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Demandes */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Demandes de devis ({clientReqs.length})
                  </h3>
                  {isDrawerLoad ? (
                    <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" /></div>
                  ) : clientReqs.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-sm">Aucune demande</div>
                  ) : (
                    <div className="space-y-2">
                      {clientReqs.map(r => (
                        <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-[#0a0f1e] font-medium truncate max-w-[200px]">{r.property_name || "Propriété"}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${
                              r.status === "approuve" ? "bg-green-100 text-green-700 border-green-200" :
                              r.status === "rejete"   ? "bg-red-100 text-red-700 border-red-200" :
                              "bg-blue-100 text-blue-700 border-blue-200"
                            }`}>
                              {r.status ?? "nouveau"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{fmtDate(r.created_at)}</p>
                          {r.property_price && (
                            <p className="text-xs text-[#d4af37] font-medium mt-0.5">
                              {new Intl.NumberFormat("fr-FR").format(r.property_price)} FCFA
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
