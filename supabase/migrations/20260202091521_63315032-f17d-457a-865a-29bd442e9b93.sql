-- Add meeting evidence columns to face_to_face_requests
ALTER TABLE public.face_to_face_requests 
ADD COLUMN IF NOT EXISTS meeting_evidence_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_met_at TIMESTAMP WITH TIME ZONE;

-- Add price_offer message type support (already exists but let's ensure fields are there)
-- No changes needed for face_to_face_messages as it already has the fields

-- Create trigger to add earnings when face-to-face is completed
CREATE OR REPLACE FUNCTION public.add_lawyer_earnings_on_face_to_face_completion()
RETURNS TRIGGER AS $$
DECLARE
  platform_fee_percentage NUMERIC;
  platform_fee_amount NUMERIC;
  lawyer_amount NUMERIC;
  final_price NUMERIC;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Use agreed_price if available, otherwise proposed_price
    final_price := COALESCE(NEW.agreed_price, NEW.proposed_price, 0);
    
    IF final_price <= 0 THEN
      RETURN NEW;
    END IF;
    
    -- Get platform fee percentage from settings (default 10%)
    SELECT COALESCE((value::text)::numeric, 10) INTO platform_fee_percentage
    FROM app_settings 
    WHERE key = 'face_to_face_fee_percentage'
    LIMIT 1;
    
    IF platform_fee_percentage IS NULL THEN
      platform_fee_percentage := 10;
    END IF;
    
    -- Calculate amounts
    platform_fee_amount := final_price * (platform_fee_percentage / 100);
    lawyer_amount := final_price - platform_fee_amount;
    
    -- Add to lawyer_earnings
    INSERT INTO lawyer_earnings (
      lawyer_id,
      amount,
      description,
      is_withdrawn
    )
    VALUES (
      NEW.lawyer_id,
      lawyer_amount,
      'Pendapatan dari tatap muka: ' || COALESCE(NEW.case_type, 'Umum'),
      false
    );
    
    -- Add to platform_earnings
    INSERT INTO platform_earnings (
      source_type,
      source_id,
      gross_amount,
      platform_fee,
      lawyer_amount,
      fee_type,
      fee_value,
      lawyer_id,
      description
    )
    VALUES (
      'face_to_face',
      NEW.id,
      final_price,
      platform_fee_amount,
      lawyer_amount,
      'percentage',
      platform_fee_percentage,
      NEW.lawyer_id,
      'Pendapatan platform dari tatap muka'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_face_to_face_completion ON public.face_to_face_requests;
CREATE TRIGGER on_face_to_face_completion
  AFTER UPDATE ON public.face_to_face_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.add_lawyer_earnings_on_face_to_face_completion();