import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformEarning {
  id: string;
  source_type: 'consultation' | 'pendampingan';
  source_id: string | null;
  lawyer_id: string | null;
  gross_amount: number;
  platform_fee: number;
  lawyer_amount: number;
  fee_type: 'fixed' | 'percentage';
  fee_value: number;
  created_at: string;
  description: string | null;
  lawyer?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export interface PlatformEarningSummary {
  totalPlatformFee: number;
  totalGrossAmount: number;
  totalLawyerAmount: number;
  countConsultation: number;
  countPendampingan: number;
}

// Get all platform earnings (superadmin only)
export function usePlatformEarnings() {
  return useQuery({
    queryKey: ['platform-earnings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_earnings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with lawyer info
      const enriched = await Promise.all(
        (data || []).map(async (earning) => {
          if (earning.lawyer_id) {
            const { data: lawyer } = await supabase
              .from('lawyers')
              .select('id, name, image_url')
              .eq('id', earning.lawyer_id)
              .single();

            return { ...earning, lawyer } as PlatformEarning;
          }
          return earning as PlatformEarning;
        })
      );

      return enriched;
    }
  });
}

// Get platform earnings summary
export function usePlatformEarningsSummary() {
  return useQuery({
    queryKey: ['platform-earnings-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_earnings')
        .select('source_type, gross_amount, platform_fee, lawyer_amount');

      if (error) throw error;

      const summary: PlatformEarningSummary = {
        totalPlatformFee: 0,
        totalGrossAmount: 0,
        totalLawyerAmount: 0,
        countConsultation: 0,
        countPendampingan: 0
      };

      (data || []).forEach((e) => {
        summary.totalPlatformFee += e.platform_fee;
        summary.totalGrossAmount += e.gross_amount;
        summary.totalLawyerAmount += e.lawyer_amount;
        if (e.source_type === 'consultation') {
          summary.countConsultation++;
        } else {
          summary.countPendampingan++;
        }
      });

      return summary;
    }
  });
}

// Helper function to calculate platform fee
export function calculatePlatformFee(
  baseAmount: number,
  feeType: 'fixed' | 'percentage',
  feeValue: number
): { platformFee: number; lawyerAmount: number; totalAmount: number } {
  let platformFee: number;
  
  if (feeType === 'percentage') {
    platformFee = Math.round((baseAmount * feeValue) / 100);
  } else {
    platformFee = feeValue;
  }

  return {
    platformFee,
    lawyerAmount: baseAmount,
    totalAmount: baseAmount + platformFee
  };
}
