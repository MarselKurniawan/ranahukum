import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Scale, Clock, DollarSign, FileText, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  useAssistanceRequest, 
  useAssistanceMessages,
  useAssistanceStatusHistory 
} from "@/hooks/useLegalAssistance";

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "success" | "accent"; label: string }> = {
    pending: { variant: "warning", label: "Menunggu" },
    negotiating: { variant: "accent", label: "Negosiasi" },
    agreed: { variant: "success", label: "Deal" },
    in_progress: { variant: "default", label: "Berlangsung" },
    completed: { variant: "secondary", label: "Selesai" },
    cancelled: { variant: "destructive", label: "Dibatalkan" },
    rejected: { variant: "destructive", label: "Ditolak" }
  };
  const config = variants[status] || { variant: "secondary" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getStageLabel = (stage: string | null) => {
  if (!stage) return "-";
  const stages: Record<string, string> = {
    consultation: "Konsultasi Awal",
    document_collection: "Pengumpulan Berkas",
    document_review: "Review Dokumen",
    negotiation: "Negosiasi",
    court_preparation: "Persiapan Sidang",
    court_session: "Sidang",
    closing: "Penutupan",
    completed: "Selesai"
  };
  return stages[stage] || stage;
};

export default function SuperAdminAssistanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: request, isLoading: loadingRequest } = useAssistanceRequest(id || '');
  const { data: messages = [] } = useAssistanceMessages(id || '');
  const { data: statusHistory = [] } = useAssistanceStatusHistory(id || '');

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loadingRequest) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Pendampingan tidak ditemukan</p>
          <Button className="mt-4" onClick={() => navigate('/admin/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Detail Pendampingan</h1>
              <p className="text-xs text-primary-foreground/70">Super Admin View</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Client */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Client</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.client?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.client?.full_name || 'Client'}</p>
                    <p className="text-sm text-muted-foreground">{request.client?.email}</p>
                  </div>
                </div>
              </div>

              {/* Lawyer */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Lawyer</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.lawyer?.image_url || undefined} />
                    <AvatarFallback>
                      <Scale className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.lawyer?.name || 'Lawyer'}</p>
                    <p className="text-sm text-muted-foreground">{request.lawyer?.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tahap</p>
                <p className="font-medium text-sm mt-1">{getStageLabel(request.current_stage)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Harga Deal</p>
                <p className="font-medium text-sm mt-1 text-primary">
                  {request.agreed_price ? formatCurrency(request.agreed_price) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pembayaran</p>
                <Badge variant={request.payment_status === 'paid' ? 'success' : 'warning'} className="mt-1">
                  {request.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Deskripsi Kasus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.case_description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Riwayat Status ({statusHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {statusHistory.length > 0 ? (
                  <div className="space-y-3">
                    {statusHistory.map((history, index) => (
                      <div key={history.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(history.status)}
                            {history.stage && (
                              <Badge variant="outline" className="text-xs">
                                {getStageLabel(history.stage)}
                              </Badge>
                            )}
                          </div>
                          {history.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{history.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(history.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Belum ada riwayat status
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Pesan ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isLawyer = msg.sender_id === request.lawyer?.user_id;
                      return (
                        <div key={msg.id} className={`flex ${isLawyer ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            isLawyer 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-xs font-medium mb-1">
                              {isLawyer ? request.lawyer?.name : request.client?.full_name}
                            </p>
                            {msg.is_price_offer ? (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">
                                  Penawaran: {formatCurrency(msg.offered_price || 0)}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${
                              isLawyer ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Belum ada pesan
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Dibuat: </span>
                <span className="font-medium">{formatDate(request.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Diperbarui: </span>
                <span className="font-medium">{formatDate(request.updated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
