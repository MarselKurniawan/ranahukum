import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { EarningsDashboard } from "@/components/EarningsDashboard";
import { LawyerSideMenu } from "@/components/LawyerSideMenu";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function LawyerEarnings() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const { data: lawyerProfile, isLoading: loadingProfile } = useLawyerProfile();

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

  if (loading || loadingProfile) {
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
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/lawyer/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Pendapatan</h1>
              <p className="text-xs text-muted-foreground">
                Riwayat dan saldo pendapatan Anda
              </p>
            </div>
          </div>
          <LawyerSideMenu />
        </div>
      </div>

      <div className="p-4">
        <EarningsDashboard lawyerId={lawyerProfile?.id} />
      </div>
    </MobileLayout>
  );
}
