-- Add brand trademark notice column
ALTER TABLE public.email_design_settings 
ADD COLUMN IF NOT EXISTS brand_trademark_notice TEXT DEFAULT 'ImmoOnPoint ist eine Marke der NPS Media GmbH';

-- Update existing rows with default value
UPDATE public.email_design_settings 
SET brand_trademark_notice = 'ImmoOnPoint ist eine Marke der NPS Media GmbH'
WHERE brand_trademark_notice IS NULL;