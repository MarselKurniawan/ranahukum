-- Add approval status for lawyers
ALTER TABLE public.lawyers 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lawyers_approval_status ON public.lawyers(approval_status);

-- Superadmin can view all lawyers
CREATE POLICY "Superadmin can view all lawyers" 
ON public.lawyers 
FOR SELECT 
USING (public.has_role(auth.uid(), 'superadmin'));

-- Superadmin can update any lawyer (for price setting and approval)
CREATE POLICY "Superadmin can update all lawyers" 
ON public.lawyers 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'superadmin'));

-- Superadmin can view all consultations
CREATE POLICY "Superadmin can view all consultations" 
ON public.consultations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'superadmin'));

-- Superadmin can view all messages
CREATE POLICY "Superadmin can view all messages" 
ON public.messages 
FOR SELECT 
USING (public.has_role(auth.uid(), 'superadmin'));

-- Superadmin can view all profiles
CREATE POLICY "Superadmin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'superadmin'));