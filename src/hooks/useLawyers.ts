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
  pendampingan_price: number;
  created_at: string;
  approval_status: string;
  submitted_at: string | null;
}

export function useLawyers() {
  return useQuery({
    queryKey: ['lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('rating', { ascending: false });

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
