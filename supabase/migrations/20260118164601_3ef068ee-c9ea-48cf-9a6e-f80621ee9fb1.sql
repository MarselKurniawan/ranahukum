-- Add client identity fields to legal_assistance_requests for Surat Kuasa
ALTER TABLE public.legal_assistance_requests
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS client_age INTEGER,
ADD COLUMN IF NOT EXISTS client_religion TEXT,
ADD COLUMN IF NOT EXISTS client_nik TEXT,
ADD COLUMN IF NOT EXISTS case_type TEXT,
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS surat_kuasa_url TEXT,
ADD COLUMN IF NOT EXISTS surat_kuasa_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS meeting_date DATE,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS meeting_location TEXT,
ADD COLUMN IF NOT EXISTS meeting_notes TEXT,
ADD COLUMN IF NOT EXISTS meeting_evidence_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_signature_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meeting_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS can_withdraw BOOLEAN DEFAULT FALSE;

-- Create storage bucket for legal assistance documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legal-assistance-docs', 'legal-assistance-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for legal assistance documents
CREATE POLICY "Clients can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'legal-assistance-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Lawyers can upload surat kuasa and meeting evidence" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'legal-assistance-docs' 
  AND EXISTS (
    SELECT 1 FROM lawyers l 
    WHERE l.user_id = auth.uid()
  )
);

CREATE POLICY "Request participants can view documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'legal-assistance-docs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM lawyers l WHERE l.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Superadmin can view all legal docs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'legal-assistance-docs' 
  AND has_role(auth.uid(), 'superadmin'::app_role)
);