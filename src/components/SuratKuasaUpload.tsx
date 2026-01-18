import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, Upload, CheckCircle, Download, 
  AlertTriangle, Loader2, X, Eye, ExternalLink 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface SuratKuasaUploadProps {
  requestId: string;
  lawyerId: string;
  onSubmit: (url: string) => Promise<void>;
  suratKuasaUrl?: string | null;
  uploadedAt?: string | null;
  isSubmitting?: boolean;
  isLawyer?: boolean;
  clientIdentity?: {
    client_name?: string;
    client_nik?: string;
    case_type?: string;
  };
}

export function SuratKuasaUpload({ 
  requestId,
  lawyerId,
  onSubmit,
  suratKuasaUrl,
  uploadedAt,
  isSubmitting = false,
  isLawyer = false,
  clientIdentity
}: SuratKuasaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Hanya file PDF atau gambar yang diizinkan");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file Surat Kuasa terlebih dahulu");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${lawyerId}/${requestId}/surat_kuasa_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('legal-assistance-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('legal-assistance-docs')
        .getPublicUrl(fileName);

      await onSubmit(data.publicUrl);
      toast.success("Surat Kuasa berhasil diunggah");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah Surat Kuasa");
    } finally {
      setUploading(false);
    }
  };

  // If Surat Kuasa already uploaded
  if (suratKuasaUrl) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-success">Surat Kuasa Tersedia</p>
              <p className="text-xs text-muted-foreground">
                {uploadedAt && `Diunggah ${format(new Date(uploadedAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}`}
              </p>
            </div>
          </div>
          
          <a 
            href={suratKuasaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            Lihat Surat Kuasa
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>
    );
  }

  // Client view - waiting for lawyer
  if (!isLawyer) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Menunggu lawyer mengirim Surat Kuasa
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Surat Kuasa akan dikirim setelah identitas Anda diverifikasi
          </p>
        </CardContent>
      </Card>
    );
  }

  // Lawyer view - upload form
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Upload Surat Kuasa</CardTitle>
        </div>
        <CardDescription>
          Kirim Surat Kuasa ke client berdasarkan data identitas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Identity Preview */}
        {clientIdentity?.client_name && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Data Client:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nama:</span>
                <p className="font-medium">{clientIdentity.client_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">NIK:</span>
                <p className="font-medium">{clientIdentity.client_nik}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Perkara:</span>
                <p className="font-medium">{clientIdentity.case_type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Pastikan Surat Kuasa sudah lengkap dan sesuai dengan data identitas client.
          </p>
        </div>

        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {file ? (
          <div className="border rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Tap untuk upload Surat Kuasa (PDF/Gambar)
            </span>
          </button>
        )}

        <Button 
          className="w-full" 
          variant="gradient"
          onClick={handleUpload}
          disabled={uploading || isSubmitting || !file}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Kirim Surat Kuasa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
