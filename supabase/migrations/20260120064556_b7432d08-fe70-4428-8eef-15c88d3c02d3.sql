-- Create lawyer_certifications table for multiple certifications
CREATE TABLE public.lawyer_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  year INTEGER,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lawyer_licenses table for multiple licenses
CREATE TABLE public.lawyer_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  license_number TEXT,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add bio and education columns to lawyers table
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS bio TEXT;

-- Enable RLS on new tables
ALTER TABLE public.lawyer_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_licenses ENABLE ROW LEVEL SECURITY;

-- RLS for lawyer_certifications
CREATE POLICY "Lawyers can view own certifications" ON public.lawyer_certifications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_certifications.lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Lawyers can insert own certifications" ON public.lawyer_certifications
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_certifications.lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Everyone can view approved certifications" ON public.lawyer_certifications
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Superadmin can view all certifications" ON public.lawyer_certifications
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update certifications" ON public.lawyer_certifications
  FOR UPDATE USING (has_role(auth.uid(), 'superadmin'));

-- RLS for lawyer_licenses
CREATE POLICY "Lawyers can view own licenses" ON public.lawyer_licenses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_licenses.lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Lawyers can insert own licenses" ON public.lawyer_licenses
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM lawyers WHERE lawyers.id = lawyer_licenses.lawyer_id AND lawyers.user_id = auth.uid()
  ));

CREATE POLICY "Everyone can view approved licenses" ON public.lawyer_licenses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Superadmin can view all licenses" ON public.lawyer_licenses
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update licenses" ON public.lawyer_licenses
  FOR UPDATE USING (has_role(auth.uid(), 'superadmin'));