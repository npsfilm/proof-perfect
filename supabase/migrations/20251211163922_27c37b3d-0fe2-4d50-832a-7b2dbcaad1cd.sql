-- Email Design Settings (globale Styling-Optionen)
CREATE TABLE public.email_design_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Farben
  primary_color TEXT NOT NULL DEFAULT '#233c63',
  secondary_color TEXT NOT NULL DEFAULT '#4f7942',
  background_color TEXT NOT NULL DEFAULT '#f4f4f5',
  container_bg_color TEXT NOT NULL DEFAULT '#ffffff',
  text_color TEXT NOT NULL DEFAULT '#18181b',
  text_muted_color TEXT NOT NULL DEFAULT '#71717a',
  border_color TEXT NOT NULL DEFAULT '#e4e4e7',
  
  -- Branding
  logo_url TEXT,
  logo_width INTEGER NOT NULL DEFAULT 150,
  company_name TEXT NOT NULL DEFAULT 'ImmoOnPoint',
  
  -- Typografie
  font_family TEXT NOT NULL DEFAULT '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif',
  heading_font_size INTEGER NOT NULL DEFAULT 24,
  body_font_size INTEGER NOT NULL DEFAULT 16,
  line_height NUMERIC NOT NULL DEFAULT 1.6,
  
  -- Buttons
  button_bg_color TEXT NOT NULL DEFAULT '#233c63',
  button_text_color TEXT NOT NULL DEFAULT '#ffffff',
  button_border_radius INTEGER NOT NULL DEFAULT 8,
  button_padding_x INTEGER NOT NULL DEFAULT 32,
  button_padding_y INTEGER NOT NULL DEFAULT 16,
  
  -- Layout
  container_max_width INTEGER NOT NULL DEFAULT 600,
  container_border_radius INTEGER NOT NULL DEFAULT 12,
  content_padding INTEGER NOT NULL DEFAULT 40,
  
  -- Footer
  footer_text TEXT DEFAULT '© {year} ImmoOnPoint. Alle Rechte vorbehalten.',
  show_social_links BOOLEAN NOT NULL DEFAULT false,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email Templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('system', 'customer', 'newsletter')),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Du-Form
  subject_du TEXT NOT NULL,
  preheader_du TEXT,
  heading_du TEXT,
  body_du TEXT NOT NULL,
  cta_text_du TEXT,
  cta_url_placeholder TEXT,
  
  -- Sie-Form
  subject_sie TEXT NOT NULL,
  preheader_sie TEXT,
  heading_sie TEXT,
  body_sie TEXT NOT NULL,
  cta_text_sie TEXT,
  
  -- Platzhalter (JSON array)
  available_placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.email_design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies für email_design_settings
CREATE POLICY "Admins can manage email design settings"
ON public.email_design_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- RLS Policies für email_templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::role_t))
WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- Trigger für updated_at
CREATE TRIGGER update_email_design_settings_updated_at
BEFORE UPDATE ON public.email_design_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Initial design settings row erstellen
INSERT INTO public.email_design_settings (id) VALUES (gen_random_uuid());

