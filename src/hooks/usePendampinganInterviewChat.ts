import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface PendampinganInterviewMessage {
  id: string;
  interview_id: string;
  sender_id: string;
  sender_type: 'lawyer' | 'admin';
  content: string;
  created_at: string;
}

// Get messages for a pendampingan interview
export function usePendampinganInterviewMessages(interviewId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pendampingan-interview-messages', interviewId],
    queryFn: async () => {
      if (!interviewId) return [];

      const { data, error } = await supabase
        .from('pendampingan_interview_messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PendampinganInterviewMessage[];
    },
    enabled: !!interviewId
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!interviewId) return;

    const channel = supabase
      .channel(`pendampingan-interview-messages-${interviewId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pendampingan_interview_messages',
          filter: `interview_id=eq.${interviewId}`
        },
        (payload) => {
          queryClient.setQueryData(
            ['pendampingan-interview-messages', interviewId],
            (old: PendampinganInterviewMessage[] | undefined) => {
              if (!old) return [payload.new as PendampinganInterviewMessage];
              // Avoid duplicates
              if (old.some(msg => msg.id === (payload.new as PendampinganInterviewMessage).id)) {
                return old;
              }
              return [...old, payload.new as PendampinganInterviewMessage];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interviewId, queryClient]);

  return query;
}

// Send message to pendampingan interview
export function useSendPendampinganInterviewMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      interviewId,
      content,
      senderType
    }: {
      interviewId: string;
      content: string;
      senderType: 'lawyer' | 'admin';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pendampingan_interview_messages')
        .insert({
          interview_id: interviewId,
          sender_id: user.id,
          sender_type: senderType,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['pendampingan-interview-messages', variables.interviewId] 
      });
    }
  });
}

// Get pendampingan interview by ID with lawyer details
export function usePendampinganInterviewById(interviewId: string | null) {
  return useQuery({
    queryKey: ['pendampingan-interview', interviewId],
    queryFn: async () => {
      if (!interviewId) return null;

      const { data, error } = await supabase
        .from('pendampingan_interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (error) throw error;

      // Fetch lawyer details
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id, name, image_url, location, user_id, pendampingan_status')
        .eq('id', data.lawyer_id)
        .single();

      return {
        ...data,
        lawyer
      };
    },
    enabled: !!interviewId
  });
}

// Get any pendampingan interview for lawyer (scheduled or not yet scheduled for pending status)
export function useLawyerPendampinganChatInterview() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-pendampingan-chat-interview', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get lawyer
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id, pendampingan_status, pendampingan_interview_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return null;

      // If no interview scheduled yet but status is pending, return a pseudo interview for chat
      if (lawyer.pendampingan_status === 'pending' && !lawyer.pendampingan_interview_id) {
        // Check if there's any interview for this lawyer (even without being linked)
        const { data: existingInterview } = await supabase
          .from('pendampingan_interviews')
          .select('*')
          .eq('lawyer_id', lawyer.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (existingInterview) {
          return {
            ...existingInterview,
            lawyer_pendampingan_status: lawyer.pendampingan_status
          };
        }

        // Return null for pending without interview - chat will show pending state
        return {
          id: null,
          status: 'pending_review',
          scheduled_date: null,
          scheduled_time: null,
          google_meet_link: null,
          lawyer_id: lawyer.id,
          lawyer_pendampingan_status: lawyer.pendampingan_status
        };
      }

      // Get the linked interview
      if (lawyer.pendampingan_interview_id) {
        const { data: interview, error } = await supabase
          .from('pendampingan_interviews')
          .select('*')
          .eq('id', lawyer.pendampingan_interview_id)
          .single();

        if (error) throw error;
        return {
          ...interview,
          lawyer_pendampingan_status: lawyer.pendampingan_status
        };
      }

      return null;
    },
    enabled: !!user
  });
}
