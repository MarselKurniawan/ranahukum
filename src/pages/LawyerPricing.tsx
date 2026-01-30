import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Clock, CheckCircle, XCircle, Send, Users } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { useLawyerPriceRequests, useCreatePriceRequest } from "@/hooks/useLawyerPriceRequests";
import { useAppSetting } from "@/hooks/useLegalAssistance";
import { useToast } from "@/hooks/use-toast";
import { FaceToFaceActivationCard } from "@/components/FaceToFaceActivationCard";

export default function LawyerPricing() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useLawyerProfile();
  const { data: priceRequests = [], isLoading: loadingRequests } = useLawyerPriceRequests();
  const { data: chatPriceSetting } = useAppSetting('chat_consultation_price');
  const createRequest = useCreatePriceRequest();
  const { toast } = useToast();

  // Get consultation price from global settings
  const consultationPrice = chatPriceSetting 
    ? (chatPriceSetting.value as { amount?: number })?.amount || 0 
    : 0;

  // Pendampingan price request state
  const [pendampinganPrice, setPendampinganPrice] = useState("");
  const [pendampinganNotes, setPendampinganNotes] = useState("");

  // Face to face price request state
  const [faceToFacePrice, setFaceToFacePrice] = useState("");
  const [faceToFaceNotes, setFaceToFaceNotes] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmitPendampinganRequest = async () => {
    if (!pendampinganPrice) {
      toast({
        title: "Error",
        description: "Masukkan harga yang diinginkan",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRequest.mutateAsync({
        requestedPrice: parseInt(pendampinganPrice),
        notes: pendampinganNotes || undefined,
        requestType: 'pendampingan'
      });
      toast({
        title: "Berhasil",
        description: "Permintaan perubahan harga pendampingan telah dikirim ke admin"
      });
      setPendampinganPrice("");
      setPendampinganNotes("");
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const handleSubmitFaceToFaceRequest = async () => {
    if (!faceToFacePrice) {
      toast({
        title: "Error",
        description: "Masukkan harga yang diinginkan",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRequest.mutateAsync({
        requestedPrice: parseInt(faceToFacePrice),
        notes: faceToFaceNotes || undefined,
        requestType: 'face_to_face'
      });
      toast({
        title: "Berhasil",
        description: "Permintaan perubahan harga tatap muka telah dikirim ke admin"
      });
      setFaceToFacePrice("");
      setFaceToFaceNotes("");
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (authLoading || loadingProfile) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  const hasPendingPendampinganRequest = priceRequests.some(r => r.status === 'pending' && r.request_type === 'pendampingan');
  const hasPendingFaceToFaceRequest = priceRequests.some(r => r.status === 'pending' && r.request_type === 'face_to_face');
  const pendampinganRequests = priceRequests.filter(r => r.request_type === 'pendampingan');
  const faceToFaceRequests = priceRequests.filter(r => r.request_type === 'face_to_face');

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Pengaturan Harga & Layanan</h1>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Current Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Tarif Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Konsultasi Chat</p>
                <p className="text-xs text-muted-foreground">Diatur global oleh Admin</p>
              </div>
              <p className="font-bold text-primary">{formatCurrency(consultationPrice)}</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Pendampingan Hukum</p>
                <p className="text-xs text-muted-foreground">Dapat diubah (perlu approval)</p>
              </div>
              <p className="font-bold text-accent">{formatCurrency(profile?.pendampingan_price || 0)}</p>
            </div>
            {profile?.face_to_face_enabled && (
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Tatap Muka</p>
                  <p className="text-xs text-muted-foreground">Dapat diubah (perlu approval)</p>
                </div>
                <p className="font-bold text-accent">{formatCurrency(profile?.face_to_face_price || 0)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Face to Face Activation */}
        {profile?.is_verified && <FaceToFaceActivationCard />}

        {/* Price Request Tabs */}
        {profile?.is_verified && (
          <Tabs defaultValue="pendampingan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pendampingan">Pendampingan</TabsTrigger>
              <TabsTrigger value="face_to_face" disabled={!profile?.face_to_face_enabled}>
                Tatap Muka
              </TabsTrigger>
            </TabsList>

            {/* Pendampingan Tab */}
            <TabsContent value="pendampingan" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ajukan Perubahan Harga Pendampingan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasPendingPendampinganRequest ? (
                    <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Menunggu Persetujuan</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anda memiliki permintaan yang sedang diproses. Tunggu hingga admin memproses permintaan Anda.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pendampingan-price">Harga Baru (Rp)</Label>
                        <Input
                          id="pendampingan-price"
                          type="number"
                          placeholder="Contoh: 5000000"
                          value={pendampinganPrice}
                          onChange={(e) => setPendampinganPrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pendampingan-notes">Catatan (Opsional)</Label>
                        <Textarea
                          id="pendampingan-notes"
                          placeholder="Alasan perubahan harga..."
                          value={pendampinganNotes}
                          onChange={(e) => setPendampinganNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button 
                        variant="gradient" 
                        className="w-full"
                        onClick={handleSubmitPendampinganRequest}
                        disabled={createRequest.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Permintaan
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pendampingan Request History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Riwayat Permintaan Pendampingan</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <Skeleton className="h-20 w-full" />
                  ) : pendampinganRequests.length > 0 ? (
                    <div className="space-y-3">
                      {pendampinganRequests.map((request) => (
                        <PriceRequestItem key={request.id} request={request} formatCurrency={formatCurrency} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada riwayat permintaan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Face to Face Tab */}
            <TabsContent value="face_to_face" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Ajukan Perubahan Harga Tatap Muka
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasPendingFaceToFaceRequest ? (
                    <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Menunggu Persetujuan</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anda memiliki permintaan yang sedang diproses. Tunggu hingga admin memproses permintaan Anda.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="f2f-price">Harga Baru (Rp)</Label>
                        <Input
                          id="f2f-price"
                          type="number"
                          placeholder="Contoh: 1000000"
                          value={faceToFacePrice}
                          onChange={(e) => setFaceToFacePrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="f2f-notes">Catatan (Opsional)</Label>
                        <Textarea
                          id="f2f-notes"
                          placeholder="Alasan perubahan harga..."
                          value={faceToFaceNotes}
                          onChange={(e) => setFaceToFaceNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button 
                        variant="gradient" 
                        className="w-full"
                        onClick={handleSubmitFaceToFaceRequest}
                        disabled={createRequest.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Permintaan
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Face to Face Request History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Riwayat Permintaan Tatap Muka</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <Skeleton className="h-20 w-full" />
                  ) : faceToFaceRequests.length > 0 ? (
                    <div className="space-y-3">
                      {faceToFaceRequests.map((request) => (
                        <PriceRequestItem key={request.id} request={request} formatCurrency={formatCurrency} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada riwayat permintaan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!profile?.is_verified && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Anda harus terverifikasi untuk dapat mengajukan perubahan harga.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

// Separate component for price request item
function PriceRequestItem({ 
  request, 
  formatCurrency 
}: { 
  request: any; 
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-medium">
            {formatCurrency(request.requested_price)}
          </p>
          <p className="text-xs text-muted-foreground">
            dari {formatCurrency(request.current_price)}
          </p>
        </div>
        <Badge
          variant={
            request.status === 'approved' ? 'success' :
            request.status === 'rejected' ? 'destructive' : 'warning'
          }
          className="text-[10px]"
        >
          {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
          {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
          {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
          {request.status === 'approved' ? 'Disetujui' :
           request.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
        </Badge>
      </div>
      {request.notes && (
        <p className="text-xs text-muted-foreground">{request.notes}</p>
      )}
      <p className="text-[10px] text-muted-foreground mt-2">
        {new Date(request.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </p>
    </div>
  );
}
