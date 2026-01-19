
-- Add question_type and category columns to lawyer_quiz_questions
ALTER TABLE public.lawyer_quiz_questions 
ADD COLUMN question_type TEXT NOT NULL DEFAULT 'essay' CHECK (question_type IN ('essay', 'multiple_choice')),
ADD COLUMN category TEXT;

-- Create table for multiple choice options
CREATE TABLE public.lawyer_quiz_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.lawyer_quiz_questions(id) ON DELETE CASCADE,
  option_label CHAR(1) NOT NULL, -- A, B, C, D
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on options table
ALTER TABLE public.lawyer_quiz_options ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Anyone can read quiz options"
ON public.lawyer_quiz_options
FOR SELECT
USING (true);

-- Allow superadmin to manage options
CREATE POLICY "Superadmin can manage quiz options"
ON public.lawyer_quiz_options
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'));

-- Add index for faster lookups
CREATE INDEX idx_quiz_options_question_id ON public.lawyer_quiz_options(question_id);

-- Update existing questions to have a default category
UPDATE public.lawyer_quiz_questions SET category = 'Umum' WHERE category IS NULL;
