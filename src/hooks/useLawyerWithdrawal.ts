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

export interface HeldEarningDetail {
  earningId: string;
  amount: number;
  requestId: string;
  displayId: string | null;
  clientName: string | null;
  caseType: string | null;
  missingEvidence: boolean;
  missingSignature: boolean;
}

// Get lawyer's earnings
export function useLawyerEarnings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-earnings', user?.id],
    queryFn: async () => {
      if (!user) return [];

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

// Get available balance with held amount details
export function useLawyerBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lawyer-balance', user?.id],
    queryFn: async () => {
      if (!user) return { available: 0, pending: 0, total: 0, held: 0, heldDetails: [] as HeldEarningDetail[] };

      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!lawyer) return { available: 0, pending: 0, total: 0, held: 0, heldDetails: [] as HeldEarningDetail[] };

      // Get all earnings
      const { data: earnings } = await supabase
        .from('lawyer_earnings')
        .select('id, amount, is_withdrawn, request_id')
        .eq('lawyer_id', lawyer.id);

      // Get pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('lawyer_withdrawals')
        .select('amount')
        .eq('lawyer_id', lawyer.id)
        .in('status', ['pending', 'processing']);

      // Get incomplete assistance requests (completed but missing evidence/signature)
      const { data: incompleteRequests } = await supabase
        .from('legal_assistance_requests')
        .select('id, display_id, client_name, case_type, meeting_evidence_url, meeting_signature_url, meeting_verified')
        .eq('lawyer_id', lawyer.id)
        .eq('status', 'completed')
        .eq('meeting_verified', false);

      const incompleteRequestIds = new Set(
        (incompleteRequests || [])
          .filter(r => !r.meeting_evidence_url || !r.meeting_signature_url)
          .map(r => r.id)
      );

      const totalEarnings = earnings?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const withdrawnAmount = earnings?.filter(e => e.is_withdrawn).reduce((sum, e) => sum + e.amount, 0) || 0;
      const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

      // Calculate held amount - only earnings from incomplete accompaniments
      const heldDetails: HeldEarningDetail[] = [];
      let heldAmount = 0;

      if (earnings && incompleteRequests) {
        for (const earning of earnings) {
          if (earning.is_withdrawn || !earning.request_id) continue;
          if (incompleteRequestIds.has(earning.request_id)) {
            const request = incompleteRequests.find(r => r.id === earning.request_id);
            if (request) {
              heldAmount += earning.amount;
              heldDetails.push({
                earningId: earning.id,
                amount: earning.amount,
                requestId: request.id,
                displayId: request.display_id,
                clientName: request.client_name,
                caseType: request.case_type,
                missingEvidence: !request.meeting_evidence_url,
                missingSignature: !request.meeting_signature_url,
              });
            }
          }
        }
      }

      return {
        available: totalEarnings - withdrawnAmount - pendingAmount - heldAmount,
        pending: pendingAmount,
        total: totalEarnings,
        held: heldAmount,
        heldDetails,
      };
    },
    enabled: !!user
  });
}

// Check if lawyer can withdraw (always can, but with reduced available balance)
export function useCanWithdraw() {
  const { data: balance } = useLawyerBalance();

  return useQuery({
    queryKey: ['can-withdraw', balance?.available],
    queryFn: async () => {
      // Always allow withdrawal, the held amount is already excluded from available balance
      return { canWithdraw: true, reason: '' };
    },
    enabled: balance !== undefined
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
