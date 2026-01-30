import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { LawyerCalendar } from "@/components/LawyerCalendar";
import { LawyerSideMenu } from "@/components/LawyerSideMenu";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LawyerSchedule() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || role !== 'lawyer')) {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini hanya untuk lawyer",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, role, loading, navigate, toast]);

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/lawyer/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Jadwal Saya</h1>
              <p className="text-xs text-muted-foreground">
                Atur ketersediaan jadwal Anda
              </p>
            </div>
          </div>
          <LawyerSideMenu />
        </div>
      </div>

      <div className="p-4">
        <LawyerCalendar />
      </div>
    </MobileLayout>
  );
}
