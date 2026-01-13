import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface LegalAssistanceRequest {
  id: string;
  client_id: string;
  lawyer_id: string;
  case_description: string;
  proposed_price: number | null;
  agreed_price: number | null;
  status: string;
  current_stage: string | null;
  stage_notes: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
  lawyer?: {
    id: string;
    user_id?: string;
    name: string;
    image_url: string | null;
    pendampingan_price: number | null;
    location?: string | null;
  };
  client?: {
    id: string;
    user_id?: string;
    full_name: string | null;
    email?: string | null;
    avatar_url: string | null;
  };
}

export interface LegalAssistanceMessage {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_price_offer: boolean;
  offered_price: number | null;
  file_url: string | null;
  created_at: string;
}

export interface LegalAssistanceStatusHistory {
  id: string;
  request_id: string;
  status: string;
  stage: string | null;
  notes: string | null;
  updated_by: string;
  created_at: string;
}

// Available stages for tracking
export const ASSISTANCE_STAGES = [
  { value: 'initial_consultation', label: 'Konsultasi Awal', description: 'Diskusi awal dan analisis kasus' },
  { value: 'document_collection', label: 'Pengumpulan Berkas', description: 'Mengumpulkan dokumen-dokumen yang diperlukan' },
  { value: 'document_review', label: 'Review Dokumen', description: 'Menelaah dan menganalisis dokumen' },
  { value: 'legal_drafting', label: 'Penyusunan Dokumen Hukum', description: 'Menyusun dokumen hukum yang diperlukan' },
  { value: 'negotiation', label: 'Negosiasi', description: 'Melakukan negosiasi dengan pihak lawan' },
  { value: 'court_preparation', label: 'Persiapan Pengadilan', description: 'Mempersiapkan berkas untuk pengadilan' },
  { value: 'court_session', label: 'Sidang Pengadilan', description: 'Proses persidangan di pengadilan' },
  { value: 'awaiting_verdict', label: 'Menunggu Putusan', description: 'Menunggu hasil putusan' },
  { value: 'completed', label: 'Selesai', description: 'Pendampingan hukum telah selesai' },
];

// Hook to get client's legal assistance requests
export function useClientAssistanceRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['client-assistance-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch lawyer details
      const enrichedData = await Promise.all(
        (data || []).map(async (req) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('id, name, image_url, pendampingan_price')
            .eq('id', req.lawyer_id)
            .single();

          return { ...req, lawyer } as LegalAssistanceRequest;
        })
      );

      return enrichedData;
    },
    enabled: !!user
  });

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('client-assistance-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_assistance_requests',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

// Hook to get lawyer's legal assistance requests
export function useLawyerAssistanceRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lawyer-assistance-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get lawyer profile first
      const { data: lawyerData } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerData) return [];

      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .select('*')
        .eq('lawyer_id', lawyerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client details
      const enrichedData = await Promise.all(
        (data || []).map(async (req) => {
          const { data: client } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('user_id', req.client_id)
            .single();

          return { ...req, client } as LegalAssistanceRequest;
        })
      );

      return enrichedData;
    },
    enabled: !!user
  });

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('lawyer-assistance-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_assistance_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['lawyer-assistance-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

// Hook to get single request
export function useAssistanceRequest(requestId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assistance-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error) throw error;

      // Fetch lawyer
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id, user_id, name, image_url, pendampingan_price, location')
        .eq('id', data.lawyer_id)
        .single();

      // Fetch client
      const { data: client } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, avatar_url')
        .eq('user_id', data.client_id)
        .single();

      return { ...data, lawyer, client } as LegalAssistanceRequest;
    },
    enabled: !!requestId
  });

  // Realtime subscription
  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`assistance-request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_assistance_requests',
          filter: `id=eq.${requestId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['assistance-request', requestId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);

  return query;
}

// Hook to get messages for a request
export function useAssistanceMessages(requestId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assistance-messages', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_assistance_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as LegalAssistanceMessage[];
    },
    enabled: !!requestId
  });

  // Realtime subscription
  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`assistance-messages-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'legal_assistance_messages',
          filter: `request_id=eq.${requestId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['assistance-messages', requestId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);

  return query;
}

