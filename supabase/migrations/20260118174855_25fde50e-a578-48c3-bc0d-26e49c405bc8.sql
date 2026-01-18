-- Create table for pendampingan interview messages
CREATE TABLE public.pendampingan_interview_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.pendampingan_interviews(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('lawyer', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pendampingan_interview_messages ENABLE ROW LEVEL SECURITY;

-- Allow lawyers to read their own interview messages
CREATE POLICY "Lawyers can read their interview messages"
  ON public.pendampingan_interview_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pendampingan_interviews pi
      JOIN public.lawyers l ON l.id = pi.lawyer_id
      WHERE pi.id = pendampingan_interview_messages.interview_id
      AND l.user_id = auth.uid()
    )
  );

-- Allow admins to read interview messages
CREATE POLICY "Admins can read interview messages"
  ON public.pendampingan_interview_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Allow lawyers to send messages to their interview
CREATE POLICY "Lawyers can send interview messages"
  ON public.pendampingan_interview_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'lawyer' AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.pendampingan_interviews pi
      JOIN public.lawyers l ON l.id = pi.lawyer_id
      WHERE pi.id = pendampingan_interview_messages.interview_id
      AND l.user_id = auth.uid()
    )
  );

-- Allow admins to send messages
CREATE POLICY "Admins can send interview messages"
  ON public.pendampingan_interview_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'admin' AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pendampingan_interview_messages;