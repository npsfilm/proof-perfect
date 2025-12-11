-- Fix team_invitations: Remove dangerous USING(true) policy
DROP POLICY IF EXISTS "Anyone can read their own invitation by token" ON public.team_invitations;

-- New secure policy: Only authenticated users can read invitations sent to their email
CREATE POLICY "Users can read invitations to their email"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Fix clients table: Change TO public to TO authenticated
DROP POLICY IF EXISTS "Users can read own client record" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client record" ON public.clients;

-- New secure SELECT policy
CREATE POLICY "Users can read own client record"
ON public.clients
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- New secure UPDATE policy
CREATE POLICY "Users can update own client record"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);