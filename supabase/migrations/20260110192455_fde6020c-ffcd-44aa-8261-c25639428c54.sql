-- Create specialization_types table for dynamic consultation types
CREATE TABLE public.specialization_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.specialization_types ENABLE ROW LEVEL SECURITY;

-- Everyone can view active specialization types
CREATE POLICY "Everyone can view active specialization types" 
ON public.specialization_types 
FOR SELECT 
USING (is_active = true);

-- Superadmin can manage specialization types
CREATE POLICY "Superadmin can manage specialization types" 
ON public.specialization_types 
FOR ALL 
USING (has_role(auth.uid(), 'superadmin'));

-- Insert default specialization types
INSERT INTO public.specialization_types (name, description) VALUES
('Perceraian', 'Hukum keluarga terkait perceraian'),
('Pertanahan', 'Hukum properti dan pertanahan'),
('Hukum Keluarga', 'Warisan, pernikahan, hak asuh anak'),
('Hukum Pidana', 'Kasus pidana dan pembelaan'),
('Hukum Perdata', 'Sengketa perdata'),
('Hukum Bisnis', 'Kontrak, perusahaan, investasi'),
('Hukum Ketenagakerjaan', 'Perselisihan hubungan kerja'),
('Hukum Pajak', 'Konsultasi perpajakan'),
('Hukum Imigrasi', 'Visa, izin tinggal, kewarganegaraan');

-- Add lawyer document uploads table
CREATE TABLE public.lawyer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'ijazah', 'surat_izin', 'ktp', 'foto'
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lawyer_documents ENABLE ROW LEVEL SECURITY;

-- Lawyers can view and upload their own documents
CREATE POLICY "Lawyers can view own documents" 
ON public.lawyer_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_documents.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Lawyers can upload own documents" 
ON public.lawyer_documents 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_documents.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

-- Superadmin can view and update all documents
CREATE POLICY "Superadmin can view all documents" 
ON public.lawyer_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update all documents" 
ON public.lawyer_documents 
FOR UPDATE 
USING (has_role(auth.uid(), 'superadmin'));

-- Add pending price update request table
CREATE TABLE public.lawyer_price_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL, -- 'pendampingan_price'
  requested_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.lawyer_price_requests ENABLE ROW LEVEL SECURITY;

-- Lawyers can view and create their own price requests
CREATE POLICY "Lawyers can view own price requests" 
ON public.lawyer_price_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_price_requests.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Lawyers can create own price requests" 
ON public.lawyer_price_requests 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_price_requests.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

-- Superadmin can view and update all price requests
CREATE POLICY "Superadmin can view all price requests" 
ON public.lawyer_price_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update all price requests" 
ON public.lawyer_price_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'superadmin'));