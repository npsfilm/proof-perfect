-- Add individual sender email field to email templates
ALTER TABLE email_templates
ADD COLUMN from_email TEXT DEFAULT NULL;

COMMENT ON COLUMN email_templates.from_email IS 
'Individuelle Absender-Adresse für dieses Template. Format: "Name <email@domain.de>" oder nur "email@domain.de". Wenn leer, wird Standard-Adresse verwendet.';