-- Create table for lawyer withdrawals
CREATE TABLE public.lawyer_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  notes TEXT,
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lawyer_withdrawals ENABLE ROW LEVEL SECURITY;

-- Lawyers can view their own withdrawals
CREATE POLICY "Lawyers can view own withdrawals"
  ON public.lawyer_withdrawals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyers l
      WHERE l.id = lawyer_withdrawals.lawyer_id
      AND l.user_id = auth.uid()
    )
  );

-- Lawyers can create withdrawal requests
CREATE POLICY "Lawyers can create withdrawals"
  ON public.lawyer_withdrawals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyers l
      WHERE l.id = lawyer_withdrawals.lawyer_id
      AND l.user_id = auth.uid()
    )
  );

-- Superadmin can view all withdrawals
CREATE POLICY "Superadmin can view all withdrawals"
  ON public.lawyer_withdrawals
  FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Superadmin can update withdrawals
CREATE POLICY "Superadmin can update withdrawals"
  ON public.lawyer_withdrawals
  FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Create table for lawyer earnings (track completed assistance payments)
CREATE TABLE public.lawyer_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.legal_assistance_requests(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  is_withdrawn BOOLEAN NOT NULL DEFAULT false,
  withdrawal_id UUID REFERENCES public.lawyer_withdrawals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lawyer_earnings ENABLE ROW LEVEL SECURITY;

-- Lawyers can view their own earnings
CREATE POLICY "Lawyers can view own earnings"
  ON public.lawyer_earnings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyers l
      WHERE l.id = lawyer_earnings.lawyer_id
      AND l.user_id = auth.uid()
    )
  );

-- Superadmin can view all earnings
CREATE POLICY "Superadmin can view all earnings"
  ON public.lawyer_earnings
  FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- System can insert earnings (via trigger or admin)
CREATE POLICY "System can insert earnings"
  ON public.lawyer_earnings
  FOR INSERT
  WITH CHECK (true);

-- Superadmin can update earnings
CREATE POLICY "Superadmin can update earnings"
  ON public.lawyer_earnings
  FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));