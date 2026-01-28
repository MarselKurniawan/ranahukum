import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface FaceToFaceRequest {
  id: string;
  display_id: string | null;
  client_id: string;
  lawyer_id: string;
  case_type: string | null;
  case_description: string;
  proposed_price: number | null;
  agreed_price: number | null;
  status: string;
  payment_status: string;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  meeting_notes: string | null;
  meeting_confirmed_at: string | null;
  cancel_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  auto_expired: boolean | null;
  created_at: string;
  updated_at: string;
  lawyers?: {
    id: string;
    name: string;
    image_url: string | null;
    specialization: string[] | null;
    rating: number | null;
    face_to_face_price: number | null;
    user_id: string;
  };
  profiles?: {
    full_name: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
}

export interface FaceToFaceMessage {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url: string | null;
  proposed_date: string | null;
  proposed_time: string | null;
  proposed_location: string | null;
  is_schedule_accepted: boolean | null;
  created_at: string;
}

// Fetch lawyers that offer face-to-face service
export function useFaceToFaceLawyers() {
  return useQuery({
    queryKey: ["face-to-face-lawyers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lawyers")
        .select("*")
        .eq("is_verified", true)
        .eq("is_available", true)
        .eq("is_suspended", false)
        .gt("face_to_face_price", 0)
        .order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch client's face-to-face requests
export function useClientFaceToFaceRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-face-to-face-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("face_to_face_requests")
        .select(`
          *,
          lawyers (id, name, image_url, specialization, rating, face_to_face_price, user_id)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FaceToFaceRequest[];
    },
    enabled: !!user,
  });
}

// Fetch lawyer's face-to-face requests
export function useLawyerFaceToFaceRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lawyer-face-to-face-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get lawyer id
      const { data: lawyerData } = await supabase
        .from("lawyers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!lawyerData) return [];

      const { data, error } = await supabase
        .from("face_to_face_requests")
        .select("*")
        .eq("lawyer_id", lawyerData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch client profiles separately
      const clientIds = [...new Set(data.map(r => r.client_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, whatsapp")
        .in("user_id", clientIds);

      return data.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.user_id === request.client_id)
      })) as FaceToFaceRequest[];
    },
    enabled: !!user,
  });
}

// Fetch single face-to-face request
export function useFaceToFaceRequest(id: string) {
  return useQuery({
    queryKey: ["face-to-face-request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("face_to_face_requests")
        .select(`
          *,
          lawyers (id, name, image_url, specialization, rating, face_to_face_price, user_id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as FaceToFaceRequest;
    },
    enabled: !!id,
  });
}

// Create face-to-face request
export function useCreateFaceToFaceRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lawyerId,
      caseType,
      caseDescription,
    }: {
      lawyerId: string;
      caseType: string;
      caseDescription: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("face_to_face_requests")
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          case_type: caseType,
          case_description: caseDescription,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-face-to-face-requests"] });
      toast.success("Permintaan tatap muka berhasil dikirim");
    },
    onError: (error) => {
      console.error("Failed to create request:", error);
      toast.error("Gagal membuat permintaan");
    },
  });
}

// Update face-to-face request
export function useUpdateFaceToFaceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: string;
      proposed_price?: number;
      agreed_price?: number;
      meeting_date?: string;
      meeting_time?: string;
      meeting_location?: string;
      meeting_notes?: string;
      meeting_confirmed_at?: string;
      cancel_reason?: string;
      cancelled_by?: string;
      cancelled_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("face_to_face_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["face-to-face-request", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["client-face-to-face-requests"] });
      queryClient.invalidateQueries({ queryKey: ["lawyer-face-to-face-requests"] });
    },
  });
}

// Fetch face-to-face messages
export function useFaceToFaceMessages(requestId: string) {
  return useQuery({
    queryKey: ["face-to-face-messages", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("face_to_face_messages")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as FaceToFaceMessage[];
    },
    enabled: !!requestId,
    refetchInterval: 3000, // Poll for new messages
  });
}

// Send face-to-face message
export function useSendFaceToFaceMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      content,
      messageType = "text",
      fileUrl,
      proposedDate,
      proposedTime,
      proposedLocation,
    }: {
      requestId: string;
      content: string;
      messageType?: string;
      fileUrl?: string;
      proposedDate?: string;
      proposedTime?: string;
      proposedLocation?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("face_to_face_messages")
        .insert({
          request_id: requestId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          proposed_date: proposedDate,
          proposed_time: proposedTime,
          proposed_location: proposedLocation,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["face-to-face-messages", variables.requestId],
      });
    },
  });
}

// Accept/confirm schedule proposal
export function useAcceptScheduleProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      requestId,
      date,
      time,
      location,
    }: {
      messageId: string;
      requestId: string;
      date: string;
      time: string;
      location: string;
    }) => {
      // Update message as accepted
      await supabase
        .from("face_to_face_messages")
        .update({ is_schedule_accepted: true })
        .eq("id", messageId);

      // Update request with confirmed schedule
      const { data, error } = await supabase
        .from("face_to_face_requests")
        .update({
          status: "scheduled",
          meeting_date: date,
          meeting_time: time,
          meeting_location: location,
          meeting_confirmed_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["face-to-face-request", variables.requestId],
      });
      queryClient.invalidateQueries({
        queryKey: ["face-to-face-messages", variables.requestId],
      });
      toast.success("Jadwal pertemuan dikonfirmasi");
    },
  });
}
