-- Create function to add lawyer earnings only when consultation is completed
CREATE OR REPLACE FUNCTION public.add_lawyer_earnings_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  platform_fee_percentage NUMERIC;
  platform_fee_amount NUMERIC;
  lawyer_amount NUMERIC;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get platform fee percentage from settings (default 15%)
    SELECT COALESCE((value::text)::numeric, 15) INTO platform_fee_percentage
    FROM app_settings 
    WHERE key = 'consultation_fee_percentage'
    LIMIT 1;
    
    IF platform_fee_percentage IS NULL THEN
      platform_fee_percentage := 15;
    END IF;
    
    -- Calculate amounts
    platform_fee_amount := NEW.price * (platform_fee_percentage / 100);
    lawyer_amount := NEW.price - platform_fee_amount;
    
    -- Add to lawyer_earnings
    INSERT INTO lawyer_earnings (
      lawyer_id,
      amount,
      description,
      is_withdrawn
    )
    SELECT 
      NEW.lawyer_id,
      lawyer_amount,
      'Pendapatan dari konsultasi: ' || NEW.topic,
      false;
    
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
      'consultation',
      NEW.id,
      NEW.price,
      platform_fee_amount,
      lawyer_amount,
      'percentage',
      platform_fee_percentage,
      NEW.lawyer_id,
      'Pendapatan platform dari konsultasi'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for consultation completion
DROP TRIGGER IF EXISTS add_earnings_on_consultation_completion ON consultations;
CREATE TRIGGER add_earnings_on_consultation_completion
AFTER UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION add_lawyer_earnings_on_completion();

-- Create function to add lawyer earnings when legal assistance is completed
CREATE OR REPLACE FUNCTION public.add_lawyer_earnings_on_assistance_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    WHERE key = 'pendampingan_fee_percentage'
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
      request_id,
      is_withdrawn
    )
    VALUES (
      NEW.lawyer_id,
      lawyer_amount,
      'Pendapatan dari pendampingan hukum: ' || COALESCE(NEW.case_type, 'Umum'),
      NEW.id,
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
      'pendampingan',
      NEW.id,
      final_price,
      platform_fee_amount,
      lawyer_amount,
      'percentage',
      platform_fee_percentage,
      NEW.lawyer_id,
      'Pendapatan platform dari pendampingan hukum'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for legal assistance completion
DROP TRIGGER IF EXISTS add_earnings_on_assistance_completion ON legal_assistance_requests;
CREATE TRIGGER add_earnings_on_assistance_completion
AFTER UPDATE ON legal_assistance_requests
FOR EACH ROW
EXECUTE FUNCTION add_lawyer_earnings_on_assistance_completion();