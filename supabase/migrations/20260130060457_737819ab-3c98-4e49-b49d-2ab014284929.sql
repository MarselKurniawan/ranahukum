
-- Create trigger function to notify lawyer when face-to-face request is approved/rejected
CREATE OR REPLACE FUNCTION public.notify_lawyer_face_to_face_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify when approved
  IF NEW.face_to_face_status = 'approved' AND (OLD.face_to_face_status IS NULL OR OLD.face_to_face_status != 'approved') THEN
    INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      NEW.user_id,
      'face_to_face_approved',
      'Layanan Tatap Muka Diaktifkan',
      'Selamat! Permintaan aktivasi layanan tatap muka Anda telah disetujui. Silakan atur tarif konsultasi tatap muka Anda.',
      NEW.id
    );
  END IF;

  -- Notify when rejected
  IF NEW.face_to_face_status = 'rejected' AND (OLD.face_to_face_status IS NULL OR OLD.face_to_face_status != 'rejected') THEN
    INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      NEW.user_id,
      'face_to_face_rejected',
      'Permintaan Tatap Muka Ditolak',
      'Mohon maaf, permintaan aktivasi layanan tatap muka Anda ditolak. Silakan coba lagi nanti.',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS on_face_to_face_status_change ON public.lawyers;
CREATE TRIGGER on_face_to_face_status_change
  AFTER UPDATE ON public.lawyers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lawyer_face_to_face_status();

-- Create trigger function to notify lawyer when face-to-face price request is approved/rejected
CREATE OR REPLACE FUNCTION public.notify_lawyer_price_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lawyer_user_id uuid;
  request_type_label text;
BEGIN
  -- Get the lawyer's user_id
  SELECT user_id INTO lawyer_user_id FROM public.lawyers WHERE id = NEW.lawyer_id;
  
  IF lawyer_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Set label based on request type
  IF NEW.request_type = 'face_to_face' THEN
    request_type_label := 'Tatap Muka';
  ELSIF NEW.request_type = 'pendampingan' THEN
    request_type_label := 'Pendampingan';
  ELSE
    request_type_label := 'Konsultasi';
  END IF;

  -- Notify when approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      lawyer_user_id,
      'price_request_approved',
      'Perubahan Tarif Disetujui',
      'Permintaan perubahan tarif ' || request_type_label || ' Anda telah disetujui. Tarif baru: Rp ' || TO_CHAR(NEW.requested_price, 'FM999,999,999'),
      NEW.id
    );
    
    -- Auto-update the lawyer's price
    IF NEW.request_type = 'face_to_face' THEN
      UPDATE public.lawyers SET face_to_face_price = NEW.requested_price WHERE id = NEW.lawyer_id;
    ELSIF NEW.request_type = 'pendampingan' THEN
      UPDATE public.lawyers SET pendampingan_price = NEW.requested_price WHERE id = NEW.lawyer_id;
    END IF;
  END IF;

  -- Notify when rejected
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
    VALUES (
      lawyer_user_id,
      'price_request_rejected',
      'Perubahan Tarif Ditolak',
      'Mohon maaf, permintaan perubahan tarif ' || request_type_label || ' Anda ditolak.' || COALESCE(' Alasan: ' || NEW.notes, ''),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for price requests
DROP TRIGGER IF EXISTS on_price_request_status_change ON public.lawyer_price_requests;
CREATE TRIGGER on_price_request_status_change
  AFTER UPDATE ON public.lawyer_price_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lawyer_price_request_status();

-- Create trigger function to notify admin when lawyer submits price request
CREATE OR REPLACE FUNCTION public.notify_admin_price_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user record;
  lawyer_name text;
  request_type_label text;
BEGIN
  -- Only trigger on new pending requests
  IF NEW.status = 'pending' THEN
    -- Get lawyer name
    SELECT name INTO lawyer_name FROM public.lawyers WHERE id = NEW.lawyer_id;
    
    -- Set label based on request type
    IF NEW.request_type = 'face_to_face' THEN
      request_type_label := 'Tatap Muka';
    ELSIF NEW.request_type = 'pendampingan' THEN
      request_type_label := 'Pendampingan';
    ELSE
      request_type_label := 'Konsultasi';
    END IF;

    -- Notify all superadmins
    FOR admin_user IN 
      SELECT user_id FROM user_roles WHERE role = 'superadmin'
    LOOP
      INSERT INTO user_activity_alerts (user_id, type, title, message, related_id)
      VALUES (
        admin_user.user_id,
        'price_request',
        'Permintaan Perubahan Tarif',
        'Lawyer ' || COALESCE(lawyer_name, 'Unknown') || ' mengajukan perubahan tarif ' || request_type_label || ' menjadi Rp ' || TO_CHAR(NEW.requested_price, 'FM999,999,999'),
        NEW.id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for new price requests
DROP TRIGGER IF EXISTS on_price_request_created ON public.lawyer_price_requests;
CREATE TRIGGER on_price_request_created
  AFTER INSERT ON public.lawyer_price_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_price_request();
