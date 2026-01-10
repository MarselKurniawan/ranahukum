import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, Clock, MessageCircle, TrendingUp,
  Settings, LogOut, ChevronRight, DollarSign, UserCheck, UserX,
  Plus, FileText, AlertCircle, Briefcase
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useIsSuperAdmin, 
  useAllLawyers, 
  usePendingLawyers, 
  useAllConsultations,
  useApproveLawyer 
} from "@/hooks/useSuperAdmin";
import { useAllPriceRequests, useApprovePriceRequest } from "@/hooks/useLawyerPriceRequests";
import { useAllSpecializationTypes, useCreateSpecializationType, useUpdateSpecializationType } from "@/hooks/useSpecializationTypes";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: allLawyers = [], isLoading: loadingLawyers } = useAllLawyers();
  const { data: pendingLawyers = [], isLoading: loadingPending } = usePendingLawyers();
  const { data: allConsultations = [], isLoading: loadingConsultations } = useAllConsultations();
  const { data: priceRequests = [] } = useAllPriceRequests();
  const { data: specializationTypes = [] } = useAllSpecializationTypes();
  const approveLawyer = useApproveLawyer();
  const approvePriceRequest = useApprovePriceRequest();
  const createSpecType = useCreateSpecializationType();
  const updateSpecType = useUpdateSpecializationType();

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [addSpecOpen, setAddSpecOpen] = useState(false);

  // Fetch all profiles (clients)
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!isSuperAdmin
  });

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

  const handleApprovePriceRequest = async (request: any, approve: boolean) => {
    try {
      await approvePriceRequest.mutateAsync({
        requestId: request.id,
        approve,
        lawyerId: request.lawyer_id,
        newPrice: request.requested_price
      });
      toast({
        title: approve ? "Permintaan Disetujui" : "Permintaan Ditolak",
        description: approve 
          ? "Harga lawyer telah diperbarui"
          : "Permintaan perubahan harga ditolak"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleAddSpecialization = async () => {
    if (!newSpecName.trim()) return;
    try {
      await createSpecType.mutateAsync({
        name: newSpecName,
        description: newSpecDesc || undefined
      });
      toast({ title: "Jenis konsultasi berhasil ditambahkan" });
      setNewSpecName("");
      setNewSpecDesc("");
      setAddSpecOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Jenis konsultasi sudah ada",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
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
  const clients = allProfiles.filter(p => {
    // Exclude lawyers from client list
    return !allLawyers.some(l => l.user_id === p.user_id);
  });
  const totalRevenue = allConsultations
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.price, 0);

  const pendingRequestsCount = pendingLawyers.length + priceRequests.length;

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="gradient-hero pb-6 px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-primary-foreground">Super Admin</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-primary-foreground">
          <h2 className="text-xl font-semibold">Legal Connect Admin</h2>
          <p className="text-primary-foreground/70 text-sm">Kelola platform dan lawyer</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{approvedLawyers.length}</p>
              <p className="text-xs text-muted-foreground">Lawyer Aktif</p>
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Total Client</p>
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
              <DollarSign className="w-6 h-6 mx-auto text-warning mb-2" />
              <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {pendingRequestsCount > 0 && (
          <Card className="mb-4 border-warning/30 bg-warning/5">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm">{pendingRequestsCount} permintaan menunggu</p>
                <p className="text-xs text-muted-foreground">
                  {pendingLawyers.length} lawyer baru, {priceRequests.length} update harga
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-5 h-auto">
            <TabsTrigger value="requests" className="text-[10px] px-1 py-2">
              Permintaan
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="text-[10px] px-1 py-2">
              Lawyer
            </TabsTrigger>
            <TabsTrigger value="clients" className="text-[10px] px-1 py-2">
              Client
            </TabsTrigger>
            <TabsTrigger value="consultations" className="text-[10px] px-1 py-2">
              Konsultasi
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] px-1 py-2">
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {/* Pending Lawyers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Pendaftaran Lawyer ({pendingLawyers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingPending ? (
                  <Skeleton className="h-20 w-full" />
                ) : pendingLawyers.length > 0 ? (
                  pendingLawyers.map((lawyer) => (
                    <div key={lawyer.id} className="p-3 border rounded-lg">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={lawyer.image_url || undefined} />
                          <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{lawyer.name}</h4>
                          <p className="text-xs text-muted-foreground">{lawyer.location}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(lawyer.specialization || []).slice(0, 2).map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-[10px]">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive"
                              onClick={() => handleApprove(lawyer.id, false)}
                            >
                              <UserX className="w-3 h-3 mr-1" />
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              variant="gradient"
                              className="h-7 text-xs"
                              onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada pendaftaran menunggu
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Price Requests */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Permintaan Update Harga ({priceRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {priceRequests.length > 0 ? (
                  priceRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.lawyer?.image_url || undefined} />
                          <AvatarFallback>{request.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{request.lawyer?.name}</h4>
                          <p className="text-xs text-muted-foreground">Pendampingan Hukum</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">{formatCurrency(request.current_price)}</span>
                            <span className="text-xs">→</span>
                            <span className="text-xs font-bold text-primary">
                              {formatCurrency(request.requested_price)}
                            </span>
                          </div>
                          {request.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{request.notes}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive"
                              onClick={() => handleApprovePriceRequest(request, false)}
                            >
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              variant="gradient"
                              className="h-7 text-xs"
                              onClick={() => handleApprovePriceRequest(request, true)}
                            >
                              Setujui
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada permintaan harga
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Lawyer</TableHead>
                    <TableHead className="text-xs">Konsultasi</TableHead>
                    <TableHead className="text-xs">Revenue</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedLawyers.map((lawyer) => {
                    const lawyerConsultations = allConsultations.filter(
                      c => c.lawyer_id === lawyer.id && c.status === 'completed'
                    );
                    const revenue = lawyerConsultations.reduce((sum, c) => sum + c.price, 0);
                    
                    return (
                      <TableRow 
                        key={lawyer.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}
                      >
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={lawyer.image_url || undefined} />
                              <AvatarFallback className="text-xs">{lawyer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">{lawyer.name}</p>
                              <p className="text-[10px] text-muted-foreground">{lawyer.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{lawyerConsultations.length}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(revenue)}</TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Konsultasi</TableHead>
                    <TableHead className="text-xs">Bergabung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const clientConsultations = allConsultations.filter(
                      c => c.client_id === client.user_id
                    );
                    
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={client.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {client.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">{client.full_name || 'Anonim'}</p>
                              <p className="text-[10px] text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{clientConsultations.length}</TableCell>
                        <TableCell className="text-xs">
                          {new Date(client.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-3">
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
                      <span>{formatCurrency(consultation.price)}</span>
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Specialization Types */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Jenis Konsultasi</CardTitle>
                  <Dialog open={addSpecOpen} onOpenChange={setAddSpecOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Tambah
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Jenis Konsultasi</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Nama</Label>
                          <Input
                            value={newSpecName}
                            onChange={(e) => setNewSpecName(e.target.value)}
                            placeholder="Contoh: Hukum Konsumen"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi (Opsional)</Label>
                          <Input
                            value={newSpecDesc}
                            onChange={(e) => setNewSpecDesc(e.target.value)}
                            placeholder="Deskripsi singkat"
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleAddSpecialization}
                          disabled={createSpecType.isPending}
                        >
                          Simpan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specializationTypes.map((spec) => (
                    <Badge 
                      key={spec.id} 
                      variant={spec.is_active ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        updateSpecType.mutate({ id: spec.id, is_active: !spec.is_active });
                      }}
                    >
                      {spec.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
