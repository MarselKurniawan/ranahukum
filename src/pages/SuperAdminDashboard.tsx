import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, Clock, MessageCircle, TrendingUp,
  Settings, LogOut, ChevronRight, DollarSign, UserCheck, UserX
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useIsSuperAdmin, 
  useAllLawyers, 
  usePendingLawyers, 
  useAllConsultations,
  useApproveLawyer 
} from "@/hooks/useSuperAdmin";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: allLawyers = [], isLoading: loadingLawyers } = useAllLawyers();
  const { data: pendingLawyers = [], isLoading: loadingPending } = usePendingLawyers();
  const { data: allConsultations = [], isLoading: loadingConsultations } = useAllConsultations();
  const approveLawyer = useApproveLawyer();

  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || !isSuperAdmin)) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk Super Admin",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, isSuperAdmin, loading, checkingAdmin, navigate, toast]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleApprove = async (lawyerId: string, approve: boolean) => {
    try {
      await approveLawyer.mutateAsync({ lawyerId, approve });
      toast({
        title: approve ? "Lawyer Disetujui" : "Lawyer Ditolak",
        description: approve 
          ? "Lawyer berhasil diverifikasi dan dapat mulai menerima konsultasi"
          : "Pendaftaran lawyer ditolak"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  if (loading || checkingAdmin || loadingLawyers) {
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

  const approvedLawyers = allLawyers.filter(l => l.approval_status === 'approved');
  const rejectedLawyers = allLawyers.filter(l => l.approval_status === 'rejected');
  const totalRevenue = allConsultations
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.price, 0);

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="gradient-hero pb-6 px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-primary-foreground">Super Admin</h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="text-primary-foreground">
          <h2 className="text-xl font-semibold">Legal Connect Admin</h2>
          <p className="text-primary-foreground/70 text-sm">Kelola platform dan lawyer</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{allLawyers.length}</p>
              <p className="text-xs text-muted-foreground">Total Lawyer</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-warning mb-2" />
              <p className="text-2xl font-bold">{pendingLawyers.length}</p>
              <p className="text-xs text-muted-foreground">Menunggu Approval</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold">{allConsultations.length}</p>
              <p className="text-xs text-muted-foreground">Total Konsultasi</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto text-accent mb-2" />
              <p className="text-lg font-bold">Rp {(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approval Alert */}
        {pendingLawyers.length > 0 && (
          <Card className="mb-4 border-warning/30 bg-warning/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm">{pendingLawyers.length} pendaftaran menunggu</p>
                <p className="text-xs text-muted-foreground">Review dan approve lawyer baru</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-3">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({pendingLawyers.length})
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="text-xs">
              Lawyer ({approvedLawyers.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              Konsultasi
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-3">
            {loadingPending ? (
              <Skeleton className="h-24 w-full" />
            ) : pendingLawyers.length > 0 ? (
              pendingLawyers.map((lawyer) => (
                <Card key={lawyer.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={lawyer.image_url || undefined} />
                        <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{lawyer.name}</h3>
                        <p className="text-xs text-muted-foreground">{lawyer.location}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(lawyer.specialization || []).slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-[10px]">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleApprove(lawyer.id, false)}
                            disabled={approveLawyer.isPending}
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            variant="gradient"
                            className="h-8 text-xs"
                            onClick={() => handleApprove(lawyer.id, true)}
                            disabled={approveLawyer.isPending}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Setujui
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Tidak ada pendaftaran menunggu</p>
              </div>
            )}
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-3">
            {loadingLawyers ? (
              <Skeleton className="h-24 w-full" />
            ) : approvedLawyers.length > 0 ? (
              approvedLawyers.map((lawyer) => (
                <Card 
                  key={lawyer.id} 
                  className="animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 items-center">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={lawyer.image_url || undefined} />
                        <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{lawyer.name}</h3>
                          {lawyer.is_verified && (
                            <Badge variant="success" className="text-[10px]">Verified</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{lawyer.location}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Rp {(lawyer.price || 0).toLocaleString('id-ID')}</span>
                          <span>•</span>
                          <span>{lawyer.consultation_count} konsultasi</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada lawyer terdaftar</p>
              </div>
            )}
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="history" className="space-y-3">
            {loadingConsultations ? (
              <Skeleton className="h-24 w-full" />
            ) : allConsultations.length > 0 ? (
              allConsultations.slice(0, 20).map((consultation) => (
                <Card 
                  key={consultation.id} 
                  className="animate-fade-in cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/consultation/${consultation.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {consultation.client_profile?.full_name || 'Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          → {consultation.lawyer?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          consultation.status === 'completed' ? 'success' :
                          consultation.status === 'active' ? 'accent' :
                          consultation.status === 'pending' ? 'warning' : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{consultation.topic}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>Rp {consultation.price.toLocaleString('id-ID')}</span>
                      <span>{new Date(consultation.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada konsultasi</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>
    </MobileLayout>
  );
}
