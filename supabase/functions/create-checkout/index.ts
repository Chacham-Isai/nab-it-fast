import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { listing_id, type, quantity = 1 } = await req.json();

    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, auctions(*)')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) throw new Error('Listing not found');

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    let amount: number;
    let description: string;

    if (type === 'buy_now') {
      amount = listing.buy_now_price! * 100; // cents
      description = `Buy Now: ${listing.title}`;
    } else if (type === 'grab_bag') {
      amount = listing.starting_price * quantity * 100;
      description = `Grab Bag: ${listing.title} x${quantity}`;
    } else if (type === 'break_slot') {
      amount = listing.starting_price * 100;
      description = `Break Slot: ${listing.title}`;
    } else {
      throw new Error('Invalid checkout type');
    }

    const platformFee = Math.round(amount * 0.10); // 10% platform fee

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description: description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/play?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/play?cancelled=true`,
      metadata: {
        listing_id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        type,
        quantity: quantity.toString(),
        platform_fee: platformFee.toString(),
      },
    });

    // Create pending order
    await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: listing.seller_id,
      listing_id,
      amount: amount / 100,
      platform_fee: platformFee / 100,
      stripe_checkout_session_id: session.id,
      status: 'pending',
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
