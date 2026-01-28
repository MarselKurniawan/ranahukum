import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbLawyer {
  id: string;
  user_id: string;
  name: string;
  specialization: string[];
  rating: number;
  review_count: number;
  consultation_count: number;
  price: number;
  experience_years: number;
  image_url: string | null;
  location: string | null;
  is_verified: boolean;
  is_available: boolean;
  is_suspended?: boolean;
  suspended_until?: string | null;
  suspend_reason?: string | null;
  pendampingan_price: number;
  face_to_face_price?: number;
  created_at: string;
  approval_status: string;
  submitted_at: string | null;
  education?: string | null;
  interview_consent?: boolean;
  quiz_completed?: boolean;
  bio?: string | null;
}

// Hook for public lawyer listing - only approved & available lawyers
export function useLawyers() {
  return useQuery({
    queryKey: ['lawyers', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as DbLawyer[];
    }
  });
}

// Hook for admin - all lawyers including pending
export function useAllLawyers() {
  return useQuery({
    queryKey: ['lawyers', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbLawyer[];
    }
  });
}

export function useLawyer(id: string) {
  return useQuery({
    queryKey: ['lawyer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as DbLawyer | null;
    },
    enabled: !!id
  });
}
