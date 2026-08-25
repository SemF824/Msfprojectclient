import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "motion/react";
import { Link } from "react-router";
import {
  Calendar,
  FileText,
  Heart,
  Lock,
  Search,
  Calculator,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import { toast } from "sonner";
import type {
  Appointment,
  DevisRequest,
  Favorite,
  Document,
} from "../../types/database.types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function Dashboard() {
  const { user: authUser, isLoading: isAuthLoading } = useSupabaseAuth();

  const { data: dashboardData, isLoading: isDataLoading } = useQuery({
    queryKey: ["client_dashboard_data", authUser?.id],
    queryFn: async () => {
      if (!authUser || !supabase) throw new Error("Non connecté");
      const uid = authUser.id;
      const email = authUser.email || "";

      // Chargement parallèle optimisé
      const [ap, dv, fv, dc] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("user_id", uid)
          .order("appointment_date", { ascending: true }),
        supabase
          .from("devis_requests")
          .select("*")
          .eq("client_email", email)
          .order("created_at", { ascending: false }),
        supabase.from("favorites").select("*").eq("user_id", uid),
        supabase.from("documents").select("*").eq("user_id", uid),
      ]);

      if (ap.error) throw ap.error;
      if (dv.error) throw dv.error;
      if (fv.error) throw fv.error;
      if (dc.error) throw dc.error;

      return {
        appointments: ap.data || [],
        devisRequests: dv.data || [],
        favorites: fv.data || [],
        documents: dc.data || [],
      };
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutes
  });

  const appointments = dashboardData?.appointments || [];
  const devisRequests = dashboardData?.devisRequests || [];
  const favorites = dashboardData?.favorites || [];
  const documents = dashboardData?.documents || [];

  const displayName =
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split("@")[0] ||
    "Utilisateur";

  const stats = [
    {
      label: "Demandes Actives",
      value: devisRequests
        .filter((r) => r?.status === "nouveau" || r?.status === "en_cours")
        .length.toString(),
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Propriétés Favorites",
      value: favorites.length.toString(),
      icon: Heart,
      color: "from-pink-500 to-pink-600",
    },
    {
      label: "Visites Planifiées",
      value: appointments
        .filter((a) => a?.status === "planifie")
        .length.toString(),
      icon: Calendar,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Documents Sécurisés",
      value: documents.length.toString(),
      icon: Lock,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const statusLabel = (s: string) =>
    ({
      en_attente: "En attente",
      complete: "Terminée",
      echoue: "Échouée",
      planifie: "Planifié",
      nouveau: "Nouveau",
      en_cours: "En cours",
    })[s] ??
    s ??
    "Inconnu";

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-8" />

        <div className="h-64 bg-gray-200 rounded-2xl mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 h-28"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#0a0f1e] mb-1 sm:mb-2 font-bold break-words">
            Bonjour,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">
              {displayName.split(" ")[0]}
            </span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Voici un aperçu de votre activité immobilière
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#0a0f1e] to-[#1a2540] rounded-2xl shadow-lg p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl text-white font-semibold mb-2 sm:mb-3 leading-tight">
            Entamer une démarche immobilière
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl text-sm sm:text-base leading-relaxed">
            Prêt à trouver la maison de vos rêves ou à investir ? Explorez nos
            biens ou estimez votre capacité d'emprunt.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <Link
              to="/properties"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#d4af37] text-[#0a0f1e] font-semibold rounded-xl hover:bg-[#f4e3b2] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" /> Explorer les biens
            </Link>
            <Link
              to="/client/loan"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" /> Estimer mon prêt
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg p-4 sm:p-5 flex flex-col justify-center"
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}
            >
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl text-[#0a0f1e] font-bold tracking-tight">
              {s.value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 font-medium">
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm sm:shadow-lg p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg text-[#0a0f1e] font-semibold">
              Prochains Rendez-vous
            </h2>
            <Link
              to="/client/appointments"
              className="text-xs sm:text-sm text-[#d4af37] hover:underline font-medium"
            >
              Voir tout
            </Link>
          </div>
          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Aucun rendez-vous"
              description="Vous n'avez pas de visite prévue."
            />
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:bg-gray-100"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#d4af37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0a0f1e] font-medium text-xs sm:text-sm truncate">
                      {apt.property_name || "Visite immobilière"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      {apt.appointment_date
                        ? new Date(apt.appointment_date).toLocaleDateString(
                            "fr-FR",
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#0a0f1e] font-semibold">
              Demandes Actives
            </h2>
            <Link
              to="/client/requests"
              className="text-sm text-[#d4af37] hover:underline"
            >
              Voir tout
            </Link>
          </div>
          {devisRequests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucune demande"
              description="Vous n'avez pas de demande en cours."
            />
          ) : (
            <div className="space-y-3">
              {devisRequests.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0a0f1e] font-medium text-sm truncate">
                      {r.property_name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {statusLabel(r.status || "")}
                    </p>
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
