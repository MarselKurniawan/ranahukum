import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RatingSummaryCardProps {
  lawyerId: string;
  avgRating: number;
  reviewCount: number;
}

export function RatingSummaryCard({ lawyerId, avgRating, reviewCount }: RatingSummaryCardProps) {
  const { data: distribution, isLoading } = useQuery({
    queryKey: ["rating-distribution", lawyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("lawyer_id", lawyerId);

      if (error) throw error;

      const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      (data || []).forEach((r) => {
        dist[r.rating] = (dist[r.rating] || 0) + 1;
      });
      return dist;
    },
    enabled: !!lawyerId,
  });

  if (reviewCount === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Average */}
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(avgRating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviewCount} ulasan</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {isLoading
              ? [5, 4, 3, 2, 1].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-xs w-3">{s}</span>
                    <Skeleton className="h-2 flex-1 rounded-full" />
                  </div>
                ))
              : [5, 4, 3, 2, 1].map((star) => {
                  const count = distribution?.[star] || 0;
                  const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <Star className="w-3 h-3 shrink-0 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground w-3">{star}</span>
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
                    </div>
                  );
                })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
