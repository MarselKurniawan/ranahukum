import { useState, useEffect } from "react";
import { Percent, DollarSign, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useLegalAssistance";

interface PlatformFee {
  type: 'fixed' | 'percentage';
  amount: number;
}

interface PlatformFeeSettingsCardProps {
  settingKey: 'platform_fee_chat' | 'platform_fee_pendampingan';
  title: string;
  description: string;
}

export function PlatformFeeSettingsCard({ settingKey, title, description }: PlatformFeeSettingsCardProps) {
  const { toast } = useToast();
  const { data: setting } = useAppSetting(settingKey);
  const updateSetting = useUpdateAppSetting();
  
  const [feeType, setFeeType] = useState<'fixed' | 'percentage'>('fixed');
  const [feeAmount, setFeeAmount] = useState<string>("0");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (setting) {
      const value = setting.value as unknown as PlatformFee;
      setFeeType(value?.type || 'fixed');
      setFeeAmount(String(value?.amount || 0));
    }
  }, [setting]);

  const handleSave = async () => {
    const amount = parseInt(feeAmount) || 0;
    
    if (amount < 0) {
      toast({
        title: "Error",
        description: "Biaya tidak boleh negatif",
        variant: "destructive"
      });
      return;
    }

    if (feeType === 'percentage' && amount > 100) {
      toast({
        title: "Error",
        description: "Persentase tidak boleh lebih dari 100%",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSetting.mutateAsync({
        key: settingKey,
        value: { type: feeType, amount } as unknown as { amount: number },
        description
      });
      toast({
        title: "Berhasil",
        description: "Pengaturan biaya platform berhasil diperbarui"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "destructive"
      });
    }
  };

  const formatDisplay = () => {
    const amount = parseInt(feeAmount) || 0;
    if (feeType === 'fixed') {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
    return `${amount}%`;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFeeAmount(raw);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {feeType === 'percentage' ? (
                <Percent className="w-5 h-5" />
              ) : (
                <DollarSign className="w-5 h-5" />
              )}
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {description}
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
        {isEditing ? (
          <>
            <div className="space-y-3">
              <Label>Tipe Biaya</Label>
              <RadioGroup 
                value={feeType} 
                onValueChange={(v) => setFeeType(v as 'fixed' | 'percentage')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id={`${settingKey}-fixed`} />
                  <Label htmlFor={`${settingKey}-fixed`} className="cursor-pointer">
                    Nominal Tetap (Rp)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id={`${settingKey}-percentage`} />
                  <Label htmlFor={`${settingKey}-percentage`} className="cursor-pointer">
                    Persentase (%)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Nilai Biaya</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {feeType === 'fixed' ? 'Rp' : '%'}
                </span>
                <Input
                  value={feeType === 'fixed' ? parseInt(feeAmount || '0').toLocaleString('id-ID') : feeAmount}
                  onChange={handleAmountChange}
                  className="pl-10"
                  placeholder={feeType === 'fixed' ? "5,000" : "5"}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
              onClick={() => {
                  setIsEditing(false);
                  if (setting) {
                    const value = setting.value as unknown as PlatformFee;
                    setFeeType(value?.type || 'fixed');
                    setFeeAmount(String(value?.amount || 0));
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
          </>
        ) : (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium">Biaya Saat Ini</p>
            <p className="text-2xl font-bold text-primary">
              {formatDisplay()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {feeType === 'fixed' ? 'per transaksi' : 'dari total biaya layanan'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
