import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Upload, FileText, CheckCircle, XCircle, 
  Clock, Loader2, Eye, Trash2, AlertCircle
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { useLawyerDocuments, useUploadLawyerDocument } from "@/hooks/useLawyerDocuments";
import { useToast } from "@/hooks/use-toast";

const DOCUMENT_TYPES = [
  { 
    id: 'ijazah', 
    label: 'Ijazah S1 Hukum', 
    description: 'Scan ijazah sarjana hukum',
    icon: '🎓'
  },
  { 
    id: 'surat_izin', 
    label: 'Surat Izin Praktik', 
    description: 'Kartu PERADI atau surat izin beracara',
    icon: '📜'
  },
  { 
    id: 'ktp', 
    label: 'KTP', 
    description: 'Kartu Tanda Penduduk',
    icon: '🪪'
  },
  { 
    id: 'foto', 
    label: 'Pas Foto', 
    description: 'Pas foto formal 3x4 atau 4x6',
    icon: '📷'
  },
];

export default function LawyerDocuments() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useLawyerProfile();
  const { data: documents = [], isLoading: loadingDocs } = useLawyerDocuments();
  const uploadDocument = useUploadLawyerDocument();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleFileSelect = (type: string) => {
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran maksimal file adalah 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipe file tidak didukung",
        description: "Gunakan format JPG, PNG, atau PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file,
        documentType: selectedType
      });
      toast({
        title: "Berhasil",
        description: "Dokumen berhasil diunggah dan menunggu verifikasi"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengunggah dokumen",
        variant: "destructive"
      });
    } finally {
      setSelectedType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDocumentByType = (type: string) => {
    return documents.find(d => d.document_type === type);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px]"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="warning" className="text-[10px]"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
    }
  };

  const allDocsUploaded = DOCUMENT_TYPES.every(type => 
    documents.some(d => d.document_type === type.id)
  );

  const approvedDocsCount = documents.filter(d => d.status === 'approved').length;

  if (authLoading || loadingProfile) {
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
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Dokumen Verifikasi</h1>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Progress Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm">Progress Dokumen</p>
                <p className="text-xs text-muted-foreground">
                  {approvedDocsCount} dari {DOCUMENT_TYPES.length} dokumen disetujui
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${(approvedDocsCount / DOCUMENT_TYPES.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        {!allDocsUploaded && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Lengkapi Dokumen</p>
                <p className="text-xs text-muted-foreground">
                  Unggah semua dokumen yang diperlukan untuk proses verifikasi akun lawyer Anda.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Types */}
        <div className="space-y-3">
          {DOCUMENT_TYPES.map((type) => {
            const existingDoc = getDocumentByType(type.id);
            const isUploading = uploadDocument.isPending && selectedType === type.id;

            return (
              <Card key={type.id} className={existingDoc ? 'border-muted' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-sm">{type.label}</h3>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        {existingDoc && getStatusBadge(existingDoc.status)}
                      </div>

                      {existingDoc ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{existingDoc.file_name}</span>
                          </div>
                          {existingDoc.notes && existingDoc.status === 'rejected' && (
                            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                              {existingDoc.notes}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => window.open(existingDoc.file_url, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Lihat
                            </Button>
                            {existingDoc.status !== 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => handleFileSelect(type.id)}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-3 h-3 mr-1" />
                                    Ganti
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="gradient"
                          className="mt-3 h-8 text-xs"
                          onClick={() => handleFileSelect(type.id)}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Mengunggah...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-1" />
                              Unggah Dokumen
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Format yang diterima:</strong> JPG, PNG, PDF (maks. 5MB)<br />
              <strong>Waktu review:</strong> 1-3 hari kerja
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
