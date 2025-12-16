import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Consultation {
  id: string;
  client_id: string;
  lawyer_id: string;
  topic: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  price: number;
  started_at: string | null;
  ended_at: string | null;
  lawyer_notes: string | null;
  created_at: string;
  lawyers?: {
    name: string;
    image_url: string | null;
    specialization: string[];
  };
  profiles?: {
    full_name: string | null;
  };
}

export function useConsultations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          lawyers (name, image_url, specialization)
        `)
        .eq('client_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Consultation[];
    },
    enabled: !!user
  });
}

export function useLawyerConsultations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lawyer-consultations', user?.id],
    queryFn: async () => {
      // First get the lawyer id
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!lawyer) return [];

      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!consultations || consultations.length === 0) return [];

      // Fetch client profiles separately
      const clientIds = consultations.map(c => c.client_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', clientIds);

      // Merge data
      return consultations.map(c => ({
        ...c,
        profiles: profiles?.find(p => p.user_id === c.client_id) || null
      })) as Consultation[];
    },
    enabled: !!user
  });
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          lawyers (name, image_url, specialization, user_id)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lawyerId, topic, price }: { lawyerId: string; topic: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('consultations')
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          topic,
          price,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, lawyer_notes }: { id: string; status?: string; lawyer_notes?: string }) => {
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (lawyer_notes) updates.lawyer_notes = lawyer_notes;
      if (status === 'active') updates.started_at = new Date().toISOString();
      if (status === 'completed') updates.ended_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('consultations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-consultations'] });
    }
  });
}
