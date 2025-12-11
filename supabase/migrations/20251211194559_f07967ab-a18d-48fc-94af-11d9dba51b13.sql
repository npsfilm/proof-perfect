-- Create email_sections table for reusable sections
CREATE TABLE public.email_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('header', 'text', 'image', 'cta', 'divider', 'columns', 'spacer', 'footer', 'custom')),
  content_du TEXT,
  content_sie TEXT,
  settings JSONB DEFAULT '{}',
  is_preset BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_sections ENABLE ROW LEVEL SECURITY;

-- RLS policy for admins
CREATE POLICY "Admins can manage email sections"
ON public.email_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Add new columns to email_design_settings
ALTER TABLE public.email_design_settings
ADD COLUMN IF NOT EXISTS use_branding_logo BOOLEAN DEFAULT true;

-- Add new columns to email_templates
ALTER TABLE public.email_templates
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'simple' CHECK (content_type IN ('simple', 'sections', 'html')),
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS html_content_du TEXT,
ADD COLUMN IF NOT EXISTS html_content_sie TEXT;

-- Create storage bucket for email images
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-images', 'email-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for email-images bucket
CREATE POLICY "Admins can manage email images"
ON storage.objects
FOR ALL
USING (bucket_id = 'email-images' AND has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (bucket_id = 'email-images' AND has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Anyone can view email images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'email-images');

-- Insert preset sections
INSERT INTO public.email_sections (name, section_type, content_du, content_sie, settings, is_preset, sort_order) VALUES
('Header mit Logo', 'header', '', '', '{"alignment": "center"}', true, 1),
('Text-Block', 'text', 'Hallo {vorname},\n\ndein Text hier...', 'Guten Tag {vollständige_anrede},\n\nIhr Text hier...', '{"alignment": "left"}', true, 2),
('Bild (zentriert)', 'image', '', '', '{"alignment": "center", "maxWidth": "100%"}', true, 3),
('CTA-Button', 'cta', 'Jetzt ansehen', 'Jetzt ansehen', '{"alignment": "center", "buttonUrl": "{action_url}"}', true, 4),
('Trennlinie', 'divider', '', '', '{"color": "#e4e4e7", "width": "100%"}', true, 5),
('Abstand', 'spacer', '', '', '{"height": "24px"}', true, 6),
('Zwei Spalten', 'columns', '', '', '{"columns": 2}', true, 7),
('Footer', 'footer', '© {year} {firma_name}. Alle Rechte vorbehalten.', '© {year} {firma_name}. Alle Rechte vorbehalten.', '{"alignment": "center"}', true, 8);

-- Update trigger for email_sections
CREATE TRIGGER update_email_sections_updated_at
BEFORE UPDATE ON public.email_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();