-- Create consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled')),
  price INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  lawyer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'file', 'system')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS for consultations
CREATE POLICY "Users can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can view their consultations"
  ON public.consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyers 
      WHERE lawyers.id = consultations.lawyer_id 
      AND lawyers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers can update their consultations"
  ON public.consultations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyers 
      WHERE lawyers.id = consultations.lawyer_id 
      AND lawyers.user_id = auth.uid()
    )
  );

-- RLS for messages
CREATE POLICY "Consultation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = messages.consultation_id
      AND (c.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.lawyers l WHERE l.id = c.lawyer_id AND l.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Consultation participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = messages.consultation_id
      AND (c.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.lawyers l WHERE l.id = c.lawyer_id AND l.user_id = auth.uid()
      ))
    )
  );

-- Update lawyer consultation count trigger
CREATE OR REPLACE FUNCTION public.update_lawyer_consultation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.lawyers
    SET consultation_count = consultation_count + 1
    WHERE id = NEW.lawyer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_consultation_completed
  AFTER INSERT OR UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_lawyer_consultation_count();

-- Triggers for updated_at
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;