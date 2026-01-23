-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_legal_assistance_display_id ON public.legal_assistance_requests;
DROP FUNCTION IF EXISTS public.generate_legal_assistance_display_id();

-- Create improved function with correct regex matching
CREATE OR REPLACE FUNCTION public.generate_legal_assistance_display_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  current_month INT;
  month_roman TEXT;
  next_sequence INT;
BEGIN
  -- Get current year (last 2 digits) and month
  current_year := TO_CHAR(NOW(), 'YY');
  current_month := EXTRACT(MONTH FROM NOW())::INT;
  
  -- Convert month to roman numeral
  month_roman := public.month_to_roman(current_month);
  
  -- Get next sequence number with proper regex and lock
  SELECT COALESCE(MAX(
    CASE 
      WHEN display_id ~ ('^#P[0-9]{3}' || month_roman || current_year || '$')
      THEN CAST(SUBSTRING(display_id FROM 3 FOR 3) AS integer)
      ELSE 0
    END
  ), 0) + 1
  INTO next_sequence
  FROM public.legal_assistance_requests;
  
  -- Generate display_id: #P008I26 format
  NEW.display_id := '#P' || LPAD(next_sequence::TEXT, 3, '0') || month_roman || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate trigger
CREATE TRIGGER set_legal_assistance_display_id
  BEFORE INSERT ON public.legal_assistance_requests
  FOR EACH ROW
  WHEN (NEW.display_id IS NULL)
  EXECUTE FUNCTION public.generate_legal_assistance_display_id();