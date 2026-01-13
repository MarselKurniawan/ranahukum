import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Clock, CheckCircle, XCircle, FileText, Banknote } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useClientAssistanceRequests } from "@/hooks/useLegalAssistance";

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
  if (!stage) return null;
  const stages: Record<string, string> = {
    consultation: "Konsultasi Awal",
    document_collection: "Pengumpulan Berkas",
    document_review: "Review Dokumen",
    negotiation: "Negosiasi",
    court_preparation: "Persiapan Sidang",
    court_session: "Sidang",
    closing: "Penutupan"
  };
  return stages[stage] || stage;
};

export default function ClientAssistanceRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useClientAssistanceRequests();

  const activeRequests = requests.filter(r => 
    ['pending', 'negotiating', 'agreed', 'in_progress'].includes(r.status)
  );
  const completedRequests = requests.filter(r => 
    ['completed', 'cancelled', 'rejected'].includes(r.status)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const RequestCard = ({ request }: { request: any }) => (
    <Card 
      className="cursor-pointer hover:shadow-elevated transition-all"
      onClick={() => navigate(`/legal-assistance/chat/${request.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.lawyer?.image_url} />
            <AvatarFallback>{request.lawyer?.name?.[0] || 'L'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{request.lawyer?.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {request.case_description}
                </p>
              </div>
              {getStatusBadge(request.status)}
            </div>
            
            {request.current_stage && ['agreed', 'in_progress'].includes(request.status) && (
              <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3 text-primary" />
                  <span className="font-medium">Tahap: {getStageLabel(request.current_stage)}</span>
                </div>
                {request.stage_notes && (
                  <p className="text-xs text-muted-foreground mt-1">{request.stage_notes}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(request.created_at)}
              </div>
              {request.agreed_price && (
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <Banknote className="w-3 h-3" />
                  {formatCurrency(request.agreed_price)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout>
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold">Pendampingan Saya</h2>
            <p className="text-xs text-muted-foreground">Riwayat permintaan pendampingan</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-2">
            <TabsTrigger value="active" className="text-xs">
              Berlangsung ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Riwayat ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-0">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
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
            ) : activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Tidak ada pendampingan aktif</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/legal-assistance')}
                >
                  Cari Pengacara
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada riwayat pendampingan</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
