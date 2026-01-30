import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLawyerProfile } from "./useLawyerProfile";

export interface LawyerPriceRequest {
  id: string;
  lawyer_id: string;
  request_type: string;
  requested_price: number;
  current_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface LawyerPriceRequestWithLawyer extends LawyerPriceRequest {
  lawyer?: {
    name: string;
    image_url: string | null;
  };
}

export function useLawyerPriceRequests() {
  const { data: profile } = useLawyerProfile();

  return useQuery({
    queryKey: ['lawyer-price-requests', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('lawyer_price_requests')
        .select('*')
        .eq('lawyer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LawyerPriceRequest[];
    },
    enabled: !!profile?.id
  });
}

export function useCreatePriceRequest() {
  const queryClient = useQueryClient();
  const { data: profile } = useLawyerProfile();

  return useMutation({
    mutationFn: async ({ 
      requestedPrice, 
      notes, 
      requestType = 'pendampingan' 
    }: { 
      requestedPrice: number; 
      notes?: string;
      requestType?: 'pendampingan' | 'face_to_face';
    }) => {
      if (!profile) throw new Error('No lawyer profile');

      const currentPrice = requestType === 'face_to_face' 
        ? profile.face_to_face_price || 0 
        : profile.pendampingan_price || 0;

      const { data, error } = await supabase
        .from('lawyer_price_requests')
        .insert({
          lawyer_id: profile.id,
          request_type: requestType,
          requested_price: requestedPrice,
          current_price: currentPrice,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-price-requests'] });
    }
  });
}

// Superadmin hooks
export function useAllPriceRequests() {
  return useQuery({
    queryKey: ['all-price-requests'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('lawyer_price_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch lawyer details
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('name, image_url')
            .eq('id', request.lawyer_id)
            .maybeSingle();

          return {
            ...request,
            lawyer: lawyer || undefined
          };
        })
      );

      return enrichedRequests as LawyerPriceRequestWithLawyer[];
    }
  });
}

export function useApprovePriceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approve, notes }: { 
      requestId: string; 
      approve: boolean;
      notes?: string;
    }) => {
      // Update the request status - the trigger will auto-update lawyer's price if approved
      const { error: requestError } = await supabase
        .from('lawyer_price_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', requestId);

      if (requestError) throw requestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-price-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-profile'] });
    }
  });
}
