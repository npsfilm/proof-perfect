-- Fix Problem 5: Restrict user_roles SELECT policy
-- Remove the overly permissive policy that allows all authenticated users to see all roles
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;

-- Create a restrictive policy: users can only see their own role
CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Note: The has_role() function is SECURITY DEFINER, so internal role checks
-- will continue to work even though users can't query all roles directly