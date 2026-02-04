import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MessageCircle, Lightbulb, 
  Calendar, Clock, ChevronDown, ChevronUp, Download, User
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/hooks/useConsultations";
import { useMessages } from "@/hooks/useMessages";
import { useConsultationReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function LawyerConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { data: consultation, isLoading: loadingConsultation } = useConsultation(id || '');
  const { data: messages = [], isLoading: loadingMessages } = useMessages(id || '');
  const [showAllMessages, setShowAllMessages] = useState(false);

  // Get client and lawyer info
  const client = consultation ? (consultation as { profiles?: { full_name: string | null } }).profiles : null;
  const isAnonymousConsultation = consultation ? (consultation as { is_anonymous?: boolean }).is_anonymous === true : false;
  const clientName = client?.full_name;
  // When anonymous, show 'Pengguna Anonim'; otherwise show actual client name
  const displayName = isAnonymousConsultation ? 'Pengguna Anonim' : (clientName && clientName.trim() ? clientName : 'Memuat...');
  const displayInitial = isAnonymousConsultation ? 'A' : (clientName && clientName.trim() ? clientName[0].toUpperCase() : '?');
  const lawyerId = consultation?.lawyer_id;
  const clientId = consultation?.client_id;

  const { data: review, isLoading: loadingReview } = useConsultationReview(
    id,
    clientId,
    lawyerId
  );

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk lawyer",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = () => {
    if (!consultation?.started_at || !consultation?.ended_at) return "N/A";
    const start = new Date(consultation.started_at).getTime();
    const end = new Date(consultation.ended_at).getTime();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} menit`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} jam ${mins} menit`;
  };

  if (loadingConsultation || loadingMessages || authLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Konsultasi tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  const displayMessages = showAllMessages 
    ? messages 
    : messages.slice(-5);

  const lawyerUserId = (consultation.lawyers as { user_id?: string })?.user_id;

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
            <p className="text-xs text-muted-foreground">Riwayat chat, saran & review</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Client Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="text-lg">
                  {displayInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{displayName}</h3>
                <Badge
                  variant={consultation.status === 'completed' ? 'success' : 'secondary'} 
                  className="mt-1 text-xs"
                >
                  {consultation.status === 'completed' ? 'Selesai' : consultation.status}
                </Badge>
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
                  <p className="text-sm font-medium">{consultation.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="text-sm font-medium">{formatDate(consultation.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durasi</p>
                  <p className="text-sm font-medium">{calculateDuration()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lawyer's Advice */}
        {consultation.lawyer_notes && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Saran dari Anda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {consultation.lawyer_notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Review */}
        <Card className={review ? "border-success/30 bg-success/5" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className={cn("w-5 h-5", review ? "text-warning fill-warning" : "text-muted-foreground")} />
              Review dari Klien
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {loadingReview ? (
              <Skeleton className="h-16 w-full" />
            ) : review ? (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= review.rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                  <span className="text-sm ml-2 font-medium">{review.rating}/5</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(review.created_at)}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Klien belum memberikan review</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat History */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Riwayat Chat</CardTitle>
              <Badge variant="secondary" className="text-xs">{messages.length} pesan</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!showAllMessages && messages.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mb-3 text-xs"
                onClick={() => setShowAllMessages(true)}
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                Lihat {messages.length - 5} pesan sebelumnya
              </Button>
            )}

            <div className="space-y-3">
              {displayMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada pesan
                </p>
              ) : (
                displayMessages.map((message) => {
                  const isLawyer = message.sender_id === lawyerUserId;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        isLawyer ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-2",
                          isLawyer
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-secondary-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          isLawyer ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {showAllMessages && messages.length > 5 && (
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
      </div>
    </MobileLayout>
  );
}
