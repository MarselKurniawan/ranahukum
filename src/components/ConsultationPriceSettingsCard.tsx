import { useState, useEffect } from "react";
import { MessageCircle, Phone, UserX, Loader2, ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSetting, useUpdateAppSetting } from "@/hooks/useLegalAssistance";
import { toast } from "sonner";

export function ConsultationPriceSettingsCard() {
  const { data: chatOnlyPrice } = useAppSetting('chat_only_price');
  const { data: chatCallPrice } = useAppSetting('chat_call_price');
  const { data: anonymousFee } = useAppSetting('anonymous_fee');
  const { data: callUpgradePrice } = useAppSetting('call_upgrade_price');
  
  const updateSetting = useUpdateAppSetting();

  const [chatOnly, setChatOnly] = useState("");
  const [chatCall, setChatCall] = useState("");
  const [anonymous, setAnonymous] = useState("");
  const [upgrade, setUpgrade] = useState("");

  useEffect(() => {
    if (chatOnlyPrice) {
      setChatOnly(String((chatOnlyPrice.value as { amount?: number })?.amount || 50000));
    }
    if (chatCallPrice) {
      setChatCall(String((chatCallPrice.value as { amount?: number })?.amount || 100000));
    }
    if (anonymousFee) {
      setAnonymous(String((anonymousFee.value as { amount?: number })?.amount || 25000));
    }
    if (callUpgradePrice) {
      setUpgrade(String((callUpgradePrice.value as { amount?: number })?.amount || 50000));
    }
  }, [chatOnlyPrice, chatCallPrice, anonymousFee, callUpgradePrice]);

  const handleSave = async (key: string, value: string) => {
    const amount = parseInt(value);
    if (isNaN(amount) || amount < 0) {
      toast.error("Masukkan nilai yang valid");
      return;
    }

    try {
      await updateSetting.mutateAsync({
        key,
        value: { amount }
      });
      toast.success("Harga berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan harga");
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Harga Konsultasi Chat
        </CardTitle>
        <CardDescription>
          Atur harga paket konsultasi chat dan fitur tambahan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chat Only Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <Label>Paket Chat Saja</Label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="number"
                value={chatOnly}
                onChange={(e) => setChatOnly(e.target.value)}
                className="pl-10"
                placeholder="50000"
              />
            </div>
            <Button 
              onClick={() => handleSave('chat_only_price', chatOnly)}
              disabled={updateSetting.isPending}
              size="sm"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Harga untuk konsultasi chat saja (tanpa fitur telepon)
          </p>
        </div>

        {/* Chat + Call Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-success" />
            <Label>Paket Chat + Telepon</Label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="number"
                value={chatCall}
                onChange={(e) => setChatCall(e.target.value)}
                className="pl-10"
                placeholder="100000"
              />
            </div>
            <Button 
              onClick={() => handleSave('chat_call_price', chatCall)}
              disabled={updateSetting.isPending}
              size="sm"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Harga untuk konsultasi chat dengan fitur telepon langsung
          </p>
        </div>

        {/* Anonymous Fee */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-warning" />
            <Label>Biaya Anonim (Tambahan)</Label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="number"
                value={anonymous}
                onChange={(e) => setAnonymous(e.target.value)}
                className="pl-10"
                placeholder="25000"
              />
            </div>
            <Button 
              onClick={() => handleSave('anonymous_fee', anonymous)}
              disabled={updateSetting.isPending}
              size="sm"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Biaya tambahan untuk menyembunyikan identitas klien
          </p>
        </div>

        {/* Call Upgrade Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-accent" />
            <Label>Biaya Upgrade ke Call (Mid-Chat)</Label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Rp
              </span>
              <Input
                type="number"
                value={upgrade}
                onChange={(e) => setUpgrade(e.target.value)}
                className="pl-10"
                placeholder="50000"
              />
            </div>
            <Button 
              onClick={() => handleSave('call_upgrade_price', upgrade)}
              disabled={updateSetting.isPending}
              size="sm"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Biaya upgrade dari Chat ke Chat+Call di tengah konsultasi
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
