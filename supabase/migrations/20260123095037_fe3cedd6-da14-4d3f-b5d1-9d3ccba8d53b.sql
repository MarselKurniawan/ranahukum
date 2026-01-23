-- =====================================================
-- FIX 1: Make chat-files bucket private and add secure policies
-- =====================================================

-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

-- Create secure SELECT policies based on file folder/ownership

-- Policy for lawyer photos (public profile photos - can remain accessible)
CREATE POLICY "Anyone can view lawyer photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files' 
  AND (storage.foldername(name))[1] = 'lawyer-photos'
);

-- Policy for consultation files (only participants can view)
CREATE POLICY "Consultation participants can view chat files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files' 
  AND (storage.foldername(name))[1] NOT IN ('lawyer-documents', 'lawyer-photos', 'certifications', 'licenses')
  AND (
    -- Owner of the file (user_id is first folder)
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Lawyer participant in the consultation
    EXISTS (
      SELECT 1 FROM consultations c
      JOIN lawyers l ON l.id = c.lawyer_id
      WHERE c.id::text = (storage.foldername(name))[2]
      AND l.user_id = auth.uid()
    )
  )
);

-- Policy for lawyer documents (only owner lawyer and superadmin)
CREATE POLICY "Lawyers can view own documents in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND (storage.foldername(name))[1] = 'lawyer-documents'
  AND (
    EXISTS (
      SELECT 1 FROM lawyers l
      JOIN lawyer_documents ld ON ld.lawyer_id = l.id
      WHERE l.user_id = auth.uid()
      AND ld.file_url LIKE '%' || name
    )
    OR has_role(auth.uid(), 'superadmin')
  )
);

-- Policy for certifications (only owner lawyer and superadmin)
CREATE POLICY "Lawyers can view own certifications in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND (storage.foldername(name))[1] = 'certifications'
  AND (
    auth.uid()::text = (storage.foldername(name))[2]
    OR has_role(auth.uid(), 'superadmin')
  )
);

-- Policy for licenses (only owner lawyer and superadmin)
CREATE POLICY "Lawyers can view own licenses in storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND (storage.foldername(name))[1] = 'licenses'
  AND (
    auth.uid()::text = (storage.foldername(name))[2]
    OR has_role(auth.uid(), 'superadmin')
  )
);

-- Superadmin can view all files
CREATE POLICY "Superadmin can view all chat files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND has_role(auth.uid(), 'superadmin')
);

-- =====================================================
-- FIX 2: Remove overly permissive INSERT policies
-- =====================================================

-- Drop permissive INSERT policies on system tables
DROP POLICY IF EXISTS "System can insert alerts" ON public.user_activity_alerts;
DROP POLICY IF EXISTS "System can insert earnings" ON public.lawyer_earnings;
DROP POLICY IF EXISTS "System can insert platform earnings" ON public.platform_earnings;

-- Recreate with proper restrictions

-- user_activity_alerts: Only superadmin can insert alerts (triggers bypass RLS)
CREATE POLICY "Superadmin can insert alerts"
ON public.user_activity_alerts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- lawyer_earnings: Only superadmin can insert earnings (triggers bypass RLS)
CREATE POLICY "Superadmin can insert earnings"
ON public.lawyer_earnings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- platform_earnings: Only superadmin can insert platform earnings (triggers bypass RLS)
CREATE POLICY "Superadmin can insert platform earnings"
ON public.platform_earnings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'superadmin'));