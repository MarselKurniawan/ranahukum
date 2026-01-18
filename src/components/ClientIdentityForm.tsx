import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, User, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ClientIdentityFormProps {
  onSubmit: (data: ClientIdentityData) => Promise<void>;
  initialData?: Partial<ClientIdentityData>;
  isSubmitting?: boolean;
  isVerified?: boolean;
}

export interface ClientIdentityData {
  client_name: string;
  client_address: string;
  client_age: number;
  client_religion: string;
  client_nik: string;
  case_type: string;
}

const RELIGION_OPTIONS = [
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya"
];

const CASE_TYPE_OPTIONS = [
  "Perdata",
  "Pidana",
  "Perceraian",
  "Waris",
  "Sengketa Tanah",
  "Ketenagakerjaan",
  "Perlindungan Konsumen",
  "Hak Kekayaan Intelektual",
  "Lainnya"
];

export function ClientIdentityForm({ 
  onSubmit, 
  initialData, 
  isSubmitting = false,
  isVerified = false
}: ClientIdentityFormProps) {
  const [formData, setFormData] = useState<ClientIdentityData>({
    client_name: initialData?.client_name || "",
    client_address: initialData?.client_address || "",
    client_age: initialData?.client_age || 0,
    client_religion: initialData?.client_religion || "",
    client_nik: initialData?.client_nik || "",
    case_type: initialData?.case_type || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!formData.client_address.trim()) {
      toast.error("Alamat wajib diisi");
      return;
    }
    if (!formData.client_age || formData.client_age < 17) {
      toast.error("Umur minimal 17 tahun");
      return;
    }
    if (!formData.client_religion) {
      toast.error("Agama wajib diisi");
      return;
    }
    if (!formData.client_nik || formData.client_nik.length !== 16) {
      toast.error("NIK harus 16 digit");
      return;
    }
    if (!formData.case_type) {
      toast.error("Jenis perkara wajib diisi");
      return;
    }

    await onSubmit(formData);
  };

  if (isVerified) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-success">Identitas Terverifikasi</p>
              <p className="text-xs text-muted-foreground">
                Data identitas Anda sudah diverifikasi untuk Surat Kuasa
              </p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium">{initialData?.client_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NIK</p>
              <p className="font-medium">{initialData?.client_nik}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Umur</p>
              <p className="font-medium">{initialData?.client_age} tahun</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agama</p>
              <p className="font-medium">{initialData?.client_religion}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Alamat</p>
              <p className="font-medium">{initialData?.client_address}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Jenis Perkara</p>
              <p className="font-medium">{initialData?.case_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Verifikasi Identitas Client</CardTitle>
        </div>
        <CardDescription>
          Data ini diperlukan untuk pembuatan Surat Kuasa
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Pastikan data sesuai dengan KTP. Data ini akan digunakan untuk Surat Kuasa resmi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Nama Lengkap (sesuai KTP) *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_nik">NIK (16 digit) *</Label>
            <Input
              id="client_nik"
              value={formData.client_nik}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                setFormData(prev => ({ ...prev, client_nik: value }));
              }}
              placeholder="3501234567890123"
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client_age">Umur *</Label>
              <Input
                id="client_age"
                type="number"
                value={formData.client_age || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, client_age: parseInt(e.target.value) || 0 }))}
                placeholder="25"
                min={17}
                max={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_religion">Agama *</Label>
              <Select
                value={formData.client_religion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_religion: value }))}
              >
                <SelectTrigger id="client_religion">
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_address">Alamat Lengkap (sesuai KTP) *</Label>
            <Input
              id="client_address"
              value={formData.client_address}
              onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
              placeholder="Jl. Contoh No. 123, Kota, Provinsi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case_type">Jenis Perkara *</Label>
            <Select
              value={formData.case_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, case_type: value }))}
            >
              <SelectTrigger id="case_type">
                <SelectValue placeholder="Pilih jenis perkara" />
              </SelectTrigger>
              <SelectContent>
                {CASE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            variant="gradient"
            disabled={isSubmitting}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan & Verifikasi Identitas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
