
-- Listings table (products/items for sale)
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  condition text DEFAULT 'new',
  images text[] DEFAULT '{}',
  starting_price numeric NOT NULL,
  buy_now_price numeric,
  listing_type text NOT NULL DEFAULT 'auction',
  status text NOT NULL DEFAULT 'draft',
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Auctions table (active auction state)
CREATE TABLE public.auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  current_price numeric NOT NULL DEFAULT 0,
  highest_bidder_id uuid REFERENCES public.profiles(id),
  bid_count integer NOT NULL DEFAULT 0,
  reserve_price numeric,
  bid_increment numeric NOT NULL DEFAULT 1.00,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  auto_extend boolean DEFAULT true,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Bids table
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  bid_type text NOT NULL DEFAULT 'manual',
  max_proxy_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id),
  auction_id uuid REFERENCES public.auctions(id),
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb,
  tracking_number text,
  tracking_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seller profiles (extended info for sellers)
CREATE TABLE public.seller_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  shop_name text,
  shop_description text,
  shop_avatar text,
  total_sales integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, reviewer_id)
);

-- Chat messages for live auctions/streams
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- LISTINGS policies
CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can view own listings" ON public.listings FOR SELECT TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "Sellers can create listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update own listings" ON public.listings FOR UPDATE TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "Sellers can delete own draft listings" ON public.listings FOR DELETE TO authenticated USING (seller_id = auth.uid() AND status = 'draft');

-- AUCTIONS policies
CREATE POLICY "Anyone can view live auctions" ON public.auctions FOR SELECT USING (status IN ('live', 'ended'));
CREATE POLICY "Sellers can create auctions" ON public.auctions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid())
);
CREATE POLICY "Sellers can update own auctions" ON public.auctions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid())
);

-- BIDS policies
CREATE POLICY "Anyone can view bids on live auctions" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (bidder_id = auth.uid());

-- ORDERS policies
CREATE POLICY "Buyers can view own orders" ON public.orders FOR SELECT TO authenticated USING (buyer_id = auth.uid());
CREATE POLICY "Sellers can view orders for their items" ON public.orders FOR SELECT TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "System can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Sellers can update order status" ON public.orders FOR UPDATE TO authenticated USING (seller_id = auth.uid());

-- SELLER PROFILES policies
CREATE POLICY "Anyone can view seller profiles" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "Sellers can create own profile" ON public.seller_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Sellers can update own profile" ON public.seller_profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- REVIEWS policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- CHAT MESSAGES policies
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Enable realtime for auctions, bids, and chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to update listing updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
