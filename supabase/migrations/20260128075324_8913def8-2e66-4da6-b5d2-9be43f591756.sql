-- Fix race condition in consultation display_id generation
-- Current implementation uses MAX()+1 without locking, which can collide on concurrent inserts.

CREATE OR REPLACE FUNCTION public.generate_consultation_display_id()
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
  -- Ensure created_at exists for month/year derivation
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  month_num := EXTRACT(MONTH FROM NEW.created_at);
  year_num := EXTRACT(YEAR FROM NEW.created_at);
  year_short := TO_CHAR(NEW.created_at, 'YY');
  month_roman := public.month_to_roman(month_num);

  -- Serialize ID generation per (year, month) to avoid duplicates
  PERFORM pg_advisory_xact_lock(hashtext('consultations_display_id_' || year_num::text || '_' || month_num::text));

  SELECT COALESCE(MAX(
    CASE
      WHEN display_id ~ ('^#C[0-9]{3}' || month_roman || year_short || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO seq_num
  FROM public.consultations
  WHERE EXTRACT(MONTH FROM created_at) = month_num
    AND EXTRACT(YEAR FROM created_at) = year_num;

  NEW.display_id := '#C' || LPAD(seq_num::text, 3, '0') || month_roman || year_short;
  RETURN NEW;
END;
$$;