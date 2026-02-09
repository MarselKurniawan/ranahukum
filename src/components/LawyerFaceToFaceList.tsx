import { useNavigate } from "react-router-dom";
import { Clock, MessageCircle, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLawyerFaceToFaceRequests, useUpdateFaceToFaceRequest } from "@/hooks/useFaceToFace";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "warning" | "default" | "success" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Menunggu", variant: "warning" },
  negotiating: { label: "Negosiasi", variant: "default" },
  agreed: { label: "Sepakat", variant: "success" },
  in_progress: { label: "Berlangsung", variant: "default" },
  scheduled: { label: "Terjadwal", variant: "success" },
  met: { label: "Bertemu", variant: "success" },
  completed: { label: "Selesai", variant: "secondary" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
  expired: { label: "Kadaluarsa", variant: "secondary" },
};

export function LawyerFaceToFaceList() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useLawyerFaceToFaceRequests();
  const updateRequest = useUpdateFaceToFaceRequest();

  const activeRequests = requests.filter(r =>
    ["pending", "negotiating", "agreed", "in_progress", "scheduled", "met"].includes(r.status)
  );
  const historyRequests = requests.filter(r =>
    ["completed", "cancelled", "expired"].includes(r.status)
  );

  const handleAccept = async (id: string) => {
    try {
      await updateRequest.mutateAsync({ id, status: "negotiating" });
      toast.success("Permintaan diterima");
    } catch {
      toast.error("Gagal menerima permintaan");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateRequest.mutateAsync({
        id,
        status: "cancelled",
        cancel_reason: "Ditolak oleh lawyer",
        cancelled_by: "lawyer",
        cancelled_at: new Date().toISOString(),
      });
      toast.success("Permintaan ditolak");
    } catch {
      toast.error("Gagal menolak permintaan");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Card key={i}><CardContent className="p-4"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    );
  }

  const RequestCard = ({ request }: { request: typeof requests[0] }) => {
    const clientName = request.profiles?.full_name || 'Klien';
    const status = statusConfig[request.status] || { label: request.status, variant: "secondary" as const };

    return (
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback>{clientName[0]?.toUpperCase() || 'K'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{clientName}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{request.case_description}</p>
                </div>
                <Badge variant={status.variant} className="text-[10px] shrink-0">
                  {status.label}
                </Badge>
              </div>

              {request.meeting_date && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(request.meeting_date), "dd MMM yyyy", { locale: localeId })}</span>
                  {request.meeting_location && (
                    <>
                      <MapPin className="w-3 h-3 ml-1" />
                      <span className="truncate">{request.meeting_location}</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {format(new Date(request.created_at), "dd MMM", { locale: localeId })}
                </span>

                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleReject(request.id)}>
                      <XCircle className="w-3 h-3 mr-1" />Tolak
                    </Button>
                    <Button size="sm" variant="gradient" className="h-7 text-xs" onClick={() => handleAccept(request.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" />Terima
                    </Button>
                  </div>
                )}

                {["negotiating", "agreed", "in_progress", "scheduled", "met"].includes(request.status) && (
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-7 text-xs"
                    onClick={() => navigate(`/lawyer/face-to-face/chat/${request.id}`)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />Buka Chat
                  </Button>
                )}

                {request.status === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => navigate(`/lawyer/face-to-face/chat/${request.id}`)}
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

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="w-full mb-3 grid grid-cols-2">
        <TabsTrigger value="active" className="text-xs">Aktif ({activeRequests.length})</TabsTrigger>
        <TabsTrigger value="history" className="text-xs">Riwayat ({historyRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-3">
        {activeRequests.length > 0 ? (
          activeRequests.map(r => <RequestCard key={r.id} request={r} />)
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada permintaan tatap muka</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        {historyRequests.length > 0 ? (
          historyRequests.map(r => <RequestCard key={r.id} request={r} />)
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada riwayat</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
