-- Add cancel_reason column to legal_assistance_requests for pendampingan cancellation
ALTER TABLE public.legal_assistance_requests
ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS cancelled_by UUID NULL,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE NULL;

-- Add cancel_reason to consultations for chat cancellation with reason
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS cancelled_by UUID NULL,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE NULL;

-- Add auto_rejected flag to track if rejection was automatic
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS auto_expired BOOLEAN DEFAULT FALSE;

ALTER TABLE public.legal_assistance_requests
ADD COLUMN IF NOT EXISTS auto_expired BOOLEAN DEFAULT FALSE;