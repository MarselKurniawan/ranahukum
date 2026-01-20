import { useState, useRef, useEffect } from "react";
import { Plus, Upload, FileText, Award, Loader2, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { 
  useLawyerCertifications, 
  useLawyerLicenses, 
  useAddCertification,
  useAddLicense,
  useDeleteCertification,
  useDeleteLicense
} from "@/hooks/useLawyerCredentials";
import { useLawyerProfile, useUpdateLawyerProfile } from "@/hooks/useLawyerProfile";

export function LawyerCredentialsForm() {
  const { toast } = useToast();
  const { data: profile, isLoading: loadingProfile } = useLawyerProfile();
  const updateProfile = useUpdateLawyerProfile();
  const { data: certifications = [], isLoading: loadingCerts } = useLawyerCertifications();
  const { data: licenses = [], isLoading: loadingLicenses } = useLawyerLicenses();
  const addCertification = useAddCertification();
  const addLicense = useAddLicense();

  const deleteCertification = useDeleteCertification();
  const deleteLicense = useDeleteLicense();

  const [bio, setBio] = useState("");
  const [bioInitialized, setBioInitialized] = useState(false);

  // Sync bio state when profile loads
  useEffect(() => {
    if (profile && !bioInitialized) {
      setBio(profile.bio || "");
      setBioInitialized(true);
    }
  }, [profile, bioInitialized]);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'cert' | 'license'; id: string; name: string } | null>(null);
  const certFileRef = useRef<HTMLInputElement>(null);
  const licenseFileRef = useRef<HTMLInputElement>(null);

  // Certification form state
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    year: new Date().getFullYear(),
    file: null as File | null
  });

  // License form state
  const [licenseForm, setLicenseForm] = useState({
    name: "",
    license_number: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    file: null as File | null
  });

  const handleSaveBio = async () => {
    try {
      await updateProfile.mutateAsync({ bio });
      toast({ title: "Biografi berhasil disimpan" });
    } catch (error) {
      toast({ title: "Gagal menyimpan biografi", variant: "destructive" });
    }
  };

  const handleAddCertification = async () => {
    if (!certForm.name) {
      toast({ title: "Nama sertifikasi wajib diisi", variant: "destructive" });
      return;
    }

    try {
      await addCertification.mutateAsync({
        name: certForm.name,
        issuer: certForm.issuer || undefined,
        year: certForm.year || undefined,
        file: certForm.file || undefined
      });
      toast({ title: "Sertifikasi berhasil ditambahkan" });
      setShowCertDialog(false);
      setCertForm({ name: "", issuer: "", year: new Date().getFullYear(), file: null });
    } catch (error) {
      toast({ title: "Gagal menambah sertifikasi", variant: "destructive" });
    }
  };

  const handleAddLicense = async () => {
    if (!licenseForm.name) {
      toast({ title: "Nama lisensi wajib diisi", variant: "destructive" });
      return;
    }

    try {
      await addLicense.mutateAsync({
        name: licenseForm.name,
        license_number: licenseForm.license_number || undefined,
        issuer: licenseForm.issuer || undefined,
        issue_date: licenseForm.issue_date || undefined,
        expiry_date: licenseForm.expiry_date || undefined,
        file: licenseForm.file || undefined
      });
      toast({ title: "Lisensi berhasil ditambahkan" });
      setShowLicenseDialog(false);
      setLicenseForm({ name: "", license_number: "", issuer: "", issue_date: "", expiry_date: "", file: null });
    } catch (error) {
      toast({ title: "Gagal menambah lisensi", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="border-success text-success"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
    }
  };

  const canDelete = (status: string) => status === 'pending' || status === 'rejected';

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      if (deletingItem.type === 'cert') {
        await deleteCertification.mutateAsync(deletingItem.id);
      } else {
        await deleteLicense.mutateAsync(deletingItem.id);
      }
      toast({ title: `${deletingItem.type === 'cert' ? 'Sertifikasi' : 'Lisensi'} berhasil dihapus` });
    } catch (error) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Biografi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan tentang pengalaman dan keahlian hukum Anda..."
            rows={4}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveBio}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Simpan Biografi
          </Button>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Sertifikasi</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowCertDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingCerts ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada sertifikasi</p>
          ) : (
            certifications.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Award className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cert.issuer && `${cert.issuer} • `}{cert.year || '-'}
                  </p>
                  {cert.notes && cert.status === 'rejected' && (
                    <p className="text-xs text-destructive mt-1">Catatan: {cert.notes}</p>
                  )}
                </div>
                {getStatusBadge(cert.status)}
                {canDelete(cert.status) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeletingItem({ type: 'cert', id: cert.id, name: cert.name });
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Licenses */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Lisensi</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowLicenseDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingLicenses ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : licenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada lisensi</p>
          ) : (
            licenses.map((license) => (
              <div key={license.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{license.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {license.license_number && `No. ${license.license_number}`}
                    {license.file_name && ` • ${license.file_name}`}
                  </p>
                  {license.notes && license.status === 'rejected' && (
                    <p className="text-xs text-destructive mt-1">Catatan: {license.notes}</p>
                  )}
                </div>
                {getStatusBadge(license.status)}
                {canDelete(license.status) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeletingItem({ type: 'license', id: license.id, name: license.name });
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Certification Dialog */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Sertifikasi</DialogTitle>
            <DialogDescription>
              Sertifikasi akan diverifikasi oleh admin sebelum ditampilkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Sertifikasi *</Label>
              <Input
                value={certForm.name}
                onChange={(e) => setCertForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: PKPA (Pendidikan Khusus Profesi Advokat)"
              />
            </div>
            <div className="space-y-2">
              <Label>Lembaga Penerbit</Label>
              <Input
                value={certForm.issuer}
                onChange={(e) => setCertForm(f => ({ ...f, issuer: e.target.value }))}
                placeholder="Contoh: PERADI"
              />
            </div>
            <div className="space-y-2">
              <Label>Tahun</Label>
              <Input
                type="number"
                value={certForm.year}
                onChange={(e) => setCertForm(f => ({ ...f, year: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>File Sertifikat (Opsional)</Label>
              <input
                ref={certFileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setCertForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => certFileRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {certForm.file ? certForm.file.name : 'Upload File'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleAddCertification}
              disabled={addCertification.isPending}
            >
              {addCertification.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add License Dialog */}
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Lisensi</DialogTitle>
            <DialogDescription>
              Lisensi akan diverifikasi oleh admin sebelum ditampilkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Lisensi *</Label>
              <Input
                value={licenseForm.name}
                onChange={(e) => setLicenseForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Lisensi Advokat"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Lisensi</Label>
              <Input
                value={licenseForm.license_number}
                onChange={(e) => setLicenseForm(f => ({ ...f, license_number: e.target.value }))}
                placeholder="Contoh: 123/ADV/2020"
              />
            </div>
            <div className="space-y-2">
              <Label>Lembaga Penerbit</Label>
              <Input
                value={licenseForm.issuer}
                onChange={(e) => setLicenseForm(f => ({ ...f, issuer: e.target.value }))}
                placeholder="Contoh: PERADI"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tanggal Terbit</Label>
                <Input
                  type="date"
                  value={licenseForm.issue_date}
                  onChange={(e) => setLicenseForm(f => ({ ...f, issue_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Berakhir</Label>
                <Input
                  type="date"
                  value={licenseForm.expiry_date}
                  onChange={(e) => setLicenseForm(f => ({ ...f, expiry_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>File Lisensi (Opsional)</Label>
              <input
                ref={licenseFileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setLicenseForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => licenseFileRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {licenseForm.file ? licenseForm.file.name : 'Upload File'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLicenseDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleAddLicense}
              disabled={addLicense.isPending}
            >
              {addLicense.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deletingItem?.type === 'cert' ? 'Sertifikasi' : 'Lisensi'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus "{deletingItem?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {(deleteCertification.isPending || deleteLicense.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
