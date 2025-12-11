-- Create user_events table for comprehensive analytics tracking
CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  gallery_id UUID REFERENCES public.galleries(id) ON DELETE SET NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_gallery_id ON public.user_events(gallery_id);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_category ON public.user_events(event_category);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
ON public.user_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can read all events for analytics
CREATE POLICY "Admins can read all events"
ON public.user_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::role_t));

-- Admins can manage all events
CREATE POLICY "Admins can manage all events"
ON public.user_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));