-- Seed: System-E-Mail-Templates
INSERT INTO public.email_templates (template_key, category, name, description, subject_du, heading_du, body_du, cta_text_du, cta_url_placeholder, subject_sie, heading_sie, body_sie, cta_text_sie, available_placeholders, is_system_template) VALUES
(
  'verification',
  'system',
  'E-Mail-Bestätigung',
  'Wird bei der Registrierung gesendet',
  'Bestätige deine E-Mail-Adresse',
  'Willkommen bei ImmoOnPoint!',
  'Vielen Dank für deine Registrierung. Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.',
  'E-Mail bestätigen',
  '{action_url}',
  'Bestätigen Sie Ihre E-Mail-Adresse',
  'Willkommen bei ImmoOnPoint!',
  'Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.',
  'E-Mail bestätigen',
  '[{"key": "action_url", "label": "Bestätigungs-Link", "example": "https://app.immoonpoint.de/verify?token=..."}, {"key": "vorname", "label": "Vorname", "example": "Max"}, {"key": "nachname", "label": "Nachname", "example": "Mustermann"}]',
  true
),
(
  'password_reset',
  'system',
  'Passwort zurücksetzen',
  'Wird bei Passwort-Anfrage gesendet',
  'Setze dein Passwort zurück',
  'Passwort zurücksetzen',
  'Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu erstellen. Dieser Link ist 1 Stunde gültig.',
  'Neues Passwort erstellen',
  '{action_url}',
  'Setzen Sie Ihr Passwort zurück',
  'Passwort zurücksetzen',
  'Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen. Dieser Link ist 1 Stunde gültig.',
  'Neues Passwort erstellen',
  '[{"key": "action_url", "label": "Reset-Link", "example": "https://app.immoonpoint.de/reset-password?token=..."}]',
  true
),
(
  'welcome',
  'system',
  'Willkommens-E-Mail',
  'Nach erfolgreicher Bestätigung',
  'Willkommen bei ImmoOnPoint, {vorname}!',
  'Dein Konto ist bereit!',
  'Dein Konto wurde erfolgreich aktiviert. Du kannst dich jetzt einloggen und loslegen.',
  'Zum Dashboard',
  '{dashboard_url}',
  'Willkommen bei ImmoOnPoint, {anrede} {nachname}!',
  'Ihr Konto ist bereit!',
  'Ihr Konto wurde erfolgreich aktiviert. Sie können sich jetzt einloggen und loslegen.',
  'Zum Dashboard',
  '[{"key": "vorname", "label": "Vorname", "example": "Max"}, {"key": "nachname", "label": "Nachname", "example": "Mustermann"}, {"key": "anrede", "label": "Anrede", "example": "Herr"}, {"key": "dashboard_url", "label": "Dashboard-Link", "example": "https://app.immoonpoint.de/"}]',
  true
);

