-- Fix: Remove overly permissive SELECT policy that exposes all customer data
DROP POLICY IF EXISTS "Public can read own bookings by email" ON public.bookings;

-- Create a secure policy: only authenticated users can read bookings matching their email
CREATE POLICY "Authenticated users can read own bookings by email"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  contact_email = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  )
);

-- Note: "Admins can manage all bookings" policy already exists and covers admin access
-- Note: "Public can insert bookings" policy remains for the public booking form