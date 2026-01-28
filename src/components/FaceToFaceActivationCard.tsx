import { useState } from "react";
import { Users, Clock, CheckCircle, XCircle, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  useLawyerFaceToFaceStatus, 
  useRequestFaceToFaceActivation,
  getRemainingCooldown,
  canRequestAgain
} from "@/hooks/useFaceToFaceActivation";
import { useToast } from "@/hooks/use-toast";

export function FaceToFaceActivationCard() {
  const { data: status, isLoading } = useLawyerFaceToFaceStatus();
  const requestActivation = useRequestFaceToFaceActivation();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRequestActivation = async () => {
    try {
      await requestActivation.mutateAsync();
      toast({
        title: "Permintaan Terkirim",
        description: "Permintaan aktivasi layanan tatap muka telah dikirim ke admin"
      });
      setConfirmOpen(false);
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Already enabled
  if (status?.face_to_face_enabled) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Layanan Tatap Muka
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Layanan Aktif</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Layanan tatap muka sudah aktif. Klien dapat mengajukan permintaan tatap muka kepada Anda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending approval
  if (status?.face_to_face_status === 'pending') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Layanan Tatap Muka
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Menunggu Persetujuan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Permintaan aktivasi layanan tatap muka sedang ditinjau oleh admin. Mohon tunggu.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected with cooldown
  const isRejected = status?.face_to_face_status === 'rejected';
  const rejectionCount = status?.face_to_face_rejection_count || 0;
  const rejectedAt = status?.face_to_face_rejected_at || null;
  const canRequest = isRejected ? canRequestAgain(rejectedAt, rejectionCount) : true;
  const remainingCooldown = getRemainingCooldown(rejectedAt, rejectionCount);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Layanan Tatap Muka
          {isRejected && (
            <Badge variant="destructive" className="text-xs">Ditolak</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRejected && !canRequest && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Permintaan Ditolak</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Anda dapat mengajukan kembali dalam {remainingCooldown}
            </p>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Aktifkan layanan tatap muka untuk menerima permintaan konsultasi langsung dari klien.
            Setelah diaktifkan, Anda dapat mengatur harga dan menerima permintaan tatap muka.
          </p>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="gradient" 
              className="w-full"
              disabled={!canRequest}
            >
              <Send className="w-4 h-4 mr-2" />
              {isRejected && canRequest ? 'Ajukan Kembali' : 'Ajukan Aktivasi'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Pengajuan</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan mengajukan aktivasi layanan tatap muka. Admin akan meninjau permintaan Anda.
                Pastikan Anda sudah siap untuk menerima klien secara langsung.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRequestActivation}
                disabled={requestActivation.isPending}
              >
                {requestActivation.isPending ? 'Mengirim...' : 'Ajukan'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
