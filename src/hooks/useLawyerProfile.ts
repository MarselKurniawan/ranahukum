import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { DbLawyer } from "./useLawyers";

export interface LawyerProfileCompletion {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

const REQUIRED_FIELDS = [
  { key: 'name', label: 'Nama Lengkap' },
  { key: 'specialization', label: 'Spesialisasi' },
  { key: 'location', label: 'Lokasi' },
  { key: 'experience_years', label: 'Pengalaman (Tahun)' },
  { key: 'image_url', label: 'Foto Profil' },
] as const;

export function useLawyerProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as DbLawyer | null;
    },
    enabled: !!user
  });
}

export function useUpdateLawyerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<DbLawyer>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lawyers')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as DbLawyer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-profile'] });
    }
  });
}

export function useLawyerProfileCompletion(): LawyerProfileCompletion | null {
  const { data: profile, isLoading } = useLawyerProfile();

  if (isLoading || !profile) return null;

  const missingFields: string[] = [];
  let completedFields = 0;

  for (const field of REQUIRED_FIELDS) {
    const value = profile[field.key as keyof DbLawyer];
    
    if (field.key === 'specialization') {
      if (Array.isArray(value) && value.length > 0) {
        completedFields++;
      } else {
        missingFields.push(field.label);
      }
    } else if (field.key === 'experience_years') {
      if (typeof value === 'number' && value > 0) {
        completedFields++;
      } else {
        missingFields.push(field.label);
      }
    } else if (field.key === 'image_url') {
      if (value && String(value).trim() !== '') {
        completedFields++;
      } else {
        missingFields.push(field.label);
      }
    } else {
      if (value && String(value).trim() !== '') {
        completedFields++;
      } else {
        missingFields.push(field.label);
      }
    }
  }

  return {
    isComplete: missingFields.length === 0,
    completedFields,
    totalFields: REQUIRED_FIELDS.length,
    missingFields
  };
}
