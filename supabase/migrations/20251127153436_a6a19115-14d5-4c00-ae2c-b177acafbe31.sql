-- Add separate Du and Sie email template columns
ALTER TABLE public.system_settings
ADD COLUMN email_send_subject_du text,
ADD COLUMN email_send_body_du text,
ADD COLUMN email_send_subject_sie text,
ADD COLUMN email_send_body_sie text,
ADD COLUMN email_review_subject_du text,
ADD COLUMN email_review_body_du text,
ADD COLUMN email_review_subject_sie text,
ADD COLUMN email_review_body_sie text,
ADD COLUMN email_deliver_subject_du text,
ADD COLUMN email_deliver_body_du text,
ADD COLUMN email_deliver_subject_sie text,
ADD COLUMN email_deliver_body_sie text;

-- Migrate existing data to Du versions as default
UPDATE public.system_settings
SET 
  email_send_subject_du = email_send_subject,
  email_send_body_du = email_send_body,
  email_send_subject_sie = email_send_subject,
  email_send_body_sie = email_send_body,
  email_review_subject_du = email_review_subject,
  email_review_body_du = email_review_body,
  email_review_subject_sie = email_review_subject,
  email_review_body_sie = email_review_body,
  email_deliver_subject_du = email_deliver_subject,
  email_deliver_body_du = email_deliver_body,
  email_deliver_subject_sie = email_deliver_subject,
  email_deliver_body_sie = email_deliver_body;

-- Drop old columns
ALTER TABLE public.system_settings
DROP COLUMN email_send_subject,
DROP COLUMN email_send_body,
DROP COLUMN email_review_subject,
DROP COLUMN email_review_body,
DROP COLUMN email_deliver_subject,
DROP COLUMN email_deliver_body;