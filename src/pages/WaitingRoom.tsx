import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, X } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockLawyers } from "@/data/mockLawyers";

export default function WaitingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lawyer = mockLawyers.find((l) => l.id === id);
  const [status, setStatus] = useState<"waiting" | "accepted" | "rejected">("waiting");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Simulate lawyer accepting after a few seconds
    const acceptTimer = setTimeout(() => {
      setStatus("accepted");
    }, 5000);

    return () => clearTimeout(acceptTimer);
  }, []);

  useEffect(() => {
    if (status === "waiting" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Pengacara tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {status === "waiting" && (
          <div className="text-center animate-fade-in">
            {/* Animated waiting indicator */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <img
                src={lawyer.photo}
                alt={lawyer.name}
                className="absolute inset-2 rounded-full object-cover"
              />
            </div>

            <h1 className="text-xl font-bold mb-2">Menunggu Konfirmasi</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {lawyer.name} sedang mengkonfirmasi permintaan Anda
            </p>

            <Card className="mb-6">
              <CardContent className="p-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">{countdown} detik</span>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => navigate("/")}>
              Batalkan
            </Button>
          </div>
        )}

        {status === "accepted" && (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h1 className="text-xl font-bold mb-2">Konsultasi Diterima!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {lawyer.name} siap berkonsultasi dengan Anda
            </p>

            <Button 
              variant="gradient" 
              size="lg" 
              className="w-full"
              onClick={() => navigate(`/chat/${lawyer.id}`)}
            >
              Mulai Chat
            </Button>
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
              <Button variant="gradient" size="lg" className="w-full" onClick={() => navigate("/")}>
                Cari Pengacara Lain
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Minta Pengembalian Dana
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
