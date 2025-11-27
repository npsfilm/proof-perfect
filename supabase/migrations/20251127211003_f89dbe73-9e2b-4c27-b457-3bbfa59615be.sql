-- Fix Problem 6: Make storage bucket private and add RLS policies
-- This ensures only authorized users can access photos in their assigned galleries

-- 1. Make the 'proofs' bucket private
UPDATE storage.buckets 
SET public = false 
WHERE name = 'proofs';

-- 2. Create policy: Users can view photos in galleries they have access to
-- Photos are organized as: proofs/[gallery-slug]/[filename]
CREATE POLICY "Users can view photos in assigned galleries"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proofs' AND
  EXISTS (
    SELECT 1 
    FROM public.gallery_access ga
    JOIN public.galleries g ON g.id = ga.gallery_id
    WHERE g.slug = (storage.foldername(name))[1]
    AND ga.user_id = auth.uid()
  )
);

-- 3. Create policy: Admins can view all photos
CREATE POLICY "Admins can view all photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.role_t
  )
);

-- 4. Create policy: Admins can upload photos
CREATE POLICY "Admins can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.role_t
  )
);

-- 5. Create policy: Admins can update photos
CREATE POLICY "Admins can update photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.role_t
  )
);

-- 6. Create policy: Admins can delete photos
CREATE POLICY "Admins can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.role_t
  )
);