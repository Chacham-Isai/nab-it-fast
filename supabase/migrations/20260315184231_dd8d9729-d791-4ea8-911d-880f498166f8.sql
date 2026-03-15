-- Allow buyers to update their own orders (for confirming delivery)
CREATE POLICY "Buyers can confirm delivery"
ON public.orders
FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid() AND status = 'shipped')
WITH CHECK (buyer_id = auth.uid() AND status = 'delivered');

-- Allow deleting cancelled listings (currently only draft allowed)
DROP POLICY IF EXISTS "Sellers can delete own draft listings" ON public.listings;
CREATE POLICY "Sellers can delete own draft or cancelled listings"
ON public.listings
FOR DELETE
TO authenticated
USING (seller_id = auth.uid() AND status IN ('draft', 'cancelled'));