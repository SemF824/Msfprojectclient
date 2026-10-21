import { motion } from "motion/react";
import { FileText, Building2, Calendar, Clock, DollarSign } from "lucide-react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import { useClientRequests } from "../../hooks/useClientRequests";

export default function ClientRequests() {
  const { user: authUser } = useSupabaseAuth();
  const { requests, loading, error } = useClientRequests(authUser?.id || null);

  const getStatusBadge = (s?: string | null) => {
    switch (s) {
      case "approuve":
        return {
          label: "Approuvé & Validé",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "en_cours":
        return {
          label: "En cours d'instruction",
          className: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "documents":
        return {
          label: "Pièces complémentaires",
          className: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "rejete":
        return {
          label: "Non retenu",
          className: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "nouveau":
      default:
        return {
          label: "Dossier reçu",
          className: "bg-[#d4af37]/15 text-[#8c7423] border-[#d4af37]/35",
        };
    }
  };

  const getRequestTypeLabel = (type?: string | null) => {
    switch (type) {
      case "achat":
        return "Projet d'Acquisition Immobilière";
      case "location":
        return "Demande de Location Longue Durée";
      case "information":
        return "Demande d'Informations Techniques";
      default:
        return "Étude de Devis Immobilier";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold animate-pulse">
            Chargement de vos dossiers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-rose-600 font-medium text-sm">
          Une erreur est survenue lors de la récupération de vos demandes de devis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Mes Demandes", path: "/client/requests" },
          ]}
        />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-1 font-bold tracking-tight">
          Vos Dossiers & <span className="text-[#d4af37]">Demandes de Devis</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Suivez l'état d'instruction de vos dossiers d'acquisition et de financement.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6"
      >
        {requests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucune demande de devis"
            description="Vous n'avez pas encore soumis de demande d'étude pour un bien immobilier."
          />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const badge = getStatusBadge(r.status);
              const dateStr = r.created_at
                ? new Date(r.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={r.id}
                  className="p-5 bg-white rounded-xl border border-gray-100 hover:border-[#d4af37]/60 transition-[border-color,box-shadow] duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/15 to-[#f4e3b2]/20 border border-[#d4af37]/25 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-[#8c7423]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[#0a0f1e] font-bold text-base sm:text-lg leading-snug break-words">
                        {r.property_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getRequestTypeLabel(r.request_type)}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        {dateStr && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {dateStr}
                          </span>
                        )}
                        {r.property_price && (
                          <span className="font-bold text-[#8c7423]">
                            {(Number(r.property_price) || 0).toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
