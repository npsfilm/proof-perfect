
-- Tags-Tabelle für Kundensegmentierung
CREATE TABLE public.client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  tag_type TEXT NOT NULL CHECK (tag_type IN ('manual', 'auto')),
  auto_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client-Tag-Zuordnung
CREATE TABLE public.client_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.client_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by TEXT CHECK (assigned_by IN ('auto', 'manual')),
  UNIQUE(client_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tag_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_tags (admin only)
CREATE POLICY "Admins can manage client tags"
ON public.client_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for client_tag_assignments (admin only)
CREATE POLICY "Admins can manage tag assignments"
ON public.client_tag_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- View for client metrics (used by auto-tags)
CREATE OR REPLACE VIEW public.v_client_metrics AS
SELECT 
  c.id as client_id,
  c.email,
  c.vorname,
  c.nachname,
  COUNT(DISTINCT b.id) as booking_count,
  COALESCE(SUM(bp.price_cents), 0) as total_revenue_cents,
  COUNT(DISTINCT sr.id) as staging_count,
  COUNT(DISTINCT CASE WHEN p.blue_hour_requested THEN p.id END) as blue_hour_count,
  COALESCE(EXTRACT(DAY FROM now() - MAX(b.created_at))::INT, 999) as days_since_last_booking
FROM public.clients c
LEFT JOIN public.bookings b ON lower(b.contact_email) = lower(c.email)
LEFT JOIN public.booking_packages bp ON bp.package_type = b.package_type
LEFT JOIN public.profiles prof ON lower(prof.email) = lower(c.email)
LEFT JOIN public.staging_requests sr ON sr.user_id = prof.id
LEFT JOIN public.gallery_access ga ON ga.user_id = prof.id
LEFT JOIN public.photos p ON p.gallery_id = ga.gallery_id AND p.blue_hour_requested = true
GROUP BY c.id, c.email, c.vorname, c.nachname;

-- Trigger for updated_at
CREATE TRIGGER update_client_tags_updated_at
BEFORE UPDATE ON public.client_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tags
INSERT INTO public.client_tags (name, slug, description, color, tag_type, auto_conditions) VALUES
('Vielbucher', 'vielbucher', 'Kunden mit 10+ Buchungen', '#22c55e', 'auto', '{"field": "booking_count", "operator": "gte", "value": 10}'),
('Hoher Umsatz', 'hoher-umsatz', 'Kunden mit 5.000€+ Umsatz', '#eab308', 'auto', '{"field": "total_revenue_cents", "operator": "gte", "value": 500000}'),
('Inaktiv (90 Tage)', 'inaktiv-90', 'Keine Buchung seit 90 Tagen', '#ef4444', 'auto', '{"field": "days_since_last_booking", "operator": "gte", "value": 90}'),
('Staging-Kunde', 'staging-kunde', 'Kunden mit 5+ Staging-Anfragen', '#a855f7', 'auto', '{"field": "staging_count", "operator": "gte", "value": 5}'),
('Blue Hour Fan', 'blue-hour-fan', 'Kunden mit 5+ Blue Hour Bildern', '#3b82f6', 'auto', '{"field": "blue_hour_count", "operator": "gte", "value": 5}'),
('VIP', 'vip', 'Manuell zugewiesene VIP-Kunden', '#f97316', 'manual', '{}');
