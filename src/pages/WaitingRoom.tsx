import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, X, AlertCircle, Timer } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConsultation, useUpdateConsultation } from "@/hooks/useConsultations";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function WaitingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: consultation, isLoading } = useConsultation(id || '');
  const updateConsultation = useUpdateConsultation();
  const [waitingTime, setWaitingTime] = useState("00:00");
  const [isExpired, setIsExpired] = useState(false);

  // Redirect to chat when consultation becomes active
  useEffect(() => {
    if (consultation?.status === 'active') {
      navigate(`/chat/${consultation.id}`);
    }
  }, [consultation?.status, consultation?.id, navigate]);

  // Calculate waiting time and auto-cancel after 1 hour
  useEffect(() => {
    if (!consultation?.created_at || consultation?.status !== 'pending') return;
    
    const createdTime = new Date(consultation.created_at).getTime();
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    
    const updateTimer = async () => {
      const now = Date.now();
      const diff = now - createdTime;
      
      // Check if more than 1 hour has passed
      if (diff >= ONE_HOUR) {
        setIsExpired(true);
        // Auto-cancel the consultation
        try {
          await updateConsultation.mutateAsync({ id: consultation.id, status: 'expired' });
          toast({
            title: "Konsultasi Kedaluwarsa",
            description: "Pengacara tidak merespons dalam 1 jam. Silakan cari pengacara lain.",
            variant: "destructive"
          });
        } catch (error) {
          console.error('Error expiring consultation:', error);
        }
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setWaitingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [consultation?.created_at, consultation?.status, consultation?.id, updateConsultation, toast]);

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-32 h-32 mb-6">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </MobileLayout>
    );
  }

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Konsultasi tidak ditemukan</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const lawyer = consultation.lawyers;
  const status = consultation.status;

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {(status === "pending" || status === "accepted") && !isExpired && (
          <div className="text-center animate-fade-in">
            {/* Animated waiting indicator */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <img
                src={lawyer?.image_url || '/placeholder.svg'}
                alt={lawyer?.name || 'Lawyer'}
                className="absolute inset-2 rounded-full object-cover"
              />
            </div>

            <h1 className="text-xl font-bold mb-2">
              {status === "pending" ? "Menunggu Konfirmasi" : "Diterima! Menunggu Mulai..."}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {status === "pending" 
                ? `${lawyer?.name || 'Pengacara'} sedang mengkonfirmasi permintaan Anda`
                : `${lawyer?.name || 'Pengacara'} akan segera memulai konsultasi`
              }
            </p>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">
                    Waktu Menunggu: {waitingTime}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Topik: {consultation.topic}
                </p>
                <p className="text-xs text-warning text-center mt-2">
                  Konsultasi akan otomatis dibatalkan jika tidak ada respons dalam 1 jam
                </p>
              </CardContent>
            </Card>

            {status === "pending" && (
              <Button variant="outline" onClick={() => navigate("/")}>
                Batalkan
              </Button>
            )}

            {status === "accepted" && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Permintaan diterima!</span>
              </div>
            )}
          </div>
        )}

        {(status === "rejected" || status === "expired" || isExpired) && (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-destructive" />
            </div>

            <h1 className="text-xl font-bold mb-2">
              {status === "expired" || isExpired ? "Konsultasi Kedaluwarsa" : "Konsultasi Ditolak"}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {status === "expired" || isExpired 
                ? "Pengacara tidak merespons dalam waktu 1 jam"
                : "Maaf, pengacara tidak dapat menerima konsultasi saat ini"
              }
            </p>

            <div className="space-y-2">
              <Button variant="gradient" size="lg" className="w-full" onClick={() => navigate("/search")}>
                Cari Pengacara Lain
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h1 className="text-xl font-bold mb-2">Konsultasi Selesai</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Terima kasih telah menggunakan layanan kami
            </p>

            <div className="space-y-2">
              <Button variant="gradient" size="lg" className="w-full" onClick={() => navigate(`/chat/${consultation.id}`)}>
                Lihat Riwayat Chat
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}