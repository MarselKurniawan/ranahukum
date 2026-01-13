import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, Clock, MessageCircle, TrendingUp,
  LogOut, ChevronRight, Banknote, UserCheck, UserX,
  Plus, FileText, AlertCircle, Briefcase, Eye, Search,
  Filter, X, HelpCircle, Pencil, Trash2, Video, Phone,
  Calendar, Mail, ExternalLink, MoreHorizontal, Menu,
  Bell, Gift, Megaphone, Info, Image, Gavel
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useIsSuperAdmin, 
  useAllLawyers, 
  usePendingLawyers, 
  useAllConsultations,
  useApproveLawyer,
  useSuspendLawyer,
  useSuspendClient
} from "@/hooks/useSuperAdmin";
import { useAllPriceRequests, useApprovePriceRequest } from "@/hooks/useLawyerPriceRequests";
import { useAllSpecializationTypes, useCreateSpecializationType, useUpdateSpecializationType, useDeleteSpecializationType } from "@/hooks/useSpecializationTypes";
import { usePendingDocuments, useReviewDocument, useLawyerDocuments } from "@/hooks/useLawyerDocuments";
import { 
  useAllQuizQuestions, 
  useCreateQuizQuestion, 
  useUpdateQuizQuestion, 
  useDeleteQuizQuestion 
} from "@/hooks/useLawyerQuiz";
import { useAllAssistanceRequests } from "@/hooks/useLegalAssistance";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  useAllNotifications,
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  type Notification
} from "@/hooks/useNotifications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceSettingsCard } from "@/components/PriceSettingsCard";

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
  const deleteSpecType = useDeleteSpecializationType();
  const suspendLawyer = useSuspendLawyer();
  const suspendClient = useSuspendClient();

  // Quiz management hooks
  const { data: quizQuestions = [] } = useAllQuizQuestions();
  const createQuizQuestion = useCreateQuizQuestion();
  const updateQuizQuestion = useUpdateQuizQuestion();
  const deleteQuizQuestion = useDeleteQuizQuestion();

  // Legal assistance requests
  const { data: allAssistanceRequests = [] } = useAllAssistanceRequests();

  // Notification management hooks
  const { data: allNotifications = [] } = useAllNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [addSpecOpen, setAddSpecOpen] = useState(false);
  const [searchLawyer, setSearchLawyer] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [searchConsultation, setSearchConsultation] = useState("");
  const [searchPendingLawyer, setSearchPendingLawyer] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedDocForReject, setSelectedDocForReject] = useState<string | null>(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  
  // Interview dialog state
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedLawyerForInterview, setSelectedLawyerForInterview] = useState<any>(null);
  const [interviewNotes, setInterviewNotes] = useState("");
  
  // Quiz management state
  const [newQuizQuestion, setNewQuizQuestion] = useState("");
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ id: string; question: string } | null>(null);
  const [deleteQuizOpen, setDeleteQuizOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Notification management state
  const [addNotifOpen, setAddNotifOpen] = useState(false);
  const [editNotifOpen, setEditNotifOpen] = useState(false);
  const [deleteNotifOpen, setDeleteNotifOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [deletingNotifId, setDeletingNotifId] = useState<string | null>(null);
  
  // Specialization delete state
  const [deleteSpecOpen, setDeleteSpecOpen] = useState(false);
  const [deletingSpecId, setDeletingSpecId] = useState<string | null>(null);
  
  const [newNotif, setNewNotif] = useState({
    title: "",
    description: "",
    type: "info",
    image_url: "",
    promo_code: "",
    valid_until: "",
    target_audience: "all"
  });

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
          ? "Lawyer berhasil diverifikasi dan sekarang online"
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

  // Quiz management handlers
  const handleAddQuizQuestion = async () => {
    if (!newQuizQuestion.trim()) return;
    try {
      await createQuizQuestion.mutateAsync({ question: newQuizQuestion });
      toast({ title: "Pertanyaan quiz berhasil ditambahkan" });
      setNewQuizQuestion("");
      setAddQuizOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menambahkan pertanyaan",
        variant: "destructive"
      });
    }
  };

  const handleUpdateQuizQuestion = async () => {
    if (!editingQuestion || !editingQuestion.question.trim()) return;
    try {
      await updateQuizQuestion.mutateAsync({
        id: editingQuestion.id,
        question: editingQuestion.question
      });
      toast({ title: "Pertanyaan berhasil diperbarui" });
      setEditingQuestion(null);
      setEditQuizOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat memperbarui pertanyaan",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuizQuestion = async () => {
    if (!deletingQuestionId) return;
    try {
      await deleteQuizQuestion.mutateAsync(deletingQuestionId);
      toast({ title: "Pertanyaan berhasil dihapus" });
      setDeletingQuestionId(null);
      setDeleteQuizOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghapus pertanyaan",
        variant: "destructive"
      });
    }
  };

  const handleToggleQuizActive = async (id: string, currentActive: boolean) => {
    try {
      await updateQuizQuestion.mutateAsync({ id, is_active: !currentActive });
      toast({ 
        title: currentActive ? "Pertanyaan dinonaktifkan" : "Pertanyaan diaktifkan" 
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const openInterviewDialog = (lawyer: any) => {
    setSelectedLawyerForInterview(lawyer);
    setInterviewNotes("");
    setInterviewDialogOpen(true);
  };

  // Specialization delete handler
  const handleDeleteSpecialization = async () => {
    if (!deletingSpecId) return;
    try {
      await deleteSpecType.mutateAsync(deletingSpecId);
      toast({ title: "Jenis konsultasi berhasil dihapus" });
      setDeletingSpecId(null);
      setDeleteSpecOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghapus",
        variant: "destructive"
      });
    }
  };

  // Suspend handlers
  const handleSuspendLawyer = async (lawyerId: string, suspend: boolean) => {
    try {
      await suspendLawyer.mutateAsync({ lawyerId, suspend });
      toast({ 
        title: suspend ? "Lawyer Dinonaktifkan" : "Lawyer Diaktifkan",
        description: suspend ? "Akun lawyer telah dinonaktifkan sementara" : "Akun lawyer telah diaktifkan kembali"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleSuspendClient = async (profileId: string, suspend: boolean) => {
    try {
      await suspendClient.mutateAsync({ profileId, suspend });
      toast({ 
        title: suspend ? "Client Dinonaktifkan" : "Client Diaktifkan",
        description: suspend ? "Akun client telah dinonaktifkan sementara" : "Akun client telah diaktifkan kembali"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  // Notification handlers
  const handleCreateNotification = async () => {
    if (!newNotif.title.trim() || !newNotif.description.trim()) return;
    try {
      await createNotification.mutateAsync({
        title: newNotif.title,
        description: newNotif.description,
        type: newNotif.type,
        image_url: newNotif.image_url || undefined,
        promo_code: newNotif.promo_code || undefined,
        valid_until: newNotif.valid_until || undefined,
        target_audience: newNotif.target_audience
      });
      toast({ title: "Notifikasi berhasil dibuat" });
      setNewNotif({
        title: "",
        description: "",
        type: "info",
        image_url: "",
        promo_code: "",
        valid_until: "",
        target_audience: "all"
      });
      setAddNotifOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat membuat notifikasi",
        variant: "destructive"
      });
    }
  };

  const handleUpdateNotification = async () => {
    if (!editingNotif || !editingNotif.title.trim()) return;
    try {
      await updateNotification.mutateAsync({
        id: editingNotif.id,
        title: editingNotif.title,
        description: editingNotif.description,
        type: editingNotif.type,
        image_url: editingNotif.image_url,
        promo_code: editingNotif.promo_code,
        valid_until: editingNotif.valid_until,
        is_active: editingNotif.is_active,
        target_audience: editingNotif.target_audience
      });
      toast({ title: "Notifikasi berhasil diperbarui" });
      setEditingNotif(null);
      setEditNotifOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async () => {
    if (!deletingNotifId) return;
    try {
      await deleteNotification.mutateAsync(deletingNotifId);
      toast({ title: "Notifikasi berhasil dihapus" });
      setDeletingNotifId(null);
      setDeleteNotifOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleToggleNotifActive = async (notif: Notification) => {
    try {
      await updateNotification.mutateAsync({ id: notif.id, is_active: !notif.is_active });
      toast({ 
        title: notif.is_active ? "Notifikasi dinonaktifkan" : "Notifikasi diaktifkan" 
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const getNotifTypeIcon = (type: string) => {
    switch (type) {
      case "promo": return <Gift className="w-4 h-4" />;
      case "announcement": return <Megaphone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotifTypeLabel = (type: string) => {
    switch (type) {
      case "promo": return "Promo";
      case "announcement": return "Pengumuman";
      default: return "Info";
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
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

  const filteredPendingLawyers = pendingLawyers.filter(l => 
    l.name.toLowerCase().includes(searchPendingLawyer.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchPendingLawyer.toLowerCase())
  );

  const filteredLawyers = approvedLawyers.filter(l => 
    l.name.toLowerCase().includes(searchLawyer.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchLawyer.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchClient.toLowerCase())
  );

  const filteredConsultations = allConsultations.filter(c =>
    c.topic?.toLowerCase().includes(searchConsultation.toLowerCase()) ||
    c.client_profile?.full_name?.toLowerCase().includes(searchConsultation.toLowerCase()) ||
    c.lawyer?.name?.toLowerCase().includes(searchConsultation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setSideMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold">Super Admin</h1>
                <p className="text-primary-foreground/70 text-xs hidden md:block">Legal Connect Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pendingRequestsCount} menunggu
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      <Sheet open={sideMenuOpen} onOpenChange={setSideMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Menu Admin</SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setSideMenuOpen(false); }}>
              <Briefcase className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-3" />
              Keluar
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Lawyer Aktif</p>
                  <p className="text-2xl md:text-3xl font-bold">{approvedLawyers.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Client</p>
                  <p className="text-2xl md:text-3xl font-bold">{clients.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Konsultasi</p>
                  <p className="text-2xl md:text-3xl font-bold">{allConsultations.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
                  <p className="text-lg md:text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Banknote className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {pendingRequestsCount > 0 && (
          <Card className="mb-6 border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{pendingRequestsCount} permintaan menunggu persetujuan</p>
                <p className="text-sm text-muted-foreground">
                  {pendingLawyers.length} pendaftaran lawyer • {pendingDocuments.length} dokumen • {priceRequests.length} perubahan harga
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
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="lawyers" className="text-xs md:text-sm px-3 md:px-4 py-2">
                Lawyer
              </TabsTrigger>
              <TabsTrigger value="clients" className="text-xs md:text-sm px-3 md:px-4 py-2">
                Client
              </TabsTrigger>
              <TabsTrigger value="consultations" className="text-xs md:text-sm px-3 md:px-4 py-2">
                Konsultasi
              </TabsTrigger>
              <TabsTrigger value="assistance" className="text-xs md:text-sm px-3 md:px-4 py-2">
                <Gavel className="w-3 h-3 mr-1" />
                Pendampingan
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm px-3 md:px-4 py-2">
                <Bell className="w-3 h-3 mr-1" />
                Notifikasi
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm px-3 md:px-4 py-2">
                Pengaturan
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Lawyer Registrations */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Pendaftaran Lawyer
                      {pendingLawyers.length > 0 && (
                        <Badge variant="warning">{pendingLawyers.length}</Badge>
                      )}
                    </CardTitle>
                  </div>
                  {pendingLawyers.length > 3 && (
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari lawyer..."
                        value={searchPendingLawyer}
                        onChange={(e) => setSearchPendingLawyer(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingPending ? (
                    <Skeleton className="h-20 w-full" />
                  ) : filteredPendingLawyers.length > 0 ? (
                    filteredPendingLawyers.map((lawyer) => (
                      <div key={lawyer.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={lawyer.image_url || undefined} />
                            <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold truncate">{lawyer.name}</h4>
                                <p className="text-sm text-muted-foreground">{lawyer.location}</p>
                              </div>
                              {lawyer.interview_consent && (
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Bersedia Interview
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(lawyer.specialization || []).slice(0, 3).map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Detail
                              </Button>
                              {lawyer.interview_consent && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => openInterviewDialog(lawyer)}
                                >
                                  <Video className="w-3 h-3 mr-1" />
                                  Interview
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive"
                                onClick={() => handleApprove(lawyer.id, false)}
                                disabled={approveLawyer.isPending}
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Tolak
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs"
                                onClick={() => handleApprove(lawyer.id, true)}
                                disabled={approveLawyer.isPending}
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
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Tidak ada pendaftaran menunggu</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Documents - Separate Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Dokumen Verifikasi
                    {pendingDocuments.length > 0 && (
                      <Badge variant="warning">{pendingDocuments.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingDocuments.length > 0 ? (
                    pendingDocuments.map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={doc.lawyer?.image_url || undefined} />
                            <AvatarFallback>{doc.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h4 className="font-medium">{doc.lawyer?.name}</h4>
                                <p className="text-sm text-muted-foreground">{getDocTypeLabel(doc.document_type)}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs shrink-0"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Lihat
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{doc.file_name}</p>
                            <div className="flex gap-2 mt-3">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs text-destructive"
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
                                variant="default"
                                className="h-8 text-xs"
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
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Tidak ada dokumen menunggu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Price Requests - Full Width */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Permintaan Perubahan Harga
                  {priceRequests.length > 0 && (
                    <Badge variant="warning">{priceRequests.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priceRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {priceRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={request.lawyer?.image_url || undefined} />
                            <AvatarFallback>{request.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{request.lawyer?.name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{request.request_type}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm line-through text-muted-foreground">
                                {formatCurrency(request.current_price)}
                              </span>
                              <span className="text-sm">→</span>
                              <span className="text-sm font-bold text-primary">
                                {formatCurrency(request.requested_price)}
                              </span>
                            </div>
                            {request.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{request.notes}"</p>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive flex-1"
                                onClick={() => handleApprovePriceRequest(request, false)}
                              >
                                Tolak
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs flex-1"
                                onClick={() => handleApprovePriceRequest(request, true)}
                              >
                                Setujui
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada permintaan harga</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lawyers Tab */}
          <TabsContent value="lawyers" className="space-y-4 mt-0">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari lawyer berdasarkan nama atau lokasi..."
                  value={searchLawyer}
                  onChange={(e) => setSearchLawyer(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredLawyers.length} dari {approvedLawyers.length} lawyer
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lawyer</TableHead>
                    <TableHead className="hidden md:table-cell">Lokasi</TableHead>
                    <TableHead className="hidden lg:table-cell">Spesialisasi</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Konsultasi</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Revenue</TableHead>
                    <TableHead className="text-center w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLawyers.map((lawyer) => {
                    const lawyerConsultations = allConsultations.filter(
                      c => c.lawyer_id === lawyer.id && c.status === 'completed'
                    );
                    const revenue = lawyerConsultations.reduce((sum, c) => sum + c.price, 0);
                    
                    return (
                      <TableRow key={lawyer.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={lawyer.image_url || undefined} />
                              <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{lawyer.name}</p>
                              <p className="text-sm text-muted-foreground md:hidden">{lawyer.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{lawyer.location}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(lawyer.specialization || []).slice(0, 2).map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {(lawyer.specialization || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(lawyer.specialization || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{lawyer.rating || 0}</span>
                          <span className="text-muted-foreground text-sm"> ({lawyer.review_count || 0})</span>
                        </TableCell>
                        <TableCell className="text-center">{lawyerConsultations.length}</TableCell>
                        <TableCell className="text-right hidden md:table-cell font-medium">
                          {formatCurrency(revenue)}
                        </TableCell>
                        <TableCell className="text-center">
                          {lawyer.is_suspended ? (
                            <Badge variant="destructive" className="text-xs">
                              Suspended
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">
                              Aktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openInterviewDialog(lawyer)}>
                                <Video className="w-4 h-4 mr-2" />
                                Interview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {lawyer.is_suspended ? (
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={() => handleSuspendLawyer(lawyer.id, false)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan Kembali
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleSuspendLawyer(lawyer.id, true)}
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend Akun
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredLawyers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Tidak ada lawyer ditemukan</p>
              </div>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4 mt-0">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari client berdasarkan nama atau email..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredClients.length} dari {clients.length} client
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-center">Konsultasi</TableHead>
                    <TableHead className="text-center">Akun</TableHead>
                    <TableHead className="text-right">Bergabung</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const clientConsultations = allConsultations.filter(
                      c => c.client_id === client.user_id
                    );
                    
                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={client.avatar_url || undefined} />
                              <AvatarFallback>{client.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{client.full_name || 'Anonim'}</p>
                              <p className="text-sm text-muted-foreground md:hidden">{client.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {client.email}
                        </TableCell>
                        <TableCell className="text-center">{clientConsultations.length}</TableCell>
                        <TableCell className="text-center">
                          {client.is_suspended ? (
                            <Badge variant="destructive" className="text-xs">
                              Suspended
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">
                              Aktif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {client.is_suspended ? (
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={() => handleSuspendClient(client.id, false)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan Kembali
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleSuspendClient(client.id, true)}
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend Akun
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Tidak ada client ditemukan</p>
              </div>
            )}
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations" className="space-y-4 mt-0">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan topik, client, atau lawyer..."
                  value={searchConsultation}
                  onChange={(e) => setSearchConsultation(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredConsultations.length} dari {allConsultations.length} konsultasi
              </p>
            </div>

            {loadingConsultations ? (
              <Skeleton className="h-24 w-full" />
            ) : filteredConsultations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredConsultations.slice(0, 30).map((consultation) => (
                  <Card 
                    key={consultation.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/admin/consultation/${consultation.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {consultation.client_profile?.full_name || 'Anonim'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            → {consultation.lawyer?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            consultation.status === 'completed' ? 'success' :
                            consultation.status === 'active' ? 'accent' :
                            consultation.status === 'pending' ? 'warning' : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {consultation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{consultation.topic}</p>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{formatCurrency(consultation.price)}</span>
                        <span className="text-muted-foreground">
                          {new Date(consultation.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Tidak ada konsultasi ditemukan</p>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-0">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Kelola Notifikasi</h3>
                <p className="text-sm text-muted-foreground">Buat promo, pengumuman, atau info untuk pengguna</p>
              </div>
              <Dialog open={addNotifOpen} onOpenChange={setAddNotifOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Notifikasi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Buat Notifikasi Baru</DialogTitle>
                    <DialogDescription>
                      Notifikasi akan dikirim ke semua pengguna sesuai target audience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={newNotif.type} onValueChange={(v) => setNewNotif({...newNotif, type: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Info
                              </div>
                            </SelectItem>
                            <SelectItem value="promo">
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                Promo
                              </div>
                            </SelectItem>
                            <SelectItem value="announcement">
                              <div className="flex items-center gap-2">
                                <Megaphone className="w-4 h-4" />
                                Pengumuman
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target</Label>
                        <Select value={newNotif.target_audience} onValueChange={(v) => setNewNotif({...newNotif, target_audience: v})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Pengguna</SelectItem>
                            <SelectItem value="clients">Client Only</SelectItem>
                            <SelectItem value="lawyers">Lawyer Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Judul *</Label>
                      <Input
                        value={newNotif.title}
                        onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
                        placeholder="Contoh: Diskon 50% Konsultasi Pertama!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi *</Label>
                      <Textarea
                        value={newNotif.description}
                        onChange={(e) => setNewNotif({...newNotif, description: e.target.value})}
                        placeholder="Deskripsi lengkap notifikasi..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Gambar (Opsional)</Label>
                      <Input
                        value={newNotif.image_url}
                        onChange={(e) => setNewNotif({...newNotif, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {newNotif.type === 'promo' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Kode Promo</Label>
                          <Input
                            value={newNotif.promo_code}
                            onChange={(e) => setNewNotif({...newNotif, promo_code: e.target.value})}
                            placeholder="NEWUSER50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Berlaku Sampai</Label>
                          <Input
                            type="date"
                            value={newNotif.valid_until}
                            onChange={(e) => setNewNotif({...newNotif, valid_until: e.target.value})}
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleCreateNotification}
                      disabled={createNotification.isPending || !newNotif.title.trim() || !newNotif.description.trim()}
                    >
                      Buat Notifikasi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {allNotifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allNotifications.map((notif) => (
                  <Card key={notif.id} className={`${!notif.is_active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notif.type === 'promo' ? 'bg-green-500/10 text-green-600' :
                            notif.type === 'announcement' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-gray-500/10 text-gray-600'
                          }`}>
                            {getNotifTypeIcon(notif.type)}
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {getNotifTypeLabel(notif.type)}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingNotif(notif);
                              setEditNotifOpen(true);
                            }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleNotifActive(notif)}>
                              {notif.is_active ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setDeletingNotifId(notif.id);
                                setDeleteNotifOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h4 className="font-semibold mb-1 line-clamp-1">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{notif.description}</p>
                      
                      {notif.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden h-24 bg-muted">
                          <img src={notif.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {notif.promo_code && (
                        <div className="mb-2 p-2 bg-primary/10 rounded-lg text-center">
                          <span className="text-xs text-muted-foreground">Kode: </span>
                          <span className="font-bold text-primary">{notif.promo_code}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{notif.target_audience === 'all' ? 'Semua' : notif.target_audience}</span>
                        <span>{new Date(notif.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      
                      {!notif.is_active && (
                        <Badge variant="secondary" className="mt-2">Nonaktif</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Belum ada notifikasi</p>
                <p className="text-sm text-muted-foreground">Buat notifikasi pertama untuk pengguna</p>
              </div>
            )}
          </TabsContent>

          {/* Assistance Tab */}
          <TabsContent value="assistance" className="space-y-6 mt-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Pendampingan Hukum
                    <Badge variant="secondary">{allAssistanceRequests.length}</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {allAssistanceRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Lawyer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Akun</TableHead>
                        <TableHead>Tahap</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAssistanceRequests.map((req) => (
                        <TableRow 
                          key={req.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/admin/assistance/${req.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={req.client?.avatar_url || undefined} />
                                <AvatarFallback>{req.client?.full_name?.[0] || 'C'}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{req.client?.full_name || 'Client'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={req.lawyer?.image_url || undefined} />
                                <AvatarFallback>{req.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{req.lawyer?.name || 'Lawyer'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              req.status === 'completed' ? 'secondary' :
                              req.status === 'in_progress' ? 'default' :
                              req.status === 'agreed' ? 'success' :
                              req.status === 'negotiating' ? 'accent' :
                              req.status === 'cancelled' || req.status === 'rejected' ? 'destructive' : 'warning'
                            }>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {req.current_stage || '-'}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {req.agreed_price ? `Rp ${req.agreed_price.toLocaleString('id-ID')}` : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada pendampingan hukum</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Settings */}
              <PriceSettingsCard />
              
              {/* Specialization Types */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Jenis Konsultasi</CardTitle>
                    <Dialog open={addSpecOpen} onOpenChange={setAddSpecOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-1" />
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
                  <div className="space-y-2">
                    {specializationTypes.map((spec) => (
                      <div 
                        key={spec.id} 
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={spec.is_active ? "secondary" : "outline"}>
                            {spec.name}
                          </Badge>
                          {spec.description && (
                            <span className="text-xs text-muted-foreground">{spec.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={spec.is_active}
                            onCheckedChange={() => updateSpecType.mutate({ id: spec.id, is_active: !spec.is_active })}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              setDeletingSpecId(spec.id);
                              setDeleteSpecOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Toggle untuk aktifkan/nonaktifkan. Hapus untuk menghapus permanen.
                  </p>
                </CardContent>
              </Card>

              {/* Platform Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Statistik Platform
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Lawyer</span>
                    <span className="font-medium">{allLawyers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lawyer Aktif</span>
                    <span className="font-medium">{approvedLawyers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Menunggu Approval</span>
                    <span className="font-medium">{pendingLawyers.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Client</span>
                    <span className="font-medium">{clients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Konsultasi</span>
                    <span className="font-medium">{allConsultations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Konsultasi Selesai</span>
                    <span className="font-medium">
                      {allConsultations.filter(c => c.status === 'completed').length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Questions Management */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Pertanyaan Quiz Lawyer
                    <Badge variant="secondary">{quizQuestions.length}</Badge>
                  </CardTitle>
                  <Dialog open={addQuizOpen} onOpenChange={setAddQuizOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Pertanyaan Quiz</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Pertanyaan</Label>
                          <Textarea
                            value={newQuizQuestion}
                            onChange={(e) => setNewQuizQuestion(e.target.value)}
                            placeholder="Masukkan pertanyaan untuk calon lawyer..."
                            rows={3}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleAddQuizQuestion}
                          disabled={createQuizQuestion.isPending || !newQuizQuestion.trim()}
                        >
                          Simpan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quizQuestions.length > 0 ? (
                    quizQuestions.map((q, index) => (
                      <div 
                        key={q.id} 
                        className={`p-4 border rounded-lg ${!q.is_active ? 'opacity-50 bg-muted/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{q.question}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={q.is_active}
                                  onCheckedChange={() => handleToggleQuizActive(q.id, q.is_active)}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {q.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </div>
                              <div className="flex gap-1 ml-auto">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingQuestion({ id: q.id, question: q.question });
                                    setEditQuizOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => {
                                    setDeletingQuestionId(q.id);
                                    setDeleteQuizOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Belum ada pertanyaan quiz</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Pertanyaan quiz akan ditampilkan kepada lawyer saat mendaftar
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Interview Lawyer
            </DialogTitle>
            <DialogDescription>
              Jadwalkan atau lakukan interview dengan calon lawyer
            </DialogDescription>
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
                <Textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Catatan tentang interview, pertanyaan yang ingin ditanyakan, dll."
                  rows={3}
                />
              </div>

              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Pilih Metode Interview:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Video className="w-5 h-5" />
                    <span className="text-xs">Video Call</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Phone className="w-5 h-5" />
                    <span className="text-xs">Phone Call</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => {
              toast({ title: "Fitur interview sedang dalam pengembangan" });
              setInterviewDialogOpen(false);
            }}>
              <Calendar className="w-4 h-4 mr-2" />
              Jadwalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Question Dialog */}
      <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pertanyaan Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Textarea
                value={editingQuestion?.question || ''}
                onChange={(e) => setEditingQuestion(prev => 
                  prev ? { ...prev, question: e.target.value } : null
                )}
                placeholder="Masukkan pertanyaan..."
                rows={3}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateQuizQuestion}
              disabled={updateQuizQuestion.isPending || !editingQuestion?.question.trim()}
            >
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz Question Confirmation */}
      <AlertDialog open={deleteQuizOpen} onOpenChange={setDeleteQuizOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Pertanyaan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuizQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Notification Dialog */}
      <Dialog open={editNotifOpen} onOpenChange={setEditNotifOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notifikasi</DialogTitle>
          </DialogHeader>
          {editingNotif && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select 
                    value={editingNotif.type} 
                    onValueChange={(v) => setEditingNotif({...editingNotif, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                      <SelectItem value="announcement">Pengumuman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Select 
                    value={editingNotif.target_audience} 
                    onValueChange={(v) => setEditingNotif({...editingNotif, target_audience: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pengguna</SelectItem>
                      <SelectItem value="clients">Client Only</SelectItem>
                      <SelectItem value="lawyers">Lawyer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  value={editingNotif.title}
                  onChange={(e) => setEditingNotif({...editingNotif, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={editingNotif.description}
                  onChange={(e) => setEditingNotif({...editingNotif, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Gambar</Label>
                <Input
                  value={editingNotif.image_url || ''}
                  onChange={(e) => setEditingNotif({...editingNotif, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {editingNotif.type === 'promo' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kode Promo</Label>
                    <Input
                      value={editingNotif.promo_code || ''}
                      onChange={(e) => setEditingNotif({...editingNotif, promo_code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Berlaku Sampai</Label>
                    <Input
                      type="date"
                      value={editingNotif.valid_until?.split('T')[0] || ''}
                      onChange={(e) => setEditingNotif({...editingNotif, valid_until: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingNotif.is_active}
                  onCheckedChange={(v) => setEditingNotif({...editingNotif, is_active: v})}
                />
                <Label>Notifikasi Aktif</Label>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateNotification}
                disabled={updateNotification.isPending || !editingNotif.title.trim()}
              >
                Simpan Perubahan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Notification Confirmation */}
      <AlertDialog open={deleteNotifOpen} onOpenChange={setDeleteNotifOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Notifikasi ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotification}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Specialization Confirmation */}
      <AlertDialog open={deleteSpecOpen} onOpenChange={setDeleteSpecOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis Konsultasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Jenis konsultasi ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpecialization}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
