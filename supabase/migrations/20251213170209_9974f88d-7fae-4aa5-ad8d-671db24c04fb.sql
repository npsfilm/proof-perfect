-- Add new columns to booking_packages for enhanced package management
ALTER TABLE public.booking_packages 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create upgrades table for booking add-ons
CREATE TABLE IF NOT EXISTS public.booking_upgrades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT,
  is_per_image BOOLEAN DEFAULT false,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on upgrades
ALTER TABLE public.booking_upgrades ENABLE ROW LEVEL SECURITY;

-- Public read access for upgrades
CREATE POLICY "Anyone can read active upgrades" 
ON public.booking_upgrades 
FOR SELECT 
USING (is_active = true);

-- Admin write access for upgrades
CREATE POLICY "Admins can manage upgrades"
ON public.booking_upgrades
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default upgrades based on blueprint
INSERT INTO public.booking_upgrades (name, description, price_cents, icon_name, is_per_image, sort_order) VALUES
('24h Express-Lieferung', 'Ihre Bilder innerhalb von 24 Stunden', 9900, 'Zap', false, 1),
('Blaue Stunde', 'Aufnahmen in der goldenen Stunde für magische Lichtstimmung', 14900, 'Moon', false, 2),
('Virtuelles Staging', 'Leere Räume professionell virtuell einrichten', 3900, 'Sofa', true, 3),
('Grundrissplan', 'Professioneller 2D-Grundriss Ihrer Immobilie', 9900, 'LayoutGrid', false, 4),
('Videotour', 'Professionelle Videoführung durch Ihre Immobilie', 29900, 'Video', false, 5),
('360° Rundgang', 'Interaktiver virtueller Rundgang', 19900, 'View', false, 6)
ON CONFLICT DO NOTHING;

-- Update existing packages with names and features
-- Home packages (Foto)
UPDATE public.booking_packages SET 
  name = 'Home S',
  description = 'Perfekt für kleine Objekte',
  features = '["Professionelle Innenaufnahmen", "Optimale Bildbearbeitung", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 1
WHERE package_type = 'Foto' AND photo_count = 10;

UPDATE public.booking_packages SET 
  name = 'Home M',
  description = 'Für mittlere Objekte',
  features = '["Professionelle Innenaufnahmen", "Außenaufnahmen", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 2
WHERE package_type = 'Foto' AND photo_count = 15;

UPDATE public.booking_packages SET 
  name = 'Home L',
  description = 'Für große Objekte',
  features = '["Alle Räume", "Premium Bearbeitung", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 3
WHERE package_type = 'Foto' AND photo_count = 20;

UPDATE public.booking_packages SET 
  name = 'Home XL',
  description = 'Für sehr große Objekte',
  features = '["Alle Räume", "Premium Bearbeitung", "Außenaufnahmen", "48h Lieferung"]'::jsonb,
  is_popular = true,
  sort_order = 4
WHERE package_type = 'Foto' AND photo_count = 30;

-- Sky packages (Drohne)
UPDATE public.booking_packages SET 
  name = 'Sky S',
  description = 'Kompakte Luftaufnahmen',
  features = '["Luftaufnahmen", "Optimale Perspektiven", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 1
WHERE package_type = 'Drohne' AND photo_count = 5;

UPDATE public.booking_packages SET 
  name = 'Sky M',
  description = 'Inkl. Grundstück',
  features = '["Mehr Perspektiven", "Inkl. Grundstück", "48h Lieferung"]'::jsonb,
  is_popular = true,
  sort_order = 2
WHERE package_type = 'Drohne' AND photo_count = 10;

UPDATE public.booking_packages SET 
  name = 'Sky L',
  description = 'Premium Bearbeitung',
  features = '["Umgebungsaufnahmen", "Premium Bearbeitung", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 3
WHERE package_type = 'Drohne' AND photo_count = 15;

-- Kombi packages
UPDATE public.booking_packages SET 
  name = 'Kombi 15',
  description = 'Innen + Außen',
  features = '["10 Innenaufnahmen", "5 Drohnenaufnahmen", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 1
WHERE package_type = 'Kombi' AND photo_count = 15;

UPDATE public.booking_packages SET 
  name = 'Kombi 20',
  description = 'Für mittlere Objekte',
  features = '["15 Innenaufnahmen", "5 Drohnenaufnahmen", "48h Lieferung"]'::jsonb,
  is_popular = true,
  sort_order = 2
WHERE package_type = 'Kombi' AND photo_count = 20;

UPDATE public.booking_packages SET 
  name = 'Kombi 30',
  description = 'Premium Paket',
  features = '["20 Innenaufnahmen", "10 Drohnenaufnahmen", "48h Lieferung"]'::jsonb,
  is_popular = false,
  sort_order = 3
WHERE package_type = 'Kombi' AND photo_count = 30;