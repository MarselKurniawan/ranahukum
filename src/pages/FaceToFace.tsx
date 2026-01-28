import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Users, ArrowRight, Search as SearchIcon, Filter } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFaceToFaceLawyers, useClientFaceToFaceRequests } from "@/hooks/useFaceToFace";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function FaceToFace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: lawyers = [], isLoading: loadingLawyers } = useFaceToFaceLawyers();
  const { data: myRequests = [], isLoading: loadingRequests } = useClientFaceToFaceRequests();

  const filteredLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialization?.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Menunggu", variant: "secondary" },
      negotiating: { label: "Negosiasi", variant: "default" },
      accepted: { label: "Diterima", variant: "default" },
      scheduled: { label: "Terjadwal", variant: "default" },
      completed: { label: "Selesai", variant: "outline" },
      cancelled: { label: "Dibatalkan", variant: "destructive" },
      rejected: { label: "Ditolak", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <MobileLayout>
      <div className="p-4 pb-24 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Tatap Muka</h1>
          <p className="text-muted-foreground text-sm">
            Konsultasi langsung dengan pengacara
          </p>
        </div>

        <Tabs defaultValue="lawyers" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="lawyers" className="flex-1">Cari Lawyer</TabsTrigger>
            <TabsTrigger value="my-requests" className="flex-1">
              Permintaan Saya
              {myRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                  {myRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lawyers" className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lawyers List */}
            {loadingLawyers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredLawyers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada lawyer yang menyediakan layanan tatap muka</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLawyers.map((lawyer) => (
                  <Card
                    key={lawyer.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/face-to-face/lawyer/${lawyer.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={lawyer.image_url || "/placeholder.svg"}
                          alt={lawyer.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{lawyer.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span>{lawyer.rating?.toFixed(1) || "0.0"}</span>
                            <span className="mx-1">•</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{lawyer.location || "Indonesia"}</span>
                          </div>
                          {lawyer.specialization && lawyer.specialization.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {lawyer.specialization.slice(0, 2).map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {lawyer.specialization.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{lawyer.specialization.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <p className="font-semibold text-primary">
                              {formatCurrency(lawyer.face_to_face_price || 0)}
                            </p>
                            <Button size="sm" variant="outline">
                              Lihat <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-4 mt-4">
            {!user ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Silakan login untuk melihat permintaan</p>
                <Button onClick={() => navigate("/auth")}>Login</Button>
              </div>
            ) : loadingRequests ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada permintaan tatap muka</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/face-to-face/chat/${request.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.lawyers?.image_url || "/placeholder.svg"}
                            alt={request.lawyers?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-sm">{request.lawyers?.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {request.display_id}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {request.case_description}
                      </p>
                      {request.meeting_date && (
                        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                          <span>📅</span>
                          <span>
                            {format(new Date(request.meeting_date), "dd MMM yyyy", { locale: localeId })}
                            {request.meeting_time && ` • ${request.meeting_time}`}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(request.created_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
