-- Companies & Users Area Migration

-- 1. Create companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  domain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive unique index on slug
CREATE UNIQUE INDEX idx_companies_slug_ci ON public.companies (lower(slug));

-- Add updated_at trigger (reuse existing function)
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create company_members join table
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_company_members UNIQUE (company_id, user_id)
);

-- 3. Add company_id to galleries
ALTER TABLE public.galleries
  ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- 4. Slug generator for companies (mirrors gallery pattern)
CREATE OR REPLACE FUNCTION public.generate_company_slug(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 2;
BEGIN
  -- Create base slug: lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(regexp_replace(p_name, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check for collisions (case-insensitive) and append counter if needed
  WHILE EXISTS(SELECT 1 FROM public.companies WHERE lower(slug) = lower(final_slug)) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 5. RPC for admin-only gallery assignment
CREATE OR REPLACE FUNCTION public.assign_gallery_to_company(
  p_gallery_id uuid,
  p_company_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::role_t) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE public.galleries
  SET company_id = p_company_id
  WHERE id = p_gallery_id;
END;
$$;

-- 6. Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all companies"
  ON public.companies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::role_t))
  WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- 7. Enable RLS on company_members
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all company members"
  ON public.company_members
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::role_t))
  WITH CHECK (has_role(auth.uid(), 'admin'::role_t));

-- 8. Create view: v_company_gallery_stats
CREATE OR REPLACE VIEW public.v_company_gallery_stats AS
SELECT
  c.id as company_id,
  c.name as company_name,
  c.slug,
  c.domain,
  COUNT(DISTINCT g.id) as galleries_count,
  COALESCE(SUM(photo_counts.total), 0)::bigint as photos_count,
  COALESCE(SUM(photo_counts.selected), 0)::bigint as selected_count,
  COALESCE(SUM(photo_counts.staging), 0)::bigint as staging_count,
  COUNT(g.id) FILTER (WHERE g.status = 'Reviewed') as reviewed_count,
  COUNT(g.id) FILTER (WHERE g.status = 'Delivered') as delivered_count
FROM public.companies c
LEFT JOIN public.galleries g ON g.company_id = c.id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_selected = true) as selected,
    COUNT(*) FILTER (WHERE staging_requested = true) as staging
  FROM public.photos
  WHERE gallery_id = g.id
) photo_counts ON true
GROUP BY c.id, c.name, c.slug, c.domain;

-- 9. Create view: v_user_activity
CREATE OR REPLACE VIEW public.v_user_activity AS
SELECT
  p.id as user_id,
  p.email,
  ur.role,
  au.last_sign_in_at,
  (SELECT COUNT(*) FROM public.gallery_access ga WHERE ga.user_id = p.id) as galleries_assigned,
  (SELECT COUNT(*)
   FROM public.photos ph
   JOIN public.galleries g ON g.id = ph.gallery_id
   JOIN public.gallery_access ga ON ga.gallery_id = g.id AND ga.user_id = p.id
   WHERE ph.is_selected = true) as selections_made
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN auth.users au ON au.id = p.id;

-- 10. Create view: v_gallery_selection_stats
CREATE OR REPLACE VIEW public.v_gallery_selection_stats AS
SELECT
  g.id as gallery_id,
  g.company_id,
  g.name,
  g.slug,
  g.status,
  g.created_at,
  COUNT(p.*) as photos_count,
  COUNT(*) FILTER (WHERE p.is_selected = true) as selected_count,
  COUNT(*) FILTER (WHERE p.staging_requested = true) as staging_count
FROM public.galleries g
LEFT JOIN public.photos p ON p.gallery_id = g.id
GROUP BY g.id;

-- 11. Create helpful indexes
CREATE INDEX idx_galleries_company ON public.galleries(company_id);
CREATE INDEX idx_company_members_company ON public.company_members(company_id);
CREATE INDEX idx_company_members_user ON public.company_members(user_id);