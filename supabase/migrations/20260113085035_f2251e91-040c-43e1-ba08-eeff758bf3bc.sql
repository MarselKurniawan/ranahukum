-- Add is_suspended column to profiles for client deactivation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Add is_suspended column to lawyers for lawyer deactivation
ALTER TABLE public.lawyers ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;