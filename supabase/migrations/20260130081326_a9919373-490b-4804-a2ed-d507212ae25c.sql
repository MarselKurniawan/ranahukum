-- Fix the sync_profile_full_name function to have proper search_path
DROP FUNCTION IF EXISTS public.sync_profile_full_name();

-- This function is not actually needed, we'll handle the display logic in the frontend