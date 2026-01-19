import { Star, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppSetting } from "@/hooks/useLegalAssistance";
import { VerifiedBadge, VerifiedBadgeCompact } from "@/components/VerifiedBadge";

interface LawyerCardProps {
  id: string;
  name: string;
  photo: string;
  specializations: string[];
  rating: number;
  consultationCount: number;
  price: number;
  isOnline?: boolean;
  responseTime?: string;
  location?: string;
  isVerified?: boolean;
  onClick?: () => void;
}

export function LawyerCard({
  name,
  photo,
  specializations,
  rating,
  consultationCount,
  isOnline = false,
  responseTime = "< 5 menit",
  location,
  isVerified = false,
  onClick,
}: LawyerCardProps) {
  const { data: chatPriceSetting } = useAppSetting('chat_consultation_price');
  
  // Get consultation price from global settings
  const consultationPrice = chatPriceSetting 
    ? (chatPriceSetting.value as { amount?: number })?.amount || 50000 
    : 50000;

  return (
    <Card 
      className="hover:shadow-elevated cursor-pointer transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative">
            <img src={photo} alt={name} className="w-16 h-16 rounded-xl object-cover" />
            {isOnline && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground truncate">{name}</h3>
                  {isVerified && <VerifiedBadge size="sm" showLabel={false} />}
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">• {consultationCount} konsultasi</span>
                </div>
              </div>
              {isOnline && (
                <Badge variant="success" className="text-[10px] shrink-0">Online</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {specializations.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="tag" className="text-[10px]">{spec}</Badge>
              ))}
              {specializations.length > 3 && (
                <Badge variant="muted" className="text-[10px]">+{specializations.length - 3}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {responseTime}
            </span>
            {isVerified && <VerifiedBadgeCompact />}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Mulai dari</p>
            <p className="font-semibold text-primary">Rp {consultationPrice.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
