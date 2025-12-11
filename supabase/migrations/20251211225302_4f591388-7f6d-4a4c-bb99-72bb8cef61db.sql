-- Add newsletter-specific sender columns
ALTER TABLE public.email_design_settings 
ADD COLUMN IF NOT EXISTS newsletter_from_name TEXT DEFAULT 'ImmoOnPoint Tipps',
ADD COLUMN IF NOT EXISTS newsletter_from_email TEXT DEFAULT 'tipps@immoonpoint.de',
ADD COLUMN IF NOT EXISTS newsletter_reply_to_email TEXT,
ADD COLUMN IF NOT EXISTS newsletter_reply_to_name TEXT;

-- Update default_from_email to info@ for existing rows
UPDATE public.email_design_settings 
SET default_from_email = 'info@immoonpoint.de'
WHERE default_from_email = 'noreply@immoonpoint.de' OR default_from_email IS NULL;

-- Update the column default for new rows
ALTER TABLE public.email_design_settings 
ALTER COLUMN default_from_email SET DEFAULT 'info@immoonpoint.de';