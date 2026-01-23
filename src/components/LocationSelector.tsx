import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { getCities, getDistrictsByCity } from "@/data/indonesiaLocations";

interface LocationSelectorProps {
  city: string;
  district: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  disabled?: boolean;
}

export function LocationSelector({
  city,
  district,
  onCityChange,
  onDistrictChange,
  disabled = false,
}: LocationSelectorProps) {
  const [cityOpen, setCityOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const cities = useMemo(() => getCities(), []);
  const districts = useMemo(() => getDistrictsByCity(city), [city]);

  const handleCityChange = (selectedCity: string) => {
    onCityChange(selectedCity);
    onDistrictChange(""); // Reset district when city changes
    setCityOpen(false);
  };

  const handleDistrictChange = (selectedDistrict: string) => {
    onDistrictChange(selectedDistrict);
    setDistrictOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* City Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          Kota/Kabupaten *
        </Label>
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={cityOpen}
              className="w-full justify-between font-normal"
              disabled={disabled}
            >
              {city || "Pilih kota..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 z-[9999]" align="start">
            <Command>
              <CommandInput placeholder="Cari kota..." />
              <CommandList>
                <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {cities.map((c) => (
                    <CommandItem
                      key={c}
                      value={c}
                      onSelect={() => handleCityChange(c)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          city === c ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* District Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          Kecamatan *
        </Label>
        <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={districtOpen}
              className="w-full justify-between font-normal"
              disabled={disabled || !city}
            >
              {district || (city ? "Pilih kecamatan..." : "Pilih kota dulu")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 z-[9999]" align="start">
            <Command>
              <CommandInput placeholder="Cari kecamatan..." />
              <CommandList>
                <CommandEmpty>Kecamatan tidak ditemukan.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {districts.map((d) => (
                    <CommandItem
                      key={d}
                      value={d}
                      onSelect={() => handleDistrictChange(d)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          district === d ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {d}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
