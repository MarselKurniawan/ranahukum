-- Drop the foreign key constraint on lawyers.user_id to allow sample data
ALTER TABLE public.lawyers DROP CONSTRAINT IF EXISTS lawyers_user_id_fkey;

-- Insert sample lawyers data
INSERT INTO public.lawyers (user_id, name, specialization, rating, review_count, consultation_count, price, experience_years, image_url, location, is_verified, is_available, pendampingan_price)
VALUES 
  (gen_random_uuid(), 'Dr. Ahmad Fauzi, S.H., M.H.', ARRAY['Hukum Pidana', 'Hukum Perdata'], 4.9, 156, 342, 150000, 15, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 'Jakarta Selatan', true, true, 2500000),
  (gen_random_uuid(), 'Sarah Putri, S.H., LL.M.', ARRAY['Hukum Bisnis', 'Hukum Kontrak'], 4.8, 98, 215, 200000, 10, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'Jakarta Pusat', true, true, 3000000),
  (gen_random_uuid(), 'Budi Santoso, S.H., M.Kn.', ARRAY['Hukum Properti', 'Hukum Keluarga'], 4.7, 87, 178, 175000, 12, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Bandung', true, true, 2000000),
  (gen_random_uuid(), 'Dewi Anggraini, S.H.', ARRAY['Hukum Ketenagakerjaan', 'Hukum Perdata'], 4.6, 64, 134, 125000, 8, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'Surabaya', true, true, 1800000),
  (gen_random_uuid(), 'Rizky Pratama, S.H., M.H.', ARRAY['Hukum Pidana', 'Hukum Perdata'], 4.5, 45, 89, 100000, 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Yogyakarta', false, true, 1500000),
  (gen_random_uuid(), 'Linda Wijaya, S.H., LL.M.', ARRAY['Hukum Bisnis', 'Hukum Internasional'], 4.9, 120, 267, 250000, 18, 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 'Jakarta Selatan', true, true, 4000000);