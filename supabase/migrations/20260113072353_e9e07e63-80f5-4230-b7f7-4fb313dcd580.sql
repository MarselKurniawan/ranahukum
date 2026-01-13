-- Create app_settings table for global settings (like chat consultation price)
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view settings
CREATE POLICY "Everyone can view app settings" ON public.app_settings
  FOR SELECT USING (true);

-- Superadmin can manage settings
CREATE POLICY "Superadmin can manage app settings" ON public.app_settings
  FOR ALL USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Insert default consultation price
INSERT INTO public.app_settings (key, value, description)
VALUES ('consultation_price', '{"amount": 50000}'::jsonb, 'Harga konsultasi chat (sama untuk semua lawyer)');

-- Create legal_assistance_requests table
CREATE TABLE public.legal_assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  lawyer_id uuid REFERENCES public.lawyers(id) NOT NULL,
  case_description text NOT NULL,
  proposed_price integer,
  agreed_price integer,
  status text NOT NULL DEFAULT 'pending',
  current_stage text,
  stage_notes text,
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_assistance_requests ENABLE ROW LEVEL SECURITY;

-- Clients can create their own requests
CREATE POLICY "Clients can create own assistance requests" ON public.legal_assistance_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can view their own requests
CREATE POLICY "Clients can view own assistance requests" ON public.legal_assistance_requests
  FOR SELECT USING (auth.uid() = client_id);

-- Lawyers can view requests for them
CREATE POLICY "Lawyers can view their assistance requests" ON public.legal_assistance_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lawyers 
      WHERE lawyers.id = legal_assistance_requests.lawyer_id 
      AND lawyers.user_id = auth.uid()
    )
  );

-- Lawyers can update requests for them
CREATE POLICY "Lawyers can update their assistance requests" ON public.legal_assistance_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lawyers 
      WHERE lawyers.id = legal_assistance_requests.lawyer_id 
      AND lawyers.user_id = auth.uid()
    )
  );

-- Clients can update their own requests (for agreed_price, payment_status)
CREATE POLICY "Clients can update own assistance requests" ON public.legal_assistance_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Superadmin can view all
CREATE POLICY "Superadmin can view all assistance requests" ON public.legal_assistance_requests
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Create legal_assistance_messages table for negotiation chat
CREATE TABLE public.legal_assistance_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.legal_assistance_requests(id) NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  is_price_offer boolean DEFAULT false,
  offered_price integer,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_assistance_messages ENABLE ROW LEVEL SECURITY;

-- Participants can send messages
CREATE POLICY "Request participants can send messages" ON public.legal_assistance_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM legal_assistance_requests r
      WHERE r.id = legal_assistance_messages.request_id
      AND (
        r.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lawyers l
          WHERE l.id = r.lawyer_id AND l.user_id = auth.uid()
        )
      )
    )
  );

-- Participants can view messages
CREATE POLICY "Request participants can view messages" ON public.legal_assistance_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM legal_assistance_requests r
      WHERE r.id = legal_assistance_messages.request_id
      AND (
        r.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lawyers l
          WHERE l.id = r.lawyer_id AND l.user_id = auth.uid()
        )
      )
    )
  );

-- Superadmin can view all messages
CREATE POLICY "Superadmin can view all assistance messages" ON public.legal_assistance_messages
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Create legal_assistance_status_history table for tracking
CREATE TABLE public.legal_assistance_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.legal_assistance_requests(id) NOT NULL,
  status text NOT NULL,
  stage text,
  notes text,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_assistance_status_history ENABLE ROW LEVEL SECURITY;

-- Lawyers can insert status history
CREATE POLICY "Lawyers can insert status history" ON public.legal_assistance_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_assistance_requests r
      JOIN lawyers l ON l.id = r.lawyer_id
      WHERE r.id = legal_assistance_status_history.request_id
      AND l.user_id = auth.uid()
    )
  );

-- Participants can view status history
CREATE POLICY "Participants can view status history" ON public.legal_assistance_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM legal_assistance_requests r
      WHERE r.id = legal_assistance_status_history.request_id
      AND (
        r.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM lawyers l
          WHERE l.id = r.lawyer_id AND l.user_id = auth.uid()
        )
      )
    )
  );

-- Superadmin can view all
CREATE POLICY "Superadmin can view all status history" ON public.legal_assistance_status_history
  FOR SELECT USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Enable realtime for messages and requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.legal_assistance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.legal_assistance_messages;

-- Create trigger for updated_at
CREATE TRIGGER update_legal_assistance_requests_updated_at
  BEFORE UPDATE ON public.legal_assistance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();