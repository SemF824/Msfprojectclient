import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import { PopupModal } from "react-calendly";
import type { Appointment } from "../../types/database.types";

export default function ClientAppointments() {
  const { user: authUser } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  // Fallback de sécurité si VITE_CALENDLY_URL n'est pas encore détecté
  const calendlyUrl = (import.meta as any).env.VITE_CALENDLY_URL
  
  useEffect(() => {
    if (!authUser || !supabase) return;
    (async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", authUser.id)
        .order("appointment_date", { ascending: true });
      setAppointments(data || []);
    })();
  }, [authUser]);

  const statusLabel = (s: string) => ({ planifie: "Planifié", termine: "Terminé", annule: "Annulé" }[s] ?? s ?? "Inconnu");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <Breadcrumb items={[{ label: "Dashboard", path: "/client/dashboard" }, { label: "Rendez-vous", path: "/client/appointments" }]} />
          <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Mes Rendez-vous</h1>
          <p className="text-gray-600">Consultez et planifiez vos visites immobilières.</p>
        </div>
        <button 
          onClick={() => setIsCalendlyOpen(true)} 
          className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] rounded-xl hover:bg-[#f4e3b2] hover:shadow-lg transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Prendre un Rendez-vous
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="Aucun rendez-vous" description="Vous n'avez pas de visite prévue pour le moment." />
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => {
              const d = new Date((apt as any).appointment_date);
              return (
                <div key={apt.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#d4af37]/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#d4af37]/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[#d4af37] text-[10px] uppercase font-bold">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>
                      <span className="text-[#0a0f1e] font-black text-xl">{d.getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#0a0f1e] font-semibold text-lg">{(apt as any).title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-4 h-4" /> {(apt as any).appointment_time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full border bg-white shadow-sm font-medium`}>{statusLabel((apt as any).status || "")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Intégration de la modale Calendly */}
      <PopupModal 
        url={calendlyUrl} 
        onModalClose={() => setIsCalendlyOpen(false)} 
        open={isCalendlyOpen} 
        rootElement={document.getElementById("root")!} 
      />
    </div>
  );
}