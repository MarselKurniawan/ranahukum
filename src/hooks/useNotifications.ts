import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url: string | null;
  promo_code: string | null;
  valid_until: string | null;
  is_active: boolean;
  target_audience: string;
  created_by: string | null;
  created_at: string;
}

export interface NotificationRead {
  id: string;
  user_id: string;
  notification_id: string;
  read_at: string;
}

// Fetch all notifications for current user (with read status)
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      // Fetch active notifications
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;

      // Fetch read statuses for current user
      const { data: reads, error: readsError } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', user?.id || '');

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.notification_id) || []);

      return (notifications || []).map(n => ({
        ...n,
        is_read: readIds.has(n.id)
      })) as (Notification & { is_read: boolean })[];
    },
    enabled: !!user
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

// Get unread notification count
export function useUnreadNotificationCount() {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter(n => !n.is_read).length;
}

// Mark notification as read
export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_notification_reads')
        .upsert({
          user_id: user.id,
          notification_id: notificationId
        }, {
          onConflict: 'user_id,notification_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return [];

      const { data, error } = await supabase
        .from('user_notification_reads')
        .upsert(
          unreadIds.map(id => ({
            user_id: user.id,
            notification_id: id
          })),
          { onConflict: 'user_id,notification_id' }
        );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Admin: Fetch all notifications (including inactive)
export function useAllNotifications() {
  return useQuery({
    queryKey: ['all-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    }
  });
}

// Admin: Create notification
export function useCreateNotification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {
      title: string;
      description: string;
      type: string;
      image_url?: string;
      promo_code?: string;
      valid_until?: string;
      target_audience?: string;
    }) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Admin: Update notification
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Notification> & { id: string }) => {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Admin: Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}
