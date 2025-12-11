-- Add page title columns to seo_settings
ALTER TABLE public.seo_settings
ADD COLUMN IF NOT EXISTS default_page_title TEXT DEFAULT 'ImmoOnPoint - Professionelle Immobilienfotografie',
ADD COLUMN IF NOT EXISTS page_title_dashboard TEXT DEFAULT 'Meine Galerien{suffix}',
ADD COLUMN IF NOT EXISTS page_title_gallery TEXT DEFAULT '{gallery_name}{suffix}',
ADD COLUMN IF NOT EXISTS page_title_virtual_editing TEXT DEFAULT 'Virtuelle Bearbeitung{suffix}',
ADD COLUMN IF NOT EXISTS page_title_staging TEXT DEFAULT 'Staging anfordern{suffix}',
ADD COLUMN IF NOT EXISTS page_title_settings TEXT DEFAULT 'Einstellungen{suffix}',
ADD COLUMN IF NOT EXISTS page_title_admin_dashboard TEXT DEFAULT 'Admin Dashboard{suffix}',
ADD COLUMN IF NOT EXISTS page_title_admin_galleries TEXT DEFAULT 'Galerien verwalten{suffix}',
ADD COLUMN IF NOT EXISTS page_title_admin_settings TEXT DEFAULT 'Admin Einstellungen{suffix}';