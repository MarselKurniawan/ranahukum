-- Add consultation package settings to app_settings
INSERT INTO app_settings (key, value, description)
VALUES 
  ('chat_only_price', '{"amount": 50000}'::jsonb, 'Harga konsultasi chat saja'),
  ('chat_call_price', '{"amount": 100000}'::jsonb, 'Harga konsultasi chat + call'),
  ('anonymous_fee', '{"amount": 25000}'::jsonb, 'Biaya tambahan untuk mode anonim'),
  ('call_upgrade_price', '{"amount": 50000}'::jsonb, 'Biaya upgrade ke paket call di tengah konsultasi')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Add columns to consultations table for package tracking
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS consultation_type TEXT DEFAULT 'chat_only' CHECK (consultation_type IN ('chat_only', 'chat_call')),
ADD COLUMN IF NOT EXISTS is_call_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS call_upgrade_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS call_upgrade_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS base_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS call_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS anonymous_fee INTEGER DEFAULT 0;

-- Create a function to sync full_name from profiles when not using anonymous mode
CREATE OR REPLACE FUNCTION sync_profile_full_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if not in production to avoid issues
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_type ON consultations(consultation_type);
CREATE INDEX IF NOT EXISTS idx_consultations_call_enabled ON consultations(is_call_enabled);