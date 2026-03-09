import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ size = "md", showLabel = true, className }: VerifiedBadgeProps) {
  const iconSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const textSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1",
      className
    )}>
      <BadgeCheck className={cn(iconSize[size], "text-blue-500 fill-blue-500/20")} />
      {showLabel && (
        <span className={cn(textSize[size], "font-medium text-blue-600")}>
          Terverifikasi
        </span>
      )}
    </div>
  );
}

export function VerifiedBadgeCompact({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200",
      className
    )}>
      <BadgeCheck className="w-3 h-3 text-blue-500" />
      <span className="text-[10px] font-medium text-blue-600">Verified</span>
    </div>
  );
}
