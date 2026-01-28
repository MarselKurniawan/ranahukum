import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Exponential backoff cooldown periods in minutes
const COOLDOWN_PERIODS = [5, 15, 30, 60, 180, 420, 720, 1440]; // 5min, 15min, 30min, 1hr, 3hr, 7hr, 12hr, 24hr

// Calculate cooldown end time based on rejection count
export function calculateCooldownEnd(rejectedAt: string | null, rejectionCount: number): Date | null {
  if (!rejectedAt || rejectionCount === 0) return null;
  
  const rejectedDate = new Date(rejectedAt);
  const cooldownMinutes = COOLDOWN_PERIODS[Math.min(rejectionCount - 1, COOLDOWN_PERIODS.length - 1)];
  const cooldownEnd = new Date(rejectedDate.getTime() + cooldownMinutes * 60 * 1000);
  
  return cooldownEnd;
}

// Check if user can request again
export function canRequestAgain(rejectedAt: string | null, rejectionCount: number): boolean {
  const cooldownEnd = calculateCooldownEnd(rejectedAt, rejectionCount);
  if (!cooldownEnd) return true;
  return new Date() >= cooldownEnd;
}

// Get remaining cooldown time in human readable format
export function getRemainingCooldown(rejectedAt: string | null, rejectionCount: number): string | null {
  const cooldownEnd = calculateCooldownEnd(rejectedAt, rejectionCount);
  if (!cooldownEnd) return null;
  
  const now = new Date();
  if (now >= cooldownEnd) return null;
  
  const diffMs = cooldownEnd.getTime() - now.getTime();
  const diffMins = Math.ceil(diffMs / (60 * 1000));
  
  if (diffMins < 60) {
    return `${diffMins} menit`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  } else {
    const days = Math.floor(diffMins / 1440);
    const hours = Math.floor((diffMins % 1440) / 60);
    return hours > 0 ? `${days} hari ${hours} jam` : `${days} hari`;
  }
}

// Get lawyer's face-to-face activation status
export function useLawyerFaceToFaceStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-face-to-face-status', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('lawyers')
        .select('id, face_to_face_enabled, face_to_face_status, face_to_face_requested_at, face_to_face_rejection_count, face_to_face_rejected_at, face_to_face_price')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

// Request face-to-face activation
export function useRequestFaceToFaceActivation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // First check current status and cooldown
      const { data: lawyer, error: fetchError } = await supabase
        .from('lawyers')
        .select('id, face_to_face_status, face_to_face_rejection_count, face_to_face_rejected_at')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Check if already pending
      if (lawyer.face_to_face_status === 'pending') {
        throw new Error('Permintaan sudah dalam proses review');
      }

      // Check cooldown if rejected
      if (lawyer.face_to_face_status === 'rejected') {
        const rejectionCount = lawyer.face_to_face_rejection_count || 1;
        const rejectedAt = lawyer.face_to_face_rejected_at;
        
        if (!canRequestAgain(rejectedAt, rejectionCount)) {
          const remaining = getRemainingCooldown(rejectedAt, rejectionCount);
          throw new Error(`Silakan tunggu ${remaining} lagi sebelum mengajukan kembali`);
        }
      }

      const { data, error } = await supabase
        .from('lawyers')
        .update({ 
          face_to_face_status: 'pending',
          face_to_face_requested_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-face-to-face-status'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-profile'] });
    }
  });
}

// Get all face-to-face activation requests (for SuperAdmin)
export function useAllFaceToFaceRequests() {
  return useQuery({
    queryKey: ['all-face-to-face-activation-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('face_to_face_status', 'pending')
        .order('face_to_face_requested_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}

// Approve or reject face-to-face activation (SuperAdmin)
export function useApproveFaceToFaceActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lawyerId, approve }: { lawyerId: string; approve: boolean }) => {
      let updateData: Record<string, unknown> = {
        face_to_face_status: approve ? 'approved' : 'rejected',
        face_to_face_enabled: approve
      };

      if (!approve) {
        // Get current rejection count
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('face_to_face_rejection_count')
          .eq('id', lawyerId)
          .single();

        const currentCount = lawyer?.face_to_face_rejection_count || 0;
        updateData = {
          ...updateData,
          face_to_face_rejection_count: currentCount + 1,
          face_to_face_rejected_at: new Date().toISOString()
        };
      }

      const { data, error } = await supabase
        .from('lawyers')
        .update(updateData)
        .eq('id', lawyerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-face-to-face-activation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
    }
  });
}
