import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Shield, MessageCircle, Clock, ChevronRight, Bot } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { LawyerCard } from "@/components/LawyerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockLawyers, specializations } from "@/data/mockLawyers";

const features = [
  { icon: Shield, label: "Terverifikasi", desc: "Pengacara berlisensi" },
  { icon: MessageCircle, label: "Chat & Voice", desc: "Konsultasi fleksibel" },
  { icon: Clock, label: "24/7", desc: "Kapan saja" },
];

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Semua"]);

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

  const filteredLawyers = mockLawyers.filter((lawyer) => {
    const matchesSearch =
      lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.specializations.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesTags =
      selectedTags.includes("Semua") ||
      lawyer.specializations.some((s) => selectedTags.includes(s));
    return matchesSearch && matchesTags;
  });

  return (
    <MobileLayout>
      {/* Hero Section */}
      <div className="gradient-hero px-4 pt-12 pb-8 rounded-b-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Scale className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs text-primary-foreground font-medium">
              Konsultasi Hukum Online
            </span>
          </div>
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

      {/* AI Assistant Banner */}
      <div className="px-4 mt-4">
        <Card 
          className="gradient-accent cursor-pointer hover:shadow-elevated transition-all"
          onClick={() => navigate("/ai-assistant")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-foreground/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-accent-foreground text-sm">
                Tanya AI Dulu
              </h3>
              <p className="text-accent-foreground/80 text-xs">
                Dapatkan jawaban cepat untuk pertanyaan hukum umum
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-accent-foreground/60" />
          </CardContent>
        </Card>
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
          {filteredLawyers.map((lawyer, index) => (
            <div
              key={lawyer.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <LawyerCard
                {...lawyer}
                onClick={() => navigate(`/lawyer/${lawyer.id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
