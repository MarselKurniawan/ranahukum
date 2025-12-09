import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onFilterClick,
  placeholder = "Cari kasus atau nama pengacara...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 h-11 rounded-xl bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
      {onFilterClick && (
        <Button
          variant="secondary"
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0"
          onClick={onFilterClick}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
