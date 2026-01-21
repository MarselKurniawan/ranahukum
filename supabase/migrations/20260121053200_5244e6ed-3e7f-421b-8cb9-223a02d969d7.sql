-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.generate_consultation_display_id()
RETURNS TRIGGER AS $$
DECLARE
  month_num integer;
  year_short text;
  month_roman text;
  seq_num integer;
  new_display_id text;
BEGIN
  month_num := EXTRACT(MONTH FROM NEW.created_at);
  year_short := TO_CHAR(NEW.created_at, 'YY');
  month_roman := public.month_to_roman(month_num);
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN display_id ~ ('^#C[0-9]{3}' || month_roman || year_short || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1 INTO seq_num
  FROM public.consultations
  WHERE EXTRACT(MONTH FROM created_at) = month_num
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NEW.created_at);
  
  new_display_id := '#C' || LPAD(seq_num::text, 3, '0') || month_roman || year_short;
  NEW.display_id := new_display_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_assistance_display_id()
RETURNS TRIGGER AS $$
DECLARE
  month_num integer;
  year_short text;
  month_roman text;
  seq_num integer;
  new_display_id text;
BEGIN
  month_num := EXTRACT(MONTH FROM NEW.created_at);
  year_short := TO_CHAR(NEW.created_at, 'YY');
  month_roman := public.month_to_roman(month_num);
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN display_id ~ ('^#P[0-9]{3}' || month_roman || year_short || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1 INTO seq_num
  FROM public.legal_assistance_requests
  WHERE EXTRACT(MONTH FROM created_at) = month_num
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NEW.created_at);
  
  new_display_id := '#P' || LPAD(seq_num::text, 3, '0') || month_roman || year_short;
  NEW.display_id := new_display_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;