
-- Create group_deals table
CREATE TABLE public.group_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  emoji text DEFAULT '🎁',
  category text DEFAULT 'other',
  tribe_name text,
  deal_price numeric NOT NULL,
  retail_price numeric NOT NULL,
  discount_pct integer NOT NULL DEFAULT 0,
  target_participants integer NOT NULL DEFAULT 10,
  current_participants integer NOT NULL DEFAULT 0,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  reward_tier text DEFAULT NULL
);

-- Create group_deal_participants table
CREATE TABLE public.group_deal_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.group_deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Add XP/streak columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- RLS for group_deals
ALTER TABLE public.group_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active group deals" ON public.group_deals
  FOR SELECT TO public USING (status IN ('active', 'funded', 'completed'));

CREATE POLICY "Authenticated users can create group deals" ON public.group_deals
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update own group deals" ON public.group_deals
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- RLS for group_deal_participants
ALTER TABLE public.group_deal_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON public.group_deal_participants
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can join deals" ON public.group_deal_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave deals" ON public.group_deal_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Trigger: auto-increment current_participants and check funded
CREATE OR REPLACE FUNCTION public.handle_group_deal_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.group_deals
  SET current_participants = current_participants + 1,
      status = CASE
        WHEN current_participants + 1 >= target_participants THEN 'funded'
        ELSE status
      END,
      reward_tier = CASE
        WHEN (current_participants + 1)::float / target_participants >= 1.0 THEN 'gold'
        WHEN (current_participants + 1)::float / target_participants >= 0.75 THEN 'silver'
        WHEN (current_participants + 1)::float / target_participants >= 0.5 THEN 'bronze'
        ELSE reward_tier
      END
  WHERE id = NEW.deal_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_deal_join
  AFTER INSERT ON public.group_deal_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_deal_join();

-- Trigger: decrement on leave
CREATE OR REPLACE FUNCTION public.handle_group_deal_leave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.group_deals
  SET current_participants = GREATEST(current_participants - 1, 0),
      status = CASE
        WHEN current_participants - 1 < target_participants AND status = 'funded' THEN 'active'
        ELSE status
      END,
      reward_tier = CASE
        WHEN (current_participants - 1)::float / target_participants >= 1.0 THEN 'gold'
        WHEN (current_participants - 1)::float / target_participants >= 0.75 THEN 'silver'
        WHEN (current_participants - 1)::float / target_participants >= 0.5 THEN 'bronze'
        ELSE NULL
      END
  WHERE id = OLD.deal_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_group_deal_leave
  AFTER DELETE ON public.group_deal_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_deal_leave();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_deal_participants;
