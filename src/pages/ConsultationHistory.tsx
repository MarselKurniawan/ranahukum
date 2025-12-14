import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MessageCircle, Lightbulb, 
  Calendar, Clock, ChevronDown, ChevronUp, Download 
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockLawyers } from "@/data/mockLawyers";

interface Message {
  id: string;
  content: string;
  sender: "lawyer" | "client";
  timestamp: Date;
  type: "text" | "voice" | "file";
}

const mockConsultationData = {
  id: "2",
  lawyerId: "2",
  topic: "Sengketa tanah warisan keluarga",
  date: new Date(Date.now() - 86400000 * 2),
  duration: "45 menit",
  status: "completed" as const,
  rating: 5,
  advice: `Berdasarkan konsultasi kita, berikut adalah saran saya:

1. **Kumpulkan Dokumen**
   - Sertifikat tanah asli atau fotokopi yang dilegalisir
   - Bukti pembayaran PBB 5 tahun terakhir
   - Surat keterangan waris dari kelurahan
   - Akta kelahiran semua ahli waris

2. **Langkah Hukum**
   - Ajukan permohonan mediasi ke kelurahan/kecamatan terlebih dahulu
   - Jika mediasi gagal, siapkan gugatan ke Pengadilan Negeri
   - Pertimbangkan untuk membuat kesepakatan pembagian secara tertulis

3. **Rekomendasi**
   - Saya sarankan untuk segera membuat Akta Pembagian Waris di notaris
   - Jika ada pihak yang tidak setuju, bisa ditempuh jalur litigasi

Jangan ragu untuk menghubungi saya kembali jika membutuhkan pendampingan lebih lanjut.`,
  messages: [
    {
      id: "1",
      content: "Selamat siang Bu, saya ingin konsultasi tentang sengketa tanah warisan.",
      sender: "client" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3600000),
      type: "text" as const,
    },
    {
      id: "2",
      content: "Selamat siang. Silakan ceritakan kronologi permasalahannya.",
      sender: "lawyer" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3500000),
      type: "text" as const,
    },
    {
      id: "3",
      content: "Ayah saya meninggal 2 tahun lalu dan meninggalkan sebidang tanah. Ada 4 ahli waris tapi saudara tertua menguasai tanah tersebut dan tidak mau membagi.",
      sender: "client" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3400000),
      type: "text" as const,
    },
    {
      id: "4",
      content: "Apakah sudah ada surat keterangan waris? Dan apakah sertifikat tanah masih atas nama almarhum ayah?",
      sender: "lawyer" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3300000),
      type: "text" as const,
    },
    {
      id: "5",
      content: "Belum ada surat waris resmi, dan sertifikat masih atas nama ayah.",
      sender: "client" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3200000),
      type: "text" as const,
    },
    {
      id: "6",
      content: "Baik, langkah pertama yang perlu dilakukan adalah membuat surat keterangan waris di kelurahan. Setelah itu kita bisa memproses pembagian waris secara legal.",
      sender: "lawyer" as const,
      timestamp: new Date(Date.now() - 86400000 * 2 - 3100000),
      type: "text" as const,
    },
  ],
};

export default function ConsultationHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [hasRated, setHasRated] = useState(mockConsultationData.rating > 0);
  const [rating, setRating] = useState(mockConsultationData.rating);

  const lawyer = mockLawyers.find((l) => l.id === mockConsultationData.lawyerId);
  const displayMessages = showAllMessages 
    ? mockConsultationData.messages 
    : mockConsultationData.messages.slice(-3);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Data konsultasi tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-sm">Detail Konsultasi</h2>
            <p className="text-xs text-muted-foreground">Riwayat chat & saran pengacara</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Lawyer Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-14 h-14">
                <AvatarImage src={lawyer.photo} alt={lawyer.name} />
                <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{lawyer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span>{lawyer.rating}</span>
                  <span>•</span>
                  <span>{lawyer.totalConsultations} konsultasi</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lawyer.specializations.slice(0, 2).map((spec) => (
                    <Badge key={spec} variant="tag" className="text-[10px]">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Info */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-3">Informasi Konsultasi</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Topik</p>
                  <p className="text-sm font-medium">{mockConsultationData.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="text-sm font-medium">{formatDate(mockConsultationData.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durasi</p>
                  <p className="text-sm font-medium">{mockConsultationData.duration}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lawyer's Advice */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Saran dari Pengacara
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {mockConsultationData.advice}
            </div>
          </CardContent>
        </Card>

        {/* Chat History */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Riwayat Chat</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <Download className="w-3 h-3" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!showAllMessages && mockConsultationData.messages.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mb-3 text-xs"
                onClick={() => setShowAllMessages(true)}
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                Lihat {mockConsultationData.messages.length - 3} pesan sebelumnya
              </Button>
            )}

            <div className="space-y-3">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.sender === "client" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2",
                      message.sender === "client"
                        ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                        : "bg-primary text-primary-foreground rounded-br-sm"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      message.sender === "client" ? "text-muted-foreground" : "text-primary-foreground/60"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {showAllMessages && mockConsultationData.messages.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-xs"
                onClick={() => setShowAllMessages(false)}
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Sembunyikan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Rating */}
        {!hasRated ? (
          <Card>
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold mb-2">Beri Rating Konsultasi</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Bagaimana pengalaman konsultasi Anda?
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        star <= rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => setHasRated(true)}
                disabled={rating === 0}
              >
                Kirim Rating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Terima kasih atas rating Anda!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/lawyer/${lawyer.id}`)}>
            Lihat Profil
          </Button>
          <Button variant="gradient" className="flex-1" onClick={() => navigate(`/booking/${lawyer.id}`)}>
            Konsultasi Lagi
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
