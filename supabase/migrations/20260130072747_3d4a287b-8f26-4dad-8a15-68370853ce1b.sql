-- Fix display_id generation race condition using advisory locks
-- Drop existing triggers and recreate with proper locking

-- Fix for consultations display_id
CREATE OR REPLACE FUNCTION generate_consultation_display_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  month_roman TEXT;
  next_seq INTEGER;
  lock_key BIGINT;
BEGIN
  -- Get current year and month
  current_year := TO_CHAR(NOW(), 'YY');
  current_month := TO_CHAR(NOW(), 'MM');
  month_roman := public.month_to_roman(EXTRACT(MONTH FROM NOW())::INTEGER);
  
  -- Create a unique lock key for this month/year combination for consultations
  -- Using a hash that includes 'C' prefix indicator (1 for consultations)
  lock_key := ('x' || md5('consultation_' || current_year || current_month))::bit(64)::bigint;
  
  -- Acquire advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get next sequence number for this month
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN display_id ~ ('^#C[0-9]+' || month_roman || current_year || '$')
        THEN (regexp_replace(display_id, '^#C([0-9]+).*$', '\1'))::INTEGER
        ELSE 0 
      END
    ), 0
  ) + 1 INTO next_seq
  FROM consultations
  WHERE display_id LIKE '#C%' || month_roman || current_year;
  
  -- Generate the display ID
  NEW.display_id := '#C' || LPAD(next_seq::TEXT, 3, '0') || month_roman || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure trigger uses BEFORE INSERT
DROP TRIGGER IF EXISTS generate_consultation_display_id_trigger ON consultations;
CREATE TRIGGER generate_consultation_display_id_trigger
BEFORE INSERT ON consultations
FOR EACH ROW
WHEN (NEW.display_id IS NULL)
EXECUTE FUNCTION generate_consultation_display_id();

-- Fix for legal_assistance_requests display_id
CREATE OR REPLACE FUNCTION generate_pendampingan_display_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  month_roman TEXT;
  next_seq INTEGER;
  lock_key BIGINT;
BEGIN
  -- Get current year and month
  current_year := TO_CHAR(NOW(), 'YY');
  current_month := TO_CHAR(NOW(), 'MM');
  month_roman := public.month_to_roman(EXTRACT(MONTH FROM NOW())::INTEGER);
  
  -- Create a unique lock key for pendampingan
  lock_key := ('x' || md5('pendampingan_' || current_year || current_month))::bit(64)::bigint;
  
  -- Acquire advisory lock
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get next sequence number for this month
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN display_id ~ ('^#P[0-9]+' || month_roman || current_year || '$')
        THEN (regexp_replace(display_id, '^#P([0-9]+).*$', '\1'))::INTEGER
        ELSE 0 
      END
    ), 0
  ) + 1 INTO next_seq
  FROM legal_assistance_requests
  WHERE display_id LIKE '#P%' || month_roman || current_year;
  
  -- Generate the display ID
  NEW.display_id := '#P' || LPAD(next_seq::TEXT, 3, '0') || month_roman || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure trigger uses BEFORE INSERT
DROP TRIGGER IF EXISTS generate_pendampingan_display_id_trigger ON legal_assistance_requests;
CREATE TRIGGER generate_pendampingan_display_id_trigger
BEFORE INSERT ON legal_assistance_requests
FOR EACH ROW
WHEN (NEW.display_id IS NULL)
EXECUTE FUNCTION generate_pendampingan_display_id();

-- Fix for face_to_face_requests display_id
CREATE OR REPLACE FUNCTION generate_face_to_face_display_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  month_roman TEXT;
  next_seq INTEGER;
  lock_key BIGINT;
BEGIN
  -- Get current year and month
  current_year := TO_CHAR(NOW(), 'YY');
  current_month := TO_CHAR(NOW(), 'MM');
  month_roman := public.month_to_roman(EXTRACT(MONTH FROM NOW())::INTEGER);
  
  -- Create a unique lock key for face-to-face
  lock_key := ('x' || md5('face_to_face_' || current_year || current_month))::bit(64)::bigint;
  
  -- Acquire advisory lock
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get next sequence number for this month
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN display_id ~ ('^#T[0-9]+' || month_roman || current_year || '$')
        THEN (regexp_replace(display_id, '^#T([0-9]+).*$', '\1'))::INTEGER
        ELSE 0 
      END
    ), 0
  ) + 1 INTO next_seq
  FROM face_to_face_requests
  WHERE display_id LIKE '#T%' || month_roman || current_year;
  
  -- Generate the display ID
  NEW.display_id := '#T' || LPAD(next_seq::TEXT, 3, '0') || month_roman || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Ensure trigger uses BEFORE INSERT
DROP TRIGGER IF EXISTS generate_face_to_face_display_id_trigger ON face_to_face_requests;
CREATE TRIGGER generate_face_to_face_display_id_trigger
BEFORE INSERT ON face_to_face_requests
FOR EACH ROW
WHEN (NEW.display_id IS NULL)
EXECUTE FUNCTION generate_face_to_face_display_id();