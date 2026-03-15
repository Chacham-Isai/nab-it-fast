
CREATE OR REPLACE FUNCTION public.increment_seller_sales(p_seller_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.seller_profiles
  SET total_sales = total_sales + 1,
      total_revenue = total_revenue + p_amount
  WHERE id = p_seller_id;
END;
$$;
