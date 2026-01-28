-- Add face-to-face activation fields to lawyers table
ALTER TABLE public.lawyers
ADD COLUMN IF NOT EXISTS face_to_face_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS face_to_face_status text DEFAULT null,
ADD COLUMN IF NOT EXISTS face_to_face_requested_at timestamptz DEFAULT null,
ADD COLUMN IF NOT EXISTS face_to_face_rejected_at timestamptz DEFAULT null,
ADD COLUMN IF NOT EXISTS face_to_face_rejection_count integer DEFAULT 0;

-- Create trigger to notify admin when lawyer requests face-to-face activation
CREATE OR REPLACE FUNCTION public.notify_admin_face_to_face_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user record;
BEGIN
  -- Only trigger when status changes to 'pending'
  IF NEW.face_to_face_status = 'pending' AND (OLD.face_to_face_status IS NULL OR OLD.face_to_face_status != 'pending') THEN
    -- Notify all superadmins
    FOR admin_user IN 
      SELECT user_id FROM user_roles WHERE role = 'superadmin'
    LOOP
      INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
      VALUES (
        admin_user.user_id,
        'face_to_face_request',
        'Permintaan Aktivasi Tatap Muka',
        'Lawyer ' || NEW.name || ' mengajukan aktivasi layanan tatap muka',
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS on_face_to_face_request ON public.lawyers;
CREATE TRIGGER on_face_to_face_request
  AFTER UPDATE ON public.lawyers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_face_to_face_request();