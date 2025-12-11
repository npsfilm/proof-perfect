-- 1. Client-Eintrag für niko@immoonpoint.de erstellen
INSERT INTO clients (email, vorname, nachname, ansprache, company_id)
SELECT 
  'niko@immoonpoint.de',
  'Niko',
  '',
  'Sie',
  c.id
FROM companies c WHERE c.slug = 'immoonpoint'
ON CONFLICT DO NOTHING;

-- 2. RLS Policy: Clients können ihren eigenen Eintrag lesen (basierend auf E-Mail aus profiles)
CREATE POLICY "Users can read own client record"
ON public.clients
FOR SELECT
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- 3. RLS Policy: Clients können ihre Ansprache aktualisieren
CREATE POLICY "Users can update own client record"
ON public.clients
FOR UPDATE
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);