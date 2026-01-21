-- Add display_id column to consultations
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS display_id text UNIQUE;

-- Add display_id column to legal_assistance_requests
ALTER TABLE public.legal_assistance_requests 
ADD COLUMN IF NOT EXISTS display_id text UNIQUE;