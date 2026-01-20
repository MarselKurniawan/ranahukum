import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLawyerProfile } from "./useLawyerProfile";

export interface LawyerCertification {
  id: string;
  lawyer_id: string;
  name: string;
  issuer: string | null;
  year: number | null;
  file_url: string | null;
  file_name: string | null;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface LawyerLicense {
  id: string;
  lawyer_id: string;
  name: string;
  license_number: string | null;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  file_url: string | null;
  file_name: string | null;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Fetch lawyer certifications
export function useLawyerCertifications(lawyerId?: string) {
  const { data: profile } = useLawyerProfile();
  const targetId = lawyerId || profile?.id;

  return useQuery({
    queryKey: ['lawyer-certifications', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from('lawyer_certifications')
        .select('*')
        .eq('lawyer_id', targetId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data as LawyerCertification[];
    },
    enabled: !!targetId
  });
}

// Fetch lawyer licenses
export function useLawyerLicenses(lawyerId?: string) {
  const { data: profile } = useLawyerProfile();
  const targetId = lawyerId || profile?.id;

  return useQuery({
    queryKey: ['lawyer-licenses', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      
      const { data, error } = await supabase
        .from('lawyer_licenses')
        .select('*')
        .eq('lawyer_id', targetId)
        .order('issue_date', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as LawyerLicense[];
    },
    enabled: !!targetId
  });
}

// Add certification
export function useAddCertification() {
  const queryClient = useQueryClient();
  const { data: profile } = useLawyerProfile();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      issuer?: string;
      year?: number;
      file?: File;
    }) => {
      if (!profile) throw new Error('No lawyer profile');

      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (data.file) {
        const fileExt = data.file.name.split('.').pop();
        const path = `certifications/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(path, data.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(path);

        fileUrl = urlData.publicUrl;
        fileName = data.file.name;
      }

      const { data: cert, error } = await supabase
        .from('lawyer_certifications')
        .insert({
          lawyer_id: profile.id,
          name: data.name,
          issuer: data.issuer || null,
          year: data.year || null,
          file_url: fileUrl,
          file_name: fileName,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return cert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-certifications'] });
    }
  });
}

// Add license
export function useAddLicense() {
  const queryClient = useQueryClient();
  const { data: profile } = useLawyerProfile();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      license_number?: string;
      issuer?: string;
      issue_date?: string;
      expiry_date?: string;
      file?: File;
    }) => {
      if (!profile) throw new Error('No lawyer profile');

      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (data.file) {
        const fileExt = data.file.name.split('.').pop();
        const path = `licenses/${profile.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(path, data.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(path);

        fileUrl = urlData.publicUrl;
        fileName = data.file.name;
      }

      const { data: license, error } = await supabase
        .from('lawyer_licenses')
        .insert({
          lawyer_id: profile.id,
          name: data.name,
          license_number: data.license_number || null,
          issuer: data.issuer || null,
          issue_date: data.issue_date || null,
          expiry_date: data.expiry_date || null,
          file_url: fileUrl,
          file_name: fileName,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return license;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-licenses'] });
    }
  });
}

// Superadmin: Get all pending credentials
export function usePendingCredentials() {
  return useQuery({
    queryKey: ['pending-credentials'],
    queryFn: async () => {
      const [certRes, licRes] = await Promise.all([
        supabase
          .from('lawyer_certifications')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('lawyer_licenses')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (certRes.error) throw certRes.error;
      if (licRes.error) throw licRes.error;

      // Enrich with lawyer info
      const allLawyerIds = [
        ...new Set([
          ...(certRes.data || []).map(c => c.lawyer_id),
          ...(licRes.data || []).map(l => l.lawyer_id)
        ])
      ];

      const { data: lawyers } = await supabase
        .from('lawyers')
        .select('id, name, image_url')
        .in('id', allLawyerIds);

      const lawyerMap = new Map((lawyers || []).map(l => [l.id, l]));

      return {
        certifications: (certRes.data || []).map(c => ({
          ...c,
          lawyer: lawyerMap.get(c.lawyer_id)
        })),
        licenses: (licRes.data || []).map(l => ({
          ...l,
          lawyer: lawyerMap.get(l.lawyer_id)
        }))
      };
    }
  });
}

// Review certification
export function useReviewCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      approve, 
      notes 
    }: { 
      id: string; 
      approve: boolean;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('lawyer_certifications')
        .update({
          status: approve ? 'approved' : 'rejected',
          notes: notes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-certifications'] });
    }
  });
}

// Review license
export function useReviewLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      approve, 
      notes 
    }: { 
      id: string; 
      approve: boolean;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('lawyer_licenses')
        .update({
          status: approve ? 'approved' : 'rejected',
          notes: notes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-licenses'] });
    }
  });
}

// Get approved certifications for public view
export function useApprovedCertifications(lawyerId: string) {
  return useQuery({
    queryKey: ['approved-certifications', lawyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_certifications')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .eq('status', 'approved')
        .order('year', { ascending: false });

      if (error) throw error;
      return data as LawyerCertification[];
    },
    enabled: !!lawyerId
  });
}

// Get approved licenses for public view
export function useApprovedLicenses(lawyerId: string) {
  return useQuery({
    queryKey: ['approved-licenses', lawyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_licenses')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .eq('status', 'approved')
        .order('issue_date', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as LawyerLicense[];
    },
    enabled: !!lawyerId
  });
}
