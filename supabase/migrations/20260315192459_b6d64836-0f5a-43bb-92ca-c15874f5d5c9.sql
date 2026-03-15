
-- Tighten the INSERT policy to be more specific
DROP POLICY "Authenticated users can create crews" ON public.crews;
CREATE POLICY "Authenticated users can create crews" ON public.crews
  FOR INSERT TO authenticated WITH CHECK (member_count = 0);
