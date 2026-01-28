import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MapPin, Briefcase, GraduationCap, 
  Calendar, MessageCircle, Check, Users
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLawyer } from "@/hooks/useLawyers";
import { useCreateFaceToFaceRequest } from "@/hooks/useFaceToFace";
import { useSpecializationTypes } from "@/hooks/useSpecializationTypes";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ReviewList } from "@/components/ReviewList";

export default function FaceToFaceLawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: lawyer, isLoading } = useLawyer(id || "");
  const { data: specializationTypes = [] } = useSpecializationTypes();
  const createRequest = useCreateFaceToFaceRequest();

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [caseType, setCaseType] = useState("");
  const [caseDescription, setCaseDescription] = useState("");

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: "Silakan login terlebih dahulu", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!caseType || !caseDescription.trim()) {
      toast({ title: "Lengkapi semua data", variant: "destructive" });
      return;
    }

    try {
      const result = await createRequest.mutateAsync({
        lawyerId: id!,
        caseType,
        caseDescription,
      });

      setShowRequestDialog(false);
      navigate(`/face-to-face/chat/${result.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Lawyer tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10 p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Detail Lawyer</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={lawyer.image_url || "/placeholder.svg"}
                  alt={lawyer.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{lawyer.name}</h2>
                    {lawyer.is_verified && <VerifiedBadge />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span>{lawyer.rating?.toFixed(1) || "0.0"}</span>
                    <span>•</span>
                    <span>{lawyer.review_count || 0} ulasan</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{lawyer.location || "Indonesia"}</span>
                  </div>
                </div>
              </div>

              {lawyer.specialization && lawyer.specialization.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {lawyer.specialization.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{lawyer.experience_years || 0}</p>
                <p className="text-xs text-muted-foreground">Tahun</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{lawyer.consultation_count || 0}</p>
                <p className="text-xs text-muted-foreground">Klien</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Star className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{lawyer.rating?.toFixed(1) || "0.0"}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Bio */}
          {lawyer.bio && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Tentang</h3>
                <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {lawyer.education && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Pendidikan
                </h3>
                <p className="text-sm text-muted-foreground">{lawyer.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Price */}
          <Card className="border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Biaya Tatap Muka
              </h3>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(lawyer.face_to_face_price || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                per sesi pertemuan
              </p>
            </CardContent>
          </Card>

          {/* Reviews */}
          <div>
            <h3 className="font-semibold mb-3">Ulasan</h3>
            <ReviewList lawyerId={id || ""} />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowRequestDialog(true)}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ajukan Pertemuan
          </Button>
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajukan Tatap Muka</DialogTitle>
            <DialogDescription>
              Jelaskan kasus Anda untuk memulai diskusi dengan {lawyer.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jenis Kasus</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kasus" />
                </SelectTrigger>
                <SelectContent>
                  {specializationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Kasus</Label>
              <Textarea
                placeholder="Jelaskan secara singkat kasus atau kebutuhan hukum Anda..."
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 Setelah mengajukan, Anda dapat berdiskusi dengan lawyer untuk 
                menentukan jadwal dan lokasi pertemuan.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmitRequest}
              disabled={!caseType || !caseDescription.trim() || createRequest.isPending}
              className="w-full"
            >
              {createRequest.isPending ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
