import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, CheckCircle, XCircle, MessageCircle, Star, 
  Calendar, Users, TrendingUp, Play, BadgeCheck
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LawyerCalendar } from "@/components/LawyerCalendar";
import { EarningsDashboard } from "@/components/EarningsDashboard";
import { LawyerProfileAlert } from "@/components/LawyerProfileAlert";
import { LawyerSideMenu } from "@/components/LawyerSideMenu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLawyerConsultations, useUpdateConsultation, Consultation } from "@/hooks/useConsultations";
import { useLawyerProfile, useLawyerProfileCompletion, useUpdateLawyerProfile } from "@/hooks/useLawyerProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const { data: consultations = [], isLoading: loadingConsultations } = useLawyerConsultations();
  const { data: lawyerProfile, isLoading: loadingProfile } = useLawyerProfile();
  const profileCompletion = useLawyerProfileCompletion();
  const updateProfile = useUpdateLawyerProfile();
  const updateConsultation = useUpdateConsultation();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!loading && (!user || role !== 'lawyer')) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk lawyer",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, role, loading, navigate, toast]);

  // Set isOnline from profile
  useEffect(() => {
    if (lawyerProfile) {
      setIsOnline(lawyerProfile.is_available);
    }
  }, [lawyerProfile]);

  const handleToggleOnline = async (checked: boolean) => {
    // Block if profile is not complete
    if (checked && profileCompletion && !profileCompletion.isComplete) {
      toast({
        title: "Profil Belum Lengkap",
        description: "Lengkapi profil Anda terlebih dahulu sebelum mengaktifkan status online",
        variant: "destructive"
      });
      return;
    }
    
    setIsOnline(checked);
    try {
      await updateProfile.mutateAsync({ is_available: checked });
    } catch (error) {
      setIsOnline(!checked); // Revert on error
    }
  };

  if (loading || loadingConsultations || loadingProfile) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MobileLayout>
    );
  }

  const userName = lawyerProfile?.name || user?.user_metadata?.full_name || "Lawyer";
  const pendingRequests = consultations.filter((r) => r.status === "pending");
  const acceptedRequests = consultations.filter((r) => r.status === "accepted");
  const activeRequests = consultations.filter((r) => r.status === "active");
  const completedRequests = consultations.filter((r) => r.status === "completed");

  const handleAccept = async (id: string) => {
    await updateConsultation.mutateAsync({ id, status: 'accepted' });
    toast({ title: "Konsultasi diterima" });
  };

  const handleReject = async (id: string) => {
    await updateConsultation.mutateAsync({ id, status: 'rejected' });
    toast({ title: "Konsultasi ditolak" });
  };

  const handleStartConsultation = async (id: string) => {
    await updateConsultation.mutateAsync({ id, status: 'active' });
    navigate(`/lawyer/chat/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const RequestCard = ({ request }: { request: Consultation }) => (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback>
              {request.profiles?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">
                  {request.profiles?.full_name || 'Pengguna Anonim'}
                </h3>
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
                {formatDate(request.created_at)}
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
          <LawyerSideMenu />
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary-foreground/20">
            <AvatarImage src={lawyerProfile?.image_url || undefined} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-primary-foreground">{userName}</h2>
              {lawyerProfile?.is_verified && (
                <BadgeCheck className="w-5 h-5 text-success fill-success/20" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-primary-foreground/80 text-sm">
                {lawyerProfile?.rating || '-'}
              </span>
              <span className="text-primary-foreground/60 text-sm">• {completedRequests.length} konsultasi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 bg-primary-foreground/10 rounded-xl p-3">
          <span className="text-sm text-primary-foreground">Status Online</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isOnline ? "text-success" : "text-primary-foreground/60"}`}>
              {isOnline ? "Aktif" : "Offline"}
            </span>
            <Switch 
              checked={isOnline} 
              onCheckedChange={handleToggleOnline}
              disabled={updateProfile.isPending}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-14 relative z-10 pb-8">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{consultations.length}</p>
              <p className="text-xs text-muted-foreground">Total Konsultasi</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Alert */}
        <div className="mb-4">
          <LawyerProfileAlert onComplete={() => navigate('/lawyer/profile')} />
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

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="requests" className="text-xs">Konsultasi</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs">Jadwal</TabsTrigger>
            <TabsTrigger value="earnings" className="text-xs">Pendapatan</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            {/* Request Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="w-full mb-4 grid grid-cols-3">
                <TabsTrigger value="pending" className="text-xs">
                  Menunggu ({pendingRequests.length + acceptedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Aktif ({activeRequests.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Selesai ({completedRequests.length})
                </TabsTrigger>
              </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {[...pendingRequests, ...acceptedRequests].length > 0 ? (
              [...pendingRequests, ...acceptedRequests].map((request) => (
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
          </TabsContent>

          <TabsContent value="calendar">
            <LawyerCalendar />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsDashboard lawyerId={lawyerProfile?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
