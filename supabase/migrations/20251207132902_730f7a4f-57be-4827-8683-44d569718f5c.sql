-- First, remove duplicate events (keep newest by created_at)
DELETE FROM events a USING events b 
WHERE a.created_at < b.created_at 
  AND a.google_event_id = b.google_event_id 
  AND a.calendar_source = b.calendar_source
  AND a.user_id = b.user_id
  AND a.google_event_id IS NOT NULL;

-- Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_sync 
ON events (user_id, google_event_id, calendar_source) 
WHERE google_event_id IS NOT NULL;