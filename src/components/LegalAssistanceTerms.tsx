import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, AlertTriangle, CheckCircle, FileText, 
  Scale, HandshakeIcon, Clock, Banknote, UserX
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LegalAssistanceTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  userType: 'client' | 'lawyer';
}

export function LegalAssistanceTerms({ 
  open, 
  onOpenChange, 
  onAccept,
  userType
}: LegalAssistanceTermsProps) {
  const [agreedRules, setAgreedRules] = useState(false);
  const [agreedPayment, setAgreedPayment] = useState(false);
  const [agreedPenalty, setAgreedPenalty] = useState(false);

  const handleAccept = () => {
    if (agreedRules && agreedPayment && agreedPenalty) {
      onAccept();
      onOpenChange(false);
      // Reset state
      setAgreedRules(false);
      setAgreedPayment(false);
      setAgreedPenalty(false);
    }
  };

  const clientRules = [
    {
      icon: <FileText className="w-4 h-4 text-primary" />,
      title: "Kelengkapan Data",
      desc: "Wajib mengisi data identitas dengan benar sesuai KTP untuk pembuatan Surat Kuasa."
    },
    {
      icon: <HandshakeIcon className="w-4 h-4 text-primary" />,
      title: "Pertemuan Tatap Muka",
      desc: "Wajib hadir pada jadwal pertemuan yang telah ditentukan dengan membawa KTP asli."
    },
    {
      icon: <Banknote className="w-4 h-4 text-primary" />,
      title: "Pembayaran via Aplikasi",
      desc: "Semua pembayaran WAJIB melalui aplikasi. Transaksi di luar aplikasi tidak dijamin."
    },
    {
      icon: <Clock className="w-4 h-4 text-primary" />,
      title: "Komunikasi",
      desc: "Segala komunikasi terkait kasus wajib dilakukan melalui aplikasi untuk rekam jejak."
    }
  ];

  const lawyerRules = [
    {
      icon: <FileText className="w-4 h-4 text-primary" />,
      title: "Surat Kuasa",
      desc: "Wajib membuat dan mengirim Surat Kuasa setelah data identitas client terverifikasi."
    },
    {
      icon: <HandshakeIcon className="w-4 h-4 text-primary" />,
      title: "Pertemuan & Dokumentasi",
      desc: "Wajib upload bukti pertemuan dan tanda tangan basah client sebelum dapat menarik dana."
    },
    {
      icon: <Banknote className="w-4 h-4 text-primary" />,
      title: "Transparansi Biaya",
      desc: "Semua negosiasi harga wajib melalui aplikasi dengan penawaran yang jelas."
    },
    {
      icon: <Scale className="w-4 h-4 text-primary" />,
      title: "Etika Profesi",
      desc: "Menjaga kerahasiaan client dan menjalankan tugas sesuai kode etik advokat."
    }
  ];

  const rules = userType === 'client' ? clientRules : lawyerRules;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95%] max-h-[90vh] rounded-2xl overflow-hidden p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Aturan Pendampingan Hukum</DialogTitle>
              <DialogDescription>
                Baca dan setujui aturan berikut untuk melanjutkan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] px-4">
          <div className="space-y-3 py-4">
            {/* Rules */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Aturan sebagai {userType === 'client' ? 'Client' : 'Lawyer'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {rule.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rule.title}</p>
                      <p className="text-xs text-muted-foreground">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Steps for Client */}
            {userType === 'client' && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    Langkah Pendampingan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Isi data identitas lengkap (Nama, NIK, Alamat, dll)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Negosiasi harga dengan lawyer</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Bayar biaya pendampingan via aplikasi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <span>Terima Surat Kuasa dari lawyer</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">5</span>
                      <span>Hadiri pertemuan tatap muka & tanda tangan</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">6</span>
                      <span>Lawyer mendampingi kasus Anda</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Warning */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex gap-3">
                <UserX className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive mb-1">
                    Peringatan Pelanggaran
                  </p>
                  <ul className="text-xs text-destructive space-y-1">
                    <li>• Transaksi di luar aplikasi = <strong>BANNED PERMANEN</strong></li>
                    <li>• Memberikan data palsu = <strong>Akun dinonaktifkan</strong></li>
                    <li>• Tidak hadir pertemuan tanpa konfirmasi = <strong>Denda</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Agreement Checkboxes */}
        <div className="px-4 py-3 border-t bg-muted/30 space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="rules" 
              checked={agreedRules}
              onCheckedChange={(checked) => setAgreedRules(!!checked)}
            />
            <label htmlFor="rules" className="text-xs cursor-pointer">
              Saya telah membaca dan menyetujui aturan pendampingan hukum
            </label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="payment" 
              checked={agreedPayment}
              onCheckedChange={(checked) => setAgreedPayment(!!checked)}
            />
            <label htmlFor="payment" className="text-xs cursor-pointer">
              Saya setuju semua transaksi dilakukan melalui aplikasi
            </label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="penalty" 
              checked={agreedPenalty}
              onCheckedChange={(checked) => setAgreedPenalty(!!checked)}
            />
            <label htmlFor="penalty" className="text-xs cursor-pointer">
              Saya memahami konsekuensi pelanggaran aturan
            </label>
          </div>
        </div>

        <DialogFooter className="px-4 pb-4 pt-0">
          <Button 
            variant="gradient" 
            className="w-full"
            onClick={handleAccept}
            disabled={!agreedRules || !agreedPayment || !agreedPenalty}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Setuju & Lanjutkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
