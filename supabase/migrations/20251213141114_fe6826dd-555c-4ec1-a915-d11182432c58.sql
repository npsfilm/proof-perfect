-- Fix bookings table security: restrict SELECT to admins only
-- Bookings are created via edge function (booking-webhook) without user authentication
-- so there's no user_id to track. Only admins should be able to read booking data.

-- First, drop any existing SELECT policies on bookings
DROP POLICY IF EXISTS "Authenticated users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can read bookings" ON public.bookings;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can read bookings"
ON public.bookings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::role_t));

-- Keep existing INSERT policy for public booking creation via webhook
-- The webhook uses service role which bypasses RLS