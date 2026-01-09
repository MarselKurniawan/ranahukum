import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, X, AlertCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConsultation } from "@/hooks/useConsultations";
import { Skeleton } from "@/components/ui/skeleton";

export default function WaitingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: consultation, isLoading } = useConsultation(id || '');

  // Redirect to chat when consultation becomes active
  useEffect(() => {
    if (consultation?.status === 'active') {
      navigate(`/chat/${consultation.id}`);
    }
  }, [consultation?.status, consultation?.id, navigate]);

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
        {(status === "pending" || status === "accepted") && (
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
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {status === "pending" ? "Menunggu Respons" : "Segera Dimulai"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Topik: {consultation.topic}
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

        {status === "rejected" && (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-destructive" />
            </div>

            <h1 className="text-xl font-bold mb-2">Konsultasi Ditolak</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Maaf, pengacara tidak dapat menerima konsultasi saat ini
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
              <Button variant="gradient" size="lg" className="w-full" onClick={() => navigate(`/consultation/${consultation.id}`)}>
                Lihat Riwayat
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