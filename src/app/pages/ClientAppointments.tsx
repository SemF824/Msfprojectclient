import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import type { Appointment } from "../../types/database.types";

export default function ClientAppointments() {
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const CALENDLY_LINK = import.meta.env.VITE_CALENDLY_URL || "#";

  useEffect(() => {
    let isMounted = true;
    const fetchAppointments = async () => {
      if (!user || !supabase) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true });

        if (error) throw error;
        if (data && isMounted) setAppointments(data);
      } catch (err) {
        console.error("Erreur chargement rendez-vous:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  const isVideoLink = (url: string | undefined) => url?.includes("http");

  const getTypeLabel = (type?: string | null) => {
    switch (type) {
      case "visite":
        return "Visite de bien d'exception";
      case "notaire":
        return "Rendez-vous notarial";
      case "reunion":
        return "Échange de conseil & stratégie";
      case "remise_cles":
        return "Cérémonie de remise des clés";
      default:
        return "Rendez-vous MSF Congo";
    }
  };

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case "planifie":
        return {
          label: "Confirmé & Planifié",
          icon: Clock,
          classes: "bg-[#d4af37]/10 text-[#8c7423] border-[#d4af37]/30",
        };
      case "termine":
        return {
          label: "Terminé",
          icon: CheckCircle2,
          classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "annule":
        return {
          label: "Annulé",
          icon: XCircle,
          classes: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: "Planifié",
          icon: Clock,
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  // Filtrage selon onglet
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "upcoming") {
      return apt.status === "planifie" || (!apt.status && apt.status !== "annule" && apt.status !== "termine");
    }
    return apt.status === "termine" || apt.status === "annule";
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", path: "/client/dashboard" },
              { label: "Rendez-vous", path: "/client/appointments" },
            ]}
          />
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mt-2 mb-2 font-bold tracking-tight">
            Vos Rendez-vous & <span className="text-[#d4af37]">Rencontres</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Accompagnement sur-mesure pour vos visites privées et signatures notariales.
          </p>
        </div>
        <a
          href={CALENDLY_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#c49f2c] text-[#0a0f1e] rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all text-sm shrink-0"
        >
          <Calendar className="w-4 h-4" />
          Planifier une Visite Privée
        </a>
      </div>

      {/* Onglets de navigation */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "border-[#d4af37] text-[#0a0f1e]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <span>À venir</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-[#d4af37]/15 text-[#8c7423]">
            {appointments.filter((a) => a.status === "planifie").length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "past"
              ? "border-[#d4af37] text-[#0a0f1e]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <span>Historique & Passés</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
            {appointments.filter((a) => a.status === "termine" || a.status === "annule").length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 md:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Recherche de vos rendez-vous...
            </p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={activeTab === "upcoming" ? "Aucun rendez-vous à venir" : "Aucun historique"}
            description={
              activeTab === "upcoming"
                ? "Vous n'avez pas de visite ou de réunion planifiée prochainement."
                : "Vos rendez-vous passés apparaîtront dans cette section."
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAppointments.map((apt) => {
              const isExpanded = expandedId === apt.id;

              let localDate = "Date à confirmer";
              let localTime = "--:--";

              const rawDate = apt.appointment_date || apt.date;
              const rawTime = apt.appointment_time || apt.time;

              if (rawDate) {
                try {
                  const cleanDate = String(rawDate).trim();
                  const cleanTime = rawTime ? String(rawTime).trim().substring(0, 5) : "10:00";
                  const parts = cleanDate.split("-");
                  if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    const timeParts = cleanTime.split(":");
                    const hour = parseInt(timeParts[0] || "0", 10);
                    const minute = parseInt(timeParts[1] || "0", 10);
                    const dateObj = new Date(year, month, day, hour, minute);

                    if (!isNaN(dateObj.getTime())) {
                      localDate = dateObj.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                      localTime = dateObj.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                  }
                } catch (e) {
                  console.error("Erreur de formatage de date", e);
                }
              }

              const statusBadge = getStatusBadge(apt.status);
              const StatusIcon = statusBadge.icon;

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl transition-[border-color,box-shadow,background-color] duration-200 overflow-hidden flex flex-col ${
                    isExpanded
                      ? "border-[#d4af37] shadow-md bg-[#faf8f2]/40"
                      : "border-gray-200 hover:border-[#d4af37]/60 bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(apt.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/15 to-[#f4e3b2]/20 border border-[#d4af37]/25 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-[#8c7423]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-[#0a0f1e] leading-snug break-words">
                          {apt.title || apt.property_name || "Rencontre MSF Congo"}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {getTypeLabel(apt.type)}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs sm:text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#d4af37]" />
                            <span className="capitalize">{localDate}</span>
                            <span className="text-gray-400">à</span>
                            <span className="font-semibold">{localTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold ${statusBadge.classes}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusBadge.label}</span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                          isExpanded ? "rotate-180 text-[#d4af37]" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-white"
                      >
                        <div className="p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            {isVideoLink(apt.location) ? (
                              <Video className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            ) : (
                              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Lieu de la rencontre
                              </p>
                              {isVideoLink(apt.location) ? (
                                <a
                                  href={apt.location}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 font-semibold hover:underline break-all text-sm"
                                >
                                  Rejoindre le salon de visioconférence
                                </a>
                              ) : (
                                <p className="text-[#0a0f1e] font-medium text-sm whitespace-pre-line break-words">
                                  {apt.location || "Adresse à confirmer avec votre conseiller"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Conseiller MSF Dédié
                              </p>
                              <p className="text-[#0a0f1e] font-semibold text-sm">
                                {apt.agent_name || "Direction Immobilière MSF Congo"}
                              </p>
                              <a
                                href="tel:+242064588618"
                                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#d4af37] font-medium mt-1 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> +242 06 458 8618
                              </a>
                            </div>
                          </div>

                          {(apt.cancel_url || apt.reschedule_url) && (
                            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 mt-2">
                              {apt.reschedule_url && (
                                <a
                                  href={apt.reschedule_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-[#8c7423] hover:text-[#5e4e16] transition-colors"
                                >
                                  Reprogrammer ce rendez-vous
                                </a>
                              )}
                              {apt.cancel_url && (
                                <a
                                  href={apt.cancel_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                                >
                                  Annuler la rencontre
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
