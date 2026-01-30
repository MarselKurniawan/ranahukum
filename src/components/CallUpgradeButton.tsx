import { useState } from "react";
import { Phone, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useUpgradeToCall } from "@/hooks/useCallUpgrade";
import { useAppSetting } from "@/hooks/useLegalAssistance";

interface CallUpgradeButtonProps {
  consultationId: string;
  isCallEnabled: boolean;
  disabled?: boolean;
}

export function CallUpgradeButton({
  consultationId,
  isCallEnabled,
  disabled,
}: CallUpgradeButtonProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const upgradeToCall = useUpgradeToCall();
  
  // Get upgrade price from settings
  const { data: upgradePriceSetting } = useAppSetting('call_upgrade_price');
  const upgradePrice = (upgradePriceSetting?.value as { amount?: number })?.amount || 50000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpgrade = async () => {
    try {
      await upgradeToCall.mutateAsync({
        consultationId,
        upgradePrice,
      });
      setShowUpgradeDialog(false);
    } catch (error) {
      console.error("Failed to upgrade:", error);
    }
  };

  // Don't show if already has call enabled
  if (isCallEnabled) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowUpgradeDialog(true)}
        disabled={disabled}
        className="text-xs"
      >
        <Phone className="w-3.5 h-3.5 mr-1" />
        Upgrade ke Call
      </Button>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Upgrade ke Chat + Call
            </DialogTitle>
            <DialogDescription>
              Tambahkan fitur telepon langsung dengan pengacara untuk konsultasi ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Biaya Upgrade</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(upgradePrice)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setelah pembayaran, Anda dapat langsung menelepon pengacara melalui tombol telepon di chat
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                ✅ Telepon langsung dengan pengacara
              </p>
              <p className="flex items-center gap-2">
                ✅ Diskusi lebih cepat dan efektif
              </p>
              <p className="flex items-center gap-2">
                ✅ Biaya telepon dihitung per menit
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={upgradeToCall.isPending}
              className="flex-1"
            >
              {upgradeToCall.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bayar & Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
