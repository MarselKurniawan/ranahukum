import { useState } from "react";
import { Phone, PhoneCall, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateVoiceCall,
  useCompleteVoiceCall,
  useVoiceCallFeePerMinute,
} from "@/hooks/useVoiceCall";
import { useAuth } from "@/hooks/useAuth";

interface VoiceCallButtonProps {
  consultationId: string;
  receiverId: string;
  receiverPhone: string;
  isLawyer: boolean;
  disabled?: boolean;
}

export function VoiceCallButton({
  consultationId,
  receiverId,
  receiverPhone,
  isLawyer,
  disabled,
}: VoiceCallButtonProps) {
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [notes, setNotes] = useState("");

  const createCall = useCreateVoiceCall();
  const completeCall = useCompleteVoiceCall();
  const { data: feeSettings } = useVoiceCallFeePerMinute();

  const feePerMinute =
    (feeSettings?.value as { amount?: number })?.amount || 5000;
  const calculatedFee = parseInt(durationMinutes || "0") * feePerMinute;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStartCall = async () => {
    if (!receiverPhone) {
      return;
    }

    try {
      const result = await createCall.mutateAsync({
        consultationId,
        receiverId,
        phoneNumber: receiverPhone,
      });

      setActiveCallId(result.id);
      setShowConfirmDialog(false);

      // Open phone app
      window.location.href = `tel:${receiverPhone}`;

      // Show duration dialog after a delay (simulating call ended)
      if (isLawyer) {
        setTimeout(() => {
          setShowDurationDialog(true);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const handleCompleteCall = async () => {
    if (!activeCallId || !durationMinutes) return;

    try {
      await completeCall.mutateAsync({
        callId: activeCallId,
        durationMinutes: parseInt(durationMinutes),
        feePerMinute,
        notes: notes || undefined,
      });

      setShowDurationDialog(false);
      setActiveCallId(null);
      setDurationMinutes("");
      setNotes("");
    } catch (error) {
      console.error("Failed to complete call:", error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowConfirmDialog(true)}
        disabled={disabled || !receiverPhone}
        className="rounded-full"
        title={receiverPhone ? "Telepon" : "Nomor tidak tersedia"}
      >
        <Phone className="h-4 w-4" />
      </Button>

      {/* Confirm Call Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              Mulai Panggilan Telepon
            </DialogTitle>
            <DialogDescription>
              Panggilan akan dilakukan melalui aplikasi telepon HP Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Nomor tujuan:</p>
              <p className="font-mono font-medium">{receiverPhone}</p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg space-y-2">
              <p className="text-sm font-medium">Biaya Panggilan</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(feePerMinute)}/menit
              </p>
              <p className="text-xs text-muted-foreground">
                Biaya akan dihitung berdasarkan durasi panggilan
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleStartCall}
              disabled={createCall.isPending}
              className="flex-1"
            >
              {createCall.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Telepon Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duration Input Dialog (Lawyer Only) */}
      {isLawyer && (
        <Dialog open={showDurationDialog} onOpenChange={setShowDurationDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Panggilan Selesai</DialogTitle>
              <DialogDescription>
                Masukkan durasi panggilan untuk menghitung biaya
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (menit)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="Contoh: 15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tentang panggilan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {durationMinutes && parseInt(durationMinutes) > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Biaya:</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(calculatedFee)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {durationMinutes} menit × {formatCurrency(feePerMinute)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleCompleteCall}
                disabled={
                  !durationMinutes ||
                  parseInt(durationMinutes) <= 0 ||
                  completeCall.isPending
                }
                className="w-full"
              >
                {completeCall.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
