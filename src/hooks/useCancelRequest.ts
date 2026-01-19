import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Cancel consultation
export function useCancelConsultation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      consultationId, 
      cancelReason 
    }: { 
      consultationId: string; 
      cancelReason: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('consultations')
        .update({
          status: 'cancelled',
          cancel_reason: cancelReason,
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultation'] });
    }
  });
}

// Cancel legal assistance (pendampingan)
export function useCancelAssistance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      cancelReason 
    }: { 
      requestId: string; 
      cancelReason: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .update({
          status: 'cancelled',
          cancel_reason: cancelReason,
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistance-request'] });
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-assistance-requests'] });
    }
  });
}

// Auto-expire pending consultations after 1 hour
export function useAutoExpireConsultations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Expire pending consultations older than 1 hour
      const { data: expiredConsultations, error: consultError } = await supabase
        .from('consultations')
        .update({
          status: 'expired',
          auto_expired: true,
          cancel_reason: 'Otomatis dibatalkan karena tidak ada respons dalam 1 jam'
        })
        .eq('status', 'pending')
        .lt('created_at', oneHourAgo)
        .select();

      if (consultError) throw consultError;

      // Expire pending assistance requests older than 1 hour
      const { data: expiredAssistance, error: assistError } = await supabase
        .from('legal_assistance_requests')
        .update({
          status: 'cancelled',
          auto_expired: true,
          cancel_reason: 'Otomatis dibatalkan karena tidak ada respons dalam 1 jam'
        })
        .eq('status', 'pending')
        .lt('created_at', oneHourAgo)
        .select();

      if (assistError) throw assistError;

      return {
        expiredConsultations: expiredConsultations?.length || 0,
        expiredAssistance: expiredAssistance?.length || 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-assistance-requests'] });
    }
  });
}
