import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useUpgradeToCall() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      consultationId,
      upgradePrice
    }: {
      consultationId: string;
      upgradePrice: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("consultations")
        .update({
          is_call_enabled: true,
          call_upgrade_at: new Date().toISOString(),
          call_upgrade_paid: true,
          call_price: upgradePrice,
          consultation_type: 'chat_call'
        })
        .eq("id", consultationId)
        .eq("client_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultation", variables.consultationId] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success("Upgrade berhasil! Fitur telepon sekarang aktif.");
    },
    onError: (error) => {
      console.error("Failed to upgrade:", error);
      toast.error("Gagal melakukan upgrade");
    },
  });
}
