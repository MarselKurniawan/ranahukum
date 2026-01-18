import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Camera, Upload, CheckCircle, FileSignature, Image, 
  AlertTriangle, Loader2, X, Eye 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MeetingEvidenceFormProps {
  requestId: string;
  lawyerId: string;
  onSubmit: (evidenceUrl: string, signatureUrl: string) => Promise<void>;
  initialData?: {
    meeting_evidence_url?: string;
    meeting_signature_url?: string;
  };
  isSubmitting?: boolean;
  isVerified?: boolean;
}

export function MeetingEvidenceForm({ 
  requestId,
  lawyerId,
  onSubmit, 
  initialData, 
  isSubmitting = false,
  isVerified = false
}: MeetingEvidenceFormProps) {
  const [evidencePreview, setEvidencePreview] = useState<string | null>(initialData?.meeting_evidence_url || null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(initialData?.meeting_signature_url || null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'evidence' | 'signature'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    
    if (type === 'evidence') {
      setEvidenceFile(file);
      setEvidencePreview(preview);
    } else {
      setSignatureFile(file);
      setSignaturePreview(preview);
    }
  };

  const uploadFile = async (file: File, type: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lawyerId}/${requestId}/${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('legal-assistance-docs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('legal-assistance-docs')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!evidenceFile && !evidencePreview) {
      toast.error("Bukti pertemuan wajib diupload");
      return;
    }
    if (!signatureFile && !signaturePreview) {
      toast.error("Tanda tangan basah wajib diupload");
      return;
    }

    setUploading(true);
    try {
      let evidenceUrl = evidencePreview || "";
      let signatureUrl = signaturePreview || "";

      if (evidenceFile) {
        evidenceUrl = await uploadFile(evidenceFile, 'evidence');
      }
      if (signatureFile) {
        signatureUrl = await uploadFile(signatureFile, 'signature');
      }

      await onSubmit(evidenceUrl, signatureUrl);
      toast.success("Bukti pertemuan berhasil diunggah");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah bukti");
    } finally {
      setUploading(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-success">Pertemuan Terverifikasi</p>
              <p className="text-xs text-muted-foreground">
                Bukti pertemuan dan tanda tangan sudah diverifikasi
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {initialData?.meeting_evidence_url && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bukti Pertemuan</p>
                <a 
                  href={initialData.meeting_evidence_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={initialData.meeting_evidence_url} 
                    alt="Bukti Pertemuan" 
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                </a>
              </div>
            )}
            {initialData?.meeting_signature_url && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tanda Tangan</p>
                <a 
                  href={initialData.meeting_signature_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={initialData.meeting_signature_url} 
                    alt="Tanda Tangan" 
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Bukti Pertemuan</CardTitle>
        </div>
        <CardDescription>
          Upload bukti foto pertemuan dan tanda tangan basah client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            <strong>WAJIB</strong> upload bukti pertemuan sebelum bisa menarik dana. 
            Pastikan foto jelas dan tanda tangan terlihat dengan baik.
          </p>
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Image className="w-4 h-4" />
            Foto Bukti Pertemuan *
          </p>
          <input
            ref={evidenceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'evidence')}
          />
          
          {evidencePreview ? (
            <div className="relative">
              <img 
                src={evidencePreview} 
                alt="Bukti Pertemuan Preview" 
                className="w-full h-40 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8"
                onClick={() => {
                  setEvidenceFile(null);
                  setEvidencePreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => evidenceInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tap untuk upload foto pertemuan
              </span>
            </button>
          )}
        </div>

        {/* Signature Upload */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Foto Tanda Tangan Basah Client *
          </p>
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'signature')}
          />
          
          {signaturePreview ? (
            <div className="relative">
              <img 
                src={signaturePreview} 
                alt="Tanda Tangan Preview" 
                className="w-full h-40 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-8 h-8"
                onClick={() => {
                  setSignatureFile(null);
                  setSignaturePreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signatureInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <FileSignature className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tap untuk upload tanda tangan basah
              </span>
            </button>
          )}
        </div>

        <Button 
          className="w-full" 
          variant="gradient"
          onClick={handleSubmit}
          disabled={uploading || isSubmitting || (!evidenceFile && !evidencePreview) || (!signatureFile && !signaturePreview)}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Bukti Pertemuan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
