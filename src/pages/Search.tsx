import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { LawyerCard } from "@/components/LawyerCard";
import { specializations } from "@/data/mockLawyers";
import { useLawyers } from "@/hooks/useLawyers";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const navigate = useNavigate();
  const { data: lawyers, isLoading } = useLawyers();
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
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Cari Pengacara</h1>
        
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFilterClick={() => {}}
          className="mb-4"
        />

        <TagFilter
          tags={specializations}
          selectedTags={selectedTags}
          onTagClick={handleTagClick}
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Hasil Pencarian</h2>
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
            <>
              {filteredLawyers.map((lawyer, index) => (
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
              ))}

              {filteredLawyers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Tidak ada pengacara ditemukan
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
