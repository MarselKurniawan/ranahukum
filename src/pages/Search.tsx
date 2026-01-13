import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { LawyerCard } from "@/components/LawyerCard";
import { useLawyers } from "@/hooks/useLawyers";
import { useSpecializationTypes } from "@/hooks/useSpecializationTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, SlidersHorizontal, X, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Search() {
  const navigate = useNavigate();
  const { data: lawyers, isLoading } = useLawyers();
  const { data: specializationTypes = [] } = useSpecializationTypes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Semua"]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // Build specializations from database
  const specializations = useMemo(() => {
    return ["Semua", ...specializationTypes.map(s => s.name)];
  }, [specializationTypes]);

  // Get unique locations from lawyers
  const locations = useMemo(() => {
    if (!lawyers) return [];
    const locs = lawyers
      .map((l) => l.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locs)].sort();
  }, [lawyers]);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!locationSearch) return locations;
    return locations.filter(loc => 
      loc.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locations, locationSearch]);

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
    setSelectedTags(["Semua"]);
  };

  const activeFiltersCount = 
    (selectedLocation !== "all" ? 1 : 0) + 
    (selectedTags.length > 0 && !selectedTags.includes("Semua") ? 1 : 0);

  const filteredLawyers = useMemo(() => {
    return (lawyers || []).filter((lawyer) => {
      // Only show online lawyers (is_available = true)
      if (!lawyer.is_available) return false;
      
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
      
      // Location filter - "all" means Seluruh Indonesia
      const matchesLocation =
        selectedLocation === "all" ||
        lawyer.location === selectedLocation;

      return matchesSearch && matchesTags && matchesLocation;
    });
  }, [lawyers, searchQuery, selectedTags, selectedLocation]);

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
                {/* Location Filter - Searchable */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Lokasi
                  </label>
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationOpen}
                        className="w-full justify-between"
                      >
                        {selectedLocation === "all" 
                          ? "Seluruh Indonesia" 
                          : selectedLocation}
                        <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Cari lokasi..." 
                          value={locationSearch}
                          onValueChange={setLocationSearch}
                        />
                        <CommandList>
                          <CommandEmpty>Lokasi tidak ditemukan</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedLocation("all");
                                setLocationOpen(false);
                                setLocationSearch("");
                              }}
                            >
                              Seluruh Indonesia
                            </CommandItem>
                            {filteredLocations.map((loc) => (
                              <CommandItem
                                key={loc}
                                value={loc}
                                onSelect={() => {
                                  setSelectedLocation(loc);
                                  setLocationOpen(false);
                                  setLocationSearch("");
                                }}
                              >
                                {loc}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
