import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Star, Briefcase, Shield, 
  MessageCircle, Filter, Search, ChevronRight
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLawyers } from "@/hooks/useLawyers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const provinces = [
  "Semua Provinsi",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "DI Yogyakarta",
  "Bali",
];

export default function LegalAssistance() {
  const navigate = useNavigate();
  const { data: lawyers, isLoading } = useLawyers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Semua Provinsi");
  const [selectedSpec, setSelectedSpec] = useState("Semua");

  const filteredLawyers = (lawyers || []).filter((lawyer) => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lawyer.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvince = selectedProvince === "Semua Provinsi" || 
      (lawyer.location || '').includes(selectedProvince.replace('DKI ', '').replace('DI ', ''));

    const matchesSpec = selectedSpec === "Semua" ||
      lawyer.specialization.some(s => s.toLowerCase().includes(selectedSpec.toLowerCase()));

    return matchesSearch && matchesProvince && matchesSpec && lawyer.pendampingan_price;
  });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold">Pendampingan Hukum</h2>
            <p className="text-xs text-muted-foreground">Temukan pengacara untuk pendampingan</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, spesialisasi, atau kota..."
              className="pl-10 rounded-full bg-secondary border-0"
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger className="flex-1 h-9 text-xs rounded-full">
                <MapPin className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-full gap-1">
                  <Filter className="w-3 h-3" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Filter Pengacara</SheetTitle>
                  <SheetDescription>
                    Pilih kriteria untuk mempersempit pencarian
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Spesialisasi</label>
                    <div className="flex flex-wrap gap-2">
                      {["Semua", "Perceraian", "Pertanahan", "Pidana", "Perdata", "Bisnis"].map((spec) => (
                        <Badge
                          key={spec}
                          variant={selectedSpec === spec ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedSpec(spec)}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4">
        <Card className="mb-4 border-accent/30 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Apa itu Pendampingan Hukum?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Layanan pendampingan langsung oleh pengacara untuk kasus hukum Anda. 
                  Pengacara akan membantu mulai dari konsultasi hingga proses hukum di pengadilan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lawyers List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Pengacara Tersedia</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredLawyers.length} pengacara
            </Badge>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredLawyers.length > 0 ? (
            filteredLawyers.map((lawyer) => (
              <Card
                key={lawyer.id}
                className="cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => navigate(`/legal-assistance/${lawyer.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={lawyer.image_url || '/placeholder.svg'}
                        alt={lawyer.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      {lawyer.is_available && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm truncate">{lawyer.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {lawyer.location || 'Indonesia'}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium">{lawyer.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          • {lawyer.experience_years} tahun pengalaman
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {lawyer.specialization.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="tag" className="text-[10px]">
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                        {lawyer.is_verified && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3 text-success" />
                            Terverifikasi
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Mulai dari</p>
                          <p className="text-sm font-semibold text-primary">
                            Rp {(lawyer.pendampingan_price || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">
                Tidak ada pengacara yang sesuai dengan filter
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
