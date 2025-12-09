import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
  className?: string;
}

export function TagFilter({ tags, selectedTags, onTagClick, className }: TagFilterProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "secondary"}
            className={cn(
              "cursor-pointer whitespace-nowrap transition-all duration-200 px-3 py-1.5",
              isSelected && "shadow-sm"
            )}
            onClick={() => onTagClick(tag)}
          >
            {tag}
          </Badge>
        );
      })}
    </div>
  );
}
