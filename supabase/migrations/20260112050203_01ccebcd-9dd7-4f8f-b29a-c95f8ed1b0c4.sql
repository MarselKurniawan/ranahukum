-- Create table for lawyer quiz questions (managed by superadmin)
CREATE TABLE public.lawyer_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for lawyer quiz answers
CREATE TABLE public.lawyer_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.lawyer_quiz_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, question_id)
);

-- Add phone/whatsapp field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Add interview consent to lawyers table
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS interview_consent BOOLEAN DEFAULT false;
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.lawyer_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz questions
CREATE POLICY "Everyone can view active quiz questions" 
ON public.lawyer_quiz_questions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Superadmin can manage quiz questions" 
ON public.lawyer_quiz_questions 
FOR ALL 
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- RLS Policies for quiz answers
CREATE POLICY "Lawyers can insert own quiz answers" 
ON public.lawyer_quiz_answers 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_quiz_answers.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Lawyers can view own quiz answers" 
ON public.lawyer_quiz_answers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM lawyers 
  WHERE lawyers.id = lawyer_quiz_answers.lawyer_id 
  AND lawyers.user_id = auth.uid()
));

CREATE POLICY "Superadmin can view all quiz answers" 
ON public.lawyer_quiz_answers 
FOR SELECT 
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lawyer_quiz_questions_updated_at
BEFORE UPDATE ON public.lawyer_quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default quiz questions
INSERT INTO public.lawyer_quiz_questions (question, question_order) VALUES
('Mengapa Anda tertarik menjadi konsultan hukum di platform Legal Connect?', 1),
('Jelaskan pengalaman Anda dalam menangani kasus hukum. Berikan contoh spesifik.', 2),
('Bagaimana Anda menangani klien yang memiliki ekspektasi tidak realistis?', 3),
('Apa spesialisasi hukum utama Anda dan mengapa Anda memilih bidang tersebut?', 4),
('Bagaimana pendekatan Anda dalam memberikan konsultasi hukum secara online?', 5);