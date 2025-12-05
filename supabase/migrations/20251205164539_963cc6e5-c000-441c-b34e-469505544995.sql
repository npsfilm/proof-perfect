-- Add google_event_id to blocked_dates for tracking synced events
ALTER TABLE public.blocked_dates ADD COLUMN IF NOT EXISTS google_event_id TEXT;