
-- Waitlist table for landing page email capture
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can sign up for the waitlist
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT TO public WITH CHECK (true);

-- No one can read waitlist from client (admin only via service role)
CREATE POLICY "No public read on waitlist" ON public.waitlist FOR SELECT USING (false);
