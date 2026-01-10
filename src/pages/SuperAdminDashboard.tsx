import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, Clock, MessageCircle, TrendingUp,
  LogOut, ChevronRight, DollarSign, UserCheck, UserX,
  Plus, FileText, AlertCircle, Briefcase, Eye, Search,
  Filter, X
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { usePendingDocuments, useReviewDocument } from "@/hooks/useLawyerDocuments";
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
  const { data: pendingDocuments = [] } = usePendingDocuments();
  const { data: specializationTypes = [] } = useAllSpecializationTypes();
  const approveLawyer = useApproveLawyer();
  const approvePriceRequest = useApprovePriceRequest();
  const reviewDocument = useReviewDocument();
  const createSpecType = useCreateSpecializationType();
  const updateSpecType = useUpdateSpecializationType();

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [addSpecOpen, setAddSpecOpen] = useState(false);
  const [searchLawyer, setSearchLawyer] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedDocForReject, setSelectedDocForReject] = useState<string | null>(null);

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
          ? "Lawyer berhasil diverifikasi"
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
        title: approve ? "Permintaan Disetujui" : "Permintaan Ditolak"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleReviewDocument = async (docId: string, approve: boolean, notes?: string) => {
    try {
      await reviewDocument.mutateAsync({
        documentId: docId,
        approve,
        notes
      });
      toast({
        title: approve ? "Dokumen Disetujui" : "Dokumen Ditolak"
      });
      setSelectedDocForReject(null);
      setRejectNotes("");
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
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getDocTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ijazah: 'Ijazah',
      surat_izin: 'Surat Izin Praktik',
      ktp: 'KTP',
      foto: 'Pas Foto'
    };
    return types[type] || type;
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
    return !allLawyers.some(l => l.user_id === p.user_id);
  });
  const totalRevenue = allConsultations
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.price, 0);

  const pendingRequestsCount = pendingLawyers.length + priceRequests.length + pendingDocuments.length;

  const filteredLawyers = approvedLawyers.filter(l => 
    l.name.toLowerCase().includes(searchLawyer.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchLawyer.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="gradient-hero pb-8 px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">Super Admin</h1>
            <p className="text-primary-foreground/70 text-xs">Legal Connect Dashboard</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
            <Briefcase className="w-5 h-5 mx-auto text-primary-foreground/80 mb-1" />
            <p className="text-lg font-bold text-primary-foreground">{approvedLawyers.length}</p>
            <p className="text-[10px] text-primary-foreground/70">Lawyer</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 mx-auto text-primary-foreground/80 mb-1" />
            <p className="text-lg font-bold text-primary-foreground">{clients.length}</p>
            <p className="text-[10px] text-primary-foreground/70">Client</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
            <MessageCircle className="w-5 h-5 mx-auto text-primary-foreground/80 mb-1" />
            <p className="text-lg font-bold text-primary-foreground">{allConsultations.length}</p>
            <p className="text-[10px] text-primary-foreground/70">Konsultasi</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto text-primary-foreground/80 mb-1" />
            <p className="text-sm font-bold text-primary-foreground">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-primary-foreground/70">Revenue</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8">
        {/* Pending Alert */}
        {pendingRequestsCount > 0 && (
          <Card className="mb-4 border-warning/30 bg-warning/5 shadow-elevated">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{pendingRequestsCount} permintaan menunggu</p>
                <p className="text-xs text-muted-foreground truncate">
                  {pendingLawyers.length} lawyer • {pendingDocuments.length} dokumen • {priceRequests.length} harga
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="w-full mb-4 inline-flex h-auto p-1">
              <TabsTrigger value="requests" className="text-xs px-3 py-2 relative">
                Permintaan
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="lawyers" className="text-xs px-3 py-2">
                Lawyer
              </TabsTrigger>
              <TabsTrigger value="clients" className="text-xs px-3 py-2">
                Client
              </TabsTrigger>
              <TabsTrigger value="consultations" className="text-xs px-3 py-2">
                Konsultasi
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-3 py-2">
                Pengaturan
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4 mt-0">
            {/* Pending Lawyers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Pendaftaran Lawyer
                  {pendingLawyers.length > 0 && (
                    <Badge variant="warning" className="text-[10px]">{pendingLawyers.length}</Badge>
                  )}
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
                          <h4 className="font-medium text-sm truncate">{lawyer.name}</h4>
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
                              <Eye className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ✓ Tidak ada pendaftaran menunggu
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pending Documents */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Dokumen Verifikasi
                  {pendingDocuments.length > 0 && (
                    <Badge variant="warning" className="text-[10px]">{pendingDocuments.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingDocuments.length > 0 ? (
                  pendingDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={doc.lawyer?.image_url || undefined} />
                          <AvatarFallback>{doc.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm">{doc.lawyer?.name}</h4>
                              <p className="text-xs text-muted-foreground">{getDocTypeLabel(doc.document_type)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs shrink-0"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">{doc.file_name}</p>
                          <div className="flex gap-2 mt-2">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-destructive"
                                  onClick={() => setSelectedDocForReject(doc.id)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Tolak
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="bottom" className="rounded-t-2xl">
                                <SheetHeader>
                                  <SheetTitle>Tolak Dokumen</SheetTitle>
                                </SheetHeader>
                                <div className="py-4 space-y-4">
                                  <div className="space-y-2">
                                    <Label>Alasan Penolakan</Label>
                                    <Textarea
                                      value={rejectNotes}
                                      onChange={(e) => setRejectNotes(e.target.value)}
                                      placeholder="Contoh: Dokumen tidak jelas, perlu scan ulang"
                                      rows={3}
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => handleReviewDocument(doc.id, false, rejectNotes)}
                                    disabled={reviewDocument.isPending}
                                  >
                                    Konfirmasi Tolak
                                  </Button>
                                </div>
                              </SheetContent>
                            </Sheet>
                            <Button
                              size="sm"
                              variant="gradient"
                              className="h-7 text-xs"
                              onClick={() => handleReviewDocument(doc.id, true)}
                              disabled={reviewDocument.isPending}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Setujui
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ✓ Tidak ada dokumen menunggu
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Price Requests */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Permintaan Harga
                  {priceRequests.length > 0 && (
                    <Badge variant="warning" className="text-[10px]">{priceRequests.length}</Badge>
                  )}
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
                            <span className="text-xs line-through text-muted-foreground">
                              {formatCurrency(request.current_price)}
                            </span>
                            <span className="text-xs">→</span>
                            <span className="text-xs font-bold text-primary">
                              {formatCurrency(request.requested_price)}
                            </span>
                          </div>
                          {request.notes && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">"{request.notes}"</p>
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
                    ✓ Tidak ada permintaan harga
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-3 mt-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari lawyer..."
                value={searchLawyer}
                onChange={(e) => setSearchLawyer(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Lawyer</TableHead>
                    <TableHead className="text-xs text-center">Konsul</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLawyers.map((lawyer) => {
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
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate max-w-[120px]">{lawyer.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {lawyer.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center">{lawyerConsultations.length}</TableCell>
                        <TableCell className="text-xs text-right font-medium">
                          {formatCurrency(revenue)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredLawyers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada lawyer ditemukan
              </p>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-3 mt-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari client..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs text-center">Konsul</TableHead>
                    <TableHead className="text-xs text-right">Bergabung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
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
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate max-w-[120px]">
                                {client.full_name || 'Anonim'}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {client.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center">{clientConsultations.length}</TableCell>
                        <TableCell className="text-xs text-right">
                          {new Date(client.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Tidak ada client ditemukan
              </p>
            )}
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-3 mt-0">
            {loadingConsultations ? (
              <Skeleton className="h-24 w-full" />
            ) : allConsultations.length > 0 ? (
              allConsultations.slice(0, 30).map((consultation) => (
                <Card 
                  key={consultation.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/consultation/${consultation.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {consultation.client_profile?.full_name || 'Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          → {consultation.lawyer?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          consultation.status === 'completed' ? 'success' :
                          consultation.status === 'active' ? 'accent' :
                          consultation.status === 'pending' ? 'warning' : 'secondary'
                        }
                        className="text-[10px] shrink-0"
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{consultation.topic}</p>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
                      <span className="font-medium">{formatCurrency(consultation.price)}</span>
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
          <TabsContent value="settings" className="space-y-4 mt-0">
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
                      className="cursor-pointer transition-colors"
                      onClick={() => {
                        updateSpecType.mutate({ id: spec.id, is_active: !spec.is_active });
                      }}
                    >
                      {spec.name}
                      {!spec.is_active && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Klik badge untuk mengaktifkan/menonaktifkan jenis konsultasi
                </p>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Statistik Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Lawyer</span>
                  <span className="font-medium">{allLawyers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lawyer Aktif</span>
                  <span className="font-medium">{approvedLawyers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Client</span>
                  <span className="font-medium">{clients.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Konsultasi</span>
                  <span className="font-medium">{allConsultations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Konsultasi Selesai</span>
                  <span className="font-medium">
                    {allConsultations.filter(c => c.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
