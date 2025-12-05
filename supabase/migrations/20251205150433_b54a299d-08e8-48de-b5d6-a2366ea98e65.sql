-- Create events table for calendar
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  color TEXT DEFAULT '#3b82f6',
  google_event_id TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create google_calendar_tokens table for OAuth tokens
CREATE TABLE public.google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for events - admins can manage all events
CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (has_role(auth.uid(), 'admin'::role_t))
  WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS policies for google_calendar_tokens - admins only
CREATE POLICY "Admins can manage own tokens"
  ON public.google_calendar_tokens FOR ALL
  USING (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id)
  WITH CHECK (has_role(auth.uid(), 'admin'::role_t) AND auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_google_event_id ON public.events(google_event_id);

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();