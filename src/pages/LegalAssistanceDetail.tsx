import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MapPin, Shield, Clock, GraduationCap, 
  Briefcase, Award, MessageCircle, FileText, Send
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { mockLawyers } from "@/data/mockLawyers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function LegalAssistanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [caseDescription, setCaseDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const lawyer = mockLawyers.find((l) => l.id === id);

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Pengacara tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  const handleSubmitRequest = () => {
    if (!caseDescription.trim() || !phoneNumber.trim()) {
      toast.error("Mohon lengkapi semua field");
      return;
    }
    toast.success("Permintaan pendampingan berhasil dikirim! Pengacara akan menghubungi Anda.");
    setShowRequestDialog(false);
    setCaseDescription("");
    setPhoneNumber("");
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="gradient-hero relative">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="pt-16 pb-24 px-4 text-center">
          <img
            src={lawyer.photo}
            alt={lawyer.name}
            className="w-24 h-24 rounded-2xl mx-auto mb-3 border-4 border-primary-foreground/20 object-cover"
          />
          <h1 className="text-lg font-bold text-primary-foreground mb-1">
            {lawyer.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{lawyer.location.city}, {lawyer.location.province}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-primary-foreground font-medium">
                {lawyer.rating}
              </span>
            </div>
            <span className="text-primary-foreground/60">•</span>
            <span className="text-primary-foreground/80 text-sm">
              {lawyer.totalConsultations} konsultasi
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {lawyer.specializations.map((spec) => (
              <Badge
                key={spec}
                className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs"
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-16 relative z-10 pb-32">
        {/* Stats Card */}
        <Card className="mb-4 shadow-elevated">
          <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <GraduationCap className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Pendidikan</p>
              <p className="text-sm font-medium truncate">{lawyer.education}</p>
            </div>
            <div>
              <Briefcase className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Pengalaman</p>
              <p className="text-sm font-medium">{lawyer.experience} tahun</p>
            </div>
            <div>
              <Award className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Lisensi</p>
              <p className="text-sm font-medium truncate">{lawyer.licenseNumber.split("/")[0]}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Tentang</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lawyer.bio}
            </p>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card className="mb-4 border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Layanan Pendampingan Hukum
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Konsultasi awal dan analisis kasus
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Penyusunan dokumen hukum
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Pendampingan di pengadilan/instansi terkait
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                Komunikasi langsung via aplikasi
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Verified Badge */}
        <Card className="mb-4 border-success/20 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-sm">Pengacara Terverifikasi</p>
              <p className="text-xs text-muted-foreground">
                Identitas dan lisensi telah diverifikasi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Biaya Pendampingan</p>
            <p className="text-lg font-bold text-primary">
              Rp {(lawyer.pendampinganPrice || 0).toLocaleString("id-ID")}
              <span className="text-xs text-muted-foreground font-normal">
                /kasus
              </span>
            </p>
          </div>
          <Button 
            variant="gradient" 
            className="rounded-xl gap-2"
            onClick={() => setShowRequestDialog(true)}
          >
            <MessageCircle className="w-4 h-4" />
            Request Pendampingan
          </Button>
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request Pendampingan Hukum</DialogTitle>
            <DialogDescription>
              Ceritakan kasus Anda secara singkat. Pengacara akan menghubungi Anda untuk diskusi lebih lanjut.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Deskripsi Kasus *
              </label>
              <Textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Ceritakan kronologi dan permasalahan hukum Anda..."
                className="min-h-[120px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nomor WhatsApp *
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08123456789"
                type="tel"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Batal
            </Button>
            <Button variant="gradient" onClick={handleSubmitRequest}>
              <Send className="w-4 h-4 mr-2" />
              Kirim Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
