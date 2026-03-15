ALTER TABLE public.auctions ADD COLUMN IF NOT EXISTS watchers integer NOT NULL DEFAULT 0;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can view own listings" ON public.listings;
CREATE POLICY "Sellers can view own listings" ON public.listings FOR SELECT TO authenticated USING (seller_id = auth.uid());