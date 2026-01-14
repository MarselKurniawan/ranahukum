import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useLawyerProfile } from "./useLawyerProfile";

export interface SuspensionStatus {
  isSuspended: boolean;
  suspendedUntil: string | null;
  suspendReason: string | null;
  isActive: boolean; // true if suspension is still active (not expired)
}

// Hook for checking client/user suspension status
export function useClientSuspension(): SuspensionStatus | null {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['client-suspension', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_suspended, suspended_until, suspend_reason')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 60000 // Refetch every minute to check if suspension expired
  });

  if (!data) return null;

  const now = new Date();
  const suspendedUntil = data.suspended_until ? new Date(data.suspended_until) : null;
  const isActive = data.is_suspended && suspendedUntil && suspendedUntil > now;

  return {
    isSuspended: data.is_suspended || false,
    suspendedUntil: data.suspended_until,
    suspendReason: data.suspend_reason,
    isActive: !!isActive
  };
}

// Hook for checking lawyer suspension status
export function useLawyerSuspension(): SuspensionStatus | null {
  const { data: lawyerProfile, isLoading } = useLawyerProfile();

  if (isLoading || !lawyerProfile) return null;

  const now = new Date();
  const suspendedUntil = lawyerProfile.suspended_until ? new Date(lawyerProfile.suspended_until) : null;
  const isActive = lawyerProfile.is_suspended && suspendedUntil && suspendedUntil > now;

  return {
    isSuspended: lawyerProfile.is_suspended || false,
    suspendedUntil: lawyerProfile.suspended_until || null,
    suspendReason: lawyerProfile.suspend_reason || null,
    isActive: !!isActive
  };
}
