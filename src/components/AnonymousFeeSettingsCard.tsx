import { useState, useEffect } from "react";
import { UserX, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useLegalAssistance";

export function AnonymousFeeSettingsCard() {
  const { toast } = useToast();
  const { data: feeSettings } = useAppSetting("anonymous_fee");
  const updateSetting = useUpdateAppSetting();

  const [feeAmount, setFeeAmount] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (feeSettings) {
      const value = feeSettings.value as { amount?: number };
      setFeeAmount(String(value?.amount || 25000));
    }
  }, [feeSettings]);

  const handleSave = async () => {
    const feeValue = parseInt(feeAmount) || 0;
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
        key: "anonymous_fee",
        value: { amount: feeValue },
        description: "Biaya tambahan untuk konsultasi anonim (dalam Rupiah)",
      });
      toast({
        title: "Berhasil",
        description: "Biaya anonim berhasil diperbarui",
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
    setFeeAmount(raw);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Biaya Konsultasi Anonim
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              Biaya tambahan jika klien ingin menyembunyikan identitas
            </CardDescription>
          </div>
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
          <Label>Biaya Anonim</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              Rp
            </span>
            <Input
              value={formatCurrency(feeAmount)}
              onChange={handleFeeChange}
              disabled={!isEditing}
              className="pl-10"
              placeholder="25,000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Biaya ini ditambahkan ketika klien memilih konsultasi anonim.
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
                  setFeeAmount(String(value?.amount || 25000));
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
            Rp {formatCurrency(feeAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per sesi anonim</p>
        </div>
      </CardContent>
    </Card>
  );
}
