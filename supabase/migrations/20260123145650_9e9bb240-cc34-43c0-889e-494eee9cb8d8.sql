-- Fix duplicate display_id generation triggers for legal assistance requests
-- and add client location fields (city + district)

-- 1) Remove the duplicate trigger/function so only ONE generator runs
DROP TRIGGER IF EXISTS set_legal_assistance_display_id ON public.legal_assistance_requests;
DROP FUNCTION IF EXISTS public.generate_legal_assistance_display_id();

-- 2) Make the remaining generator race-safe and month-scoped
CREATE OR REPLACE FUNCTION public.generate_assistance_display_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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

  -- Prevent race conditions per month/year
  PERFORM pg_advisory_xact_lock(hashtext('legal_assistance_display_id_' || year_num::text || '_' || month_num::text));

  SELECT COALESCE(MAX(
    CASE
      WHEN display_id ~ ('^#P[0-9]{3}' || month_roman || year_short || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO seq_num
  FROM public.legal_assistance_requests
  WHERE EXTRACT(MONTH FROM created_at) = month_num
    AND EXTRACT(YEAR FROM created_at) = year_num;

  NEW.display_id := '#P' || LPAD(seq_num::text, 3, '0') || month_roman || year_short;
  RETURN NEW;
END;
$$;

-- Ensure the trigger still exists and points to the correct function
DROP TRIGGER IF EXISTS set_assistance_display_id ON public.legal_assistance_requests;
CREATE TRIGGER set_assistance_display_id
BEFORE INSERT ON public.legal_assistance_requests
FOR EACH ROW
WHEN (new.display_id IS NULL)
EXECUTE FUNCTION public.generate_assistance_display_id();

-- 3) Add client location fields for the "Mulai Chat" form
ALTER TABLE public.legal_assistance_requests
  ADD COLUMN IF NOT EXISTS client_city TEXT,
  ADD COLUMN IF NOT EXISTS client_district TEXT;