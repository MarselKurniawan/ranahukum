import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageCircle, ChevronRight, Calendar, Clock } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useConsultations } from "@/hooks/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: consultations, isLoading, refetch } = useConsultations();
  const { toast } = useToast();

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  const completedConsultations = consultations?.filter(c => c.status === 'completed') || [];
  const activeConsultations = consultations?.filter(c => c.status !== 'completed' && c.status !== 'cancelled') || [];

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: localeId });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Menunggu", variant: "secondary" },
      accepted: { label: "Diterima", variant: "default" },
      active: { label: "Berlangsung", variant: "default" },
      completed: { label: "Selesai", variant: "outline" },
      cancelled: { label: "Dibatalkan", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleOpenReview = (consultation: any) => {
    setSelectedConsultation(consultation);
    setSelectedRating(0);
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedConsultation || selectedRating === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        lawyer_id: selectedConsultation.lawyer_id,
        user_id: user.id,
        rating: selectedRating,
        comment: reviewComment || null,
        consultation_topic: selectedConsultation.topic
      });

      if (error) throw error;

      toast({
        title: "Ulasan Terkirim",
        description: "Terima kasih atas ulasan Anda"
      });

      setReviewDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const ConsultationCard = ({ consultation, showReviewButton = false }: { consultation: any; showReviewButton?: boolean }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={consultation.lawyers?.image_url || '/placeholder.svg'}
            alt={consultation.lawyers?.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{consultation.lawyers?.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{consultation.topic}</p>
              </div>
              {getStatusBadge(consultation.status)}
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(consultation.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">
                  Rp {consultation.price?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {showReviewButton && consultation.status === 'completed' && (
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/consultation/${consultation.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Lihat Detail
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenReview(consultation)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Beri Ulasan
                </Button>
              </div>
            )}

            {!showReviewButton && consultation.status !== 'completed' && consultation.status !== 'cancelled' && (
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/chat/${consultation.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {consultation.status === 'pending' ? 'Menunggu Konfirmasi' : 'Lanjut Chat'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Riwayat Transaksi</h1>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">
              Aktif {activeConsultations.length > 0 && `(${activeConsultations.length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai {completedConsultations.length > 0 && `(${completedConsultations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="mb-3">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : activeConsultations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Tidak ada konsultasi aktif</p>
                <Button 
                  variant="gradient" 
                  className="mt-4"
                  onClick={() => navigate('/search')}
                >
                  Cari Pengacara
                </Button>
              </div>
            ) : (
              activeConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="mb-3">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : completedConsultations.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Belum ada konsultasi selesai</p>
              </div>
            ) : (
              completedConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} showReviewButton />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-[380px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Beri Ulasan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Bagaimana pengalaman konsultasi Anda dengan
              </p>
              <p className="font-semibold">{selectedConsultation?.lawyers?.name}</p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= selectedRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Komentar (opsional)</label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Ceritakan pengalaman Anda..."
                rows={3}
              />
            </div>

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleSubmitReview}
              disabled={selectedRating === 0 || isSubmitting}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