// Hook to get status history
export function useAssistanceStatusHistory(requestId: string) {
  return useQuery({
    queryKey: ['assistance-status-history', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_assistance_status_history')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LegalAssistanceStatusHistory[];
    },
    enabled: !!requestId
  });
}

// Create request mutation
export function useCreateAssistanceRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lawyerId, caseDescription }: { lawyerId: string; caseDescription: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          case_description: caseDescription,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
    }
  });
}

// Send message mutation
export function useSendAssistanceMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      content, 
      isPriceOffer = false, 
      offeredPrice,
      messageType = 'text',
      fileUrl
    }: { 
      requestId: string; 
      content: string; 
      isPriceOffer?: boolean;
      offeredPrice?: number;
      messageType?: string;
      fileUrl?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('legal_assistance_messages')
        .insert({
          request_id: requestId,
          sender_id: user.id,
          content,
          message_type: messageType,
          is_price_offer: isPriceOffer,
          offered_price: offeredPrice,
          file_url: fileUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assistance-messages', variables.requestId] });
    }
  });
}

// Update request status (for lawyers)
export function useUpdateAssistanceStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      currentStage,
      stageNotes,
      agreedPrice
    }: { 
      requestId: string; 
      status?: string;
      currentStage?: string;
      stageNotes?: string;
      agreedPrice?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const updateData: Record<string, unknown> = {};
      if (status) updateData.status = status;
      if (currentStage !== undefined) {
        updateData.current_stage = currentStage;
        // Jika stage adalah "completed", otomatis ubah status menjadi "completed"
        if (currentStage === 'completed') {
          updateData.status = 'completed';
        }
      }
      if (stageNotes !== undefined) updateData.stage_notes = stageNotes;
      if (agreedPrice !== undefined) updateData.agreed_price = agreedPrice;

      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Add to status history
      if (status || currentStage) {
        await supabase
          .from('legal_assistance_status_history')
          .insert({
            request_id: requestId,
            status: status || 'updated',
            stage: currentStage,
            notes: stageNotes,
            updated_by: user.id
          });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assistance-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-assistance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['assistance-status-history', variables.requestId] });
    }
  });
}

// Accept price offer (for client)
export function useAcceptPriceOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, agreedPrice }: { requestId: string; agreedPrice: number }) => {
      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .update({ 
          agreed_price: agreedPrice,
          status: 'agreed'
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assistance-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
    }
  });
}

// Update payment status
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, paymentStatus }: { requestId: string; paymentStatus: string }) => {
      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .update({ 
          payment_status: paymentStatus,
          status: paymentStatus === 'paid' ? 'in_progress' : undefined
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assistance-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['client-assistance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-assistance-requests'] });
    }
  });
}

// Hook for app settings (consultation price)
export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;
      
      // Convert to object for easier access
      const settings: Record<string, unknown> = {};
      (data || []).forEach(s => {
        settings[s.key] = s.value;
      });
      
      return settings;
    }
  });
}

// Hook for single app setting
export function useAppSetting(key: string) {
  return useQuery({
    queryKey: ['app-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!key
  });
}

// Update or create app setting (superadmin only)
export function useUpdateAppSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: { amount: number }; description?: string }) => {
      // Get current user from supabase auth directly
      const { data: { user } } = await supabase.auth.getUser();
      
      // Try to update first
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('app_settings')
          .update({ 
            value: value as unknown as Record<string, never>,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
            description: description
          })
          .eq('key', key)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('app_settings')
          .insert({ 
            key,
            value: value as unknown as Record<string, never>,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
            description: description
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-setting'] });
    }
  });
}

// Hook for superadmin to get all requests
export function useAllAssistanceRequests() {
  return useQuery({
    queryKey: ['all-assistance-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_assistance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch lawyer and client details
      const enrichedData = await Promise.all(
        (data || []).map(async (req) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('id, name, image_url, pendampingan_price')
            .eq('id', req.lawyer_id)
            .single();

          const { data: client } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('user_id', req.client_id)
            .single();

          return { ...req, lawyer, client } as LegalAssistanceRequest;
        })
      );

      return enrichedData;
    }
  });
}
