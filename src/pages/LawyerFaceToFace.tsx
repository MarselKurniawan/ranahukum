import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Clock, Calendar, MapPin, MessageCircle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LawyerSideMenu } from "@/components/LawyerSideMenu";
import { useLawyerFaceToFaceRequests, useUpdateFaceToFaceRequest } from "@/hooks/useFaceToFace";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Menunggu", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="w-3 h-3" /> },
  negotiating: { label: "Negosiasi", color: "bg-primary/10 text-primary border-primary/20", icon: <MessageCircle className="w-3 h-3" /> },
  scheduled: { label: "Terjadwal", color: "bg-success/10 text-success border-success/20", icon: <Calendar className="w-3 h-3" /> },
  completed: { label: "Selesai", color: "bg-muted text-muted-foreground border-muted", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Dibatalkan", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle className="w-3 h-3" /> },
  expired: { label: "Kadaluarsa", color: "bg-muted text-muted-foreground border-muted", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function LawyerFaceToFace() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useLawyerFaceToFaceRequests();
  const updateRequest = useUpdateFaceToFaceRequest();
  const [activeTab, setActiveTab] = useState("active");

  const activeRequests = requests.filter(r => 
    ["pending", "negotiating", "scheduled"].includes(r.status)
  );
  const historyRequests = requests.filter(r => 
    ["completed", "cancelled", "expired"].includes(r.status)
  );

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateRequest.mutateAsync({
        id: requestId,
        status: "negotiating"
      });
      toast.success("Permintaan diterima, silakan diskusikan jadwal dengan klien");
    } catch (error) {
      toast.error("Gagal menerima permintaan");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateRequest.mutateAsync({
        id: requestId,
        status: "cancelled",
        cancel_reason: "Ditolak oleh lawyer",
        cancelled_by: "lawyer",
        cancelled_at: new Date().toISOString()
      });
      toast.success("Permintaan ditolak");
    } catch (error) {
      toast.error("Gagal menolak permintaan");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: localeId });
  };

  const renderRequestCard = (request: typeof requests[0]) => {
    const status = statusConfig[request.status] || statusConfig.pending;
    
    return (
      <Card key={request.id} className="overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {request.profiles?.full_name || "Pengguna"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.display_id || request.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={status.color}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>

          {/* Case Info */}
          <div className="space-y-2 mb-3">
            {request.case_type && (
              <Badge variant="secondary" className="text-xs">
                {request.case_type}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.case_description}
            </p>
          </div>

          {/* Schedule Info (if scheduled) */}
          {request.status === "scheduled" && request.meeting_date && (
            <div className="p-3 bg-success/5 rounded-lg border border-success/20 mb-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-success" />
                <span>{format(new Date(request.meeting_date), "EEEE, dd MMMM yyyy", { locale: localeId })}</span>
              </div>
              {request.meeting_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-success" />
                  <span>{request.meeting_time}</span>
                </div>
              )}
              {request.meeting_location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-success" />
                  <span className="line-clamp-1">{request.meeting_location}</span>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground mb-3">
            Diajukan: {formatDate(request.created_at)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {request.status === "pending" && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={updateRequest.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Terima
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={updateRequest.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Tolak
                </Button>
              </>
            )}
            {["negotiating", "scheduled"].includes(request.status) && (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/lawyer/face-to-face/chat/${request.id}`)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Buka Chat
              </Button>
            )}
            {["completed", "cancelled"].includes(request.status) && (
              <Button 
                size="sm" 
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/lawyer/face-to-face/chat/${request.id}`)}
              >
                Lihat Detail
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/lawyer/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Layanan Tatap Muka</h1>
              <p className="text-xs text-muted-foreground">
                Kelola permintaan pertemuan dari klien
              </p>
            </div>
          </div>
          <LawyerSideMenu />
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="active" className="relative">
              Aktif
              {activeRequests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {activeRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {activeRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Belum Ada Permintaan</p>
                  <p className="text-sm text-muted-foreground">
                    Permintaan tatap muka dari klien akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeRequests.map(renderRequestCard)
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {historyRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Belum Ada Riwayat</p>
                  <p className="text-sm text-muted-foreground">
                    Riwayat pertemuan yang selesai akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              historyRequests.map(renderRequestCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
