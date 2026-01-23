
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_legal_assistance_display_id ON public.legal_assistance_requests;
DROP FUNCTION IF EXISTS generate_legal_assistance_display_id();

-- Create improved function with better sequence handling
CREATE OR REPLACE FUNCTION generate_legal_assistance_display_id()
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
  month_roman := month_to_roman(current_month);
  
  -- Get next sequence number with lock to prevent race condition
  SELECT COALESCE(MAX(
    CASE 
      WHEN display_id ~ '^#P[0-9]+' THEN 
        SUBSTRING(display_id FROM '#P([0-9]+)')::INT
      ELSE 0
    END
  ), 0) + 1
  INTO next_sequence
  FROM legal_assistance_requests
  WHERE display_id LIKE '#P%' || month_roman || current_year
  FOR UPDATE;
  
  -- Generate display_id: #P001I26 format
  NEW.display_id := '#P' || LPAD(next_sequence::TEXT, 3, '0') || month_roman || current_year;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER set_legal_assistance_display_id
  BEFORE INSERT ON public.legal_assistance_requests
  FOR EACH ROW
  WHEN (NEW.display_id IS NULL)
  EXECUTE FUNCTION generate_legal_assistance_display_id();
