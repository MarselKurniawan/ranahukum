import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useCreateConsultation } from "@/hooks/useConsultations";
import { useAuth } from "@/hooks/useAuth";
import { useLawyer } from "@/hooks/useLawyers";
import { Skeleton } from "@/components/ui/skeleton";

const paymentMethods = [
  { id: "gopay", name: "GoPay", icon: "💚" },
  { id: "ovo", name: "OVO", icon: "💜" },
  { id: "dana", name: "DANA", icon: "💙" },
  { id: "card", name: "Kartu Kredit/Debit", icon: "💳" },
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lawyer, isLoading } = useLawyer(id || '');
  const createConsultation = useCreateConsultation();
  
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-screen p-6">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <p className="text-lg font-semibold mb-2">Pengacara tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate("/search")}>
            Cari Pengacara
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const lawyerPrice = lawyer.price || 150000;

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Pilih metode pembayaran",
        description: "Silakan pilih metode pembayaran terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topik Diperlukan",
        description: "Silakan jelaskan topik konsultasi Anda",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const consultation = await createConsultation.mutateAsync({
        lawyerId: lawyer.id,
        topic: topic.trim(),
        price: lawyerPrice + 5000
      });

      toast({
        title: "Pembayaran Berhasil!",
        description: "Menunggu pengacara menerima konsultasi...",
      });
      
      navigate(`/waiting/${consultation.id}`);
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Pembayaran</h1>
        </div>
      </div>

      <div className="p-4 pb-32">
        {/* Lawyer Info */}
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center gap-3">
            <img
              src={lawyer.image_url || '/placeholder.svg'}
              alt={lawyer.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{lawyer.name}</h3>
              <p className="text-xs text-muted-foreground">
                {lawyer.specialization?.join(", ")}
              </p>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Konsultasi ~30 menit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic */}
        <div className="mb-4">
          <Label htmlFor="topic">Topik Konsultasi</Label>
          <Textarea
            id="topic"
            placeholder="Jelaskan topik atau pertanyaan yang ingin Anda konsultasikan..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Payment Methods */}
        <h2 className="font-semibold mb-3">Metode Pembayaran</h2>
        <div className="space-y-2 mb-6">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedPayment === method.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedPayment(method.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-sm">{method.name}</span>
                </div>
                {selectedPayment === method.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Ringkasan Pembayaran</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Konsultasi</span>
                <span>Rp {lawyerPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Platform</span>
                <span>Rp 5.000</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">
                  Rp {(lawyerPrice + 5000).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <Button
          variant="gradient"
          size="xl"
          className="w-full"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Bayar Sekarang
            </>
          )}
        </Button>
      </div>
    </MobileLayout>
  );
}
