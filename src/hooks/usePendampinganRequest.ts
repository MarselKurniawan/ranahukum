import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PendampinganInterview {
  id: string;
  lawyer_id: string;
  admin_id: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduled_date: string;
  scheduled_time: string;
  google_meet_link: string | null;
  notes: string | null;
  lawyer_reminder_sent: boolean;
  admin_reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  lawyer?: {
    id: string;
    name: string;
    image_url: string | null;
    location: string | null;
    user_id: string;
    pendampingan_status: string | null;
  };
}

// Get lawyer's pendampingan status
export function useLawyerPendampinganStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-pendampingan-status', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('lawyers')
        .select('id, pendampingan_enabled, pendampingan_status, pendampingan_requested_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

// Request pendampingan activation
export function useRequestPendampinganActivation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lawyers')
        .update({ 
          pendampingan_status: 'pending',
          pendampingan_requested_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-pendampingan-status'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-profile'] });
    }
  });
}

// Get all pendampingan requests (for SuperAdmin)
export function useAllPendampinganRequests() {
  return useQuery({
    queryKey: ['all-pendampingan-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .in('pendampingan_status', ['pending', 'interview_scheduled'])
        .order('pendampingan_requested_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}

// Get all pendampingan interviews (for SuperAdmin)
export function useAllPendampinganInterviews() {
  return useQuery({
    queryKey: ['all-pendampingan-interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pendampingan_interviews')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Fetch lawyer details
      const enrichedInterviews = await Promise.all(
        (data || []).map(async (interview) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('id, name, image_url, location, user_id, pendampingan_status')
            .eq('id', interview.lawyer_id)
            .maybeSingle();

          return {
            ...interview,
            lawyer: lawyer || undefined
          } as PendampinganInterview;
        })
      );

      return enrichedInterviews;
    }
  });
}

// Get lawyer's pendampingan interview
export function useLawyerPendampinganInterview() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-pendampingan-interview', user?.id],
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
        .from('pendampingan_interviews')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .maybeSingle();

      if (error) throw error;
      return data as PendampinganInterview | null;
    },
    enabled: !!user
  });
}

// Schedule pendampingan interview (SuperAdmin)
export function useSchedulePendampinganInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      lawyerId, 
      scheduledDate, 
      scheduledTime, 
      notes,
      googleMeetLink
    }: { 
      lawyerId: string; 
      scheduledDate: string; 
      scheduledTime: string;
      notes?: string;
      googleMeetLink?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the interview
      const { data: interview, error: interviewError } = await supabase
        .from('pendampingan_interviews')
        .insert({
          lawyer_id: lawyerId,
          admin_id: user.id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          notes,
          google_meet_link: googleMeetLink
        })
        .select()
        .single();

      if (interviewError) throw interviewError;

      // Update lawyer's pendampingan status
      const { error: lawyerError } = await supabase
        .from('lawyers')
        .update({ 
          pendampingan_status: 'interview_scheduled',
          pendampingan_interview_id: interview.id
        })
        .eq('id', lawyerId);

      if (lawyerError) throw lawyerError;

      return interview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}

// Approve pendampingan directly (SuperAdmin)
export function useApprovePendampingan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lawyerId, approve }: { lawyerId: string; approve: boolean }) => {
      const { data, error } = await supabase
        .from('lawyers')
        .update({ 
          pendampingan_status: approve ? 'approved' : 'rejected',
          pendampingan_enabled: approve
        })
        .eq('id', lawyerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}

// Complete pendampingan interview (SuperAdmin)
export function useCompletePendampinganInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      interviewId, 
      lawyerId, 
      approve,
      notes
    }: { 
      interviewId: string;
      lawyerId: string;
      approve: boolean;
      notes?: string;
    }) => {
      // Update interview status
      const { error: interviewError } = await supabase
        .from('pendampingan_interviews')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes
        })
        .eq('id', interviewId);

      if (interviewError) throw interviewError;

      // Update lawyer's pendampingan status
      const { data, error: lawyerError } = await supabase
        .from('lawyers')
        .update({ 
          pendampingan_status: approve ? 'approved' : 'rejected',
          pendampingan_enabled: approve
        })
        .eq('id', lawyerId)
        .select()
        .single();

      if (lawyerError) throw lawyerError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}

// Cancel pendampingan interview (SuperAdmin)
export function useCancelPendampinganInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interviewId, lawyerId }: { interviewId: string; lawyerId: string }) => {
      // Update interview status
      const { error: interviewError } = await supabase
        .from('pendampingan_interviews')
        .update({ status: 'cancelled' })
        .eq('id', interviewId);

      if (interviewError) throw interviewError;

      // Reset lawyer's pendampingan status back to pending
      const { error: lawyerError } = await supabase
        .from('lawyers')
        .update({ 
          pendampingan_status: 'pending',
          pendampingan_interview_id: null
        })
        .eq('id', lawyerId);

      if (lawyerError) throw lawyerError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-pendampingan-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}
