-- Add extended email settings columns for anti-spam optimization
ALTER TABLE email_design_settings
ADD COLUMN IF NOT EXISTS default_from_name TEXT DEFAULT 'ImmoOnPoint',
ADD COLUMN IF NOT EXISTS default_from_email TEXT DEFAULT 'noreply@immoonpoint.de',
ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
ADD COLUMN IF NOT EXISTS reply_to_name TEXT,
ADD COLUMN IF NOT EXISTS unsubscribe_email TEXT,
ADD COLUMN IF NOT EXISTS unsubscribe_url TEXT,
ADD COLUMN IF NOT EXISTS physical_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS physical_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS physical_address_country TEXT DEFAULT 'Deutschland',
ADD COLUMN IF NOT EXISTS include_physical_address BOOLEAN DEFAULT true;