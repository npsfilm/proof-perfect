-- Drop legacy google_calendar_tokens table (no longer used after migration to iCal/ICS sync)
-- This removes unused OAuth token storage that poses security risk

-- First drop the RLS policies
DROP POLICY IF EXISTS "Users can read own tokens" ON public.google_calendar_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON public.google_calendar_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON public.google_calendar_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON public.google_calendar_tokens;

-- Drop the trigger
DROP TRIGGER IF EXISTS update_google_calendar_tokens_updated_at ON public.google_calendar_tokens;

-- Drop the table
DROP TABLE IF EXISTS public.google_calendar_tokens;