-- Create client_watermarks table
CREATE TABLE public.client_watermarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  position_x NUMERIC NOT NULL DEFAULT 50, -- percentage 0-100
  position_y NUMERIC NOT NULL DEFAULT 90, -- percentage 0-100
  size_percent NUMERIC NOT NULL DEFAULT 15, -- percentage 5-50
  opacity NUMERIC NOT NULL DEFAULT 70, -- percentage 10-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Each user can have only one watermark
);

-- Enable RLS
ALTER TABLE public.client_watermarks ENABLE ROW LEVEL SECURITY;

-- Users can read their own watermark
CREATE POLICY "Users can read own watermark"
ON public.client_watermarks
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own watermark
CREATE POLICY "Users can insert own watermark"
ON public.client_watermarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watermark
CREATE POLICY "Users can update own watermark"
ON public.client_watermarks
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own watermark
CREATE POLICY "Users can delete own watermark"
ON public.client_watermarks
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for watermarks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('watermarks', 'watermarks', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for watermarks bucket
CREATE POLICY "Users can upload own watermarks"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'watermarks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own watermarks"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'watermarks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own watermarks"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'watermarks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own watermarks"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'watermarks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger for updated_at
CREATE TRIGGER update_client_watermarks_updated_at
BEFORE UPDATE ON public.client_watermarks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();