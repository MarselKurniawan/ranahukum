-- Create voice call sessions table
CREATE TABLE public.voice_call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated', -- initiated, completed, missed, cancelled
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  call_fee INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_call_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own call sessions"
  ON public.voice_call_sessions
  FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can create call sessions"
  ON public.voice_call_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Call participants can update their sessions"
  ON public.voice_call_sessions
  FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create trigger for updated_at
CREATE TRIGGER update_voice_call_sessions_updated_at
  BEFORE UPDATE ON public.voice_call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for voice call sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_call_sessions;

-- Insert default voice call fee setting
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'voice_call_fee_per_minute',
  '{"amount": 5000}'::jsonb,
  'Biaya per menit untuk panggilan telepon (dalam Rupiah)'
)
ON CONFLICT (key) DO NOTHING;