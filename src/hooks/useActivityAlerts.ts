import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ActivityAlert {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Fetch all activity alerts for current user
export function useActivityAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activity-alerts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_alerts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ActivityAlert[];
    },
    enabled: !!user
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_activity_alerts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity-alerts', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

// Get unread activity alert count
export function useUnreadActivityAlertCount() {
  const { data: alerts = [] } = useActivityAlerts();
  return alerts.filter(a => !a.is_read).length;
}

// Mark activity alert as read
export function useMarkActivityAlertRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('user_activity_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-alerts', user?.id] });
    }
  });
}

// Mark all activity alerts as read
export function useMarkAllActivityAlertsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_activity_alerts')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-alerts', user?.id] });
    }
  });
}

// Delete activity alert
export function useDeleteActivityAlert() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('user_activity_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-alerts', user?.id] });
    }
  });
}
