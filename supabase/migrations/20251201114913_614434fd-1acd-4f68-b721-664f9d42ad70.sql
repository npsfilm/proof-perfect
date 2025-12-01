-- Create download_logs table for tracking file downloads
CREATE TABLE public.download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  download_type text NOT NULL, -- 'single_file', 'folder_zip', 'gallery_zip'
  folder_type text, -- NULL for single files and gallery_zip
  file_id uuid REFERENCES public.delivery_files(id) ON DELETE SET NULL, -- NULL for zip downloads
  file_count integer NOT NULL DEFAULT 1,
  total_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_download_type CHECK (
    download_type IN ('single_file', 'folder_zip', 'gallery_zip')
  )
);

-- Create index for faster queries
CREATE INDEX idx_download_logs_gallery_id ON public.download_logs(gallery_id);
CREATE INDEX idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX idx_download_logs_created_at ON public.download_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can read all download logs
CREATE POLICY "Admins can read all download logs"
ON public.download_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::role_t));

-- Clients can insert their own download logs
CREATE POLICY "Clients can insert own download logs"
ON public.download_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create zip_jobs table for async ZIP generation
CREATE TABLE public.zip_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  folder_type text, -- NULL for full gallery download
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_count integer,
  total_size_bytes bigint,
  storage_path text, -- Path to generated ZIP in storage
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz, -- ZIP file expiration (24 hours after completion)
  
  CONSTRAINT valid_zip_job_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  )
);

-- Create index for faster queries
CREATE INDEX idx_zip_jobs_user_id ON public.zip_jobs(user_id);
CREATE INDEX idx_zip_jobs_status ON public.zip_jobs(status);
CREATE INDEX idx_zip_jobs_created_at ON public.zip_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE public.zip_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can read all zip jobs
CREATE POLICY "Admins can read all zip jobs"
ON public.zip_jobs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::role_t));

-- Clients can read their own zip jobs
CREATE POLICY "Clients can read own zip jobs"
ON public.zip_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Clients can insert their own zip jobs
CREATE POLICY "Clients can insert own zip jobs"
ON public.zip_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for generated ZIP files
INSERT INTO storage.buckets (id, name, public)
VALUES ('zip-files', 'zip-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for zip-files bucket
-- Users can read their own ZIP files
CREATE POLICY "Users can read own zip files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'zip-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- System (service role) can write ZIP files
CREATE POLICY "Service role can manage zip files"
ON storage.objects
FOR ALL
USING (bucket_id = 'zip-files')
WITH CHECK (bucket_id = 'zip-files');