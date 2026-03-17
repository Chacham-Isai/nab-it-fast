
-- Referral codes and tracking
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  referee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, completed
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
USING (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Users can create referral codes
CREATE POLICY "Users can create referral codes"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (referrer_id = auth.uid());

-- System can update referrals (for completion)
CREATE POLICY "Users can update own referrals"
ON public.referrals FOR UPDATE
TO authenticated
USING (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Add referral_code column to profiles so we know who referred them
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by text;

-- Function to generate a short referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  existing int;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO code FROM public.referrals WHERE referrer_id = user_id AND referee_id IS NULL LIMIT 1;
  IF code IS NOT NULL THEN RETURN code; END IF;
  
  -- Generate unique 8-char code
  LOOP
    code := upper(substr(md5(random()::text || user_id::text), 1, 8));
    SELECT COUNT(*) INTO existing FROM public.referrals WHERE referral_code = code;
    EXIT WHEN existing = 0;
  END LOOP;
  
  INSERT INTO public.referrals (referrer_id, referral_code) VALUES (user_id, code);
  RETURN code;
END;
$$;

-- Function to complete a referral
CREATE OR REPLACE FUNCTION public.complete_referral(p_referee_id uuid, p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_row record;
  xp_bonus int := 500;
BEGIN
  -- Find the referral
  SELECT * INTO ref_row FROM public.referrals 
  WHERE referral_code = p_code AND status = 'pending' AND referee_id IS NULL
  LIMIT 1;
  
  IF NOT FOUND THEN RETURN; END IF;
  IF ref_row.referrer_id = p_referee_id THEN RETURN; END IF; -- can't refer yourself
  
  -- Mark referral complete
  UPDATE public.referrals 
  SET referee_id = p_referee_id, status = 'completed', xp_awarded = xp_bonus, completed_at = now()
  WHERE id = ref_row.id;
  
  -- Award XP to referrer
  UPDATE public.profiles SET total_xp = total_xp + xp_bonus WHERE id = ref_row.referrer_id;
  
  -- Award XP to referee too (welcome bonus)
  UPDATE public.profiles SET total_xp = total_xp + 100, referred_by = p_code WHERE id = p_referee_id;
  
  -- Notify referrer
  INSERT INTO public.notifications_log (user_id, type, title, body, action_label)
  VALUES (ref_row.referrer_id, 'referral', '🎉 Referral Complete!', 'A friend you invited just joined nabbit! You earned ' || xp_bonus || ' XP!', 'View Profile');
END;
$$;
