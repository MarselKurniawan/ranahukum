-- Create trigger function to notify lawyer when client fills identity
CREATE OR REPLACE FUNCTION public.notify_lawyer_identity_filled()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lawyer_user_id uuid;
BEGIN
  -- Only trigger when identity_verified changes to true
  IF NEW.identity_verified = true AND (OLD.identity_verified IS NULL OR OLD.identity_verified = false) THEN
    -- Get the lawyer's user_id
    SELECT user_id INTO lawyer_user_id
    FROM lawyers
    WHERE id = NEW.lawyer_id;

    IF lawyer_user_id IS NOT NULL THEN
      INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
      VALUES (
        lawyer_user_id,
        'identity_filled',
        'Klien Telah Mengisi Identitas',
        'Klien ' || COALESCE(NEW.client_name, 'anonim') || ' telah mengisi form identitas. Anda dapat melanjutkan upload Surat Kuasa.',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for identity notification
DROP TRIGGER IF EXISTS on_identity_filled ON legal_assistance_requests;
CREATE TRIGGER on_identity_filled
AFTER UPDATE ON legal_assistance_requests
FOR EACH ROW
EXECUTE FUNCTION notify_lawyer_identity_filled();

-- Add column for rejection cooldown tracking
ALTER TABLE lawyers 
ADD COLUMN IF NOT EXISTS pendampingan_rejection_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pendampingan_rejected_at timestamp with time zone;

-- Update the rejection handling in useApprovePendampingan to increment rejection count