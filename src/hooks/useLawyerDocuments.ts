import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLawyerProfile } from "./useLawyerProfile";

export interface LawyerDocument {
  id: string;
  lawyer_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: string;
  notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
}

export interface LawyerDocumentWithLawyer extends LawyerDocument {
  lawyer?: {
    name: string;
    image_url: string | null;
  };
}

export function useLawyerDocuments() {
  const { data: profile } = useLawyerProfile();

  return useQuery({
    queryKey: ['lawyer-documents', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('lawyer_documents')
        .select('*')
        .eq('lawyer_id', profile.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as LawyerDocument[];
    },
    enabled: !!profile?.id
  });
}

export function useUploadLawyerDocument() {
  const queryClient = useQueryClient();
  const { data: profile } = useLawyerProfile();

  return useMutation({
    mutationFn: async ({ 
      file, 
      documentType 
    }: { 
      file: File; 
      documentType: string;
    }) => {
      if (!profile) throw new Error('No lawyer profile');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${documentType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(`lawyer-documents/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(`lawyer-documents/${fileName}`);

      // Insert document record
      const { data, error } = await supabase
        .from('lawyer_documents')
        .insert({
          lawyer_id: profile.id,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] });
    }
  });
}

// Superadmin hooks
export function useAllLawyerDocuments(lawyerId?: string) {
  return useQuery({
    queryKey: ['all-lawyer-documents', lawyerId],
    queryFn: async () => {
      let query = supabase
        .from('lawyer_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (lawyerId) {
        query = query.eq('lawyer_id', lawyerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as LawyerDocument[];
    }
  });
}

export function usePendingDocuments() {
  return useQuery({
    queryKey: ['pending-documents'],
    queryFn: async () => {
      const { data: documents, error } = await supabase
        .from('lawyer_documents')
        .select('*')
        .eq('status', 'pending')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Fetch lawyer details
      const enrichedDocs = await Promise.all(
        (documents || []).map(async (doc) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('name, image_url')
            .eq('id', doc.lawyer_id)
            .maybeSingle();

          return {
            ...doc,
            lawyer: lawyer || undefined
          };
        })
      );

      return enrichedDocs as LawyerDocumentWithLawyer[];
    }
  });
}

export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      approve, 
      notes 
    }: { 
      documentId: string; 
      approve: boolean;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('lawyer_documents')
        .update({
          status: approve ? 'approved' : 'rejected',
          notes: notes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyer-documents'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] });
    }
  });
}
