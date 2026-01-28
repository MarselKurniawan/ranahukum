import { useState, useEffect } from "react";
import { Phone, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useLegalAssistance";

export function VoiceCallFeeSettingsCard() {
  const { toast } = useToast();
  const { data: feeSettings } = useAppSetting("voice_call_fee_per_minute");
  const updateSetting = useUpdateAppSetting();

  const [feePerMinute, setFeePerMinute] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (feeSettings) {
      const value = feeSettings.value as { amount?: number };
      setFeePerMinute(String(value?.amount || 5000));
    }
  }, [feeSettings]);

  const handleSave = async () => {
    const feeValue = parseInt(feePerMinute) || 0;
    if (feeValue < 0) {
      toast({
        title: "Error",
        description: "Biaya tidak boleh negatif",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSetting.mutateAsync({
        key: "voice_call_fee_per_minute",
        value: { amount: feeValue },
        description: "Biaya per menit untuk panggilan telepon (dalam Rupiah)",
      });
      toast({
        title: "Berhasil",
        description: "Biaya panggilan berhasil diperbarui",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, "")) || 0;
    return num.toLocaleString("id-ID");
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setFeePerMinute(raw);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Biaya Panggilan Telepon
          </CardTitle>
          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Ubah
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Biaya per Menit</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              Rp
            </span>
            <Input
              value={formatCurrency(feePerMinute)}
              onChange={handleFeeChange}
              disabled={!isEditing}
              className="pl-10"
              placeholder="5,000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Biaya tambahan per menit ketika klien ingin melakukan panggilan
            telepon dengan lawyer.
          </p>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditing(false);
                if (feeSettings) {
                  const value = feeSettings.value as { amount?: number };
                  setFeePerMinute(String(value?.amount || 5000));
                }
              }}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        )}

        <div className="p-3 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium">Biaya Saat Ini</p>
          <p className="text-2xl font-bold text-primary">
            Rp {formatCurrency(feePerMinute)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per menit</p>
        </div>
      </CardContent>
    </Card>
  );
}
