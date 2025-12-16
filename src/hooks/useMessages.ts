import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'voice' | 'file' | 'system';
  file_url: string | null;
  is_read: boolean;
  created_at: string;
}

export function useMessages(consultationId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', consultationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!consultationId
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!consultationId) return;

    const channel = supabase
      .channel(`messages-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${consultationId}`
        },
        (payload) => {
          queryClient.setQueryData(['messages', consultationId], (old: Message[] | undefined) => {
            if (!old) return [payload.new as Message];
            // Avoid duplicates
            if (old.some(m => m.id === (payload.new as Message).id)) return old;
            return [...old, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      consultationId, 
      content, 
      messageType = 'text',
      fileUrl 
    }: { 
      consultationId: string; 
      content: string; 
      messageType?: 'text' | 'voice' | 'file' | 'system';
      fileUrl?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          consultation_id: consultationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.consultation_id] });
    }
  });
}
