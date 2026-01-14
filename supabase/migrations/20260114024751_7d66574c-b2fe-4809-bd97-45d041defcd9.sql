-- Add suspension duration fields to lawyers and profiles tables
ALTER TABLE public.lawyers 
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspend_reason TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspend_reason TEXT;

-- Create interview_sessions table for interview chat between SuperAdmin and Lawyer
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  google_meet_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview_messages table for chat messages
CREATE TABLE public.interview_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'lawyer')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_sessions
-- SuperAdmin can see all sessions
CREATE POLICY "SuperAdmin can view all interview sessions"
ON public.interview_sessions
FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

-- SuperAdmin can create sessions
CREATE POLICY "SuperAdmin can create interview sessions"
ON public.interview_sessions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- SuperAdmin can update sessions
CREATE POLICY "SuperAdmin can update interview sessions"
ON public.interview_sessions
FOR UPDATE
USING (public.has_role(auth.uid(), 'superadmin'));

-- Lawyers can view their own sessions
CREATE POLICY "Lawyers can view their own interview sessions"
ON public.interview_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lawyers l 
    WHERE l.id = interview_sessions.lawyer_id 
    AND l.user_id = auth.uid()
  )
);

-- RLS Policies for interview_messages
-- SuperAdmin can see all messages
CREATE POLICY "SuperAdmin can view all interview messages"
ON public.interview_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'superadmin'));

-- SuperAdmin can send messages
CREATE POLICY "SuperAdmin can send interview messages"
ON public.interview_messages
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Lawyers can view messages in their sessions
CREATE POLICY "Lawyers can view their interview messages"
ON public.interview_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.interview_sessions s
    JOIN public.lawyers l ON l.id = s.lawyer_id
    WHERE s.id = interview_messages.interview_id 
    AND l.user_id = auth.uid()
  )
);

-- Lawyers can send messages in their sessions
CREATE POLICY "Lawyers can send interview messages"
ON public.interview_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interview_sessions s
    JOIN public.lawyers l ON l.id = s.lawyer_id
    WHERE s.id = interview_messages.interview_id 
    AND l.user_id = auth.uid()
    AND s.status = 'active'
  )
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_interview_sessions_updated_at
BEFORE UPDATE ON public.interview_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for interview messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_messages;