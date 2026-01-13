import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { DbLawyer } from "./useLawyers";

export interface LawyerWithProfile extends DbLawyer {
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface ConsultationWithDetails {
  id: string;
  client_id: string;
  lawyer_id: string;
  topic: string;
  status: string;
  price: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  lawyer?: {
    name: string;
    user_id: string;
  };
  client_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export function useIsSuperAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-superadmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'superadmin')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user
  });
}

export function useAllLawyers() {
  const { data: isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['all-lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbLawyer[];
    },
    enabled: !!isSuperAdmin
  });
}

export function usePendingLawyers() {
  const { data: isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['pending-lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('approval_status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data as DbLawyer[];
    },
    enabled: !!isSuperAdmin
  });
}

export function useApproveLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lawyerId, approve }: { lawyerId: string; approve: boolean }) => {
      const { data, error } = await supabase
        .from('lawyers')
        .update({ 
          approval_status: approve ? 'approved' : 'rejected',
          is_verified: approve,
          // Keep is_available as false - lawyer must manually go online after completing profile
          is_available: false
        })
        .eq('id', lawyerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
    }
  });
}

export function useUpdateLawyerPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lawyerId, price, pendampinganPrice }: { 
      lawyerId: string; 
      price: number;
      pendampinganPrice?: number;
    }) => {
      const updates: { price: number; pendampingan_price?: number } = { price };
      if (pendampinganPrice !== undefined) {
        updates.pendampingan_price = pendampinganPrice;
      }

      const { data, error } = await supabase
        .from('lawyers')
        .update(updates)
        .eq('id', lawyerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}

export function useAllConsultations() {
  const { data: isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['all-consultations'],
    queryFn: async () => {
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch lawyer and client details separately
      const enrichedConsultations = await Promise.all(
        (consultations || []).map(async (consultation) => {
          const [lawyerResult, clientResult] = await Promise.all([
            supabase
              .from('lawyers')
              .select('name, user_id')
              .eq('id', consultation.lawyer_id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', consultation.client_id)
              .maybeSingle()
          ]);

          return {
            ...consultation,
            lawyer: lawyerResult.data || undefined,
            client_profile: clientResult.data || undefined
          };
        })
      );

      return enrichedConsultations as ConsultationWithDetails[];
    },
    enabled: !!isSuperAdmin
  });
}

export function useLawyerConsultationsHistory(lawyerId: string) {
  const { data: isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['lawyer-consultations-history', lawyerId],
    queryFn: async () => {
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client profiles
      const enrichedConsultations = await Promise.all(
        (consultations || []).map(async (consultation) => {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', consultation.client_id)
            .maybeSingle();

          return {
            ...consultation,
            client_profile: clientProfile || undefined
          };
        })
      );

      return enrichedConsultations as ConsultationWithDetails[];
    },
    enabled: !!isSuperAdmin && !!lawyerId
  });
}

export function useConsultationMessages(consultationId: string) {
  const { data: isSuperAdmin } = useIsSuperAdmin();

  return useQuery({
    queryKey: ['consultation-messages', consultationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin && !!consultationId
  });
}

export function useSuspendLawyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lawyerId, suspend }: { lawyerId: string; suspend: boolean }) => {
      const { data, error } = await supabase
        .from('lawyers')
        .update({ 
          is_suspended: suspend,
          is_available: suspend ? false : undefined // Force offline when suspended
        })
        .eq('id', lawyerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
    }
  });
}

export function useSuspendClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, suspend }: { profileId: string; suspend: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_suspended: suspend })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
    }
  });
}
