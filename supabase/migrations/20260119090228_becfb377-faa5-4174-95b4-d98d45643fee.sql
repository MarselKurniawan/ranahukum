-- Add platform fee settings to app_settings
INSERT INTO public.app_settings (key, value, description)
VALUES 
  ('platform_fee_chat', '{"type": "fixed", "amount": 5000}'::jsonb, 'Biaya platform untuk konsultasi chat (type: fixed/percentage, amount: value)'),
  ('platform_fee_pendampingan', '{"type": "percentage", "amount": 5}'::jsonb, 'Biaya platform untuk pendampingan hukum (type: fixed/percentage, amount: value)')
ON CONFLICT (key) DO NOTHING;

-- Create platform_earnings table for admin/platform income
CREATE TABLE IF NOT EXISTS public.platform_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL, -- 'consultation' or 'pendampingan'
  source_id UUID, -- consultation_id or request_id
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE SET NULL,
  gross_amount INTEGER NOT NULL, -- total payment from client
  platform_fee INTEGER NOT NULL, -- fee that goes to platform
  lawyer_amount INTEGER NOT NULL, -- amount that goes to lawyer
  fee_type TEXT NOT NULL, -- 'fixed' or 'percentage'
  fee_value INTEGER NOT NULL, -- the actual fee setting value used
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Enable RLS
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

-- Only superadmin can view platform earnings
CREATE POLICY "Superadmin can view platform earnings" ON public.platform_earnings
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- System can insert (for automatic recording)
CREATE POLICY "System can insert platform earnings" ON public.platform_earnings
  FOR INSERT WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_platform_earnings_created_at ON public.platform_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_source_type ON public.platform_earnings(source_type);