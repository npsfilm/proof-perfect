-- Fix Problem 1: Restrict profiles table access
-- Remove the overly permissive policy that allows anyone to read all profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- Allow users to read only their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Allow admins to read all profiles (needed for admin dashboard)
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::role_t
  )
);