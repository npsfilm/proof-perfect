-- Create enum for price types
CREATE TYPE price_type_t AS ENUM ('fixed', 'per_image', 'per_room');

-- Create enum for discount types
CREATE TYPE discount_type_t AS ENUM ('percentage', 'fixed', 'buy_x_get_y');

-- Service Categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_type price_type_t NOT NULL DEFAULT 'fixed',
  icon_name TEXT DEFAULT 'Sparkles',
  gradient_class TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  show_in_booking BOOLEAN DEFAULT false,
  show_in_finalize BOOLEAN DEFAULT false,
  show_in_virtual_editing BOOLEAN DEFAULT false,
  requires_photo_selection BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discounts table
CREATE TABLE public.discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discount_type discount_type_t NOT NULL DEFAULT 'percentage',
  buy_quantity INTEGER,
  free_quantity INTEGER,
  percentage NUMERIC,
  fixed_amount_cents INTEGER,
  min_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staging Styles table
CREATE TABLE public.staging_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color_class TEXT DEFAULT 'bg-primary',
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Room Types table
CREATE TABLE public.room_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT DEFAULT 'Home',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_categories
CREATE POLICY "Anyone can read active service categories"
ON public.service_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage service categories"
ON public.service_categories FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for services
CREATE POLICY "Anyone can read active services"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for discounts
CREATE POLICY "Anyone can read active discounts"
ON public.discounts FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage discounts"
ON public.discounts FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for staging_styles
CREATE POLICY "Anyone can read active staging styles"
ON public.staging_styles FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage staging styles"
ON public.staging_styles FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies for room_types
CREATE POLICY "Anyone can read active room types"
ON public.room_types FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage room types"
ON public.room_types FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Create updated_at triggers
CREATE TRIGGER update_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
BEFORE UPDATE ON public.discounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staging_styles_updated_at
BEFORE UPDATE ON public.staging_styles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_types_updated_at
BEFORE UPDATE ON public.room_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for service categories
INSERT INTO public.service_categories (name, slug, description, icon_name, sort_order) VALUES
('Shooting-Pakete', 'shooting-pakete', 'Foto- und Drohnenaufnahmen', 'Camera', 1),
('Zusatzleistungen', 'zusatzleistungen', 'Express-Lieferung und weitere Services', 'Zap', 2),
('Virtuelle Bearbeitung', 'virtuelle-bearbeitung', 'Digitale Bildbearbeitung und Staging', 'Wand2', 3);

-- Insert default services
INSERT INTO public.services (category_id, name, slug, description, price_cents, price_type, icon_name, gradient_class, is_popular, show_in_finalize, sort_order) VALUES
((SELECT id FROM service_categories WHERE slug = 'zusatzleistungen'), '24h Express-Lieferung', 'express-lieferung', 'Ihre Fotos innerhalb von 24 Stunden', 4900, 'fixed', 'Zap', 'from-amber-500 to-orange-600', false, true, 1),
((SELECT id FROM service_categories WHERE slug = 'virtuelle-bearbeitung'), 'Virtuelles Staging', 'virtuelles-staging', 'Professionelle virtuelle Möblierung', 8900, 'per_image', 'Sofa', 'from-purple-500 to-indigo-600', true, true, 2),
((SELECT id FROM service_categories WHERE slug = 'virtuelle-bearbeitung'), 'Virtuelle Blaue Stunde', 'virtuelle-blaue-stunde', 'Transformation in stimmungsvolle Abendaufnahme', 4900, 'per_image', 'Sunset', 'from-blue-500 to-indigo-600', false, true, 3),
((SELECT id FROM service_categories WHERE slug = 'virtuelle-bearbeitung'), 'Sommer-Winter Transformation', 'sommer-winter', 'Saisonale Bildtransformation', 4900, 'per_image', 'Snowflake', 'from-cyan-400 to-blue-500', false, false, 4),
((SELECT id FROM service_categories WHERE slug = 'virtuelle-bearbeitung'), 'Regen-Sonne Transformation', 'regen-sonne', 'Wettertransformation von Regen zu Sonnenschein', 4900, 'per_image', 'CloudSun', 'from-yellow-400 to-orange-500', false, false, 5);

-- Insert default discounts
INSERT INTO public.discounts (service_id, name, discount_type, buy_quantity, free_quantity, min_quantity) VALUES
((SELECT id FROM services WHERE slug = 'virtuelles-staging'), 'Staging 5+1', 'buy_x_get_y', 5, 1, 6);

-- Insert default staging styles
INSERT INTO public.staging_styles (name, slug, color_class, sort_order) VALUES
('Standard', 'standard', 'bg-slate-500', 1),
('Modern', 'modern', 'bg-blue-500', 2),
('Skandinavisch', 'skandinavisch', 'bg-amber-500', 3),
('Industrial', 'industrial', 'bg-zinc-600', 4),
('Midcentury', 'midcentury', 'bg-orange-500', 5),
('Luxus', 'luxus', 'bg-purple-500', 6),
('Coastal', 'coastal', 'bg-cyan-500', 7),
('Farmhouse', 'farmhouse', 'bg-green-600', 8);

-- Insert default room types
INSERT INTO public.room_types (name, slug, icon_name, sort_order) VALUES
('Wohnzimmer', 'wohnzimmer', 'Sofa', 1),
('Schlafzimmer', 'schlafzimmer', 'Bed', 2),
('Küche', 'kueche', 'UtensilsCrossed', 3),
('Bad', 'bad', 'Bath', 4),
('Home Office', 'home-office', 'Monitor', 5),
('Esszimmer', 'esszimmer', 'Utensils', 6);