import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { EmptyState } from "../components/EmptyState";
import Breadcrumb from "../components/Breadcrumb";
import { useClientRequests } from "../../hooks/useClientRequests";

export default function ClientRequests() {
  const { user: authUser } = useSupabaseAuth();
  // Utilisation du hook personnalisé pour encapsuler l'état et le cycle de vie Supabase
  const { requests, loading, error } = useClientRequests(authUser?.id || null);

  const statusLabel = (s: string) => 
    ({ nouveau: "Nouveau", en_cours: "En cours", approuve: "Approuvé", rejete: "Rejeté" }[s] ?? s ?? "Inconnu");

  // Gestion propre de l'état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 text-sm animate-pulse">Chargement de vos demandes...</p>
        </div>
      </div>
    );
  }

  // Gestion propre de l'état d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-medium">
          Une erreur est survenue lors de la récupération de vos demandes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "Dashboard", path: "/client/dashboard" }, { label: "Mes Demandes", path: "/client/requests" }]} />
        <h1 className="text-3xl text-[#0a0f1e] mt-2 mb-2 font-bold">Mes Demandes de Devis</h1>
        <p className="text-gray-600">Suivez l'état d'avancement de vos projets immobiliers.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6"
      >
        {requests.length === 0 ? (
          <EmptyState icon={FileText} title="Aucune demande" description="Vous n'avez pas encore soumis de demande de devis." />
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#d4af37]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                        <h3 className="text-[#0a0f1e] font-semibold text-lg">{r.property_name}</h3>
                        <p className="text-sm text-gray-500 mt-1 capitalize">Projet : {r.request_type}</p>
                     </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full border bg-white shadow-sm font-medium">
                    {statusLabel(r.status || "")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}