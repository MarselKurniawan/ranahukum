import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { LawyerCard } from "@/components/LawyerCard";
import { specializations } from "@/data/mockLawyers";
import { useLawyers } from "@/hooks/useLawyers";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Banknote, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const PRICE_RANGES = [
  { label: "Semua Harga", min: 0, max: Infinity },
  { label: "< Rp 100.000", min: 0, max: 100000 },
  { label: "Rp 100.000 - Rp 200.000", min: 100000, max: 200000 },
  { label: "Rp 200.000 - Rp 500.000", min: 200000, max: 500000 },
  { label: "> Rp 500.000", min: 500000, max: Infinity },
];

export default function Search() {
  const navigate = useNavigate();
  const { data: lawyers, isLoading } = useLawyers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Semua"]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique locations from lawyers
  const locations = useMemo(() => {
    if (!lawyers) return [];
    const locs = lawyers
      .map((l) => l.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locs)].sort();
  }, [lawyers]);

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

  const clearFilters = () => {
    setSelectedLocation("all");
    setSelectedPriceRange(0);
    setSelectedTags(["Semua"]);
  };

  const activeFiltersCount = 
    (selectedLocation !== "all" ? 1 : 0) + 
    (selectedPriceRange !== 0 ? 1 : 0) +
    (selectedTags.length > 0 && !selectedTags.includes("Semua") ? 1 : 0);

  const filteredLawyers = useMemo(() => {
    return (lawyers || []).filter((lawyer) => {
      // Search filter
      const matchesSearch =
        lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lawyer.specialization.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Tags filter
      const matchesTags =
        selectedTags.includes("Semua") ||
        lawyer.specialization.some((s) => selectedTags.includes(s));
      
      // Location filter
      const matchesLocation =
        selectedLocation === "all" ||
        lawyer.location === selectedLocation;
      
      // Price filter
      const priceRange = PRICE_RANGES[selectedPriceRange];
      const matchesPrice =
        (lawyer.price || 0) >= priceRange.min &&
        (lawyer.price || 0) < priceRange.max;

      return matchesSearch && matchesTags && matchesLocation && matchesPrice;
    });
  }, [lawyers, searchQuery, selectedTags, selectedLocation, selectedPriceRange]);

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Cari Pengacara</h1>
        
        <div className="flex gap-2 mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            className="flex-1"
          />
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Filter Pencarian</span>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                      <X className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Lokasi
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Lokasi</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Banknote className="w-4 h-4 text-muted-foreground" />
                    Rentang Harga
                  </label>
                  <div className="space-y-3">
                    <Slider
                      value={[selectedPriceRange]}
                      onValueChange={(v) => setSelectedPriceRange(v[0])}
                      max={PRICE_RANGES.length - 1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Murah</span>
                      <span className="text-sm font-medium text-primary">
                        {PRICE_RANGES[selectedPriceRange].label}
                      </span>
                      <span className="text-xs text-muted-foreground">Mahal</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="gradient"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Terapkan Filter ({filteredLawyers.length} hasil)
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLocation !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                {selectedLocation}
                <button onClick={() => setSelectedLocation("all")}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </Badge>
            )}
            {selectedPriceRange !== 0 && (
              <Badge variant="secondary" className="gap-1">
                <Banknote className="w-3 h-3" />
                {PRICE_RANGES[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(0)}>
                  <X className="w-3 h-3 ml-1" />
                </button>
              </Badge>
            )}
          </div>
        )}

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
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="link" 
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Reset semua filter
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
