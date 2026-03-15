
-- Break slots table for tracking individual slots in break listings
CREATE TABLE public.break_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  slot_label text NOT NULL,
  slot_emoji text DEFAULT '🎴',
  price numeric NOT NULL DEFAULT 0,
  taken boolean NOT NULL DEFAULT false,
  buyer_id uuid REFERENCES public.profiles(id) DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.break_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view break slots for active listings
CREATE POLICY "Anyone can view break slots" ON public.break_slots
  FOR SELECT USING (true);

-- Authenticated users can buy a slot (update taken/buyer_id)
CREATE POLICY "Authenticated users can buy slots" ON public.break_slots
  FOR UPDATE TO authenticated
  USING (taken = false)
  WITH CHECK (buyer_id = auth.uid() AND taken = true);

-- Sellers can insert slots for their own listings
CREATE POLICY "Sellers can insert break slots" ON public.break_slots
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = break_slots.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can delete their own break slots
CREATE POLICY "Sellers can delete own break slots" ON public.break_slots
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = break_slots.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Enable realtime on break_slots
ALTER PUBLICATION supabase_realtime ADD TABLE public.break_slots;
