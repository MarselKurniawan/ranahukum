import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Shield, MessageCircle, Clock, User, Bot } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { LawyerCard } from "@/components/LawyerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLawyers } from "@/hooks/useLawyers";
import { useSpecializationTypes } from "@/hooks/useSpecializationTypes";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  { icon: Shield, label: "Terverifikasi", desc: "Pengacara berlisensi" },
  { icon: MessageCircle, label: "Chat & Voice", desc: "Konsultasi fleksibel" },
  { icon: Clock, label: "24/7", desc: "Kapan saja" },
];

export default function Index() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data: lawyers, isLoading } = useLawyers();
  const { data: specializationTypes = [] } = useSpecializationTypes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Semua"]);

  // Build specializations from database
  const specializations = useMemo(() => {
    return ["Semua", ...specializationTypes.map(s => s.name)];
  }, [specializationTypes]);

  const handleTagClick = (tag: string) => {
    if (tag === "Semua") {
      setSelectedTags(["Semua"]);
    } else {
      const newTags = selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags.filter((t) => t !== "Semua"), tag];
      setSelectedTags(newTags.length === 0 ? ["Semua"] : newTags);
    }
  };

  const filteredLawyers = (lawyers || []).filter((lawyer) => {
    const matchesSearch =
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specialization.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTags =
      selectedTags.includes("Semua") ||
      lawyer.specialization.some((s) => selectedTags.includes(s));
    return matchesSearch && matchesTags;
  });

  return (
    <MobileLayout>
      {/* Hero Section */}
      <div className="gradient-hero px-4 pt-6 pb-8 rounded-b-3xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1">
            <Scale className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs text-primary-foreground font-medium">Legal Connect</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(user ? '/profile' : '/auth')}
          >
            <User className="w-4 h-4 mr-1" />
            {user ? 'Profil' : 'Masuk'}
          </Button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">
            Temukan Pengacara Terbaik
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Konsultasi hukum mudah, cepat, dan terpercaya
          </p>
        </div>

        {/* Search */}
        <div className="bg-card rounded-2xl p-3 shadow-elevated">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() => {}}
            placeholder="Cari kasus: perceraian, tanah..."
          />
        </div>
      </div>

      {/* Features */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-2">
          {features.map((feature) => (
            <Card key={feature.label} className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <feature.icon className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xs font-semibold">{feature.label}</p>
                <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


      {/* Categories */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Kategori Kasus</h2>
          <button className="text-xs text-primary font-medium">Lihat Semua</button>
        </div>
        <TagFilter
          tags={specializations}
          selectedTags={selectedTags}
          onTagClick={handleTagClick}
        />
      </div>

      {/* Lawyers List */}
      <div className="px-4 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Pengacara Tersedia</h2>
          <span className="text-xs text-muted-foreground">
            {filteredLawyers.length} pengacara
          </span>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-card rounded-xl">
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredLawyers.map((lawyer, index) => (
              <div
                key={lawyer.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-slide-up"
              >
                <LawyerCard
                  id={lawyer.id}
                  name={lawyer.name}
                  specializations={lawyer.specialization}
                  rating={lawyer.rating || 0}
                  consultationCount={lawyer.consultation_count || 0}
                  price={lawyer.price || 0}
                  photo={lawyer.image_url || '/placeholder.svg'}
                  isOnline={lawyer.is_available}
                  isVerified={lawyer.is_verified}
                  location={lawyer.location || undefined}
                  onClick={() => navigate(`/lawyer/${lawyer.id}`)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legal Bot Floating Button */}
      <button
        onClick={() => navigate("/ai-assistant")}
        className="fixed bottom-24 right-4 md:right-[calc(50%-215px+16px)] w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center z-40 hover:scale-110 transition-transform"
        aria-label="Legal Bot"
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
      </button>
    </MobileLayout>
  );
}
