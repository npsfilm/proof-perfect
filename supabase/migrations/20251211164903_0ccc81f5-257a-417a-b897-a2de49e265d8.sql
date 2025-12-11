-- Backfill missing gallery_access entries for existing galleries
-- This ensures clients who were linked via gallery_clients also have proper access via gallery_access

INSERT INTO public.gallery_access (gallery_id, user_id)
SELECT DISTINCT gc.gallery_id, p.id
FROM public.gallery_clients gc
JOIN public.clients c ON c.id = gc.client_id
JOIN public.profiles p ON lower(p.email) = lower(c.email)
WHERE NOT EXISTS (
  SELECT 1 FROM public.gallery_access ga 
  WHERE ga.gallery_id = gc.gallery_id AND ga.user_id = p.id
);