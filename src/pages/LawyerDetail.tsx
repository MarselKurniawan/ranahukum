import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageCircle, Briefcase, Award, MapPin, Ban, FileText, GraduationCap, ExternalLink, Users } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { SuspensionBanner } from "@/components/SuspensionBanner";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";
import { useLawyer } from "@/hooks/useLawyers";
import { useAppSetting } from "@/hooks/useLegalAssistance";
import { useClientSuspension } from "@/hooks/useSuspensionCheck";
import { useApprovedCertifications, useApprovedLicenses } from "@/hooks/useLawyerCredentials";

export default function LawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lawyer, isLoading } = useLawyer(id || '');
  const { data: chatPriceSetting } = useAppSetting('chat_consultation_price');
  const clientSuspension = useClientSuspension();
  const { data: certifications = [] } = useApprovedCertifications(id || '');
  const { data: licenses = [] } = useApprovedLicenses(id || '');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [selectedService, setSelectedService] = useState<'chat' | 'face_to_face'>('chat');

  // Check if client is suspended
  const isClientSuspended = clientSuspension?.isActive;

  // Get consultation price from global settings
  const consultationPrice = chatPriceSetting 
    ? (chatPriceSetting.value as { amount?: number })?.amount || 50000 
    : 50000;

  const hasFaceToFace = lawyer?.face_to_face_enabled && lawyer?.face_to_face_price && lawyer.face_to_face_price > 0;

  if (isLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (!lawyer) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Pengacara tidak ditemukan</p>
        </div>
      </MobileLayout>
    );
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setRefreshReviews(prev => prev + 1);
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
            src={lawyer.image_url || '/placeholder.svg'}
            alt={lawyer.name}
            className="w-24 h-24 rounded-2xl mx-auto mb-3 border-4 border-primary-foreground/20 object-cover"
          />
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-primary-foreground">
              {lawyer.name}
            </h1>
            {lawyer.is_verified && <VerifiedBadge size="md" showLabel={false} />}
          </div>
          {lawyer.location && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-primary-foreground/70" />
              <span className="text-primary-foreground/70 text-xs">
                {lawyer.location}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-primary-foreground font-medium">
                {lawyer.rating}
              </span>
            </div>
            <span className="text-primary-foreground/60">•</span>
            <span className="text-primary-foreground/80 text-sm">
              {lawyer.consultation_count} konsultasi
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {lawyer.specialization.map((spec) => (
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
          <CardContent className="p-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <Briefcase className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Pengalaman</p>
              <p className="text-sm font-medium">{lawyer.experience_years} tahun</p>
            </div>
            <div>
              <Award className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Review</p>
              <p className="text-sm font-medium">{lawyer.review_count} ulasan</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mb-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="about">Tentang</TabsTrigger>
            <TabsTrigger value="reviews">Ulasan</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4 mt-4">
            {/* Status */}
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${lawyer.is_available ? "bg-success animate-pulse-soft" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium">
                    {lawyer.is_available ? "Online - Siap Konsultasi" : "Offline"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Verified Badge */}
            {lawyer.is_verified && (
              <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <VerifiedBadge size="lg" showLabel={false} />
                  <div>
                    <p className="font-medium text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Pengacara Terverifikasi
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Identitas dan lisensi telah diverifikasi oleh tim kami
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {lawyer.bio && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Biografi</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{lawyer.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {lawyer.education && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium">Pendidikan</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{lawyer.education}</p>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium">Sertifikasi</h3>
                  </div>
                  <div className="space-y-2">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cert.issuer && `${cert.issuer} • `}{cert.year || ''}
                          </p>
                        </div>
                        {cert.file_url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(cert.file_url!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Licenses */}
            {licenses.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium">Lisensi</h3>
                  </div>
                  <div className="space-y-2">
                    {licenses.map((license) => (
                      <div key={license.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{license.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {license.license_number && `No. ${license.license_number}`}
                            {license.issuer && ` • ${license.issuer}`}
                          </p>
                        </div>
                        {license.file_url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(license.file_url!, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-4">
            {/* Add Review Button */}
            {user && !showReviewForm && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowReviewForm(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Tulis Ulasan
              </Button>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <ReviewForm
                lawyerId={lawyer.id}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {/* Reviews List */}
            <ReviewList lawyerId={lawyer.id} refreshTrigger={refreshReviews} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border p-4 z-50">
        {isClientSuspended ? (
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <Ban className="w-5 h-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Akun Di-suspend</p>
              <p className="text-xs text-muted-foreground">Anda tidak dapat melakukan konsultasi</p>
            </div>
          </div>
        ) : (
          <>
            {hasFaceToFace ? (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSelectedService('chat')}
                  className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                    selectedService === 'chat'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <MessageCircle className={`w-4 h-4 mx-auto mb-1 ${selectedService === 'chat' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs font-medium ${selectedService === 'chat' ? 'text-primary' : 'text-muted-foreground'}`}>Konsultasi Chat</p>
                  <p className={`text-sm font-bold ${selectedService === 'chat' ? 'text-primary' : 'text-foreground'}`}>
                    Rp {consultationPrice.toLocaleString("id-ID")}
                  </p>
                </button>
                <button
                  onClick={() => setSelectedService('face_to_face')}
                  className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                    selectedService === 'face_to_face'
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <Users className={`w-4 h-4 mx-auto mb-1 ${selectedService === 'face_to_face' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs font-medium ${selectedService === 'face_to_face' ? 'text-primary' : 'text-muted-foreground'}`}>Tatap Muka</p>
                  <p className={`text-sm font-bold ${selectedService === 'face_to_face' ? 'text-primary' : 'text-foreground'}`}>
                    Rp {(lawyer.face_to_face_price || 0).toLocaleString("id-ID")}
                  </p>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Biaya Konsultasi</p>
                  <p className="text-lg font-bold text-primary">
                    Rp {consultationPrice.toLocaleString("id-ID")}
                    <span className="text-xs text-muted-foreground font-normal">/sesi</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
}
