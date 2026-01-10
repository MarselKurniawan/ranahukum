import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, Loader2, Star, MessageCircle, Clock,
  DollarSign, MapPin, Briefcase, BadgeCheck
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  useIsSuperAdmin, 
  useAllLawyers,
  useLawyerConsultationsHistory,
  useUpdateLawyerPrice
} from "@/hooks/useSuperAdmin";

export default function SuperAdminLawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { data: isSuperAdmin, isLoading: checkingAdmin } = useIsSuperAdmin();
  const { data: allLawyers = [], isLoading: loadingLawyers } = useAllLawyers();
  const { data: consultations = [], isLoading: loadingConsultations } = useLawyerConsultationsHistory(id || '');
  const updatePrice = useUpdateLawyerPrice();

  const lawyer = allLawyers.find(l => l.id === id);

  const [priceForm, setPriceForm] = useState({
    price: 0,
    pendampingan_price: 0
  });

  useEffect(() => {
    if (!loading && !checkingAdmin && (!user || !isSuperAdmin)) {
      navigate('/auth');
    }
  }, [user, isSuperAdmin, loading, checkingAdmin, navigate]);

  useEffect(() => {
    if (lawyer) {
      setPriceForm({
        price: lawyer.price || 0,
        pendampingan_price: lawyer.pendampingan_price || 0
      });
    }
  }, [lawyer]);

  const handleUpdatePrice = async () => {
    if (!id) return;

    try {
      await updatePrice.mutateAsync({
        lawyerId: id,
        price: priceForm.price,
        pendampinganPrice: priceForm.pendampingan_price
      });
      toast({
        title: "Berhasil",
        description: "Tarif lawyer berhasil diperbarui"
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menyimpan tarif",
        variant: "destructive"
      });
    }
  };

  if (loading || checkingAdmin || loadingLawyers) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 text-center">
          <p>Lawyer tidak ditemukan</p>
          <Button onClick={() => navigate('/admin/dashboard')} className="mt-4">
            Kembali
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const completedConsultations = consultations.filter(c => c.status === 'completed');
  const totalRevenue = completedConsultations.reduce((sum, c) => sum + c.price, 0);

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Detail Lawyer</h1>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* Lawyer Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={lawyer.image_url || undefined} />
                <AvatarFallback className="text-2xl">{lawyer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">{lawyer.name}</h2>
                  {lawyer.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-success fill-success/20" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{lawyer.location || 'Tidak diketahui'}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span>{lawyer.rating || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{lawyer.experience_years || 0} tahun</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(lawyer.specialization || []).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-[10px]">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <MessageCircle className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{consultations.length}</p>
              <p className="text-[10px] text-muted-foreground">Konsultasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 mx-auto text-warning mb-1" />
              <p className="text-lg font-bold">{lawyer.review_count || 0}</p>
              <p className="text-[10px] text-muted-foreground">Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-lg font-bold">Rp {(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-muted-foreground">Pendapatan</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-2">
            <TabsTrigger value="pricing" className="text-xs">Atur Tarif</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">Riwayat</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Atur Tarif Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Tarif Konsultasi Chat</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1000"
                      className="pl-10"
                      value={priceForm.price}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pendampingan_price">Tarif Pendampingan</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                    <Input
                      id="pendampingan_price"
                      type="number"
                      min="0"
                      step="1000"
                      className="pl-10"
                      value={priceForm.pendampingan_price}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, pendampingan_price: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <Button 
                  variant="gradient" 
                  className="w-full"
                  onClick={handleUpdatePrice}
                  disabled={updatePrice.isPending}
                >
                  {updatePrice.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Tarif
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {loadingConsultations ? (
              <Skeleton className="h-24 w-full" />
            ) : consultations.length > 0 ? (
              consultations.map((consultation) => (
                <Card 
                  key={consultation.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/admin/consultation/${consultation.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {consultation.client_profile?.full_name || 'Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {consultation.topic}
                        </p>
                      </div>
                      <Badge
                        variant={
                          consultation.status === 'completed' ? 'success' :
                          consultation.status === 'active' ? 'accent' : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Rp {consultation.price.toLocaleString('id-ID')}</span>
                      <span>{new Date(consultation.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Belum ada riwayat konsultasi</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
