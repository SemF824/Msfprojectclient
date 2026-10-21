import { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth, supabase } from "./useSupabaseAuth";
import type { Notification, NotificationType } from "../types/database.types";

export type { Notification, NotificationType };

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user || !supabase) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;
      setNotifications((data || []) as Notification[]);
    } catch (err: any) {
      console.error("[useNotifications] Erreur lors de la récupération :", err);
      setError(err.message || "Impossible de charger les notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Écoute en temps réel Supabase
  useEffect(() => {
    if (!user || !supabase) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user || !supabase) return;
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id)
          .eq("user_id", user.id);

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } catch (err: any) {
        console.error("[useNotifications] Erreur lors du marquage :", err);
        setError(err.message || "Impossible de marquer comme lu.");
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user || !supabase) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("[useNotifications] Erreur marquage global :", err);
      setError(err.message || "Impossible de marquer tout comme lu.");
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}
