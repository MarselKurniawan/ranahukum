import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LawyerEarning {
  id: string;
  lawyer_id: string;
  request_id: string | null;
  amount: number;
  description: string | null;
  is_withdrawn: boolean;
  withdrawal_id: string | null;
  created_at: string;
}

export interface LawyerWithdrawal {
  id: string;
  lawyer_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  notes: string | null;
  admin_notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

// Get lawyer's earnings
export function useLawyerEarnings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-earnings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return [];

      const { data, error } = await supabase
        .from('lawyer_earnings')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LawyerEarning[];
    },
    enabled: !!user
  });
}

// Get lawyer's withdrawals
export function useLawyerWithdrawals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-withdrawals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return [];

      const { data, error } = await supabase
        .from('lawyer_withdrawals')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LawyerWithdrawal[];
    },
    enabled: !!user
  });
}

// Get available balance (earnings that haven't been withdrawn)
export function useLawyerBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-balance', user?.id],
    queryFn: async () => {
      if (!user) return { available: 0, pending: 0, total: 0 };

      // Get lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return { available: 0, pending: 0, total: 0 };

      // Get all earnings
      const { data: earnings } = await supabase
        .from('lawyer_earnings')
        .select('amount, is_withdrawn')
        .eq('lawyer_id', lawyer.id);

      // Get pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('lawyer_withdrawals')
        .select('amount')
        .eq('lawyer_id', lawyer.id)
        .in('status', ['pending', 'processing']);

      const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const withdrawnAmount = earnings?.filter(e => e.is_withdrawn).reduce((sum, e) => sum + e.amount, 0) || 0;
      const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

      return {
        available: totalEarnings - withdrawnAmount - pendingAmount,
        pending: pendingAmount,
        total: totalEarnings
      };
    },
    enabled: !!user
  });
}

// Check if lawyer can withdraw (has verified meetings)
export function useCanWithdraw() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-withdraw', user?.id],
    queryFn: async () => {
      if (!user) return { canWithdraw: false, reason: 'Not authenticated' };

      // Get lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return { canWithdraw: false, reason: 'Lawyer not found' };

      // Check if there are any completed assistance requests with unverified meetings
      const { data: unverifiedMeetings } = await supabase
        .from('legal_assistance_requests')
        .select('id, meeting_verified, meeting_evidence_url, meeting_signature_url')
        .eq('lawyer_id', lawyer.id)
        .eq('status', 'completed')
        .eq('meeting_verified', false);

      if (unverifiedMeetings && unverifiedMeetings.length > 0) {
        const missingEvidence = unverifiedMeetings.filter(m => !m.meeting_evidence_url || !m.meeting_signature_url);
        if (missingEvidence.length > 0) {
          return { 
            canWithdraw: false, 
            reason: `Ada ${missingEvidence.length} pendampingan selesai yang belum memiliki bukti pertemuan atau tanda tangan. Harap upload terlebih dahulu.`,
            unverifiedCount: missingEvidence.length
          };
        }
      }

      return { canWithdraw: true, reason: '' };
    },
    enabled: !!user
  });
}

// Request withdrawal
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      bankName,
      accountNumber,
      accountHolderName,
      notes
    }: {
      amount: number;
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyer) throw new Error('Lawyer not found');

      const { data, error } = await supabase
        .from('lawyer_withdrawals')
        .insert({
          lawyer_id: lawyer.id,
          amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-balance'] });
    }
  });
}

// Admin: Get all withdrawals
export function useAllWithdrawals() {
  return useQuery({
    queryKey: ['all-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with lawyer info
      const enriched = await Promise.all(
        (data || []).map(async (withdrawal) => {
          const { data: lawyer } = await supabase
            .from('lawyers')
            .select('id, name, image_url, user_id')
            .eq('id', withdrawal.lawyer_id)
            .single();

          return { ...withdrawal, lawyer };
        })
      );

      return enriched;
    }
  });
}

// Admin: Process withdrawal
export function useProcessWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      withdrawalId,
      status,
      adminNotes
    }: {
      withdrawalId: string;
      status: 'processing' | 'completed' | 'rejected';
      adminNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lawyer_withdrawals')
        .update({
          status,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (error) throw error;

      // If completed, mark earnings as withdrawn
      if (status === 'completed') {
        const { data: withdrawal } = await supabase
          .from('lawyer_withdrawals')
          .select('lawyer_id, amount')
          .eq('id', withdrawalId)
          .single();

        if (withdrawal) {
          // Get unwithdrawn earnings up to the withdrawal amount
          const { data: earnings } = await supabase
            .from('lawyer_earnings')
            .select('id, amount')
            .eq('lawyer_id', withdrawal.lawyer_id)
            .eq('is_withdrawn', false)
            .order('created_at', { ascending: true });

          if (earnings) {
            let remaining = withdrawal.amount;
            for (const earning of earnings) {
              if (remaining <= 0) break;
              await supabase
                .from('lawyer_earnings')
                .update({ is_withdrawn: true, withdrawal_id: withdrawalId })
                .eq('id', earning.id);
              remaining -= earning.amount;
            }
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
    }
  });
}
