
-- Drop the admin-only insert policy
DROP POLICY "Admins can insert publicaciones" ON public.publicaciones;

-- Allow any authenticated user to insert publicaciones (with their own user_id)
CREATE POLICY "Authenticated users can insert publicaciones"
ON public.publicaciones
FOR INSERT
WITH CHECK (auth.uid() = user_id);
