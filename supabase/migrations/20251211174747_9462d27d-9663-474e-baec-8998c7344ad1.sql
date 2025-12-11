-- Add support_email and watermark_url fields to seo_settings
ALTER TABLE public.seo_settings 
ADD COLUMN IF NOT EXISTS support_email text DEFAULT 'support@immoonpoint.de',
ADD COLUMN IF NOT EXISTS watermark_url text;