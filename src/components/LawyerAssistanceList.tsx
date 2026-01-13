import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, Banknote, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLawyerAssistanceRequests } from "@/hooks/useLegalAssistance";

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
  return <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>;
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

export function LawyerAssistanceList() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useLawyerAssistanceRequests();

  const activeRequests = requests.filter(r => 
    ['pending', 'negotiating', 'agreed', 'in_progress'].includes(r.status)
  );

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 24) return `${hours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Request Pendampingan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Request Pendampingan
            {activeRequests.length > 0 && (
              <Badge variant="warning">{activeRequests.length}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeRequests.length > 0 ? (
          activeRequests.slice(0, 5).map((request) => (
            <div 
              key={request.id} 
              className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/lawyer/assistance/${request.id}`)}
            >
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.client?.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.client?.full_name?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {request.client?.full_name || 'Client'}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {request.case_description}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.current_stage && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>{getStageLabel(request.current_stage)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(request.created_at)}
                    </div>
                    {request.agreed_price && (
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Banknote className="w-3 h-3" />
                        {formatCurrency(request.agreed_price)}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada request pendampingan</p>
          </div>
        )}

        {requests.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => navigate('/lawyer/assistance')}
          >
            Lihat Semua ({requests.length})
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {requests.length > 0 && requests.length <= 5 && (
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => navigate('/lawyer/assistance')}
          >
            Lihat Riwayat Pendampingan
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
