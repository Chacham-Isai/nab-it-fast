
-- Buyer interaction tracking table
CREATE TABLE public.buyer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  interaction_type text NOT NULL,
  item_id text,
  item_type text,
  category text,
  price numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.buyer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own interactions" ON public.buyer_interactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own interactions" ON public.buyer_interactions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_buyer_interactions_user ON public.buyer_interactions(user_id, created_at DESC);
CREATE INDEX idx_buyer_interactions_type ON public.buyer_interactions(interaction_type);

-- Shipping addresses table
CREATE TABLE public.shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text DEFAULT 'US',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.shipping_addresses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own addresses" ON public.shipping_addresses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own addresses" ON public.shipping_addresses
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own addresses" ON public.shipping_addresses
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Expand profiles with new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_learning_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_taste_summary jsonb DEFAULT '{}'::jsonb;
