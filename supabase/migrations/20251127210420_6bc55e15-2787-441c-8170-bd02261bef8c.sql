-- Fix Problem 3: Recreate views with SECURITY INVOKER to respect RLS policies
-- This ensures that views execute queries with the permissions of the querying user,
-- not the view creator, so RLS policies are properly enforced.

-- Drop existing views
DROP VIEW IF EXISTS v_company_gallery_stats;
DROP VIEW IF EXISTS v_gallery_selection_stats;
DROP VIEW IF EXISTS v_user_activity;

-- Recreate v_gallery_selection_stats with SECURITY INVOKER
CREATE VIEW v_gallery_selection_stats 
WITH (security_invoker = true) AS
SELECT 
  g.id AS gallery_id,
  g.company_id,
  g.name,
  g.slug,
  g.status,
  g.created_at,
  count(p.*) AS photos_count,
  count(*) FILTER (WHERE p.is_selected = true) AS selected_count,
  count(*) FILTER (WHERE p.staging_requested = true) AS staging_count
FROM galleries g
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY g.id;

-- Recreate v_company_gallery_stats with SECURITY INVOKER
CREATE VIEW v_company_gallery_stats 
WITH (security_invoker = true) AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.slug,
  c.domain,
  count(DISTINCT g.id) AS galleries_count,
  count(p.*) AS photos_count,
  count(*) FILTER (WHERE p.is_selected = true) AS selected_count,
  count(*) FILTER (WHERE p.staging_requested = true) AS staging_count,
  count(DISTINCT g.id) FILTER (WHERE g.status = 'Reviewed') AS reviewed_count,
  count(DISTINCT g.id) FILTER (WHERE g.status = 'Delivered') AS delivered_count
FROM companies c
LEFT JOIN galleries g ON g.company_id = c.id
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY c.id;

-- Recreate v_user_activity with SECURITY INVOKER
CREATE VIEW v_user_activity 
WITH (security_invoker = true) AS
SELECT 
  p.id AS user_id,
  p.email,
  ur.role,
  p.updated_at AS last_activity,
  (SELECT count(*) FROM gallery_access ga WHERE ga.user_id = p.id) AS galleries_assigned,
  (SELECT count(*) FROM photos ph
   JOIN galleries g ON g.id = ph.gallery_id
   JOIN gallery_access ga ON ga.gallery_id = g.id AND ga.user_id = p.id
   WHERE ph.is_selected = true) AS selections_made
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id;