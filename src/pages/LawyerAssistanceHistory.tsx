import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Clock, Banknote, FileText, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/MobileLayout";
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
    closing: "Penutupan",
    completed: "Selesai"
  };
  return stages[stage] || stage;
};

export default function LawyerAssistanceHistory() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useLawyerAssistanceRequests();
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "short",
      year: "numeric"
    });
  };

  const activeRequests = requests.filter(r => 
    ['pending', 'negotiating', 'agreed', 'in_progress'].includes(r.status)
  );
  
  // Only show completed items in history - not cancelled/rejected
  const completedRequests = requests.filter(r => 
    r.status === 'completed'
  );

  const filterRequests = (reqs: typeof requests) => {
    if (!searchQuery) return reqs;
    return reqs.filter(r => 
      r.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.case_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const RequestCard = ({ request }: { request: typeof requests[0] }) => (
    <Card 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate(`/lawyer/assistance/${request.id}`)}
    >
      <CardContent className="p-4">
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
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">
                    {request.client?.full_name || 'Client'}
                  </h4>
                  {request.display_id && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {request.display_id}
                    </span>
                  )}
                </div>
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
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/lawyer/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Riwayat Pendampingan</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama klien atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="active" className="text-sm">
              Aktif ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">
              Selesai ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {filterRequests(activeRequests).length > 0 ? (
              filterRequests(activeRequests).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Tidak ada hasil ditemukan" : "Belum ada pendampingan aktif"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {filterRequests(completedRequests).length > 0 ? (
              filterRequests(completedRequests).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Tidak ada hasil ditemukan" : "Belum ada riwayat pendampingan"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
