-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  consultation_topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (lawyer_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update lawyer rating
CREATE OR REPLACE FUNCTION public.update_lawyer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.lawyers
  SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE lawyer_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id)),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE lawyer_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id))
  WHERE id = COALESCE(NEW.lawyer_id, OLD.lawyer_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers to auto-update lawyer rating
CREATE TRIGGER on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_lawyer_rating();

CREATE TRIGGER on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_lawyer_rating();

CREATE TRIGGER on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_lawyer_rating();

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();