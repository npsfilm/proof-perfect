-- Add email preference columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email_newsletter_company BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_newsletter_marketing BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_order_notifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_general_info BOOLEAN NOT NULL DEFAULT TRUE;

-- Create newsletter_segments table for admin segment management
CREATE TABLE IF NOT EXISTS public.newsletter_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_segments ENABLE ROW LEVEL SECURITY;

-- Admins can manage newsletter segments
CREATE POLICY "Admins can manage newsletter segments"
ON public.newsletter_segments
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Anyone can read active segments (for client preferences UI)
CREATE POLICY "Anyone can read active segments"
ON public.newsletter_segments
FOR SELECT
USING (is_active = TRUE);

-- Insert default system segments
INSERT INTO public.newsletter_segments (name, slug, description, is_system, sort_order) VALUES
  ('Firmenrelevante Themen', 'company', 'Neuigkeiten und Updates zur Plattform', TRUE, 1),
  ('Marketing & Tipps', 'marketing', 'Tipps für bessere Immobilien-Fotografie', TRUE, 2)
ON CONFLICT (slug) DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_newsletter_segments_updated_at
BEFORE UPDATE ON public.newsletter_segments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();