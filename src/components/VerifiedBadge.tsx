import { BadgeCheck, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ size = "md", showLabel = true, className }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const containerClasses = {
    sm: "gap-1 text-[10px]",
    md: "gap-1.5 text-xs",
    lg: "gap-2 text-sm"
  };

  return (
    <div className={cn(
      "inline-flex items-center font-medium",
      containerClasses[size],
      className
    )}>
      <div className="relative">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full blur-sm opacity-60 animate-pulse" />
        
        {/* Badge background */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-full p-0.5 shadow-lg">
          <div className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full p-0.5">
            <BadgeCheck className={cn(sizeClasses[size], "text-white drop-shadow-sm")} />
          </div>
        </div>
        
        {/* Sparkle accent */}
        <Sparkles className="absolute -top-0.5 -right-0.5 w-2 h-2 text-yellow-400 drop-shadow animate-pulse" />
      </div>
      
      {showLabel && (
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent font-semibold">
          Terverifikasi
        </span>
      )}
    </div>
  );
}

// Alternative compact verified badge for card usage
export function VerifiedBadgeCompact({ className }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
      "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
      "border border-blue-400/30",
      className
    )}>
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-[2px] opacity-40" />
        <Shield className="relative w-3 h-3 text-blue-500 fill-blue-500/20" />
      </div>
      <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        Verified
      </span>
    </div>
  );
}
