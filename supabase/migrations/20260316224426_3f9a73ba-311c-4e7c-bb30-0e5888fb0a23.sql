
-- Add tiered pricing and giveaway columns to group_deals
ALTER TABLE public.group_deals
  ADD COLUMN price_tiers jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN giveaway_enabled boolean DEFAULT false,
  ADD COLUMN giveaway_prize text,
  ADD COLUMN giveaway_winner_id uuid REFERENCES public.profiles(id),
  ADD COLUMN total_savings numeric DEFAULT 0,
  ADD COLUMN source_status text DEFAULT 'sourcing';

-- Add tier tracking to group_deal_participants
ALTER TABLE public.group_deal_participants
  ADD COLUMN tier_name text,
  ADD COLUMN price_paid numeric;

-- Replace the handle_group_deal_join trigger function with tiered logic
CREATE OR REPLACE FUNCTION public.handle_group_deal_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deal_row record;
  tiers jsonb;
  tier jsonb;
  i int;
  current_tier_name text;
  current_tier_price numeric;
  total_slots int := 0;
  filled_slots int := 0;
  winner_id uuid;
BEGIN
  -- Get the deal
  SELECT * INTO deal_row FROM public.group_deals WHERE id = NEW.deal_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  tiers := COALESCE(deal_row.price_tiers, '[]'::jsonb);

  -- If tiers exist, find current tier and update slots_filled
  IF jsonb_array_length(tiers) > 0 THEN
    FOR i IN 0..jsonb_array_length(tiers) - 1 LOOP
      tier := tiers->i;
      IF (tier->>'slots_filled')::int < (tier->>'slots')::int AND current_tier_name IS NULL THEN
        current_tier_name := tier->>'tier_name';
        current_tier_price := (tier->>'price')::numeric;
        tiers := jsonb_set(tiers, ARRAY[i::text, 'slots_filled'], to_jsonb((tier->>'slots_filled')::int + 1));
      END IF;
    END LOOP;

    -- Set participant tier info
    NEW.tier_name := current_tier_name;
    NEW.price_paid := current_tier_price;
  ELSE
    NEW.price_paid := deal_row.deal_price;
  END IF;

  -- Calculate new participant count
  UPDATE public.group_deals
  SET current_participants = current_participants + 1,
      price_tiers = tiers,
      total_savings = total_savings + (deal_row.retail_price - COALESCE(NEW.price_paid, deal_row.deal_price)),
      status = CASE
        WHEN current_participants + 1 >= target_participants THEN 'funded'
        ELSE status
      END,
      reward_tier = CASE
        WHEN (current_participants + 1)::float / target_participants >= 1.0 THEN 'gold'
        WHEN (current_participants + 1)::float / target_participants >= 0.75 THEN 'silver'
        WHEN (current_participants + 1)::float / target_participants >= 0.5 THEN 'bronze'
        ELSE reward_tier
      END,
      -- Pick giveaway winner when funded
      giveaway_winner_id = CASE
        WHEN giveaway_enabled AND current_participants + 1 >= target_participants THEN (
          SELECT user_id FROM public.group_deal_participants
          WHERE deal_id = NEW.deal_id
          ORDER BY random() LIMIT 1
        )
        ELSE giveaway_winner_id
      END,
      -- Update source status when funded
      source_status = CASE
        WHEN current_participants + 1 >= target_participants THEN 'quoted'
        ELSE source_status
      END
  WHERE id = NEW.deal_id;

  RETURN NEW;
END;
$function$;
