-- RLS Policy für company_members: User können ihre eigene Mitgliedschaft lesen
CREATE POLICY "Users can read own membership"
ON public.company_members
FOR SELECT
USING (auth.uid() = user_id);