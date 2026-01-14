-- Create user_activity_alerts table for storing personal activity alerts
CREATE TABLE public.user_activity_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'consultation_request', 'consultation_accepted', 'assistance_request', etc.
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid, -- ID of consultation/assistance request
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own alerts" 
ON public.user_activity_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert alerts (through triggers or edge functions)
CREATE POLICY "System can insert alerts" 
ON public.user_activity_alerts 
FOR INSERT 
WITH CHECK (true);

-- Users can update their own alerts (mark as read)
CREATE POLICY "Users can update own alerts" 
ON public.user_activity_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts" 
ON public.user_activity_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_alerts;

-- Create function to create alert for lawyer when new consultation is created
CREATE OR REPLACE FUNCTION public.create_consultation_alert()
RETURNS TRIGGER AS $$
DECLARE
  lawyer_user_id uuid;
BEGIN
  -- Get the lawyer's user_id
  SELECT user_id INTO lawyer_user_id FROM public.lawyers WHERE id = NEW.lawyer_id;
  
  IF lawyer_user_id IS NOT NULL THEN
    INSERT INTO public.user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      lawyer_user_id,
      'consultation_request',
      'Permintaan Konsultasi Baru',
      'Ada klien yang ingin berkonsultasi dengan Anda. Segera tanggapi!',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new consultations
CREATE TRIGGER on_consultation_created
  AFTER INSERT ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.create_consultation_alert();

-- Create function to notify client when consultation is accepted
CREATE OR REPLACE FUNCTION public.create_consultation_status_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      NEW.client_id,
      'consultation_accepted',
      'Konsultasi Diterima',
      'Pengacara telah menerima permintaan konsultasi Anda. Segera mulai chat!',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for consultation status updates
CREATE TRIGGER on_consultation_status_changed
  AFTER UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.create_consultation_status_alert();

-- Create function to create alert for lawyer when new assistance request is created
CREATE OR REPLACE FUNCTION public.create_assistance_alert()
RETURNS TRIGGER AS $$
DECLARE
  lawyer_user_id uuid;
BEGIN
  -- Get the lawyer's user_id
  SELECT user_id INTO lawyer_user_id FROM public.lawyers WHERE id = NEW.lawyer_id;
  
  IF lawyer_user_id IS NOT NULL THEN
    INSERT INTO public.user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      lawyer_user_id,
      'assistance_request',
      'Permintaan Pendampingan Baru',
      'Ada klien yang membutuhkan pendampingan hukum dari Anda. Segera tinjau!',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new assistance requests
CREATE TRIGGER on_assistance_created
  AFTER INSERT ON public.legal_assistance_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_assistance_alert();