import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  lawyerId: string;
  consultationTopic?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ lawyerId, consultationTopic, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login untuk memberikan review",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Diperlukan",
        description: "Silakan berikan rating bintang",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Komentar Terlalu Pendek",
        description: "Minimal 10 karakter untuk komentar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        lawyer_id: lawyerId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
        consultation_topic: consultationTopic
      });

    setIsSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Review Sudah Ada",
          description: "Anda sudah pernah memberikan review untuk lawyer ini",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Gagal Mengirim Review",
          description: error.message,
          variant: "destructive"
        });
      }
      return;
    }

    toast({
      title: "Review Terkirim",
      description: "Terima kasih atas feedback Anda!"
    });

    setRating(0);
    setComment("");
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Berikan Penilaian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {rating === 1 && "Sangat Buruk"}
            {rating === 2 && "Buruk"}
            {rating === 3 && "Cukup"}
            {rating === 4 && "Baik"}
            {rating === 5 && "Sangat Baik"}
          </p>
        </div>

        {/* Comment */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Komentar</p>
          <Textarea
            placeholder="Ceritakan pengalaman konsultasi Anda..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button
            variant="gradient"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
