
-- Create crews table for discovery
CREATE TABLE public.crews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  emoji text NOT NULL DEFAULT '🎯',
  description text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  member_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

-- Anyone can view crews
CREATE POLICY "Anyone can view crews" ON public.crews
  FOR SELECT TO public USING (true);

-- Only authenticated users can create crews (future feature)
CREATE POLICY "Authenticated users can create crews" ON public.crews
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create a trigger to keep member_count in sync
CREATE OR REPLACE FUNCTION public.update_crew_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.crews SET member_count = member_count + 1 WHERE name = NEW.tribe_name;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.crews SET member_count = GREATEST(member_count - 1, 0) WHERE name = OLD.tribe_name;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_tribe_membership_change
  AFTER INSERT OR DELETE ON public.tribe_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_crew_member_count();

-- Seed with existing crews
INSERT INTO public.crews (name, emoji, description, category, is_active) VALUES
  ('Card Collectors', '🃏', 'Trading cards, sports cards, and TCGs. From vintage to modern pulls.', 'Collectibles', true),
  ('Sneakerheads', '👟', 'Sneaker culture, drops, restocks, and grails. Stay laced up.', 'Fashion', true),
  ('Watch Collectors', '⌚', 'Timepieces from Casio to Patek. Wrist game strong.', 'Luxury', false),
  ('Tech Heads', '🖥️', 'Gadgets, GPUs, consoles, and everything silicon. Early adopters unite.', 'Electronics', true),
  ('Vintage Hunters', '🪑', 'Mid-century, retro, antique finds. If it has patina, we want it.', 'Home', false),
  ('Streetwear', '🧥', 'Supreme, Palace, Stüssy and beyond. Hype drops and steals.', 'Fashion', true),
  ('Vinyl & Audio', '🎵', 'Records, hi-fi gear, and analog vibes. Press play.', 'Music', false),
  ('Gaming', '🎮', 'Consoles, retro games, limited editions, and gaming peripherals.', 'Electronics', true),
  ('Art & Prints', '🎨', 'Limited prints, original art, and creative collectibles.', 'Art', false),
  ('Outdoor Gear', '🏕️', 'Camping, hiking, and adventure equipment deals.', 'Sports', true);

-- Update member counts from existing memberships
UPDATE public.crews c
SET member_count = (
  SELECT COUNT(*) FROM public.tribe_memberships tm WHERE tm.tribe_name = c.name
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crews;
