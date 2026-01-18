import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock, CheckCircle, Calendar, ExternalLink, AlertCircle, Video } from "lucide-react";
import { 
  useLawyerPendampinganStatus, 
  useRequestPendampinganActivation,
  useLawyerPendampinganInterview
} from "@/hooks/usePendampinganRequest";
import { useToast } from "@/hooks/use-toast";
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
import { LegalAssistanceTerms } from "./LegalAssistanceTerms";

export function PendampinganRequestCard() {
  const { toast } = useToast();
  const { data: pendampinganStatus, isLoading } = useLawyerPendampinganStatus();
  const { data: scheduledInterview } = useLawyerPendampinganInterview();
  const requestActivation = useRequestPendampinganActivation();
  const [showTerms, setShowTerms] = useState(false);

  if (isLoading) {
    return null;
  }

  const handleRequestActivation = async () => {
    try {
      await requestActivation.mutateAsync();
      toast({
        title: "Permintaan Terkirim",
        description: "Permintaan aktivasi layanan pendampingan berhasil dikirim. Tim admin akan meninjau permintaan Anda.",
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengirim permintaan",
        variant: "destructive"
      });
    }
  };

  // Already enabled
  if (pendampinganStatus?.pendampingan_enabled) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-sm">Layanan Pendampingan Aktif</p>
            <p className="text-xs text-muted-foreground">Anda dapat menerima permintaan pendampingan hukum dari klien</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interview scheduled
  if (pendampinganStatus?.pendampingan_status === 'interview_scheduled' && scheduledInterview) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Interview Pendampingan Dijadwalkan</p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(scheduledInterview.scheduled_date).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{scheduledInterview.scheduled_time} WIB</span>
                </div>
                {scheduledInterview.google_meet_link && (
                  <a 
                    href={scheduledInterview.google_meet_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka Google Meet
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pastikan Anda hadir tepat waktu untuk interview aktivasi pendampingan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending approval
  if (pendampinganStatus?.pendampingan_status === 'pending') {
    return (
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="font-medium text-sm">Menunggu Review Admin</p>
            <p className="text-xs text-muted-foreground">Permintaan aktivasi pendampingan Anda sedang ditinjau oleh tim admin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected
  if (pendampinganStatus?.pendampingan_status === 'rejected') {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-sm">Permintaan Ditolak</p>
              <p className="text-xs text-muted-foreground mt-1">
                Maaf, permintaan aktivasi pendampingan Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not requested yet (disabled)
  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Aktifkan Layanan Pendampingan</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dengan layanan pendampingan, Anda dapat membantu klien dalam proses hukum secara langsung dengan tarif yang lebih tinggi.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => setShowTerms(true)}
                >
                  Lihat Ketentuan
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="gradient" className="h-8 text-xs">
                      <Gavel className="w-3 h-3 mr-1" />
                      Ajukan Aktivasi
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ajukan Aktivasi Pendampingan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dengan mengajukan aktivasi, tim admin akan meninjau profil Anda dan mungkin menjadwalkan interview untuk verifikasi. Proses ini memastikan kualitas layanan pendampingan hukum.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleRequestActivation}
                        disabled={requestActivation.isPending}
                      >
                        {requestActivation.isPending ? 'Mengirim...' : 'Ya, Ajukan'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Dialog */}
      <LegalAssistanceTerms 
        open={showTerms} 
        onOpenChange={setShowTerms}
        onAccept={() => setShowTerms(false)}
        userType="lawyer"
      />
    </>
  );
}
