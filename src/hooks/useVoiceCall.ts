import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface VoiceCallSession {
  id: string;
  consultation_id: string | null;
  caller_id: string;
  receiver_id: string;
  phone_number: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  call_fee: number;
  is_paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useVoiceCallFeePerMinute() {
  return useQuery({
    queryKey: ["voice-call-fee-per-minute"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "voice_call_fee_per_minute")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
}

export function useVoiceCallSessions(consultationId?: string) {
  return useQuery({
    queryKey: ["voice-call-sessions", consultationId],
    queryFn: async () => {
      let query = supabase
        .from("voice_call_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (consultationId) {
        query = query.eq("consultation_id", consultationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as VoiceCallSession[];
    },
    enabled: !!consultationId,
  });
}

export function useCreateVoiceCall() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      consultationId,
      receiverId,
      phoneNumber,
    }: {
      consultationId: string;
      receiverId: string;
      phoneNumber: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("voice_call_sessions")
        .insert({
          consultation_id: consultationId,
          caller_id: user.id,
          receiver_id: receiverId,
          phone_number: phoneNumber,
          status: "initiated",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["voice-call-sessions", variables.consultationId],
      });
    },
    onError: (error) => {
      console.error("Failed to create voice call:", error);
      toast.error("Gagal memulai panggilan");
    },
  });
}

export function useCompleteVoiceCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      durationMinutes,
      feePerMinute,
      notes,
    }: {
      callId: string;
      durationMinutes: number;
      feePerMinute: number;
      notes?: string;
    }) => {
      const callFee = durationMinutes * feePerMinute;

      const { data, error } = await supabase
        .from("voice_call_sessions")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          call_fee: callFee,
          notes,
        })
        .eq("id", callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-call-sessions"] });
      toast.success("Data panggilan berhasil disimpan");
    },
    onError: (error) => {
      console.error("Failed to complete voice call:", error);
      toast.error("Gagal menyimpan data panggilan");
    },
  });
}

export function useCancelVoiceCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const { data, error } = await supabase
        .from("voice_call_sessions")
        .update({
          status: "cancelled",
          ended_at: new Date().toISOString(),
        })
        .eq("id", callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-call-sessions"] });
    },
  });
}
