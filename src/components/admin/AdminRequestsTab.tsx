import { useState } from "react";
import {
  UserCheck, UserX, CheckCircle, FileText, Banknote, Gavel,
  Users, Search, X, Eye, Video, Phone, ExternalLink, Calendar,
  Clock, MessageCircle, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApproveLawyer } from "@/hooks/useSuperAdmin";
import { useAllPriceRequests, useApprovePriceRequest } from "@/hooks/useLawyerPriceRequests";
import { usePendingDocuments, useReviewDocument } from "@/hooks/useLawyerDocuments";
import {
  usePendingCredentials,
  useReviewCertification,
  useReviewLicense
} from "@/hooks/useLawyerCredentials";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DbLawyer } from "@/hooks/useLawyers";

interface AdminRequestsTabProps {
  pendingLawyers: DbLawyer[];
  loadingPending: boolean;
  onOpenInterview: (lawyer: any) => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
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

export function AdminRequestsTab({ pendingLawyers, loadingPending, onOpenInterview }: AdminRequestsTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const approveLawyer = useApproveLawyer();
  const { data: priceRequests = [] } = useAllPriceRequests();
  const { data: pendingDocuments = [] } = usePendingDocuments();
  const { data: pendingCredentials } = usePendingCredentials();
  const reviewDocument = useReviewDocument();
  const reviewCertification = useReviewCertification();
  const reviewLicense = useReviewLicense();
  const approvePriceRequest = useApprovePriceRequest();
  const { data: pendampinganRequests = [] } = useAllPendampinganRequests();
  const { data: pendampinganInterviews = [] } = useAllPendampinganInterviews();
  const schedulePendampinganInterview = useSchedulePendampinganInterview();
  const approvePendampingan = useApprovePendampingan();
  const completePendampinganInterview = useCompletePendampinganInterview();
  const cancelPendampinganInterview = useCancelPendampinganInterview();
  const { data: faceToFaceRequests = [] } = useAllFaceToFaceRequests();
  const approveFaceToFace = useApproveFaceToFaceActivation();

  const [searchPendingLawyer, setSearchPendingLawyer] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [selectedDocForReject, setSelectedDocForReject] = useState<string | null>(null);
  const [selectedCredentialForReject, setSelectedCredentialForReject] = useState<{ type: 'cert' | 'license'; id: string } | null>(null);
  const [credentialRejectNotes, setCredentialRejectNotes] = useState("");

  // Pendampingan scheduling
  const [pendampinganScheduleOpen, setPendampinganScheduleOpen] = useState(false);
  const [selectedLawyerForPendampingan, setSelectedLawyerForPendampingan] = useState<any>(null);
  const [pendampinganSchedule, setPendampinganSchedule] = useState({ date: "", time: "", notes: "", meetLink: "" });

  const pendingCredentialsCount = (pendingCredentials?.certifications?.length || 0) + (pendingCredentials?.licenses?.length || 0);

  const handleApprove = async (lawyerId: string, approve: boolean) => {
    try {
      await approveLawyer.mutateAsync({ lawyerId, approve });
      toast({ title: approve ? "Lawyer Disetujui" : "Lawyer Ditolak" });
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleApprovePriceRequest = async (request: any, approve: boolean) => {
    try {
      await approvePriceRequest.mutateAsync({ requestId: request.id, approve });
      toast({ title: approve ? "Permintaan Disetujui" : "Permintaan Ditolak" });
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const handleReviewDocument = async (docId: string, approve: boolean, notes?: string) => {
    try {
      await reviewDocument.mutateAsync({ documentId: docId, approve, notes });
      toast({ title: approve ? "Dokumen Disetujui" : "Dokumen Ditolak" });
      setSelectedDocForReject(null);
      setRejectNotes("");
    } catch { toast({ title: "Gagal", variant: "destructive" }); }
  };

  const filteredPendingLawyers = pendingLawyers.filter(l =>
    l.name.toLowerCase().includes(searchPendingLawyer.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchPendingLawyer.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Lawyer Registrations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Pendaftaran Lawyer
                {pendingLawyers.length > 0 && <Badge variant="warning">{pendingLawyers.length}</Badge>}
              </CardTitle>
            </div>
            {pendingLawyers.length > 3 && (
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari lawyer..." value={searchPendingLawyer} onChange={(e) => setSearchPendingLawyer(e.target.value)} className="pl-9 h-9" />
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {loadingPending ? <Skeleton className="h-20 w-full" /> : filteredPendingLawyers.length > 0 ? (
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
                            <Phone className="w-3 h-3 mr-1" />Bersedia Interview
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(lawyer.specialization || []).slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}>
                          <Eye className="w-3 h-3 mr-1" />Detail
                        </Button>
                        {lawyer.interview_consent && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onOpenInterview(lawyer)}>
                            <Video className="w-3 h-3 mr-1" />Interview
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => handleApprove(lawyer.id, false)} disabled={approveLawyer.isPending}>
                          <UserX className="w-3 h-3 mr-1" />Tolak
                        </Button>
                        <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => handleApprove(lawyer.id, true)} disabled={approveLawyer.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Setujui
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

        {/* Pending Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dokumen Verifikasi
              {pendingDocuments.length > 0 && <Badge variant="warning">{pendingDocuments.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {pendingDocuments.length > 0 ? pendingDocuments.map((doc) => (
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
                      <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={() => window.open(doc.file_url, '_blank')}>
                        <ExternalLink className="w-3 h-3 mr-1" />Lihat
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{doc.file_name}</p>
                    <div className="flex gap-2 mt-3">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => setSelectedDocForReject(doc.id)}>
                            <X className="w-3 h-3 mr-1" />Tolak
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl">
                          <SheetHeader><SheetTitle>Tolak Dokumen</SheetTitle></SheetHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Alasan Penolakan</Label>
                              <Textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} placeholder="Contoh: Dokumen tidak jelas, perlu scan ulang" rows={3} />
                            </div>
                            <Button variant="destructive" className="w-full" onClick={() => handleReviewDocument(doc.id, false, rejectNotes)} disabled={reviewDocument.isPending}>
                              Konfirmasi Tolak
                            </Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => handleReviewDocument(doc.id, true)} disabled={reviewDocument.isPending}>
                        <CheckCircle className="w-3 h-3 mr-1" />Setujui
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-success/50 mb-2" />
                <p className="text-sm text-muted-foreground">Tidak ada dokumen menunggu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Permintaan Perubahan Harga
            {priceRequests.length > 0 && <Badge variant="warning">{priceRequests.length}</Badge>}
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
                        <span className="text-sm line-through text-muted-foreground">{formatCurrency(request.current_price)}</span>
                        <span className="text-sm">→</span>
                        <span className="text-sm font-bold text-primary">{formatCurrency(request.requested_price)}</span>
                      </div>
                      {request.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{request.notes}"</p>}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive flex-1" onClick={() => handleApprovePriceRequest(request, false)}>Tolak</Button>
                        <Button size="sm" variant="default" className="h-8 text-xs flex-1" onClick={() => handleApprovePriceRequest(request, true)}>Setujui</Button>
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
            {pendampinganRequests.length > 0 && <Badge variant="warning">{pendampinganRequests.length}</Badge>}
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
                      <Badge variant={lawyer.pendampingan_status === 'pending' ? 'warning' : 'accent'} className="text-[10px] mt-2">
                        {lawyer.pendampingan_status === 'pending' ? 'Menunggu Review' : 'Interview Dijadwalkan'}
                      </Badge>
                      {lawyer.pendampingan_requested_at && (
                        <p className="text-xs text-muted-foreground mt-1">Diajukan: {new Date(lawyer.pendampingan_requested_at).toLocaleDateString('id-ID')}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}>
                          <Eye className="w-3 h-3 mr-1" />Detail
                        </Button>
                        {lawyer.pendampingan_status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                              setSelectedLawyerForPendampingan(lawyer);
                              setPendampinganSchedule({ date: "", time: "", notes: "", meetLink: "" });
                              setPendampinganScheduleOpen(true);
                            }}>
                              <Calendar className="w-3 h-3 mr-1" />Jadwalkan Interview
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => approvePendampingan.mutate({ lawyerId: lawyer.id, approve: false })} disabled={approvePendampingan.isPending}>
                              <X className="w-3 h-3 mr-1" />Tolak
                            </Button>
                            <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => approvePendampingan.mutate({ lawyerId: lawyer.id, approve: true })} disabled={approvePendampingan.isPending}>
                              <CheckCircle className="w-3 h-3 mr-1" />Setujui Langsung
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

      {/* Face-to-Face Activation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Permintaan Aktivasi Tatap Muka
            {faceToFaceRequests.length > 0 && <Badge variant="warning">{faceToFaceRequests.length}</Badge>}
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
                      <Badge variant="warning" className="text-[10px] mt-2">Menunggu Review</Badge>
                      {lawyer.face_to_face_requested_at && (
                        <p className="text-xs text-muted-foreground mt-1">Diajukan: {new Date(lawyer.face_to_face_requested_at).toLocaleDateString('id-ID')}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/admin/lawyer/${lawyer.id}`)}>
                          <Eye className="w-3 h-3 mr-1" />Detail
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => approveFaceToFace.mutate({ lawyerId: lawyer.id, approve: false })} disabled={approveFaceToFace.isPending}>
                          <X className="w-3 h-3 mr-1" />Tolak
                        </Button>
                        <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => approveFaceToFace.mutate({ lawyerId: lawyer.id, approve: true })} disabled={approveFaceToFace.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Setujui
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
              <Badge variant="accent">{pendampinganInterviews.filter(i => i.status === 'scheduled').length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendampinganInterviews.filter(i => i.status === 'scheduled').map((interview) => (
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
                        <a href={interview.google_meet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-1">
                          <ExternalLink className="w-3 h-3" />Google Meet
                        </a>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/admin/pendampingan-chat/${interview.id}`)}>
                          <MessageCircle className="w-3 h-3 mr-1" />Chat
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => cancelPendampinganInterview.mutate({ interviewId: interview.id, lawyerId: interview.lawyer_id })} disabled={cancelPendampinganInterview.isPending}>
                          Batalkan
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => completePendampinganInterview.mutate({ interviewId: interview.id, lawyerId: interview.lawyer_id, approve: false })} disabled={completePendampinganInterview.isPending}>
                          Tolak
                        </Button>
                        <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => completePendampinganInterview.mutate({ interviewId: interview.id, lawyerId: interview.lawyer_id, approve: true })} disabled={completePendampinganInterview.isPending}>
                          <CheckCircle className="w-3 h-3 mr-1" />Setujui
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

      {/* Pending Credentials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5" />
            Sertifikasi & Lisensi Menunggu Review
            {pendingCredentialsCount > 0 && <Badge variant="warning">{pendingCredentialsCount}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCredentialsCount > 0 ? (
            <div className="space-y-6">
              {pendingCredentials?.certifications && pendingCredentials.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />Sertifikasi ({pendingCredentials.certifications.length})
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
                            <p className="text-xs text-muted-foreground mt-1">{cert.issuer && `${cert.issuer} • `}{cert.year || '-'}</p>
                            {cert.file_url && (
                              <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                <FileText className="w-3 h-3" />Lihat Dokumen
                              </a>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive flex-1" onClick={() => { setSelectedCredentialForReject({ type: 'cert', id: cert.id }); setCredentialRejectNotes(""); }}>Tolak</Button>
                              <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={() => reviewCertification.mutate({ id: cert.id, approve: true })} disabled={reviewCertification.isPending}>Setujui</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingCredentials?.licenses && pendingCredentials.licenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />Lisensi ({pendingCredentials.licenses.length})
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
                            <p className="text-xs text-muted-foreground mt-1">{license.license_number && `No. ${license.license_number}`}{license.issuer && ` • ${license.issuer}`}</p>
                            {license.file_url && (
                              <a href={license.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                <FileText className="w-3 h-3" />Lihat Dokumen
                              </a>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive flex-1" onClick={() => { setSelectedCredentialForReject({ type: 'license', id: license.id }); setCredentialRejectNotes(""); }}>Tolak</Button>
                              <Button size="sm" variant="default" className="h-7 text-xs flex-1" onClick={() => reviewLicense.mutate({ id: license.id, approve: true })} disabled={reviewLicense.isPending}>Setujui</Button>
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

      {/* Pendampingan Interview Schedule Dialog */}
      <Dialog open={pendampinganScheduleOpen} onOpenChange={setPendampinganScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />Jadwalkan Interview Pendampingan
            </DialogTitle>
            <DialogDescription>Tentukan jadwal interview untuk aktivasi layanan pendampingan</DialogDescription>
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
                  <Input type="date" value={pendampinganSchedule.date} onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Waktu Interview</Label>
                  <Select value={pendampinganSchedule.time} onValueChange={(v) => setPendampinganSchedule(prev => ({ ...prev, time: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih waktu" /></SelectTrigger>
                    <SelectContent>
                      {["09:00","10:00","11:00","13:00","14:00","15:00","16:00"].map(t => (
                        <SelectItem key={t} value={t}>{t} WIB</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link Google Meet (Opsional)</Label>
                <Input value={pendampinganSchedule.meetLink} onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, meetLink: e.target.value }))} placeholder="https://meet.google.com/xxx-xxx-xxx" />
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea value={pendampinganSchedule.notes} onChange={(e) => setPendampinganSchedule(prev => ({ ...prev, notes: e.target.value }))} placeholder="Catatan untuk interview..." rows={2} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendampinganScheduleOpen(false)}>Batal</Button>
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
                } catch { toast({ title: "Gagal menjadwalkan interview", variant: "destructive" }); }
              }}
              disabled={schedulePendampinganInterview.isPending || !pendampinganSchedule.date || !pendampinganSchedule.time}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {schedulePendampinganInterview.isPending ? 'Menjadwalkan...' : 'Jadwalkan Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Credential Dialog */}
      <Dialog open={!!selectedCredentialForReject} onOpenChange={(open) => !open && setSelectedCredentialForReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak {selectedCredentialForReject?.type === 'cert' ? 'Sertifikasi' : 'Lisensi'}</DialogTitle>
            <DialogDescription>Berikan alasan penolakan agar lawyer dapat memperbaiki pengajuannya.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catatan Penolakan</Label>
              <Textarea value={credentialRejectNotes} onChange={(e) => setCredentialRejectNotes(e.target.value)} placeholder="Contoh: Dokumen tidak jelas, harap upload ulang dengan kualitas yang lebih baik" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCredentialForReject(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedCredentialForReject?.type === 'cert') {
                reviewCertification.mutate({ id: selectedCredentialForReject.id, approve: false, notes: credentialRejectNotes });
              } else if (selectedCredentialForReject?.type === 'license') {
                reviewLicense.mutate({ id: selectedCredentialForReject.id, approve: false, notes: credentialRejectNotes });
              }
              setSelectedCredentialForReject(null);
              setCredentialRejectNotes("");
            }} disabled={reviewCertification.isPending || reviewLicense.isPending}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
