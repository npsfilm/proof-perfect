-- Drop all dependent views temporarily
DROP VIEW IF EXISTS v_gallery_selection_stats CASCADE;
DROP VIEW IF EXISTS v_company_gallery_stats CASCADE;

-- Remove default value temporarily
ALTER TABLE galleries ALTER COLUMN status DROP DEFAULT;

-- Create new enum type with 5 stages
CREATE TYPE gallery_status_new AS ENUM (
  'Planning',      -- Shooting in Planung
  'Open',          -- Vorschaugalerie offen  
  'Closed',        -- Vorschaugalerie geschlossen
  'Processing',    -- In Bearbeitung
  'Delivered'      -- Geliefert
);

-- Migrate existing data from old to new enum
ALTER TABLE galleries 
  ALTER COLUMN status TYPE gallery_status_new 
  USING (
    CASE status::text
      WHEN 'Draft' THEN 'Planning'
      WHEN 'Sent' THEN 'Open'
      WHEN 'Reviewed' THEN 'Closed'
      WHEN 'Delivered' THEN 'Delivered'
      ELSE 'Planning'
    END
  )::gallery_status_new;

-- Drop old enum type and rename new one
DROP TYPE gallery_status_t;
ALTER TYPE gallery_status_new RENAME TO gallery_status_t;

-- Set new default value
ALTER TABLE galleries ALTER COLUMN status SET DEFAULT 'Planning'::gallery_status_t;

-- Recreate v_gallery_selection_stats view
CREATE VIEW v_gallery_selection_stats 
WITH (security_invoker=on)
AS
SELECT 
  g.id AS gallery_id,
  g.company_id,
  g.name,
  g.slug,
  g.status,
  g.created_at,
  COUNT(p.id) AS photos_count,
  COUNT(p.id) FILTER (WHERE p.is_selected = true) AS selected_count,
  COUNT(p.id) FILTER (WHERE p.staging_requested = true) AS staging_count
FROM galleries g
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY g.id, g.company_id, g.name, g.slug, g.status, g.created_at;

-- Recreate v_company_gallery_stats view
CREATE VIEW v_company_gallery_stats 
WITH (security_invoker=on)
AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.slug,
  c.domain,
  COUNT(g.id) AS galleries_count,
  COUNT(p.id) AS photos_count,
  COUNT(p.id) FILTER (WHERE p.is_selected = true) AS selected_count,
  COUNT(p.id) FILTER (WHERE p.staging_requested = true) AS staging_count,
  COUNT(g.id) FILTER (WHERE g.status = 'Closed') AS reviewed_count,
  COUNT(g.id) FILTER (WHERE g.status = 'Delivered') AS delivered_count
FROM companies c
LEFT JOIN galleries g ON g.company_id = c.id
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY c.id, c.name, c.slug, c.domain;