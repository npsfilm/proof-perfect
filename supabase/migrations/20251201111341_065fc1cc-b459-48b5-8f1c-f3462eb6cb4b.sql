-- Create staging_requests table for post-delivery staging orders
CREATE TABLE public.staging_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered')),
  staging_style text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create staging_request_photos junction table
CREATE TABLE public.staging_request_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staging_request_id uuid NOT NULL REFERENCES public.staging_requests(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staging_request_id, photo_id)
);

-- Add updated_at trigger for staging_requests
CREATE TRIGGER set_staging_requests_updated_at
  BEFORE UPDATE ON public.staging_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on both tables
ALTER TABLE public.staging_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_request_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staging_requests

-- Admins can manage all staging requests
CREATE POLICY "Admins can manage all staging requests"
ON public.staging_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Clients can read their own staging requests
CREATE POLICY "Clients can read own staging requests"
ON public.staging_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Clients can create staging requests for delivered galleries they have access to
CREATE POLICY "Clients can create staging requests for delivered galleries"
ON public.staging_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM galleries g
    JOIN gallery_access ga ON ga.gallery_id = g.id
    WHERE g.id = staging_requests.gallery_id
      AND ga.user_id = auth.uid()
      AND g.status = 'Delivered'
  )
);

-- RLS Policies for staging_request_photos

-- Admins can manage all staging request photos
CREATE POLICY "Admins can manage all staging request photos"
ON public.staging_request_photos
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Clients can read photos from their own staging requests
CREATE POLICY "Clients can read own staging request photos"
ON public.staging_request_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staging_requests sr
    WHERE sr.id = staging_request_photos.staging_request_id
      AND sr.user_id = auth.uid()
  )
);

-- Clients can insert photos to their own staging requests
CREATE POLICY "Clients can insert own staging request photos"
ON public.staging_request_photos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staging_requests sr
    WHERE sr.id = staging_request_photos.staging_request_id
      AND sr.user_id = auth.uid()
  )
);