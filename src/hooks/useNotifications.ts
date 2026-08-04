import { useEffect, useState, useCallback } from 'react';
import { supabase } from './useSupabaseAuth'; // Assurez-vous que le chemin est correct

// Définissez le type de vos notifications pour TypeScript
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment' | 'document'; // Types définis dans votre table SQL
  is_read: boolean;
  link?: string; // Optionnel, si la notification doit rediriger
  created_at: string; // Ou Date, si vous préférez le parser
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>; // Expose la fonction de rafraîchissement
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utilisez useCallback pour mémoriser la fonction et éviter des re-render inutiles
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé.");
      }
      const { data, error: supabaseError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false }); // Triez par le plus récent

      if (supabaseError) {
        throw supabaseError;
      }
      setNotifications(data || []);
    } catch (err: any) {
      console.error("[useNotifications] Erreur lors de la récupération :", err);
      setError(err.message || "Impossible de charger les notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Dépendances vides car supabase est statique après initialisation

  // Effet pour charger les notifications et s'abonner aux changements en temps réel
  useEffect(() => {
    fetchNotifications();

    if (!supabase) return;

    // Abonnement en temps réel aux insertions pour les nouvelles notifications
    const channel = supabase.channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écoute INSERT, UPDATE, DELETE pour rafraîchir la liste
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.currentUser?.id}`, // IMPORTANT: Filtrer par l'utilisateur connecté
        },
        () => fetchNotifications() // Recharge les notifications à chaque changement
      )
      .subscribe();

    return () => {
      // Nettoyage de l'abonnement lors du démontage du composant
      channel.unsubscribe();
    };
  }, [fetchNotifications]); // Dépend de fetchNotifications

  // Compte des notifications non lues
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé.");
      }
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      fetchNotifications(); // Rafraîchit la liste après la mise à jour
    } catch (err: any) {
      console.error("[useNotifications] Erreur lors du marquage comme lu :", err);
      setError(err.message || "Impossible de marquer comme lu.");
    }
  }, [fetchNotifications]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      if (!supabase) {
        throw new Error("Client Supabase non initialisé.");
      }
      // Marquez uniquement les notifications non lues de l'utilisateur actuel
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', supabase.auth.currentUser?.id) // S'assurer que seul l'utilisateur voit ses notifs
        .eq('is_read', false);
      fetchNotifications();
    } catch (err: any) {
      console.error("[useNotifications] Erreur lors du marquage de toutes les notifications :", err);
      setError(err.message || "Impossible de marquer toutes les notifications comme lues.");
    }
  }, [fetchNotifications]);


  return { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, fetchNotifications };
}