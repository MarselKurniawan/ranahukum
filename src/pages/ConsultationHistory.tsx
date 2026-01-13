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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/hooks/useConsultations";
import { useMessages } from "@/hooks/useMessages";
import { useConsultationReview, useCreateReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ConsultationHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: consultation, isLoading: consultationLoading } = useConsultation(id || '');
  const { data: messages = [], isLoading: messagesLoading } = useMessages(id || '');
  
  // Check if user has already reviewed this lawyer for this consultation
  const { data: existingReview, isLoading: reviewLoading } = useConsultationReview(
    id,
    user?.id,
    consultation?.lawyer_id
  );
  
  const createReview = useCreateReview();

  const isLoading = consultationLoading || messagesLoading || reviewLoading;

  const displayMessages = showAllMessages 
    ? messages 
    : messages.slice(-3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
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
    if (!consultation?.started_at || !consultation?.ended_at) return "-";
    const start = new Date(consultation.started_at);
    const end = new Date(consultation.ended_at);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return "< 1 menit";
    if (diffMins === 1) return "1 menit";
    return `${diffMins} menit`;
  };

  const handleSubmitReview = async () => {
    if (!consultation || rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await createReview.mutateAsync({
        lawyerId: consultation.lawyer_id,
        rating,
        comment: comment.trim() || undefined,
        consultationTopic: consultation.topic
      });
      toast.success("Terima kasih atas ulasan Anda!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!consultation) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Data konsultasi tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const lawyer = consultation.lawyers;
  const hasReviewed = !!existingReview;

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
                <AvatarImage src={lawyer?.image_url || '/placeholder.svg'} alt={lawyer?.name || 'Lawyer'} />
                <AvatarFallback>{lawyer?.name?.[0] || 'L'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{lawyer?.name || 'Pengacara'}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lawyer?.specialization?.slice(0, 2).map((spec) => (
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

        {/* Lawyer's Notes/Advice */}
        {consultation.lawyer_notes && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                Saran dari Pengacara
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {consultation.lawyer_notes}
              </div>
            </CardContent>
          </Card>
        )}

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
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada riwayat chat
              </p>
            ) : (
              <>
                {!showAllMessages && messages.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mb-3 text-xs"
                    onClick={() => setShowAllMessages(true)}
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Lihat {messages.length - 3} pesan sebelumnya
                  </Button>
                )}

                <div className="space-y-3">
                  {displayMessages.map((message) => {
                    const isClient = message.sender_id === consultation.client_id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          isClient ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2",
                            isClient
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-secondary text-secondary-foreground rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={cn(
                            "text-[10px] mt-1",
                            isClient ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showAllMessages && messages.length > 3 && (
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Rating - Only show for completed consultations */}
        {consultation.status === 'completed' && !hasReviewed ? (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-center">Beri Rating & Ulasan</h4>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Bagaimana pengalaman konsultasi Anda dengan {lawyer?.name}?
              </p>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                    disabled={isSubmitting}
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

              {/* Comment Textarea */}
              <Textarea
                placeholder="Tulis ulasan Anda tentang pengacara ini (opsional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 min-h-[80px]"
                disabled={isSubmitting}
              />

              <Button
                variant="gradient"
                className="w-full"
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
              </Button>
            </CardContent>
          </Card>
        ) : hasReviewed ? (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= (existingReview?.rating || 0)
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              {existingReview?.comment && (
                <p className="text-sm text-foreground/80 mb-2 italic">
                  "{existingReview.comment}"
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Terima kasih atas ulasan Anda!
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {lawyer?.user_id && (
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/lawyer/${consultation.lawyer_id}`)}>
              Lihat Profil
            </Button>
          )}
          <Button variant="gradient" className="flex-1" onClick={() => navigate(`/booking/${consultation.lawyer_id}`)}>
            Konsultasi Lagi
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
