import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Clock, Loader2, Plus } from "lucide-react";
import { useSupabaseAuth, supabase } from "../../hooks/useSupabaseAuth";
import Breadcrumb from "../components/Breadcrumb";
import { EmptyState } from "../components/EmptyState";
import type { Appointment } from "../../types/database.types";

export default function ClientAppointments() {
  const { user } = useSupabaseAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Récupération sécurisée du lien depuis les variables d'environnement
  const CALENDLY_LINK = import.meta.env.VITE_CALENDLY_URL;

  useEffect(() => {
    let isMounted = true;
    
    const fetchAppointments = async () => {
      if (!user || !supabase) return;
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (!error && data && isMounted) {
          setAppointments(data);
        }
      } catch (err) {
        console.error("Erreur chargement rendez-vous:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchAppointments();
    
    return () => { isMounted = false; };
  }, [user]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'scheduled': 
      case 'planifie': return { label: "Planifié", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case 'confirmed': 
      case 'confirme': return { label: "Confirmé", color: "bg-green-100 text-green-700 border-green-200" };
      case 'completed': 
      case 'termine': return { label: "Terminé", color: "bg-gray-100 text-gray-700 border-gray-200" };
      case 'cancelled': 
      case 'annule': return { label: "Annulé", color: "bg-red-100 text-red-700 border-red-200" };
      default: return { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" };
    }
  };

  const handleBookAppointment = () => {
    if (!CALENDLY_LINK) {
      console.error("VITE_CALENDLY_URL n'est pas défini dans le fichier .env");
      alert("Le service de prise de rendez-vous est momentanément indisponible.");
      return;
    }
    // Ouvre le lien Calendly dans un nouvel onglet
    window.open(CALENDLY_LINK, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", path: "/client/dashboard" },
            { label: "Rendez-vous", path: "/client/appointments" }
          ]} />
          <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Mes Rendez-vous</h1>
          <p className="text-gray-600">Consultez et planifiez vos visites immobilières.</p>
        </div>
        
        <button 
          onClick={handleBookAppointment}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#d4af37] text-[#0a0f1e] font-bold rounded-xl hover:bg-[#b8952e] transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Prendre un Rendez-vous
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
            <p className="text-gray-500">Chargement de votre agenda...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <EmptyState 
              icon={CalendarIcon} 
              title="Aucun rendez-vous" 
              description="Vous n'avez pas de visite prévue pour le moment." 
            />
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appointments.map((apt, index) => {
              const statusDisplay = getStatusDisplay(apt.status);
              
              return (
                <motion.div 
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl border border-gray-200 hover:border-[#d4af37]/50 transition-colors shadow-sm bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                        <CalendarIcon className="w-6 h-6 text-[#d4af37]" />
                      </div>
                      <div>
                        <h3 className="text-[#0a0f1e] font-bold">{apt.property_name || "Rendez-vous Conseil"}</h3>
                        <p className="text-sm text-gray-500 capitalize">{apt.type === 'visit' ? 'Visite' : apt.type}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-[#0a0f1e]">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {apt.time}
                      </span>
                    </div>
                    
                    {apt.agent_name && (
                      <div className="flex items-center gap-3 text-sm text-[#0a0f1e]">
                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-gray-600">{apt.agent_name.charAt(0)}</span>
                        </div>
                        <span className="text-gray-600">Avec <strong className="text-[#0a0f1e]">{apt.agent_name}</strong></span>
                      </div>
                    )}
                  </div>
                  
                  {apt.notes && (
                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-800">
                      <strong>Note :</strong> {apt.notes}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}