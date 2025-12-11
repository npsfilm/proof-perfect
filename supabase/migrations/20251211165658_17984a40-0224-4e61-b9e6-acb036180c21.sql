-- Create seo_settings table for centralized SEO and branding configuration
CREATE TABLE public.seo_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Branding
  site_name text NOT NULL DEFAULT 'ImmoOnPoint',
  logo_url text,
  logo_dark_url text,
  logo_icon_url text,
  favicon_url text,
  
  -- SEO Meta Tags
  meta_title_suffix text DEFAULT ' | ImmoOnPoint',
  meta_description text,
  meta_keywords text,
  
  -- Open Graph
  og_image_url text,
  og_type text DEFAULT 'website',
  og_locale text DEFAULT 'de_DE',
  
  -- Twitter Card
  twitter_card_type text DEFAULT 'summary_large_image',
  twitter_handle text,
  
  -- Schema.org / Structured Data
  schema_org_type text DEFAULT 'LocalBusiness',
  business_name text DEFAULT 'ImmoOnPoint',
  business_description text,
  business_phone text,
  business_email text,
  business_address_street text,
  business_address_city text,
  business_address_zip text,
  business_address_country text DEFAULT 'Deutschland',
  business_geo_lat numeric,
  business_geo_lng numeric,
  
  -- Analytics
  google_analytics_id text,
  google_tag_manager_id text,
  facebook_pixel_id text,
  
  -- Dynamic Content (for reusable texts/images across the site)
  hero_headline text,
  hero_subheadline text,
  hero_image_url text,
  cta_primary_text text DEFAULT 'Jetzt buchen',
  cta_secondary_text text DEFAULT 'Mehr erfahren',
  footer_tagline text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can manage seo settings"
ON public.seo_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Public read access for frontend to use these settings
CREATE POLICY "Anyone can read seo settings"
ON public.seo_settings
FOR SELECT
USING (true);

-- Insert default row
INSERT INTO public.seo_settings (
  site_name,
  meta_description,
  business_name,
  business_description
) VALUES (
  'ImmoOnPoint',
  'Professionelle Immobilienfotografie für Makler und Agenturen. Hochwertige Fotos, virtuelle Staging und Drohnenaufnahmen.',
  'ImmoOnPoint',
  'Professionelle Immobilienfotografie für Makler und Agenturen'
);

-- Create trigger for updated_at
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create branding storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true);

-- Storage policies for branding bucket
CREATE POLICY "Branding images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Admins can update branding images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Admins can delete branding images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'branding' AND has_role(auth.uid(), 'admin'::role_t));