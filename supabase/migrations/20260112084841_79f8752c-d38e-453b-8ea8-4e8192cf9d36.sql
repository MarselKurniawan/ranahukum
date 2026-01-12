-- Create table for lawyer schedules
CREATE TABLE public.lawyer_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, date, time_slot)
);

-- Enable RLS
ALTER TABLE public.lawyer_schedules ENABLE ROW LEVEL SECURITY;

-- Everyone can view lawyer schedules (for booking)
CREATE POLICY "Everyone can view lawyer schedules"
ON public.lawyer_schedules
FOR SELECT
USING (true);

-- Lawyers can manage their own schedules
CREATE POLICY "Lawyers can insert own schedules"
ON public.lawyer_schedules
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM lawyers
  WHERE lawyers.id = lawyer_schedules.lawyer_id
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Lawyers can update own schedules"
ON public.lawyer_schedules
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM lawyers
  WHERE lawyers.id = lawyer_schedules.lawyer_id
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Lawyers can delete own schedules"
ON public.lawyer_schedules
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM lawyers
  WHERE lawyers.id = lawyer_schedules.lawyer_id
  AND lawyers.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_lawyer_schedules_updated_at
BEFORE UPDATE ON public.lawyer_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lawyer_schedules;