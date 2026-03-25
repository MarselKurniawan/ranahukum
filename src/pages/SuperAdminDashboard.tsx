import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Users, MessageCircle, TrendingUp, LogOut, Banknote,
  AlertCircle, Menu, Bell, Gavel, Video
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useIsSuperAdmin, useAllLawyers, usePendingLawyers, useAllConsultations,
  useSuspendLawyer, useSuspendClient
} from "@/hooks/useSuperAdmin";
import { useAllPriceRequests } from "@/hooks/useLawyerPriceRequests";
import { usePendingDocuments } from "@/hooks/useLawyerDocuments";
import { usePendingCredentials } from "@/hooks/useLawyerCredentials";
import { PlatformAnalyticsCard } from "@/components/PlatformAnalyticsCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SuspendDialog } from "@/components/SuspendDialog";
import { useCreateInterviewSession } from "@/hooks/useInterviewChat";
import { useAllPendampinganRequests } from "@/hooks/usePendampinganRequest";

// Tab components
import { AdminRequestsTab } from "@/components/admin/AdminRequestsTab";
import { AdminLawyersTab } from "@/components/admin/AdminLawyersTab";
import { AdminClientsTab } from "@/components/admin/AdminClientsTab";
import { AdminConsultationsTab } from "@/components/admin/AdminConsultationsTab";
import { AdminNotificationsTab } from "@/components/admin/AdminNotificationsTab";
import { AdminAssistanceTab } from "@/components/admin/AdminAssistanceTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: allLawyers = [], isLoading: loadingLawyers } = useAllLawyers();
  const { data: pendingLawyers = [], isLoading: loadingPending } = usePendingLawyers();
  const { data: allConsultations = [], isLoading: loadingConsultations } = useAllConsultations();
  const { data: priceRequests = [] } = useAllPriceRequests();
  const { data: pendingDocuments = [] } = usePendingDocuments();
  const { data: pendingCredentials } = usePendingCredentials();
  const { data: pendampinganRequests = [] } = useAllPendampinganRequests();
  const suspendLawyer = useSuspendLawyer();
  const suspendClient = useSuspendClient();
  const createInterview = useCreateInterviewSession();

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedLawyerForInterview, setSelectedLawyerForInterview] = useState<any>(null);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [suspendLawyerDialogOpen, setSuspendLawyerDialogOpen] = useState(false);
  const [suspendClientDialogOpen, setSuspendClientDialogOpen] = useState(false);
  const [selectedLawyerForSuspend, setSelectedLawyerForSuspend] = useState<any>(null);
  const [selectedClientForSuspend, setSelectedClientForSuspend] = useState<any>(null);

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin
  });

  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || !isSuperAdmin)) {
      toast({ title: "Akses Ditolak", description: "Halaman ini hanya untuk Super Admin", variant: "destructive" });
      navigate('/auth');
    }
  }, [user, isSuperAdmin, loading, checkingAdmin, navigate, toast]);

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const openInterviewDialog = (lawyer: any) => {
    setSelectedLawyerForInterview(lawyer);
    setInterviewNotes("");
    setInterviewDialogOpen(true);
  };

  const handleStartInterview = async (lawyer: any) => {
    try {
      const session = await createInterview.mutateAsync({ lawyerId: lawyer.id, notes: interviewNotes });
      toast({ title: "Sesi interview dimulai" });
      setInterviewDialogOpen(false);
      navigate(`/admin/interview/${session.id}`);
    } catch { toast({ title: "Gagal memulai interview", variant: "destructive" }); }
  };

  const handleSuspendLawyer = async (durationMinutes: number, reason: string) => {
    if (!selectedLawyerForSuspend) return;
    try {
      await suspendLawyer.mutateAsync({ lawyerId: selectedLawyerForSuspend.id, suspend: true, durationMinutes, reason });
      toast({ title: "Lawyer Dinonaktifkan", description: `Akun akan ditangguhkan selama ${durationMinutes} menit` });
      setSuspendLawyerDialogOpen(false); setSelectedLawyerForSuspend(null);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleUnsuspendLawyer = async (lawyerId: string) => {
    try { await suspendLawyer.mutateAsync({ lawyerId, suspend: false }); toast({ title: "Lawyer Diaktifkan Kembali" }); }
    catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleSuspendClient = async (durationMinutes: number, reason: string) => {
    if (!selectedClientForSuspend) return;
    try {
      await suspendClient.mutateAsync({ profileId: selectedClientForSuspend.id, suspend: true, durationMinutes, reason });
      toast({ title: "Client Dinonaktifkan", description: `Akun akan ditangguhkan selama ${durationMinutes} menit` });
      setSuspendClientDialogOpen(false); setSelectedClientForSuspend(null);
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleUnsuspendClient = async (profileId: string) => {
    try { await suspendClient.mutateAsync({ profileId, suspend: false }); toast({ title: "Client Diaktifkan Kembali" }); }
    catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (loading || checkingAdmin || loadingLawyers) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const approvedLawyers = allLawyers.filter(l => l.approval_status === 'approved');
  const clients = allProfiles.filter(p => !allLawyers.some(l => l.user_id === p.user_id));
  const totalRevenue = allConsultations.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.price, 0);
  const pendingCredentialsCount = (pendingCredentials?.certifications?.length || 0) + (pendingCredentials?.licenses?.length || 0);
  const pendingRequestsCount = pendingLawyers.length + priceRequests.length + pendingDocuments.length + pendampinganRequests.length + pendingCredentialsCount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setSideMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold">Super Admin</h1>
                <p className="text-primary-foreground/70 text-xs hidden md:block">RanahHukum Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {pendingRequestsCount > 0 && <Badge variant="destructive" className="text-xs">{pendingRequestsCount} menunggu</Badge>}
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      <Sheet open={sideMenuOpen} onOpenChange={setSideMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b"><SheetTitle>Menu Admin</SheetTitle></SheetHeader>
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setSideMenuOpen(false)}>
              <Briefcase className="w-4 h-4 mr-3" />Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-3" />Keluar
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="border-primary/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-muted-foreground">Lawyer Aktif</p><p className="text-2xl md:text-3xl font-bold text-primary">{approvedLawyers.length}</p></div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-accent/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-muted-foreground">Client</p><p className="text-2xl md:text-3xl font-bold text-accent">{clients.length}</p></div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 flex items-center justify-center"><Users className="w-5 h-5 md:w-6 md:h-6 text-accent" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-muted-foreground">Konsultasi</p><p className="text-2xl md:text-3xl font-bold text-success">{allConsultations.length}</p></div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-success" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs md:text-sm text-muted-foreground">Revenue</p><p className="text-lg md:text-2xl font-bold text-warning">{formatCurrency(totalRevenue)}</p></div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center"><Banknote className="w-5 h-5 md:w-6 md:h-6 text-warning" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {pendingRequestsCount > 0 && (
          <Card className="mb-6 border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5 text-warning" /></div>
              <div className="flex-1">
                <p className="font-medium">{pendingRequestsCount} permintaan menunggu persetujuan</p>
                <p className="text-sm text-muted-foreground">
                  {pendingLawyers.length} pendaftaran lawyer • {pendingDocuments.length} dokumen • {priceRequests.length} perubahan harga • {pendampinganRequests.length} aktivasi pendampingan • {pendingCredentialsCount} sertifikasi/lisensi
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <ScrollArea className="w-full pb-2">
            <TabsList className="w-full md:w-auto inline-flex h-auto p-1 mb-4">
              <TabsTrigger value="requests" className="text-xs md:text-sm px-3 md:px-4 py-2 relative">
                Permintaan
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">{pendingRequestsCount}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="lawyers" className="text-xs md:text-sm px-3 md:px-4 py-2">Lawyer</TabsTrigger>
              <TabsTrigger value="clients" className="text-xs md:text-sm px-3 md:px-4 py-2">Client</TabsTrigger>
              <TabsTrigger value="consultations" className="text-xs md:text-sm px-3 md:px-4 py-2">Konsultasi</TabsTrigger>
              <TabsTrigger value="assistance" className="text-xs md:text-sm px-3 md:px-4 py-2"><Gavel className="w-3 h-3 mr-1" />Pendampingan</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm px-3 md:px-4 py-2"><Bell className="w-3 h-3 mr-1" />Notifikasi</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm px-3 md:px-4 py-2">Pengaturan</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs md:text-sm px-3 md:px-4 py-2"><TrendingUp className="w-3 h-3 mr-1" />Analitik</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="requests" className="mt-0">
            <AdminRequestsTab pendingLawyers={pendingLawyers} loadingPending={loadingPending} onOpenInterview={openInterviewDialog} />
          </TabsContent>

          <TabsContent value="lawyers" className="mt-0">
            <AdminLawyersTab
              approvedLawyers={approvedLawyers}
              allConsultations={allConsultations}
              onOpenInterview={openInterviewDialog}
              onSuspendLawyer={(lawyer) => { setSelectedLawyerForSuspend(lawyer); setSuspendLawyerDialogOpen(true); }}
              onUnsuspendLawyer={handleUnsuspendLawyer}
            />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <AdminClientsTab
              clients={clients}
              allConsultations={allConsultations}
              onSuspendClient={(client) => { setSelectedClientForSuspend(client); setSuspendClientDialogOpen(true); }}
              onUnsuspendClient={handleUnsuspendClient}
            />
          </TabsContent>

          <TabsContent value="consultations" className="mt-0">
            <AdminConsultationsTab allConsultations={allConsultations} loadingConsultations={loadingConsultations} />
          </TabsContent>

          <TabsContent value="assistance" className="mt-0">
            <AdminAssistanceTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <AdminNotificationsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <AdminSettingsTab
              allLawyers={allLawyers}
              approvedLawyers={approvedLawyers}
              pendingLawyers={pendingLawyers}
              clients={clients}
              allConsultations={allConsultations}
              totalRevenue={totalRevenue}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-0">
            <PlatformAnalyticsCard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Video className="w-5 h-5" />Interview Lawyer</DialogTitle>
            <DialogDescription>Jadwalkan atau lakukan interview dengan calon lawyer</DialogDescription>
          </DialogHeader>
          {selectedLawyerForInterview && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedLawyerForInterview.image_url || undefined} />
                  <AvatarFallback>{selectedLawyerForInterview.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedLawyerForInterview.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedLawyerForInterview.location}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Catatan Interview (Opsional)</Label>
                <Textarea value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} placeholder="Catatan tentang interview, pertanyaan yang ingin ditanyakan, dll." rows={3} />
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Chat Interview:</strong> Mulai chat dengan lawyer untuk berdiskusi mengenai jadwal interview dan pertanyaan verifikasi.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>Batal</Button>
            <Button onClick={() => handleStartInterview(selectedLawyerForInterview)} disabled={createInterview.isPending}>
              <MessageCircle className="w-4 h-4 mr-2" />{createInterview.isPending ? 'Memulai...' : 'Mulai Chat Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialogs */}
      <SuspendDialog open={suspendLawyerDialogOpen} onOpenChange={setSuspendLawyerDialogOpen} onConfirm={handleSuspendLawyer} userName={selectedLawyerForSuspend?.name || ''} userType="lawyer" isPending={suspendLawyer.isPending} />
      <SuspendDialog open={suspendClientDialogOpen} onOpenChange={setSuspendClientDialogOpen} onConfirm={handleSuspendClient} userName={selectedClientForSuspend?.full_name || 'Client'} userType="client" isPending={suspendClient.isPending} />
    </div>
  );
}
