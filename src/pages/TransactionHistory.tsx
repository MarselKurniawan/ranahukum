import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageCircle, Clock, Check, FileText, Banknote } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useConsultations } from "@/hooks/useConsultations";
import { useClientAssistanceRequests } from "@/hooks/useLegalAssistance";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: consultations, isLoading: consultLoading, refetch } = useConsultations();
  const { data: assistanceRequests = [], isLoading: assistanceLoading } = useClientAssistanceRequests();
  const { toast } = useToast();

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [reviewedLawyers, setReviewedLawyers] = useState<Set<string>>(new Set());

  // Fetch which lawyers user has already reviewed
  const fetchReviewedLawyers = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('reviews')
      .select('lawyer_id')
      .eq('user_id', user.id);
    
    if (data) {
      setReviewedLawyers(new Set(data.map(r => r.lawyer_id)));
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchReviewedLawyers();
  }, [user]);

  // Only show completed consultations in history - rejected/cancelled/expired should not appear
  const completedConsultations = consultations?.filter(c => 
    c.status === 'completed'
  ) || [];
  const activeConsultations = consultations?.filter(c => 
    ['pending', 'accepted', 'active'].includes(c.status)
  ) || [];

  // Assistance requests filtering - only completed in history
  const activeAssistance = assistanceRequests.filter(r => 
    ['pending', 'negotiating', 'agreed', 'in_progress'].includes(r.status)
  );
  const completedAssistance = assistanceRequests.filter(r => 
    r.status === 'completed'
  );

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
      rejected: { label: "Ditolak", variant: "destructive" },
      expired: { label: "Kedaluwarsa", variant: "outline" },
    };
    const config = variants[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAssistanceStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "success" | "accent" }> = {
      pending: { label: "Menunggu", variant: "warning" },
      negotiating: { label: "Negosiasi", variant: "accent" },
      agreed: { label: "Deal", variant: "success" },
      in_progress: { label: "Berlangsung", variant: "default" },
      completed: { label: "Selesai", variant: "secondary" },
      cancelled: { label: "Dibatalkan", variant: "destructive" },
      rejected: { label: "Ditolak", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageLabel = (stage: string | null) => {
    if (!stage) return null;
    const stages: Record<string, string> = {
      initial_consultation: "Konsultasi Awal",
      document_collection: "Pengumpulan Berkas",
      document_review: "Review Dokumen",
      legal_drafting: "Penyusunan Dokumen",
      negotiation: "Negosiasi",
      court_preparation: "Persiapan Pengadilan",
      court_session: "Sidang Pengadilan",
      awaiting_verdict: "Menunggu Putusan",
      completed: "Selesai",
    };
    return stages[stage] || stage;
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

      // Update local state
      setReviewedLawyers(prev => new Set(prev).add(selectedConsultation.lawyer_id));
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

  const hasReviewed = (lawyerId: string) => reviewedLawyers.has(lawyerId);

  if (!user) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Riwayat Transaksi</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[60vh] p-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Masuk untuk Melihat Riwayat</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Silakan login terlebih dahulu untuk melihat riwayat transaksi Anda
          </p>
          <Button variant="gradient" onClick={() => navigate('/auth')}>
            Masuk Sekarang
          </Button>
        </div>
      </MobileLayout>
    );
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{consultation.lawyers?.name}</h3>
                  {consultation.display_id && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {consultation.display_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{consultation.topic}</p>
              </div>
              {getStatusBadge(consultation.status)}
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
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
                {hasReviewed(consultation.lawyer_id) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Sudah Diulas
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenReview(consultation)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Beri Ulasan
                  </Button>
                )}
              </div>
            )}

            {!showReviewButton && consultation.status !== 'completed' && consultation.status !== 'cancelled' && (
              <div className="mt-3 pt-3 border-t border-border">
                {consultation.status === 'pending' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/waiting/${consultation.id}`)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Menunggu Konfirmasi
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/chat/${consultation.id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Lanjut Chat
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AssistanceCard = ({ request, showActions = false }: { request: any; showActions?: boolean }) => {
    const isTerminalStatus = ['rejected', 'cancelled'].includes(request.status);
    
    return (
    <Card 
      className={cn(
        "mb-3 transition-all",
        !isTerminalStatus && "cursor-pointer hover:shadow-elevated"
      )}
      onClick={() => {
        if (!isTerminalStatus) {
          navigate(`/legal-assistance/chat/${request.id}`);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.lawyer?.image_url} />
            <AvatarFallback>{request.lawyer?.name?.[0] || 'L'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{request.lawyer?.name}</h3>
                  {request.display_id && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {request.display_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{request.case_description}</p>
              </div>
              {getAssistanceStatusBadge(request.status)}
            </div>
            
            {request.current_stage && ['agreed', 'in_progress'].includes(request.status) && (
              <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3 text-primary" />
                  <span className="font-medium">Tahap: {getStageLabel(request.current_stage)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(request.created_at)}</span>
              </div>
              {request.agreed_price && (
                <div className="flex items-center gap-1">
                  <Banknote className="w-3 h-3" />
                  <span className="font-medium text-foreground">
                    Rp {request.agreed_price?.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            {showActions && request.status === 'completed' && (
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/legal-assistance/chat/${request.id}`);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Lihat Detail
                </Button>
                {hasReviewed(request.lawyer_id) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Sudah Diulas
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReview({
                        lawyer_id: request.lawyer_id,
                        lawyers: request.lawyer,
                        topic: request.case_description
                      });
                    }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Beri Ulasan
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

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
        <Tabs defaultValue="consultation">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="consultation">
              Konsultasi
            </TabsTrigger>
            <TabsTrigger value="assistance">
              Pendampingan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultation">
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
                {consultLoading ? (
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
                {consultLoading ? (
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
          </TabsContent>

          <TabsContent value="assistance">
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="active">
                  Aktif {activeAssistance.length > 0 && `(${activeAssistance.length})`}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Selesai {completedAssistance.length > 0 && `(${completedAssistance.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {assistanceLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="mb-3">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : activeAssistance.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Tidak ada pendampingan aktif</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/legal-assistance')}
                    >
                      Cari Pengacara
                    </Button>
                  </div>
                ) : (
                  activeAssistance.map((request) => (
                    <AssistanceCard key={request.id} request={request} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed">
                {assistanceLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="mb-3">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : completedAssistance.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Belum ada pendampingan selesai</p>
                  </div>
                ) : (
                  completedAssistance.map((request) => (
                    <AssistanceCard key={request.id} request={request} showActions />
                  ))
                )}
              </TabsContent>
            </Tabs>
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
