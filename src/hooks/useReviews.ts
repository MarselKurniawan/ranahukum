import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Review {
  id: string;
  lawyer_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  consultation_topic: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export function useLawyerReviews(lawyerId?: string) {
  return useQuery({
    queryKey: ['lawyer-reviews', lawyerId],
    queryFn: async () => {
      if (!lawyerId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles
      if (data && data.length > 0) {
        const userIds = data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        return data.map(review => ({
          ...review,
          profiles: profiles?.find(p => p.user_id === review.user_id) || null
        })) as Review[];
      }
      
      return data as Review[];
    },
    enabled: !!lawyerId
  });
}

export function useConsultationReview(consultationId?: string, clientId?: string, lawyerId?: string) {
  return useQuery({
    queryKey: ['consultation-review', consultationId],
    queryFn: async () => {
      if (!clientId || !lawyerId) return null;
      
      // Find review from this client to this lawyer
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!clientId && !!lawyerId
  });
}

// Hook untuk mengecek apakah user sudah memberi review untuk lawyer tertentu
export function useHasReviewedLawyer(lawyerId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['has-reviewed', lawyerId, user?.id],
    queryFn: async () => {
      if (!user || !lawyerId) return false;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('lawyer_id', lawyerId)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!lawyerId
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      lawyerId, 
      rating, 
      comment,
      consultationTopic 
    }: { 
      lawyerId: string; 
      rating: number; 
      comment?: string;
      consultationTopic?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          lawyer_id: lawyerId,
          user_id: user.id,
          rating,
          comment: comment || null,
          consultation_topic: consultationTopic || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-reviews', variables.lawyerId] });
      queryClient.invalidateQueries({ queryKey: ['consultation-review'] });
    }
  });
}
