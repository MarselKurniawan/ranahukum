import { useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (durationMinutes: number, reason: string) => void;
  userName: string;
  userType: 'lawyer' | 'client';
  isPending?: boolean;
}

type DurationUnit = 'minutes' | 'hours' | 'days';

export function SuspendDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  userType,
  isPending = false
}: SuspendDialogProps) {
  const [duration, setDuration] = useState<string>("60");
  const [unit, setUnit] = useState<DurationUnit>('minutes');
  const [reason, setReason] = useState("");

  const calculateMinutes = (): number => {
    const value = parseInt(duration) || 0;
    switch (unit) {
      case 'hours':
        return value * 60;
      case 'days':
        return value * 60 * 24;
      default:
        return value;
    }
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    const totalMinutes = calculateMinutes();
    if (totalMinutes <= 0) return;
    onConfirm(totalMinutes, reason.trim());
  };

  const formatPreview = () => {
    const totalMinutes = calculateMinutes();
    if (totalMinutes <= 0) return "Durasi tidak valid";
    
    if (totalMinutes < 60) {
      return `${totalMinutes} menit`;
    } else if (totalMinutes < 1440) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
    } else {
      const days = Math.floor(totalMinutes / 1440);
      const remainingHours = Math.floor((totalMinutes % 1440) / 60);
      return remainingHours > 0 ? `${days} hari ${remainingHours} jam` : `${days} hari`;
    }
  };

  const presetDurations = [
    { label: '30 menit', value: 30, unit: 'minutes' as DurationUnit },
    { label: '1 jam', value: 60, unit: 'minutes' as DurationUnit },
    { label: '6 jam', value: 360, unit: 'minutes' as DurationUnit },
    { label: '1 hari', value: 1440, unit: 'minutes' as DurationUnit },
    { label: '7 hari', value: 10080, unit: 'minutes' as DurationUnit },
  ];

  const handlePreset = (preset: typeof presetDurations[0]) => {
    if (preset.value < 60) {
      setDuration(preset.value.toString());
      setUnit('minutes');
    } else if (preset.value < 1440) {
      setDuration((preset.value / 60).toString());
      setUnit('hours');
    } else {
      setDuration((preset.value / 1440).toString());
      setUnit('days');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Suspend Akun
          </DialogTitle>
          <DialogDescription>
            Akun {userType === 'lawyer' ? 'lawyer' : 'client'} <strong>{userName}</strong> akan ditangguhkan sementara.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <Label>Durasi Cepat</Label>
            <div className="flex flex-wrap gap-2">
              {presetDurations.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(preset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <div className="space-y-2">
            <Label>Durasi Kustom</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Masukkan durasi"
                className="flex-1"
              />
              <Select value={unit} onValueChange={(v) => setUnit(v as DurationUnit)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Menit</SelectItem>
                  <SelectItem value="hours">Jam</SelectItem>
                  <SelectItem value="days">Hari</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Total durasi: {formatPreview()}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Alasan Suspend <span className="text-destructive">*</span></Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan penangguhan akun..."
              rows={3}
            />
          </div>

          {userType === 'lawyer' && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Catatan:</strong> Lawyer yang di-suspend masih dapat mengakses fitur penarikan saldo.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !reason.trim() || calculateMinutes() <= 0}
          >
            {isPending ? 'Memproses...' : 'Suspend Akun'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
