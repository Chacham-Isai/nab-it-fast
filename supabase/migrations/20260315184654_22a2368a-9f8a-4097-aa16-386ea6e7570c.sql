-- Function to recalculate seller rating after a review
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.seller_profiles
  SET rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE seller_id = NEW.seller_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE seller_id = NEW.seller_id)
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update seller rating on new review
CREATE TRIGGER on_review_inserted
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();