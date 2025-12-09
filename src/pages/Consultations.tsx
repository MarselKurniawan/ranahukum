import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, MessageCircle, Star } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockLawyers } from "@/data/mockLawyers";

interface Consultation {
  id: string;
  lawyerId: string;
  status: "active" | "completed" | "pending";
  date: Date;
  topic: string;
  rating?: number;
}

const mockConsultations: Consultation[] = [
  {
    id: "1",
    lawyerId: "1",
    status: "active",
    date: new Date(),
    topic: "Konsultasi perceraian",
  },
  {
    id: "2",
    lawyerId: "2",
    status: "completed",
    date: new Date(Date.now() - 86400000 * 2),
    topic: "Sengketa tanah warisan",
    rating: 5,
  },
  {
    id: "3",
    lawyerId: "4",
    status: "completed",
    date: new Date(Date.now() - 86400000 * 5),
    topic: "Kontrak kerja",
    rating: 4,
  },
];

export default function Consultations() {
  const navigate = useNavigate();

  const activeConsultations = mockConsultations.filter((c) => c.status === "active" || c.status === "pending");
  const completedConsultations = mockConsultations.filter((c) => c.status === "completed");

  const getLawyer = (lawyerId: string) => mockLawyers.find((l) => l.id === lawyerId);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const lawyer = getLawyer(consultation.lawyerId);
    if (!lawyer) return null;

    return (
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <img
              src={lawyer.photo}
              alt={lawyer.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm truncate">{lawyer.name}</h3>
                  <p className="text-xs text-muted-foreground">{consultation.topic}</p>
                </div>
                <Badge
                  variant={
                    consultation.status === "active"
                      ? "success"
                      : consultation.status === "pending"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-[10px] shrink-0"
                >
                  {consultation.status === "active"
                    ? "Aktif"
                    : consultation.status === "pending"
                    ? "Menunggu"
                    : "Selesai"}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDate(consultation.date)}
                </div>

                {consultation.status === "active" && (
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-8 text-xs"
                    onClick={() => navigate(`/chat/${lawyer.id}`)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Lanjut Chat
                  </Button>
                )}

                {consultation.status === "completed" && consultation.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: consultation.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                    ))}
                  </div>
                )}

                {consultation.status === "completed" && !consultation.rating && (
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Beri Rating
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Konsultasi Saya</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="flex-1">
              Aktif ({activeConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              Selesai ({completedConsultations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeConsultations.length > 0 ? (
              activeConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Belum ada konsultasi aktif
                </p>
                <Button
                  variant="gradient"
                  className="mt-4"
                  onClick={() => navigate("/")}
                >
                  Cari Pengacara
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedConsultations.length > 0 ? (
              completedConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Belum ada riwayat konsultasi
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
