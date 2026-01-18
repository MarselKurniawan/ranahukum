-- Add pendampingan_enabled field to lawyers table
ALTER TABLE public.lawyers 
ADD COLUMN IF NOT EXISTS pendampingan_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pendampingan_status text DEFAULT 'disabled' CHECK (pendampingan_status IN ('disabled', 'pending', 'interview_scheduled', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS pendampingan_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pendampingan_interview_id uuid REFERENCES public.interview_sessions(id);

-- Create table for pendampingan interview scheduling with time slots
CREATE TABLE IF NOT EXISTS public.pendampingan_interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id uuid NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  google_meet_link text,
  notes text,
  lawyer_reminder_sent boolean DEFAULT false,
  admin_reminder_sent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.pendampingan_interviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for pendampingan_interviews
CREATE POLICY "Lawyers can view their own pendampingan interviews"
ON public.pendampingan_interviews FOR SELECT
USING (EXISTS (
  SELECT 1 FROM lawyers l 
  WHERE l.id = pendampingan_interviews.lawyer_id 
  AND l.user_id = auth.uid()
));

CREATE POLICY "SuperAdmin can view all pendampingan interviews"
ON public.pendampingan_interviews FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "SuperAdmin can create pendampingan interviews"
ON public.pendampingan_interviews FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "SuperAdmin can update pendampingan interviews"
ON public.pendampingan_interviews FOR UPDATE
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Trigger to create activity alert when interview is scheduled
CREATE OR REPLACE FUNCTION public.notify_lawyer_pendampingan_interview()
RETURNS TRIGGER AS $$
DECLARE
  lawyer_user_id uuid;
BEGIN
  -- Get the lawyer's user_id
  SELECT user_id INTO lawyer_user_id
  FROM lawyers
  WHERE id = NEW.lawyer_id;

  -- Create activity alert for lawyer
  INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
  VALUES (
    lawyer_user_id,
    'pendampingan_interview',
    'Interview Pendampingan Dijadwalkan',
    'Interview pendampingan Anda dijadwalkan pada tanggal ' || to_char(NEW.scheduled_date, 'DD Mon YYYY') || ' pukul ' || NEW.scheduled_time,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_lawyer_pendampingan_interview_trigger
AFTER INSERT ON public.pendampingan_interviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_lawyer_pendampingan_interview();

-- Trigger to create activity alert when pendampingan request is submitted
CREATE OR REPLACE FUNCTION public.notify_admin_pendampingan_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_user record;
BEGIN
  -- Only trigger when status changes to 'pending'
  IF NEW.pendampingan_status = 'pending' AND (OLD.pendampingan_status IS NULL OR OLD.pendampingan_status != 'pending') THEN
    -- Notify all superadmins
    FOR admin_user IN 
      SELECT user_id FROM user_roles WHERE role = 'superadmin'
    LOOP
      INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
      VALUES (
        admin_user.user_id,
        'pendampingan_request',
        'Permintaan Aktivasi Pendampingan',
        'Lawyer ' || NEW.name || ' mengajukan aktivasi layanan pendampingan',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_admin_pendampingan_request_trigger
AFTER UPDATE ON public.lawyers
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_pendampingan_request();