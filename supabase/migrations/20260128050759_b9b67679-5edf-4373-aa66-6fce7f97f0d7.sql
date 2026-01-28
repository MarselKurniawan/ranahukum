-- Create face-to-face (tatap muka) requests table
CREATE TABLE public.face_to_face_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id TEXT,
  client_id UUID NOT NULL,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id),
  case_type TEXT,
  case_description TEXT NOT NULL,
  proposed_price INTEGER,
  agreed_price INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, negotiating, accepted, scheduled, completed, cancelled, rejected
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, paid, refunded
  -- Meeting schedule
  meeting_date DATE,
  meeting_time TEXT,
  meeting_location TEXT,
  meeting_notes TEXT,
  meeting_confirmed_at TIMESTAMP WITH TIME ZONE,
  -- Cancellation
  cancel_reason TEXT,
  cancelled_by UUID,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  auto_expired BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.face_to_face_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can create own face-to-face requests"
  ON public.face_to_face_requests
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view own face-to-face requests"
  ON public.face_to_face_requests
  FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can update own face-to-face requests"
  ON public.face_to_face_requests
  FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can view their face-to-face requests"
  ON public.face_to_face_requests
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lawyers
    WHERE lawyers.id = face_to_face_requests.lawyer_id
    AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Lawyers can update their face-to-face requests"
  ON public.face_to_face_requests
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM lawyers
    WHERE lawyers.id = face_to_face_requests.lawyer_id
    AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Superadmin can view all face-to-face requests"
  ON public.face_to_face_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Create messages table for face-to-face chat
CREATE TABLE public.face_to_face_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.face_to_face_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, file, voice, schedule_proposal
  file_url TEXT,
  -- For schedule proposals
  proposed_date DATE,
  proposed_time TEXT,
  proposed_location TEXT,
  is_schedule_accepted BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.face_to_face_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Request participants can view messages"
  ON public.face_to_face_messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM face_to_face_requests r
    WHERE r.id = face_to_face_messages.request_id
    AND (r.client_id = auth.uid() OR EXISTS (
      SELECT 1 FROM lawyers l
      WHERE l.id = r.lawyer_id AND l.user_id = auth.uid()
    ))
  ));

CREATE POLICY "Request participants can send messages"
  ON public.face_to_face_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM face_to_face_requests r
      WHERE r.id = face_to_face_messages.request_id
      AND (r.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM lawyers l
        WHERE l.id = r.lawyer_id AND l.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Superadmin can view all face-to-face messages"
  ON public.face_to_face_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_face_to_face_requests_updated_at
  BEFORE UPDATE ON public.face_to_face_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate display ID for face-to-face requests
CREATE OR REPLACE FUNCTION public.generate_face_to_face_display_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  month_num integer;
  year_num integer;
  year_short text;
  month_roman text;
  seq_num integer;
BEGIN
  month_num := EXTRACT(MONTH FROM NEW.created_at);
  year_num := EXTRACT(YEAR FROM NEW.created_at);
  year_short := TO_CHAR(NEW.created_at, 'YY');
  month_roman := public.month_to_roman(month_num);

  PERFORM pg_advisory_xact_lock(hashtext('face_to_face_display_id_' || year_num::text || '_' || month_num::text));

  SELECT COALESCE(MAX(
    CASE
      WHEN display_id ~ ('^#T[0-9]{3}' || month_roman || year_short || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO seq_num
  FROM public.face_to_face_requests
  WHERE EXTRACT(MONTH FROM created_at) = month_num
    AND EXTRACT(YEAR FROM created_at) = year_num;

  NEW.display_id := '#T' || LPAD(seq_num::text, 3, '0') || month_roman || year_short;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER generate_face_to_face_display_id_trigger
  BEFORE INSERT ON public.face_to_face_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_face_to_face_display_id();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.face_to_face_messages;

-- Add face-to-face price to lawyers table
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS face_to_face_price INTEGER DEFAULT 0;

-- Insert default face-to-face fee setting
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'face_to_face_fee_percentage',
  '{"percentage": 10}'::jsonb,
  'Persentase biaya platform untuk layanan tatap muka'
)
ON CONFLICT (key) DO NOTHING;