-- Seed: Kunden-E-Mail-Templates
INSERT INTO public.email_templates (template_key, category, name, description, subject_du, heading_du, body_du, cta_text_du, cta_url_placeholder, subject_sie, heading_sie, body_sie, cta_text_sie, available_placeholders, is_system_template) VALUES
(
  'gallery_send',
  'customer',
  'Galerie an Kunde senden',
  'Erste Benachrichtigung mit Zugangsdaten',
  'Deine Fotos von {gallery_address} sind da!',
  'Deine Fotos sind bereit!',
  'Die Fotos von {gallery_address} stehen zur Auswahl bereit. Wähle deine Favoriten aus und wir bearbeiten sie für dich.',
  'Fotos ansehen',
  '{gallery_url}',
  'Ihre Fotos von {gallery_address} sind da!',
  'Ihre Fotos sind bereit!',
  'Die Fotos von {gallery_address} stehen zur Auswahl bereit. Wählen Sie Ihre Favoriten aus und wir bearbeiten sie für Sie.',
  'Fotos ansehen',
  '[{"key": "gallery_name", "label": "Galerie-Name", "example": "Musterstraße 123"}, {"key": "gallery_address", "label": "Adresse", "example": "Musterstraße 123, 12345 Berlin"}, {"key": "gallery_url", "label": "Galerie-Link", "example": "https://app.immoonpoint.de/gallery/musterstrasse-123"}, {"key": "temp_password", "label": "Temporäres Passwort", "example": "abc123XYZ"}, {"key": "photo_count", "label": "Anzahl Fotos", "example": "45"}]',
  true
),
(
  'gallery_review',
  'customer',
  'Überprüfung abgeschlossen',
  'Bestätigung nach Fotoauswahl',
  'Danke für deine Auswahl!',
  'Auswahl erhalten!',
  'Wir haben deine Auswahl für {gallery_address} erhalten. Du hast {selected_count} Fotos ausgewählt. Wir machen uns sofort an die Bearbeitung!',
  'Galerie ansehen',
  '{gallery_url}',
  'Danke für Ihre Auswahl!',
  'Auswahl erhalten!',
  'Wir haben Ihre Auswahl für {gallery_address} erhalten. Sie haben {selected_count} Fotos ausgewählt. Wir machen uns sofort an die Bearbeitung!',
  'Galerie ansehen',
  '[{"key": "gallery_name", "label": "Galerie-Name", "example": "Musterstraße 123"}, {"key": "gallery_address", "label": "Adresse", "example": "Musterstraße 123, 12345 Berlin"}, {"key": "gallery_url", "label": "Galerie-Link", "example": "https://app.immoonpoint.de/gallery/musterstrasse-123"}, {"key": "selected_count", "label": "Ausgewählte Fotos", "example": "25"}, {"key": "staging_count", "label": "Staging-Anfragen", "example": "3"}]',
  true
),
(
  'gallery_deliver',
  'customer',
  'Finale Lieferung',
  'Benachrichtigung mit Download-Link',
  'Deine bearbeiteten Fotos sind fertig!',
  'Download bereit!',
  'Die bearbeiteten Fotos von {gallery_address} sind jetzt zum Download verfügbar. Klicke auf den Button, um sie herunterzuladen.',
  'Fotos herunterladen',
  '{download_url}',
  'Ihre bearbeiteten Fotos sind fertig!',
  'Download bereit!',
  'Die bearbeiteten Fotos von {gallery_address} sind jetzt zum Download verfügbar. Klicken Sie auf den Button, um sie herunterzuladen.',
  'Fotos herunterladen',
  '[{"key": "gallery_name", "label": "Galerie-Name", "example": "Musterstraße 123"}, {"key": "gallery_address", "label": "Adresse", "example": "Musterstraße 123, 12345 Berlin"}, {"key": "download_url", "label": "Download-Link", "example": "https://app.immoonpoint.de/gallery/musterstrasse-123"}]',
  true
),
(
  'staging_complete',
  'customer',
  'Staging fertiggestellt',
  'Virtuelles Staging ist bereit',
  'Dein Virtual Staging ist fertig!',
  'Staging abgeschlossen!',
  'Das virtuelle Staging für {gallery_address} ist fertig. {staging_count} Räume wurden eingerichtet. Schau dir das Ergebnis an!',
  'Staging ansehen',
  '{gallery_url}',
  'Ihr Virtual Staging ist fertig!',
  'Staging abgeschlossen!',
  'Das virtuelle Staging für {gallery_address} ist fertig. {staging_count} Räume wurden eingerichtet. Schauen Sie sich das Ergebnis an!',
  'Staging ansehen',
  '[{"key": "gallery_name", "label": "Galerie-Name", "example": "Musterstraße 123"}, {"key": "gallery_address", "label": "Adresse", "example": "Musterstraße 123, 12345 Berlin"}, {"key": "gallery_url", "label": "Galerie-Link", "example": "https://app.immoonpoint.de/gallery/musterstrasse-123"}, {"key": "staging_count", "label": "Anzahl Räume", "example": "3"}]',
  true
),
(
  'reopen_approved',
  'customer',
  'Wiedereröffnung genehmigt',
  'Galerie wurde wieder geöffnet',
  'Deine Galerie wurde wieder geöffnet!',
  'Galerie wieder geöffnet',
  'Gute Nachrichten! Deine Anfrage zur Wiedereröffnung von {gallery_address} wurde genehmigt. Du kannst jetzt Änderungen an deiner Auswahl vornehmen.',
  'Galerie öffnen',
  '{gallery_url}',
  'Ihre Galerie wurde wieder geöffnet!',
  'Galerie wieder geöffnet',
  'Gute Nachrichten! Ihre Anfrage zur Wiedereröffnung von {gallery_address} wurde genehmigt. Sie können jetzt Änderungen an Ihrer Auswahl vornehmen.',
  'Galerie öffnen',
  '[{"key": "gallery_name", "label": "Galerie-Name", "example": "Musterstraße 123"}, {"key": "gallery_address", "label": "Adresse", "example": "Musterstraße 123, 12345 Berlin"}, {"key": "gallery_url", "label": "Galerie-Link", "example": "https://app.immoonpoint.de/gallery/musterstrasse-123"}]',
  true
);

-- Seed: Newsletter-Template
INSERT INTO public.email_templates (template_key, category, name, description, subject_du, heading_du, body_du, cta_text_du, cta_url_placeholder, subject_sie, heading_sie, body_sie, cta_text_sie, available_placeholders, is_system_template) VALUES
(
  'newsletter_default',
  'newsletter',
  'Standard-Newsletter',
  'Allgemeines Newsletter-Template',
  'Neuigkeiten von ImmoOnPoint',
  'Newsletter',
  'Hier sind die neuesten Updates und Angebote von ImmoOnPoint.',
  'Mehr erfahren',
  '{cta_url}',
  'Neuigkeiten von ImmoOnPoint',
  'Newsletter',
  'Hier sind die neuesten Updates und Angebote von ImmoOnPoint.',
  'Mehr erfahren',
  '[{"key": "vorname", "label": "Vorname", "example": "Max"}, {"key": "nachname", "label": "Nachname", "example": "Mustermann"}, {"key": "cta_url", "label": "CTA-Link", "example": "https://immoonpoint.de/angebote"}]',
  false
);