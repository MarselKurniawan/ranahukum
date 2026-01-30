import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, Clock, MessageCircle, TrendingUp,
  LogOut, ChevronRight, Banknote, UserCheck, UserX,
  Plus, FileText, AlertCircle, Briefcase, Eye, Search,
  Filter, X, HelpCircle, Pencil, Trash2, Video, Phone,
  Calendar, Mail, ExternalLink, MoreHorizontal, Menu,
  Bell, Gift, Megaphone, Info, Image, Gavel, Award
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
  usePendingCredentials, 
  useReviewCertification, 
  useReviewLicense 
} from "@/hooks/useLawyerCredentials";
import {
  useAllQuizQuestions, 
  useCreateQuizQuestion, 
  useUpdateQuizQuestion, 
  useDeleteQuizQuestion,
  useQuizCategories,
  type QuizQuestion
} from "@/hooks/useLawyerQuiz";
import { QuizQuestionForm } from "@/components/QuizQuestionForm";
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
import { PlatformFeeSettingsCard } from "@/components/PlatformFeeSettingsCard";
import { VoiceCallFeeSettingsCard } from "@/components/VoiceCallFeeSettingsCard";
import { ConsultationPriceSettingsCard } from "@/components/ConsultationPriceSettingsCard";
import { SuspendDialog } from "@/components/SuspendDialog";
import { useCreateInterviewSession, useAllInterviewSessions } from "@/hooks/useInterviewChat";
import {
  useAllPendampinganRequests,
  useAllPendampinganInterviews,
  useSchedulePendampinganInterview,
  useApprovePendampingan,
  useCompletePendampinganInterview,
  useCancelPendampinganInterview
} from "@/hooks/usePendampinganRequest";
import {
  useAllFaceToFaceRequests,
  useApproveFaceToFaceActivation
} from "@/hooks/useFaceToFaceActivation";

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
  const { data: quizCategories = [] } = useQuizCategories();
  const createQuizQuestion = useCreateQuizQuestion();
  const updateQuizQuestion = useUpdateQuizQuestion();
  const deleteQuizQuestion = useDeleteQuizQuestion();

  // Legal assistance requests
  const { data: allAssistanceRequests = [] } = useAllAssistanceRequests();

  // Pendampingan activation requests
  const { data: pendampinganRequests = [] } = useAllPendampinganRequests();
  const { data: pendampinganInterviews = [] } = useAllPendampinganInterviews();
  const schedulePendampinganInterview = useSchedulePendampinganInterview();
  const approvePendampingan = useApprovePendampingan();
  const completePendampinganInterview = useCompletePendampinganInterview();
  const cancelPendampinganInterview = useCancelPendampinganInterview();

  // Face-to-face activation requests
  const { data: faceToFaceRequests = [] } = useAllFaceToFaceRequests();
  const approveFaceToFace = useApproveFaceToFaceActivation();

  // Notification management hooks
  const { data: allNotifications = [] } = useAllNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();

  // Credentials review hooks
  const { data: pendingCredentials } = usePendingCredentials();
  const reviewCertification = useReviewCertification();
  const reviewLicense = useReviewLicense();

  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [addSpecOpen, setAddSpecOpen] = useState(false);
  const [searchLawyer, setSearchLawyer] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [searchConsultation, setSearchConsultation] = useState("");
  const [searchPendingLawyer, setSearchPendingLawyer] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedDocForReject, setSelectedDocForReject] = useState<string | null>(null);
  const [selectedCredentialForReject, setSelectedCredentialForReject] = useState<{ type: 'cert' | 'license'; id: string } | null>(null);
  const [credentialRejectNotes, setCredentialRejectNotes] = useState("");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  
  // Interview dialog state
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [selectedLawyerForInterview, setSelectedLawyerForInterview] = useState<any>(null);
  const [interviewNotes, setInterviewNotes] = useState("");
  
  // Quiz management state
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [editQuizOpen, setEditQuizOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
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

  // Suspend dialog state
  const [suspendLawyerDialogOpen, setSuspendLawyerDialogOpen] = useState(false);
  const [suspendClientDialogOpen, setSuspendClientDialogOpen] = useState(false);
  const [selectedLawyerForSuspend, setSelectedLawyerForSuspend] = useState<any>(null);
  const [selectedClientForSuspend, setSelectedClientForSuspend] = useState<any>(null);

  // Interview hooks
  const createInterview = useCreateInterviewSession();
  const { data: interviewSessions = [] } = useAllInterviewSessions();
  
  // Pendampingan interview scheduling state
  const [pendampinganScheduleOpen, setPendampinganScheduleOpen] = useState(false);
  const [selectedLawyerForPendampingan, setSelectedLawyerForPendampingan] = useState<any>(null);
  const [pendampinganSchedule, setPendampinganSchedule] = useState({
    date: "",
    time: "",
    notes: "",
    meetLink: ""
  });
  
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
        approve
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
  const handleAddQuizQuestion = async (data: {
    question: string;
    question_type: 'essay' | 'multiple_choice';
    category: string;
    options?: { label: string; text: string; is_correct: boolean }[];
  }) => {
    try {
      await createQuizQuestion.mutateAsync({
        question: data.question,
        question_type: data.question_type,
        category: data.category || undefined,
        options: data.options
      });
      toast({ title: "Pertanyaan quiz berhasil ditambahkan" });
      setAddQuizOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menambahkan pertanyaan",
        variant: "destructive"
      });
    }
  };

  const handleUpdateQuizQuestion = async (data: {
    question: string;
    question_type: 'essay' | 'multiple_choice';
    category: string;
    options?: { label: string; text: string; is_correct: boolean }[];
  }) => {
    if (!editingQuestion) return;
    try {
      await updateQuizQuestion.mutateAsync({
        id: editingQuestion.id,
        question: data.question,
        question_type: data.question_type,
        category: data.category || null,
        options: data.options
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

  // Suspend handlers with duration
  const handleSuspendLawyer = async (durationMinutes: number, reason: string) => {
    if (!selectedLawyerForSuspend) return;
    try {
      await suspendLawyer.mutateAsync({ 
        lawyerId: selectedLawyerForSuspend.id, 
        suspend: true,
        durationMinutes,
        reason
      });
      toast({ 
        title: "Lawyer Dinonaktifkan",
        description: `Akun akan ditangguhkan selama ${durationMinutes} menit`
      });
      setSuspendLawyerDialogOpen(false);
      setSelectedLawyerForSuspend(null);
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleUnsuspendLawyer = async (lawyerId: string) => {
    try {
      await suspendLawyer.mutateAsync({ lawyerId, suspend: false });
      toast({ title: "Lawyer Diaktifkan Kembali" });
    } catch (error) {
      toast({ title: "Gagal", variant: "destructive" });
    }
  };

  const handleSuspendClient = async (durationMinutes: number, reason: string) => {
    if (!selectedClientForSuspend) return;
    try {
      await suspendClient.mutateAsync({ 
        profileId: selectedClientForSuspend.id, 
        suspend: true,
        durationMinutes,
        reason
      });
      toast({ 
        title: "Client Dinonaktifkan",
        description: `Akun akan ditangguhkan selama ${durationMinutes} menit`
      });
      setSuspendClientDialogOpen(false);
      setSelectedClientForSuspend(null);
    } catch (error) {
      toast({ title: "Gagal", variant: "destructive" });
    }
  };

  const handleUnsuspendClient = async (profileId: string) => {
    try {
      await suspendClient.mutateAsync({ profileId, suspend: false });
      toast({ title: "Client Diaktifkan Kembali" });
    } catch (error) {
      toast({ title: "Gagal", variant: "destructive" });
    }
  };

  // Start interview chat
  const handleStartInterview = async (lawyer: any) => {
    try {
      const session = await createInterview.mutateAsync({ 
        lawyerId: lawyer.id,
        notes: interviewNotes 
      });
      toast({ title: "Sesi interview dimulai" });
      setInterviewDialogOpen(false);
      navigate(`/admin/interview/${session.id}`);
    } catch (error) {
      toast({ title: "Gagal memulai interview", variant: "destructive" });
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

  const pendingCredentialsCount = (pendingCredentials?.certifications?.length || 0) + (pendingCredentials?.licenses?.length || 0);
  const pendingRequestsCount = pendingLawyers.length + priceRequests.length + pendingDocuments.length + pendampinganRequests.length + pendingCredentialsCount;

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
        {/* Quick Stats - Corporate Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="border-primary/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Lawyer Aktif</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{approvedLawyers.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Client</p>
                  <p className="text-2xl md:text-3xl font-bold text-accent">{clients.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Konsultasi</p>
                  <p className="text-2xl md:text-3xl font-bold text-success">{allConsultations.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-warning/20 shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
                  <p className="text-lg md:text-2xl font-bold text-warning">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Banknote className="w-5 h-5 md:w-6 md:h-6 text-warning" />
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

            {/* Pendampingan Activation Requests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Permintaan Aktivasi Pendampingan
                  {pendampinganRequests.length > 0 && (
                    <Badge variant="warning">{pendampinganRequests.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendampinganRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendampinganRequests.map((lawyer: any) => (
                      <div key={lawyer.id} className="p-4 border rounded-lg">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={lawyer.image_url || undefined} />
                            <AvatarFallback>{lawyer.name?.[0] || 'L'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{lawyer.name}</h4>
                            <p className="text-xs text-muted-foreground">{lawyer.location}</p>
                            <Badge 
                              variant={lawyer.pendampingan_status === 'pending' ? 'warning' : 'accent'} 
                              className="text-[10px] mt-2"
                            >
                              {lawyer.pendampingan_status === 'pending' ? 'Menunggu Review' : 'Interview Dijadwalkan'}
                            </Badge>
                            {lawyer.pendampingan_requested_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Diajukan: {new Date(lawyer.pendampingan_requested_at).toLocaleDateString('id-ID')}
                              </p>
                            )}
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
                              {lawyer.pendampingan_status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      setSelectedLawyerForPendampingan(lawyer);
                                      setPendampinganSchedule({ date: "", time: "", notes: "", meetLink: "" });
                                      setPendampinganScheduleOpen(true);
                                    }}
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Jadwalkan Interview
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs text-destructive"
                                    onClick={() => approvePendampingan.mutate({ lawyerId: lawyer.id, approve: false })}
                                    disabled={approvePendampingan.isPending}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Tolak
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 text-xs"
                                    onClick={() => approvePendampingan.mutate({ lawyerId: lawyer.id, approve: true })}
                                    disabled={approvePendampingan.isPending}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Setujui Langsung
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada permintaan aktivasi pendampingan</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Face-to-Face Activation Requests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Permintaan Aktivasi Tatap Muka
                  {faceToFaceRequests.length > 0 && (
                    <Badge variant="warning">{faceToFaceRequests.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {faceToFaceRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {faceToFaceRequests.map((lawyer: any) => (
                      <div key={lawyer.id} className="p-4 border rounded-lg">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={lawyer.image_url || undefined} />
                            <AvatarFallback>{lawyer.name?.[0] || 'L'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{lawyer.name}</h4>
                            <p className="text-xs text-muted-foreground">{lawyer.location}</p>
                            <Badge variant="warning" className="text-[10px] mt-2">
                              Menunggu Review
                            </Badge>
                            {lawyer.face_to_face_requested_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Diajukan: {new Date(lawyer.face_to_face_requested_at).toLocaleDateString('id-ID')}
                              </p>
                            )}
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive"
                                onClick={() => approveFaceToFace.mutate({ lawyerId: lawyer.id, approve: false })}
                                disabled={approveFaceToFace.isPending}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Tolak
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs"
                                onClick={() => approveFaceToFace.mutate({ lawyerId: lawyer.id, approve: true })}
                                disabled={approveFaceToFace.isPending}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
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
                    <p className="text-sm text-muted-foreground">Tidak ada permintaan aktivasi tatap muka</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Pendampingan Interviews */}
            {pendampinganInterviews.filter(i => i.status === 'scheduled').length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Interview Pendampingan Terjadwal
                    <Badge variant="accent">
                      {pendampinganInterviews.filter(i => i.status === 'scheduled').length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendampinganInterviews
                      .filter(i => i.status === 'scheduled')
                      .map((interview) => (
                        <div key={interview.id} className="p-4 border rounded-lg border-accent/30 bg-accent/5">
                          <div className="flex gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={interview.lawyer?.image_url || undefined} />
                              <AvatarFallback>{interview.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{interview.lawyer?.name}</h4>
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(interview.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{interview.scheduled_time}</span>
                              </div>
                              {interview.google_meet_link && (
                                <a 
                                  href={interview.google_meet_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Google Meet
                                </a>
                              )}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => navigate(`/admin/pendampingan-chat/${interview.id}`)}
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Chat
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs text-destructive"
                                  onClick={() => cancelPendampinganInterview.mutate({ 
                                    interviewId: interview.id, 
                                    lawyerId: interview.lawyer_id 
                                  })}
                                  disabled={cancelPendampinganInterview.isPending}
                                >
                                  Batalkan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs text-destructive"
                                  onClick={() => completePendampinganInterview.mutate({ 
                                    interviewId: interview.id, 
                                    lawyerId: interview.lawyer_id,
                                    approve: false
                                  })}
                                  disabled={completePendampinganInterview.isPending}
                                >
                                  Tolak
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8 text-xs"
                                  onClick={() => completePendampinganInterview.mutate({ 
                                    interviewId: interview.id, 
                                    lawyerId: interview.lawyer_id,
                                    approve: true
                                  })}
                                  disabled={completePendampinganInterview.isPending}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Setujui
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Credentials (Certifications & Licenses) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Sertifikasi & Lisensi Menunggu Review
                  {pendingCredentialsCount > 0 && (
                    <Badge variant="warning">{pendingCredentialsCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingCredentialsCount > 0 ? (
                  <div className="space-y-6">
                    {/* Pending Certifications */}
                    {pendingCredentials?.certifications && pendingCredentials.certifications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Sertifikasi ({pendingCredentials.certifications.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pendingCredentials.certifications.map((cert: any) => (
                            <div key={cert.id} className="p-4 border rounded-lg">
                              <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={cert.lawyer?.image_url || undefined} />
                                  <AvatarFallback>{cert.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm">{cert.name}</h5>
                                  <p className="text-xs text-muted-foreground">{cert.lawyer?.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {cert.issuer && `${cert.issuer} • `}{cert.year || '-'}
                                  </p>
                                  {cert.file_url && (
                                    <a 
                                      href={cert.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                    >
                                      <FileText className="w-3 h-3" />
                                      Lihat Dokumen
                                    </a>
                                  )}
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs text-destructive flex-1"
                                      onClick={() => {
                                        setSelectedCredentialForReject({ type: 'cert', id: cert.id });
                                        setCredentialRejectNotes("");
                                      }}
                                    >
                                      Tolak
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 text-xs flex-1"
                                      onClick={() => reviewCertification.mutate({ id: cert.id, approve: true })}
                                      disabled={reviewCertification.isPending}
                                    >
                                      Setujui
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending Licenses */}
                    {pendingCredentials?.licenses && pendingCredentials.licenses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Lisensi ({pendingCredentials.licenses.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pendingCredentials.licenses.map((license: any) => (
                            <div key={license.id} className="p-4 border rounded-lg">
                              <div className="flex gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={license.lawyer?.image_url || undefined} />
                                  <AvatarFallback>{license.lawyer?.name?.[0] || 'L'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm">{license.name}</h5>
                                  <p className="text-xs text-muted-foreground">{license.lawyer?.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {license.license_number && `No. ${license.license_number}`}
                                    {license.issuer && ` • ${license.issuer}`}
                                  </p>
                                  {license.file_url && (
                                    <a 
                                      href={license.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                    >
                                      <FileText className="w-3 h-3" />
                                      Lihat Dokumen
                                    </a>
                                  )}
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs text-destructive flex-1"
                                      onClick={() => {
                                        setSelectedCredentialForReject({ type: 'license', id: license.id });
                                        setCredentialRejectNotes("");
                                      }}
                                    >
                                      Tolak
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-7 text-xs flex-1"
                                      onClick={() => reviewLicense.mutate({ id: license.id, approve: true })}
                                      disabled={reviewLicense.isPending}
                                    >
                                      Setujui
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Tidak ada sertifikasi/lisensi menunggu review</p>
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
                                  onClick={() => handleUnsuspendLawyer(lawyer.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan Kembali
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedLawyerForSuspend(lawyer);
                                    setSuspendLawyerDialogOpen(true);
                                  }}
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
                                  onClick={() => handleUnsuspendClient(client.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan Kembali
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedClientForSuspend(client);
                                    setSuspendClientDialogOpen(true);
                                  }}
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
              {/* Consultation Package Pricing */}
              <ConsultationPriceSettingsCard />
              
              {/* Price Settings */}
              <PriceSettingsCard />
              
              {/* Voice Call Fee Settings */}
              <VoiceCallFeeSettingsCard />
              
              {/* Platform Fee Chat */}
              <PlatformFeeSettingsCard
                settingKey="platform_fee_chat"
                title="Biaya Platform Chat"
                description="Biaya platform untuk konsultasi chat (masuk ke admin)"
              />
              
              {/* Platform Fee Pendampingan */}
              <PlatformFeeSettingsCard
                settingKey="platform_fee_pendampingan"
                title="Biaya Platform Pendampingan"
                description="Biaya platform untuk pendampingan hukum (masuk ke admin)"
              />
              
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
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Pertanyaan Quiz</DialogTitle>
                      </DialogHeader>
                      <QuizQuestionForm
                        onSubmit={handleAddQuizQuestion}
                        isPending={createQuizQuestion.isPending}
                        categories={quizCategories}
                      />
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
                            {q.category && (
                              <Badge variant="outline" className="text-xs mb-1 mr-1">
                                {q.category}
                              </Badge>
                            )}
                            <Badge variant={q.question_type === 'multiple_choice' ? 'default' : 'secondary'} className="text-xs mb-1">
                              {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                            </Badge>
                            <p className="text-sm line-clamp-2 mt-1">{q.question}</p>
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
                                    setEditingQuestion(q);
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

              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Chat Interview:</strong> Mulai chat dengan lawyer untuk berdiskusi mengenai jadwal interview dan pertanyaan verifikasi.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => handleStartInterview(selectedLawyerForInterview)}
              disabled={createInterview.isPending}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {createInterview.isPending ? 'Memulai...' : 'Mulai Chat Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pendampingan Interview Schedule Dialog */}
      <Dialog open={pendampinganScheduleOpen} onOpenChange={setPendampinganScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jadwalkan Interview Pendampingan
            </DialogTitle>
            <DialogDescription>
              Tentukan jadwal interview untuk aktivasi layanan pendampingan
            </DialogDescription>
          </DialogHeader>
          {selectedLawyerForPendampingan && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedLawyerForPendampingan.image_url || undefined} />
                  <AvatarFallback>{selectedLawyerForPendampingan.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedLawyerForPendampingan.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedLawyerForPendampingan.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Interview</Label>
                  <Input
                    type="date"
                    value={pendampinganSchedule.date}
                    onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Waktu Interview</Label>
                  <Select 
                    value={pendampinganSchedule.time} 
                    onValueChange={(v) => setPendampinganSchedule(prev => ({ ...prev, time: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 WIB</SelectItem>
                      <SelectItem value="10:00">10:00 WIB</SelectItem>
                      <SelectItem value="11:00">11:00 WIB</SelectItem>
                      <SelectItem value="13:00">13:00 WIB</SelectItem>
                      <SelectItem value="14:00">14:00 WIB</SelectItem>
                      <SelectItem value="15:00">15:00 WIB</SelectItem>
                      <SelectItem value="16:00">16:00 WIB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link Google Meet (Opsional)</Label>
                <Input
                  value={pendampinganSchedule.meetLink}
                  onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, meetLink: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxx-xxx"
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea
                  value={pendampinganSchedule.notes}
                  onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan untuk interview..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendampinganScheduleOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedLawyerForPendampingan || !pendampinganSchedule.date || !pendampinganSchedule.time) return;
                try {
                  await schedulePendampinganInterview.mutateAsync({
                    lawyerId: selectedLawyerForPendampingan.id,
                    scheduledDate: pendampinganSchedule.date,
                    scheduledTime: pendampinganSchedule.time,
                    notes: pendampinganSchedule.notes || undefined,
                    googleMeetLink: pendampinganSchedule.meetLink || undefined
                  });
                  toast({ title: "Interview berhasil dijadwalkan" });
                  setPendampinganScheduleOpen(false);
                } catch (error) {
                  toast({ title: "Gagal menjadwalkan interview", variant: "destructive" });
                }
              }}
              disabled={schedulePendampinganInterview.isPending || !pendampinganSchedule.date || !pendampinganSchedule.time}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {schedulePendampinganInterview.isPending ? 'Menjadwalkan...' : 'Jadwalkan Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editQuizOpen} onOpenChange={setEditQuizOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pertanyaan Quiz</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <QuizQuestionForm
              initialData={editingQuestion}
              onSubmit={handleUpdateQuizQuestion}
              isPending={updateQuizQuestion.isPending}
              categories={quizCategories}
            />
          )}
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

      {/* Suspend Lawyer Dialog */}
      <SuspendDialog
        open={suspendLawyerDialogOpen}
        onOpenChange={setSuspendLawyerDialogOpen}
        onConfirm={handleSuspendLawyer}
        userName={selectedLawyerForSuspend?.name || ''}
        userType="lawyer"
        isPending={suspendLawyer.isPending}
      />

      {/* Suspend Client Dialog */}
      <SuspendDialog
        open={suspendClientDialogOpen}
        onOpenChange={setSuspendClientDialogOpen}
        onConfirm={handleSuspendClient}
        userName={selectedClientForSuspend?.full_name || 'Client'}
        userType="client"
        isPending={suspendClient.isPending}
      />

      {/* Reject Credential Dialog */}
      <Dialog 
        open={!!selectedCredentialForReject} 
        onOpenChange={(open) => !open && setSelectedCredentialForReject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak {selectedCredentialForReject?.type === 'cert' ? 'Sertifikasi' : 'Lisensi'}</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar lawyer dapat memperbaiki pengajuannya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catatan Penolakan</Label>
              <Textarea
                value={credentialRejectNotes}
                onChange={(e) => setCredentialRejectNotes(e.target.value)}
                placeholder="Contoh: Dokumen tidak jelas, harap upload ulang dengan kualitas yang lebih baik"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCredentialForReject(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedCredentialForReject?.type === 'cert') {
                  reviewCertification.mutate({ 
                    id: selectedCredentialForReject.id, 
                    approve: false,
                    notes: credentialRejectNotes 
                  });
                } else if (selectedCredentialForReject?.type === 'license') {
                  reviewLicense.mutate({ 
                    id: selectedCredentialForReject.id, 
                    approve: false,
                    notes: credentialRejectNotes 
                  });
                }
                setSelectedCredentialForReject(null);
                setCredentialRejectNotes("");
              }}
              disabled={reviewCertification.isPending || reviewLicense.isPending}
            >
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
