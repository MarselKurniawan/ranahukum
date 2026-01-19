import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CancelRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  type: "consultation" | "pendampingan";
  userType: "client" | "lawyer";
  isLoading?: boolean;
}

const CANCEL_REASONS = {
  client: [
    { value: "changed_mind", label: "Saya berubah pikiran" },
    { value: "found_other", label: "Sudah menemukan solusi lain" },
    { value: "financial", label: "Kendala finansial" },
    { value: "schedule", label: "Jadwal tidak cocok" },
    { value: "no_response", label: "Tidak ada respons dari pengacara" },
    { value: "other", label: "Alasan lain" },
  ],
  lawyer: [
    { value: "busy", label: "Jadwal padat, tidak bisa melayani" },
    { value: "conflict_interest", label: "Konflik kepentingan" },
    { value: "outside_expertise", label: "Di luar bidang keahlian" },
    { value: "client_unresponsive", label: "Klien tidak merespons" },
    { value: "inappropriate_request", label: "Permintaan tidak pantas" },
    { value: "other", label: "Alasan lain" },
  ],
};

export function CancelRequestDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
  userType,
  isLoading = false,
}: CancelRequestDialogProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = CANCEL_REASONS[userType];
  const typeLabel = type === "consultation" ? "konsultasi" : "pendampingan";

  const handleConfirm = async () => {
    const finalReason = selectedReason === "other" 
      ? customReason 
      : reasons.find(r => r.value === selectedReason)?.label || selectedReason;
    
    if (!finalReason.trim()) return;
    
    await onConfirm(finalReason);
    setSelectedReason("");
    setCustomReason("");
  };

  const isValid = selectedReason && (selectedReason !== "other" || customReason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Batalkan {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin membatalkan {typeLabel} ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Alasan Pembatalan *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan pembatalan" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label>Jelaskan alasan Anda *</Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan alasan pembatalan..."
                rows={3}
              />
            </div>
          )}

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p className="text-xs text-warning">
              <strong>Perhatian:</strong> Pembatalan yang sering dapat mempengaruhi reputasi akun Anda.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Membatalkan...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-1" />
                Ya, Batalkan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
