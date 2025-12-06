-- Add calendar_source column to track which calendar an event came from
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS calendar_source text DEFAULT 'primary';

-- Add index for faster queries by calendar source
CREATE INDEX IF NOT EXISTS idx_events_calendar_source ON public.events(calendar_source);