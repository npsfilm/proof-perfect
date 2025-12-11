-- Theme settings table for persistent color configuration
CREATE TABLE public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color_key TEXT NOT NULL UNIQUE,
  color_value_light TEXT NOT NULL,
  color_value_dark TEXT,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage theme settings
CREATE POLICY "Admins can manage theme settings"
ON public.theme_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Anyone can read theme settings (for applying theme)
CREATE POLICY "Anyone can read theme settings"
ON public.theme_settings
FOR SELECT
USING (true);

-- Insert default color values
INSERT INTO public.theme_settings (color_key, color_value_light, color_value_dark, category, label, sort_order) VALUES
-- Brand colors
('primary', '217 47% 32%', '217 47% 45%', 'brand', 'Primärfarbe', 1),
('secondary', '142 71% 45%', '142 71% 35%', 'brand', 'Sekundärfarbe', 2),
('accent', '240 4.8% 95.9%', '240 3.7% 15.9%', 'brand', 'Akzent', 3),
('destructive', '0 84.2% 60.2%', '0 62.8% 30.6%', 'brand', 'Fehler/Löschen', 4),

-- Status colors
('status-planning-bg', '240 5% 96%', '240 5% 20%', 'status', 'Planung (Hintergrund)', 10),
('status-planning-text', '240 5% 26%', '240 5% 80%', 'status', 'Planung (Text)', 11),
('status-open-bg', '214 95% 93%', '214 50% 20%', 'status', 'Offen (Hintergrund)', 12),
('status-open-text', '214 100% 30%', '214 100% 70%', 'status', 'Offen (Text)', 13),
('status-closed-bg', '48 96% 89%', '48 50% 20%', 'status', 'Geschlossen (Hintergrund)', 14),
('status-closed-text', '48 100% 29%', '48 100% 70%', 'status', 'Geschlossen (Text)', 15),
('status-processing-bg', '27 96% 91%', '27 50% 20%', 'status', 'In Bearbeitung (Hintergrund)', 16),
('status-processing-text', '27 100% 30%', '27 100% 70%', 'status', 'In Bearbeitung (Text)', 17),
('status-delivered-bg', '142 76% 91%', '142 40% 20%', 'status', 'Geliefert (Hintergrund)', 18),
('status-delivered-text', '142 100% 25%', '142 100% 70%', 'status', 'Geliefert (Text)', 19),

-- Service colors
('service-express', '0 84% 60%', '0 84% 50%', 'service', 'Express-Lieferung', 20),
('service-staging', '271 76% 53%', '271 76% 60%', 'service', 'Virtuelles Staging', 21),
('service-bluehour-start', '217 91% 50%', '217 91% 60%', 'service', 'Blaue Stunde (Start)', 22),
('service-bluehour-end', '27 96% 55%', '27 96% 60%', 'service', 'Blaue Stunde (Ende)', 23),

-- Accent/Utility colors
('info', '214 100% 50%', '214 100% 60%', 'accent', 'Info', 30),
('warning', '45 93% 47%', '45 93% 55%', 'accent', 'Warnung', 31),
('success', '142 71% 45%', '142 71% 50%', 'accent', 'Erfolg', 32),

-- Slot colors
('slot-recommended', '45 93% 47%', '45 93% 55%', 'slot', 'Empfohlen', 40),
('slot-cheapest', '142 71% 45%', '142 71% 50%', 'slot', 'Günstigste Anfahrt', 41),
('slot-flexible', '217 91% 60%', '217 91% 65%', 'slot', 'Flexibel', 42),
('slot-weekend', '271 81% 56%', '271 81% 60%', 'slot', 'Wochenende', 43);

-- Trigger for updated_at
CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();