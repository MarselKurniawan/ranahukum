import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageCircle, Shield, Briefcase, Award, MapPin } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";
import { useAuth } from "@/hooks/useAuth";
import { useLawyer } from "@/hooks/useLawyers";

export default function LawyerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lawyer, isLoading } = useLawyer(id || '');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);

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
          <h1 className="text-lg font-bold text-primary-foreground mb-1">
            {lawyer.name}
          </h1>
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
              <Card className="border-success/20 bg-success/5">
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
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Biaya Konsultasi</p>
            <p className="text-lg font-bold text-primary">
              Rp {(lawyer.price || 0).toLocaleString("id-ID")}
              <span className="text-xs text-muted-foreground font-normal">
                /sesi
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="gradient" 
              className="rounded-xl gap-2"
              onClick={() => navigate(`/booking/${lawyer.id}`)}
              disabled={!lawyer.is_available}
            >
              <MessageCircle className="w-4 h-4" />
              {lawyer.is_available ? "Mulai Konsultasi" : "Sedang Offline"}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
