
-- Allow lawyers to view profiles of clients they have consultations with
CREATE POLICY "Lawyers can view client profiles for consultations"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consultations c
    JOIN lawyers l ON l.id = c.lawyer_id
    WHERE c.client_id = profiles.user_id
    AND l.user_id = auth.uid()
  )
);

-- Allow lawyers to view client profiles for legal assistance requests
CREATE POLICY "Lawyers can view client profiles for assistance"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM legal_assistance_requests r
    JOIN lawyers l ON l.id = r.lawyer_id
    WHERE r.client_id = profiles.user_id
    AND l.user_id = auth.uid()
  )
);

-- Allow lawyers to view client profiles for face-to-face requests
CREATE POLICY "Lawyers can view client profiles for face to face"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM face_to_face_requests r
    JOIN lawyers l ON l.id = r.lawyer_id
    WHERE r.client_id = profiles.user_id
    AND l.user_id = auth.uid()
  )
);

-- Allow clients to view lawyer profiles (for chat headers)
CREATE POLICY "Clients can view profiles of lawyers they interact with"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consultations c
    JOIN lawyers l ON l.id = c.lawyer_id
    WHERE l.user_id = profiles.user_id
    AND c.client_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM legal_assistance_requests r
    JOIN lawyers l ON l.id = r.lawyer_id
    WHERE l.user_id = profiles.user_id
    AND r.client_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM face_to_face_requests r
    JOIN lawyers l ON l.id = r.lawyer_id
    WHERE l.user_id = profiles.user_id
    AND r.client_id = auth.uid()
  )
);
