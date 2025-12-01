-- Add reference_image_urls column to staging_requests table
ALTER TABLE public.staging_requests
ADD COLUMN reference_image_urls text[] DEFAULT '{}'::text[];