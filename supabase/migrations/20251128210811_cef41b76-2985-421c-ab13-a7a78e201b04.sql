-- Create reopen_requests table for clients requesting gallery reopening
CREATE TABLE public.reopen_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES public.profiles(id)
);

-- Create index for faster queries
CREATE INDEX idx_reopen_requests_gallery_id ON public.reopen_requests(gallery_id);
CREATE INDEX idx_reopen_requests_status ON public.reopen_requests(status);

-- Enable RLS
ALTER TABLE public.reopen_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Clients can create and read their own requests
CREATE POLICY "Clients can create reopen requests for assigned galleries"
ON public.reopen_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.gallery_access ga 
    WHERE ga.gallery_id = reopen_requests.gallery_id 
    AND ga.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can read their own reopen requests"
ON public.reopen_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all reopen requests
CREATE POLICY "Admins can manage all reopen requests"
ON public.reopen_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));