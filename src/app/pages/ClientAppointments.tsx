import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, MapPin, Video, User, Phone, ChevronDown } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import type { Appointment } from "../../types/database.types";

export default function ClientAppointments() {
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          .neq("status", "cancelled")
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
    return () => { isMounted = false; };
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(prevId => prevId === id ? null : id);
  };

  const isVideoLink = (url: string | undefined) => url?.includes("http");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Rendez-vous", path: "/client/appointments" }
          ]} />
          <h1 className="text-3xl md:text-4xl text-[#0a0f1e] mb-2 font-bold break-words">
            Mes <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e3b2]">Rendez-vous</span>
          </h1>
          <p className="text-gray-600">Gérez vos réunions et visites avec l'équipe MSF.</p>
        </div>
        <a 
          href={CALENDLY_LINK} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl font-bold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
        >
          <Calendar className="w-5 h-5" />
          Nouveau Rendez-vous
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState icon={Calendar} title="Aucun rendez-vous" description="Vous n'avez aucun rendez-vous planifié pour le moment." />
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((apt) => {
              const isExpanded = expandedId === apt.id;
              
              let localDate = "Date inconnue";
              let localTime = "--:--";
              
              const rawDate = apt.appointment_date || apt.date;
              const rawTime = apt.appointment_time || apt.time;

              if (rawDate && rawTime) {
                  try {
                      const cleanDate = String(rawDate).trim();
                      const cleanTime = String(rawTime).trim().substring(0, 5); 
                      
                      const dateObj = new Date(`${cleanDate}T${cleanTime}:00Z`);
                      
                      if (!isNaN(dateObj.getTime())) { 
                          localDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                          localTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      }
                  } catch (e) {
                      console.error("Erreur de parsing de date", e);
                  }
              }

              return (
                <motion.div 
                  key={apt.id} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-xl transition-all duration-300 overflow-hidden flex flex-col ${isExpanded ? 'border-[#d4af37] shadow-md bg-[#d4af37]/5' : 'border-gray-200 hover:border-[#d4af37]/50 bg-white'}`}
                >
                  <button 
                    onClick={() => toggleExpand(apt.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#f4e3b2]/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-[#d4af37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0a0f1e]">{apt.title || apt.property_name || 'Rendez-vous MSF'}</h3>
                        <p className="text-sm text-gray-500 capitalize">{apt.type}</p>
                        
                        <div className="flex items-center gap-3 mt-3 text-sm font-medium text-gray-700">
                           <div className="flex items-center gap-1.5">
                             <Clock className="w-4 h-4 text-[#d4af37]"/> 
                             {localDate} à {localTime}
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">Planifié</span>
                       <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#d4af37]' : ''}`} />
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
                              <Video className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Lieu de la rencontre</p>
                              {isVideoLink(apt.location) ? (
                                <a href={apt.location} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline break-all">
                                  Rejoindre la visioconférence
                                </a>
                              ) : (
                                <p className="text-[#0a0f1e] font-medium whitespace-pre-line">{apt.location || "Adresse à confirmer"}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                             <User className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                             <div>
                               <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Votre Conseiller</p>
                               <p className="text-[#0a0f1e] font-medium">{apt.agent_name || "Équipe MSF"}</p>
                               <a href="tel:+242064588618" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#d4af37] mt-1">
                                 <Phone className="w-3.5 h-3.5"/> +242 06 458 8618
                               </a>
                             </div>
                          </div>

                          {(apt.cancel_url || apt.reschedule_url) && (
                            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 mt-2">
                              {apt.reschedule_url ? (
                                <a 
                                  href={apt.reschedule_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-sm font-bold text-[#d4af37] hover:text-[#b5952f] transition-colors"
                                >
                                  Reprogrammer
                                </a>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Liens indisponibles (Ancien RDV)</span>
                              )}
                              
                              {apt.cancel_url && (
                                <a 
                                  href={apt.cancel_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                                >
                                  Annuler le rendez-vous
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