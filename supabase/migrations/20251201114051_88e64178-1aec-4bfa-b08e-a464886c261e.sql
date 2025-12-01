-- Create delivery_files table for final delivery uploads
CREATE TABLE public.delivery_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  folder_type text NOT NULL,
  filename text NOT NULL,
  storage_url text NOT NULL,
  file_size bigint,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_folder_type CHECK (
    folder_type IN ('full_resolution', 'web_version', 'virtual_staging', 'blue_hour')
  )
);

-- Enable RLS
ALTER TABLE public.delivery_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can manage all delivery files
CREATE POLICY "Admins can manage all delivery files"
ON public.delivery_files
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Clients can read delivery files in galleries they have access to
CREATE POLICY "Clients can read delivery files in assigned galleries"
ON public.delivery_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM gallery_access ga
    WHERE ga.gallery_id = delivery_files.gallery_id
      AND ga.user_id = auth.uid()
  )
);

-- Create deliveries storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliveries', 'deliveries', false);

-- RLS policies for deliveries bucket
-- Admins can upload/manage all files
CREATE POLICY "Admins can manage all delivery files in storage"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'deliveries' 
  AND has_role(auth.uid(), 'admin'::role_t)
)
WITH CHECK (
  bucket_id = 'deliveries' 
  AND has_role(auth.uid(), 'admin'::role_t)
);

-- Clients can read files in galleries they have access to
CREATE POLICY "Clients can read delivery files in storage"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'deliveries'
  AND EXISTS (
    SELECT 1
    FROM galleries g
    JOIN gallery_access ga ON ga.gallery_id = g.id
    WHERE auth.uid() = ga.user_id
      AND (storage.foldername(name))[1] = g.slug
  )
);