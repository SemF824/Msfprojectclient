import { useState, useEffect } from "react";
import { supabase } from "./useSupabaseAuth"; // Réutilisation du client Supabase déjà configuré dans vos hooks
import type { DevisRequest } from "../types/database.types";

interface UseClientRequestsResult {
  requests: DevisRequest[];
  loading: boolean;
  error: Error | null;
}

export function useClientRequests(userId: string | null): UseClientRequestsResult {
  const [requests, setRequests] = useState<DevisRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Si l'utilisateur n'est pas encore chargé ou authentifié, on stoppe proprement
    if (!userId) {
      setLoading(false);
      return;
    }

    // Pattern React 18 pour éviter les fuites de mémoire et les appels sur composants démontés
    let isMounted = true;
    
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: supabaseError } = await supabase
          .from("devis_requests")
          .select("*")
          // Modification stratégique : utilisation de l'id utilisateur plutôt que l'email si présent, 
          // ou adaptation selon vos règles de sécurité RLS Supabase
          .eq("user_id", userId) 
          .order("created_at", { ascending: false });

        if (supabaseError) throw new Error(supabaseError.message);
        
        if (isMounted) {
          setRequests(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    // Fonction de nettoyage (cleanup)
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { requests, loading, error };
}