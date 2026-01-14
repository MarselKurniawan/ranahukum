import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface InterviewSession {
  id: string;
  lawyer_id: string;
  admin_id: string;
  status: 'active' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  google_meet_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lawyer?: {
    name: string;
    image_url: string | null;
    location: string | null;
    user_id: string;
  };
}

export interface InterviewMessage {
  id: string;
  interview_id: string;
  sender_id: string;
  sender_type: 'admin' | 'lawyer';
  content: string;
  created_at: string;
}

// Get all interview sessions (for SuperAdmin)
export function useAllInterviewSessions() {
  return useQuery({
    queryKey: ['all-interview-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch lawyer details
      const enrichedSessions = await Promise.all(
        (data || []).map(async (session) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('name, image_url, location, user_id')
            .eq('id', session.lawyer_id)
            .maybeSingle();

          return {
            ...session,
            lawyer: lawyer || undefined
          } as InterviewSession;
        })
      );

      return enrichedSessions;
    }
  });
}

// Get interview session by ID
export function useInterviewSession(sessionId: string) {
  return useQuery({
    queryKey: ['interview-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Fetch lawyer details
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('name, image_url, location, user_id')
        .eq('id', data.lawyer_id)
        .maybeSingle();

      return {
        ...data,
        lawyer: lawyer || undefined
      } as InterviewSession;
    },
    enabled: !!sessionId
  });
}

// Get lawyer's active interview session
export function useLawyerActiveInterview() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-active-interview', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get lawyer ID first
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return null;

      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as InterviewSession | null;
    },
    enabled: !!user
  });
}

// Get interview messages
export function useInterviewMessages(interviewId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['interview-messages', interviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InterviewMessage[];
    },
    enabled: !!interviewId
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!interviewId) return;

    const channel = supabase
      .channel(`interview-messages-${interviewId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interview_messages',
          filter: `interview_id=eq.${interviewId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['interview-messages', interviewId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interviewId, queryClient]);

  return query;
}

// Create interview session
export function useCreateInterviewSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lawyerId, notes }: { lawyerId: string; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          lawyer_id: lawyerId,
          admin_id: user.id,
          notes,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-interview-sessions'] });
    }
  });
}

// Send interview message
export function useSendInterviewMessage() {
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
      senderType: 'admin' | 'lawyer';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('interview_messages')
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
      queryClient.invalidateQueries({ queryKey: ['interview-messages', variables.interviewId] });
    }
  });
}

// End interview session (SuperAdmin only)
export function useEndInterviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, notes }: { sessionId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          notes
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-interview-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-active-interview'] });
    }
  });
}

// Update Google Meet link (Lawyer only)
export function useUpdateInterviewMeetLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, meetLink }: { sessionId: string; meetLink: string }) => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .update({ google_meet_link: meetLink })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interview-session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-active-interview'] });
    }
  });
}
