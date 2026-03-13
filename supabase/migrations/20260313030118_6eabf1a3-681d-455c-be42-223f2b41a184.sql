
-- 1. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_emoji text DEFAULT '🐇',
  taste_tags text[] DEFAULT '{}',
  spending_style text,
  buy_speed text,
  brand_affinities text[] DEFAULT '{}',
  travel_vibes text[] DEFAULT '{}',
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Dream Buys table
CREATE TABLE public.dream_buys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  target_price numeric,
  status text DEFAULT 'hunting',
  match_url text,
  match_price numeric,
  created_at timestamptz DEFAULT now()
);

-- 3. Saved Items table
CREATE TABLE public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text,
  price numeric,
  was_price numeric,
  image_emoji text,
  retailer text,
  tag text,
  created_at timestamptz DEFAULT now()
);

-- 4. Tribe Memberships table
CREATE TABLE public.tribe_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tribe_name text NOT NULL,
  tribe_emoji text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tribe_name)
);

-- 5. Giving Settings table
CREATE TABLE public.giving_settings (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  roundup_enabled boolean DEFAULT false,
  roundup_pct integer DEFAULT 1,
  total_given numeric DEFAULT 0,
  active_cause text,
  updated_at timestamptz DEFAULT now()
);

-- 6. Notifications Log table
CREATE TABLE public.notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean DEFAULT false,
  action_label text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_buys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giving_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Profiles RLS (id = auth.uid())
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (id = auth.uid());

-- Dream Buys RLS
CREATE POLICY "Users can view own dream buys" ON public.dream_buys FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own dream buys" ON public.dream_buys FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own dream buys" ON public.dream_buys FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own dream buys" ON public.dream_buys FOR DELETE USING (user_id = auth.uid());

-- Saved Items RLS
CREATE POLICY "Users can view own saved items" ON public.saved_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own saved items" ON public.saved_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own saved items" ON public.saved_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own saved items" ON public.saved_items FOR DELETE USING (user_id = auth.uid());

-- Tribe Memberships RLS
CREATE POLICY "Users can view own tribe memberships" ON public.tribe_memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tribe memberships" ON public.tribe_memberships FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tribe memberships" ON public.tribe_memberships FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tribe memberships" ON public.tribe_memberships FOR DELETE USING (user_id = auth.uid());

-- Giving Settings RLS
CREATE POLICY "Users can view own giving settings" ON public.giving_settings FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own giving settings" ON public.giving_settings FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own giving settings" ON public.giving_settings FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can delete own giving settings" ON public.giving_settings FOR DELETE USING (id = auth.uid());

-- Notifications Log RLS
CREATE POLICY "Users can view own notifications" ON public.notifications_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notifications" ON public.notifications_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.notifications_log FOR DELETE USING (user_id = auth.uid());

-- Auto-create profile + giving_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  INSERT INTO public.giving_settings (id) VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
