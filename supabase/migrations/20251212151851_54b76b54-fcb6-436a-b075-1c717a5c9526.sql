
-- Fix SECURITY DEFINER views by recreating them with security_invoker = true
-- This ensures RLS policies are enforced for the querying user, not the view creator

-- 1. v_client_metrics - used for customer segmentation and auto-tags
DROP VIEW IF EXISTS public.v_client_metrics;
CREATE VIEW public.v_client_metrics
WITH (security_invoker = true)
AS
SELECT 
    c.id AS client_id,
    c.email,
    c.vorname,
    c.nachname,
    count(DISTINCT b.id) AS booking_count,
    COALESCE(sum(bp.price_cents), 0::bigint) AS total_revenue_cents,
    count(DISTINCT sr.id) AS staging_count,
    count(DISTINCT CASE WHEN p.blue_hour_requested THEN p.id ELSE NULL::uuid END) AS blue_hour_count,
    COALESCE(EXTRACT(day FROM now() - max(b.created_at))::integer, 999) AS days_since_last_booking
FROM clients c
LEFT JOIN bookings b ON lower(b.contact_email) = lower(c.email)
LEFT JOIN booking_packages bp ON bp.package_type = b.package_type
LEFT JOIN profiles prof ON lower(prof.email) = lower(c.email)
LEFT JOIN staging_requests sr ON sr.user_id = prof.id
LEFT JOIN gallery_access ga ON ga.user_id = prof.id
LEFT JOIN photos p ON p.gallery_id = ga.gallery_id AND p.blue_hour_requested = true
GROUP BY c.id, c.email, c.vorname, c.nachname;

-- 2. v_company_gallery_stats - used for company analytics
DROP VIEW IF EXISTS public.v_company_gallery_stats;
CREATE VIEW public.v_company_gallery_stats
WITH (security_invoker = true)
AS
SELECT 
    c.id AS company_id,
    c.name AS company_name,
    c.slug,
    c.domain,
    count(g.id) AS galleries_count,
    count(p.id) AS photos_count,
    count(p.id) FILTER (WHERE p.is_selected = true) AS selected_count,
    count(p.id) FILTER (WHERE p.staging_requested = true) AS staging_count,
    count(g.id) FILTER (WHERE g.status = 'Closed'::gallery_status_t) AS reviewed_count,
    count(g.id) FILTER (WHERE g.status = 'Delivered'::gallery_status_t) AS delivered_count
FROM companies c
LEFT JOIN galleries g ON g.company_id = c.id
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY c.id, c.name, c.slug, c.domain;

-- 3. v_gallery_selection_stats - used for gallery overview
DROP VIEW IF EXISTS public.v_gallery_selection_stats;
CREATE VIEW public.v_gallery_selection_stats
WITH (security_invoker = true)
AS
SELECT 
    g.id AS gallery_id,
    g.company_id,
    g.name,
    g.slug,
    g.status,
    g.created_at,
    count(p.id) AS photos_count,
    count(p.id) FILTER (WHERE p.is_selected = true) AS selected_count,
    count(p.id) FILTER (WHERE p.staging_requested = true) AS staging_count
FROM galleries g
LEFT JOIN photos p ON p.gallery_id = g.id
GROUP BY g.id, g.company_id, g.name, g.slug, g.status, g.created_at;

-- 4. v_user_activity - used for admin user management
DROP VIEW IF EXISTS public.v_user_activity;
CREATE VIEW public.v_user_activity
WITH (security_invoker = true)
AS
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

-- Grant appropriate permissions (admin-only access for sensitive views)
GRANT SELECT ON public.v_client_metrics TO authenticated;
GRANT SELECT ON public.v_company_gallery_stats TO authenticated;
GRANT SELECT ON public.v_gallery_selection_stats TO authenticated;
GRANT SELECT ON public.v_user_activity TO authenticated;

-- Revoke anon access to prevent unauthenticated queries
REVOKE ALL ON public.v_client_metrics FROM anon;
REVOKE ALL ON public.v_company_gallery_stats FROM anon;
REVOKE ALL ON public.v_gallery_selection_stats FROM anon;
REVOKE ALL ON public.v_user_activity FROM anon;
