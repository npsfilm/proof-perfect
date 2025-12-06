-- Fix RLS for profiles table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create permissive policies that require authentication
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::role_t));

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix RLS for google_calendar_tokens table
DROP POLICY IF EXISTS "Admins can manage own tokens" ON public.google_calendar_tokens;

-- Create separate policies for each operation
CREATE POLICY "Users can read own tokens"
ON public.google_calendar_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
ON public.google_calendar_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
ON public.google_calendar_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
ON public.google_calendar_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);