-- Allow superadmin to update any profile (needed for suspend/unsuspend clients)
CREATE POLICY "Superadmin can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'superadmin'::app_role));