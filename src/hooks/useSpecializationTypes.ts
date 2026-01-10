import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SpecializationType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export function useSpecializationTypes() {
  return useQuery({
    queryKey: ['specialization-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialization_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as SpecializationType[];
    }
  });
}

export function useAllSpecializationTypes() {
  return useQuery({
    queryKey: ['all-specialization-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialization_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as SpecializationType[];
    }
  });
}

export function useCreateSpecializationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('specialization_types')
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      return data as SpecializationType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialization-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-specialization-types'] });
    }
  });
}

export function useUpdateSpecializationType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SpecializationType> & { id: string }) => {
      const { data, error } = await supabase
        .from('specialization_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SpecializationType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialization-types'] });
      queryClient.invalidateQueries({ queryKey: ['all-specialization-types'] });
    }
  });
}
