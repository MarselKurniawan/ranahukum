-- Create notifications table for admin-managed notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- promo, announcement, info
  image_url TEXT,
  promo_code TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_audience TEXT NOT NULL DEFAULT 'all', -- all, lawyers, clients
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notification_reads to track which users have read which notifications
CREATE TABLE public.user_notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Everyone can view active notifications
CREATE POLICY "Everyone can view active notifications"
  ON public.notifications
  FOR SELECT
  USING (is_active = true);

-- Superadmin can manage all notifications
CREATE POLICY "Superadmin can manage notifications"
  ON public.notifications
  FOR ALL
  USING (has_role(auth.uid(), 'superadmin'));

-- RLS Policies for user_notification_reads
-- Users can view their own read status
CREATE POLICY "Users can view own notification reads"
  ON public.user_notification_reads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read"
  ON public.user_notification_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;