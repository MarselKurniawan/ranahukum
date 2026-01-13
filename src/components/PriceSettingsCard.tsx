import { useState, useEffect } from "react";
import { Banknote, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useLegalAssistance";

export function PriceSettingsCard() {
  const { toast } = useToast();
  const { data: chatPriceSetting } = useAppSetting('chat_consultation_price');
  const updateSetting = useUpdateAppSetting();
  
  const [chatPrice, setChatPrice] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (chatPriceSetting) {
      const value = chatPriceSetting.value as { amount?: number };
      setChatPrice(String(value?.amount || 50000));
    }
  }, [chatPriceSetting]);

  const handleSave = async () => {
    const priceValue = parseInt(chatPrice) || 0;
    if (priceValue < 0) {
      toast({
        title: "Error",
        description: "Harga tidak boleh negatif",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSetting.mutateAsync({
        key: 'chat_consultation_price',
        value: { amount: priceValue },
        description: 'Harga konsultasi chat yang berlaku untuk semua lawyer'
      });
      toast({
        title: "Berhasil",
        description: "Harga konsultasi berhasil diperbarui"
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

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, '')) || 0;
    return num.toLocaleString('id-ID');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setChatPrice(raw);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Harga Konsultasi Chat
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
          <Label>Harga per Sesi (Berlaku untuk semua lawyer)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              Rp
            </span>
            <Input
              value={formatCurrency(chatPrice)}
              onChange={handlePriceChange}
              disabled={!isEditing}
              className="pl-10"
              placeholder="50,000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Harga ini akan ditampilkan sebagai biaya konsultasi chat untuk semua lawyer di platform.
          </p>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setIsEditing(false);
                if (chatPriceSetting) {
                  const value = chatPriceSetting.value as { amount?: number };
                  setChatPrice(String(value?.amount || 50000));
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
          <p className="text-sm font-medium">Harga Saat Ini</p>
          <p className="text-2xl font-bold text-primary">
            Rp {formatCurrency(chatPrice)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per sesi konsultasi</p>
        </div>
      </CardContent>
    </Card>
  );
}
