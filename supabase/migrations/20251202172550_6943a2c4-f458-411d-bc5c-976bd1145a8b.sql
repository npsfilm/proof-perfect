-- Add UNIQUE constraint on user_id for upsert operations
ALTER TABLE public.booking_settings
ADD CONSTRAINT booking_settings_user_id_key UNIQUE (user_id);