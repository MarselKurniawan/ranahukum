import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, MessageCircle, XCircle, AlertCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsultations, Consultation } from "@/hooks/useConsultations";
import { useAuth } from "@/hooks/useAuth";

export default function Consultations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: consultations = [], isLoading } = useConsultations();

  const activeConsultations = consultations.filter((c) => 
    c.status === "active" || c.status === "pending" || c.status === "accepted"
  );
  const completedConsultations = consultations.filter((c) => 
    c.status === "completed" || c.status === "rejected" || c.status === "cancelled"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="text-[10px]">Aktif</Badge>;
      case 'pending':
        return <Badge variant="warning" className="text-[10px]">Menunggu</Badge>;
      case 'accepted':
        return <Badge variant="accent" className="text-[10px]">Diterima</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-[10px]">Selesai</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px]">Ditolak</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-[10px]">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const lawyer = consultation.lawyers;

    return (
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <img
              src={lawyer?.image_url || '/placeholder.svg'}
              alt={lawyer?.name || 'Lawyer'}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm truncate">{lawyer?.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{consultation.topic}</p>
                </div>
                {getStatusBadge(consultation.status)}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDate(consultation.created_at)}
                </div>

                {consultation.status === "active" && (
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-8 text-xs"
                    onClick={() => navigate(`/chat/${consultation.id}`)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Lanjut Chat
                  </Button>
                )}

                {consultation.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-8 text-xs"
                    onClick={() => navigate(`/chat/${consultation.id}`)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Mulai Chat
                  </Button>
                )}

                {consultation.status === "pending" && (
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <AlertCircle className="w-3 h-3" />
                    Menunggu konfirmasi
                  </div>
                )}

                {consultation.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => navigate(`/consultation/${consultation.id}`)}
                  >
                    Lihat Detail
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <MobileLayout>
        <div className="p-4 text-center py-12">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm mb-4">
            Silakan login untuk melihat konsultasi Anda
          </p>
          <Button variant="gradient" onClick={() => navigate('/auth')}>
            Login
          </Button>
        </div>
      </MobileLayout>
    );
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MobileLayout>
    );
  }

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
