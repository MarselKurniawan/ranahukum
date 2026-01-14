-- Add is_anonymous column to consultations table
ALTER TABLE public.consultations 
ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;