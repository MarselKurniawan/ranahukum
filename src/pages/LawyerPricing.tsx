import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { useLawyerPriceRequests, useCreatePriceRequest } from "@/hooks/useLawyerPriceRequests";
import { useToast } from "@/hooks/use-toast";

export default function LawyerPricing() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useLawyerProfile();
  const { data: priceRequests = [], isLoading: loadingRequests } = useLawyerPriceRequests();
  const createRequest = useCreatePriceRequest();
  const { toast } = useToast();

  const [requestedPrice, setRequestedPrice] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || role !== 'lawyer')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmitRequest = async () => {
    if (!requestedPrice) {
      toast({
        title: "Error",
        description: "Masukkan harga yang diinginkan",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRequest.mutateAsync({
        requestedPrice: parseInt(requestedPrice),
        notes: notes || undefined
      });
      toast({
        title: "Berhasil",
        description: "Permintaan perubahan harga telah dikirim ke admin"
      });
      setRequestedPrice("");
      setNotes("");
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

  const hasPendingRequest = priceRequests.some(r => r.status === 'pending');

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Pengaturan Harga</h1>
        </div>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Current Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Tarif Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Konsultasi Chat</p>
                <p className="text-xs text-muted-foreground">Diatur oleh Admin</p>
              </div>
              <p className="font-bold text-primary">{formatCurrency(profile?.price || 0)}</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Pendampingan Hukum</p>
                <p className="text-xs text-muted-foreground">Dapat diubah (dengan persetujuan)</p>
              </div>
              <p className="font-bold text-accent">{formatCurrency(profile?.pendampingan_price || 0)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Request Price Change */}
        {profile?.is_verified && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ajukan Perubahan Harga Pendampingan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasPendingRequest ? (
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
                    <Label htmlFor="price">Harga Baru (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Contoh: 5000000"
                      value={requestedPrice}
                      onChange={(e) => setRequestedPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Alasan perubahan harga..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    variant="gradient" 
                    className="w-full"
                    onClick={handleSubmitRequest}
                    disabled={createRequest.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Permintaan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!profile?.is_verified && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Anda harus terverifikasi untuk dapat mengajukan perubahan harga pendampingan.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Riwayat Permintaan</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <Skeleton className="h-20 w-full" />
            ) : priceRequests.length > 0 ? (
              <div className="space-y-3">
                {priceRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="p-3 border rounded-lg"
                  >
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada riwayat permintaan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
