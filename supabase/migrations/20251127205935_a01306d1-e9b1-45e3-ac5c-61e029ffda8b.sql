-- Fix Problem 2: Remove auth.users exposure from v_user_activity
-- Drop the existing view that joins with auth.users
DROP VIEW IF EXISTS v_user_activity;

-- Recreate the view without accessing auth.users
CREATE VIEW v_user_activity AS
SELECT 
  p.id AS user_id,
  p.email,
  ur.role,
  p.updated_at AS last_activity, -- Use profiles.updated_at instead of auth.users.last_sign_in_at
  (SELECT count(*) FROM gallery_access ga WHERE ga.user_id = p.id) AS galleries_assigned,
  (SELECT count(*) FROM photos ph
   JOIN galleries g ON g.id = ph.gallery_id
   JOIN gallery_access ga ON ga.gallery_id = g.id AND ga.user_id = p.id
   WHERE ph.is_selected = true) AS selections_made
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id;