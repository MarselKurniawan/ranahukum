import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet, Building2 } from "lucide-react";
import { useRequestWithdrawal, useLawyerBalance, useCanWithdraw } from "@/hooks/useLawyerWithdrawal";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalFormProps {
  onSuccess?: () => void;
}

export function WithdrawalForm({ onSuccess }: WithdrawalFormProps) {
  const { toast } = useToast();
  const { data: balance } = useLawyerBalance();
  const { data: canWithdrawData } = useCanWithdraw();
  const requestWithdrawal = useRequestWithdrawal();

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    if (amountNum > (balance?.available || 0)) {
      toast({
        title: "Error",
        description: "Jumlah melebihi saldo tersedia",
        variant: "destructive"
      });
      return;
    }

    if (amountNum < 50000) {
      toast({
        title: "Error",
        description: "Minimal penarikan Rp 50.000",
        variant: "destructive"
      });
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        amount: amountNum,
        bankName,
        accountNumber,
        accountHolderName,
        notes: notes || undefined
      });
      toast({
        title: "Berhasil",
        description: "Permintaan penarikan telah dikirim"
      });
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");
      setNotes("");
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengirim permintaan",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (!canWithdrawData?.canWithdraw) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Penarikan Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {canWithdrawData?.reason || 'Anda belum dapat melakukan penarikan saldo.'}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-4">
            Pastikan semua pendampingan yang telah selesai memiliki bukti pertemuan dan tanda tangan basah sebelum dapat menarik saldo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Penarikan Saldo
        </CardTitle>
        <CardDescription>
          Saldo tersedia: <span className="font-semibold text-success">{formatCurrency(balance?.available || 0)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Penarikan</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Minimal Rp 50.000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={50000}
              max={balance?.available || 0}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimal Rp 50.000 • Maksimal {formatCurrency(balance?.available || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input
              id="bankName"
              placeholder="Contoh: BCA, Mandiri, BNI"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Nomor Rekening</Label>
            <Input
              id="accountNumber"
              placeholder="Masukkan nomor rekening"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Nama Pemilik Rekening</Label>
            <Input
              id="accountHolderName"
              placeholder="Nama sesuai buku tabungan"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan jika diperlukan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={requestWithdrawal.isPending || !amount || !bankName || !accountNumber || !accountHolderName}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {requestWithdrawal.isPending ? 'Mengirim...' : 'Ajukan Penarikan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
