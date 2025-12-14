import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, CheckCircle, XCircle, MessageCircle, Star, 
  Bell, Settings, LogOut, Calendar, Users, TrendingUp,
  ChevronRight, Play
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConsultationRequest {
  id: string;
  clientName: string;
  clientPhoto: string;
  topic: string;
  date: Date;
  status: "pending" | "accepted" | "rejected" | "active" | "completed";
  price: number;
}

const mockRequests: ConsultationRequest[] = [
  {
    id: "1",
    clientName: "Andi Pratama",
    clientPhoto: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
    topic: "Konsultasi perceraian dan hak asuh anak",
    date: new Date(),
    status: "pending",
    price: 150000,
  },
  {
    id: "2",
    clientName: "Siti Rahayu",
    clientPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    topic: "Sengketa tanah warisan keluarga",
    date: new Date(Date.now() - 3600000),
    status: "pending",
    price: 150000,
  },
  {
    id: "3",
    clientName: "Budi Hartono",
    clientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    topic: "Masalah kontrak kerja",
    date: new Date(Date.now() - 7200000),
    status: "active",
    price: 150000,
  },
  {
    id: "4",
    clientName: "Maya Anggraini",
    clientPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    topic: "Pembagian harta gono-gini",
    date: new Date(Date.now() - 86400000),
    status: "completed",
    price: 150000,
  },
];

const lawyerProfile = {
  name: "Dr. Ahmad Fauzi, S.H., M.H.",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  rating: 4.9,
  totalConsultations: 1250,
  thisMonthConsultations: 45,
  pendingRequests: 2,
  earnings: 6750000,
};

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState(mockRequests);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter((r) => r.status === "active");
  const completedRequests = requests.filter((r) => r.status === "completed");

  const handleAccept = (id: string) => {
    setRequests(requests.map((r) => 
      r.id === id ? { ...r, status: "accepted" as const } : r
    ));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => 
      r.id === id ? { ...r, status: "rejected" as const } : r
    ));
  };

  const handleStartConsultation = (id: string) => {
    setRequests(requests.map((r) => 
      r.id === id ? { ...r, status: "active" as const } : r
    ));
    navigate(`/lawyer/chat/${id}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const RequestCard = ({ request }: { request: ConsultationRequest }) => (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.clientPhoto} alt={request.clientName} />
            <AvatarFallback>{request.clientName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{request.clientName}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{request.topic}</p>
              </div>
              <Badge
                variant={
                  request.status === "pending" ? "warning" :
                  request.status === "active" ? "success" :
                  request.status === "completed" ? "secondary" :
                  request.status === "accepted" ? "accent" : "destructive"
                }
                className="text-[10px] shrink-0"
              >
                {request.status === "pending" ? "Menunggu" :
                 request.status === "active" ? "Aktif" :
                 request.status === "completed" ? "Selesai" :
                 request.status === "accepted" ? "Diterima" : "Ditolak"}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(request.date)}
              </div>

              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleReject(request.id)}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-8 text-xs"
                    onClick={() => handleAccept(request.id)}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Terima
                  </Button>
                </div>
              )}

              {request.status === "accepted" && (
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs"
                  onClick={() => handleStartConsultation(request.id)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Mulai Konsultasi
                </Button>
              )}

              {request.status === "active" && (
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs"
                  onClick={() => navigate(`/lawyer/chat/${request.id}`)}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Lanjut Chat
                </Button>
              )}

              {request.status === "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => navigate(`/lawyer/chat/${request.id}`)}
                >
                  Lihat Detail
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="gradient-hero pb-20 px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-primary-foreground">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary-foreground/20">
            <AvatarImage src={lawyerProfile.photo} alt={lawyerProfile.name} />
            <AvatarFallback>AF</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-primary-foreground">{lawyerProfile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-primary-foreground/80 text-sm">{lawyerProfile.rating}</span>
              <span className="text-primary-foreground/60 text-sm">• {lawyerProfile.totalConsultations} konsultasi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 bg-primary-foreground/10 rounded-xl p-3">
          <span className="text-sm text-primary-foreground">Status Online</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isOnline ? "text-success" : "text-primary-foreground/60"}`}>
              {isOnline ? "Aktif" : "Offline"}
            </span>
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-14 relative z-10 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{lawyerProfile.thisMonthConsultations}</p>
              <p className="text-xs text-muted-foreground">Konsultasi Bulan Ini</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">Rp {(lawyerProfile.earnings / 1000000).toFixed(1)}jt</p>
              <p className="text-xs text-muted-foreground">Pendapatan Bulan Ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {pendingRequests.length > 0 && (
          <Card className="mb-4 border-warning/30 bg-warning/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm">{pendingRequests.length} permintaan menunggu</p>
                <p className="text-xs text-muted-foreground">Segera tanggapi untuk kepuasan klien</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="pending" className="text-xs">
              Menunggu ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Aktif ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Selesai ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Tidak ada permintaan menunggu</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3">
            {activeRequests.length > 0 ? (
              activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Tidak ada konsultasi aktif</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada riwayat konsultasi</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/")}>
          <LogOut className="w-4 h-4" />
          Kembali ke Mode Client
        </Button>
      </div>
    </MobileLayout>
  );
}
