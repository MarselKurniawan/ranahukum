import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  comment: string;
  consultation_topic: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface ReviewListProps {
  lawyerId: string;
  refreshTrigger?: number;
}

export function ReviewList({ lawyerId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [lawyerId, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    
    // Fetch reviews
    const { data: reviewsData, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, consultation_topic, created_at, user_id')
      .eq('lawyer_id', lawyerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
      return;
    }

    if (!reviewsData || reviewsData.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    // Fetch profiles for user names
    const userIds = reviewsData.map(r => r.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', userIds);

    // Merge data
    const reviewsWithNames = reviewsData.map(review => ({
      ...review,
      user_name: profilesData?.find(p => p.user_id === review.user_id)?.full_name || null
    }));

    setReviews(reviewsWithNames);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Belum ada review</p>
          <p className="text-xs text-muted-foreground mt-1">
            Jadilah yang pertama memberikan review!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review.id} className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-secondary">
                  <User className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">
                      {review.user_name || "Pengguna Anonim"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {review.consultation_topic && (
                  <p className="text-xs text-primary mt-2 bg-primary/10 rounded px-2 py-0.5 inline-block">
                    {review.consultation_topic}
                  </p>
                )}

                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
