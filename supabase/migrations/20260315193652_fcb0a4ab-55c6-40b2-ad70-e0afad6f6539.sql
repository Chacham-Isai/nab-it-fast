
-- Allow anyone to view tribe memberships (needed for crew member lists and crew discovery)
DROP POLICY "Users can view own tribe memberships" ON public.tribe_memberships;
CREATE POLICY "Anyone can view tribe memberships" ON public.tribe_memberships
  FOR SELECT TO public USING (true);
