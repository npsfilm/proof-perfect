-- Add email template columns to system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS email_send_subject TEXT,
ADD COLUMN IF NOT EXISTS email_send_body TEXT,
ADD COLUMN IF NOT EXISTS email_review_subject TEXT,
ADD COLUMN IF NOT EXISTS email_review_body TEXT,
ADD COLUMN IF NOT EXISTS email_deliver_subject TEXT,
ADD COLUMN IF NOT EXISTS email_deliver_body TEXT;