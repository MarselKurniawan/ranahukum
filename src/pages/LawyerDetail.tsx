import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageCircle, Phone, Shield, Clock, GraduationCap, Briefcase, Award } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockLawyers } from "@/data/mockLawyers";

export default function LawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="px-4 -mt-16 relative z-10 pb-24">
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

        {/* Status */}
        <Card className="mb-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${lawyer.isOnline ? "bg-success animate-pulse-soft" : "bg-muted-foreground"}`} />
              <span className="text-sm font-medium">
                {lawyer.isOnline ? "Online - Siap Konsultasi" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{lawyer.responseTime}</span>
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
            <p className="text-xs text-muted-foreground">Biaya Konsultasi</p>
            <p className="text-lg font-bold text-primary">
              Rp {lawyer.price.toLocaleString("id-ID")}
              <span className="text-xs text-muted-foreground font-normal">
                /sesi
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-xl">
              <Phone className="w-4 h-4" />
            </Button>
            <Button 
              variant="gradient" 
              className="rounded-xl gap-2"
              onClick={() => navigate(`/booking/${lawyer.id}`)}
            >
              <MessageCircle className="w-4 h-4" />
              Mulai Konsultasi
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
