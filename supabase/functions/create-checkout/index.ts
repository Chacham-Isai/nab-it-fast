import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { listing_id, type, quantity = 1, slot_id } = await req.json();
    if (!listing_id || !type) throw new Error('Missing listing_id or type');

    // Fetch listing and seller profile in parallel
    const [{ data: listing, error: listingError }, ] = await Promise.all([
      supabase
        .from('listings')
        .select('*, auctions(*)')
        .eq('id', listing_id)
        .single(),
    ]);

    if (listingError || !listing) throw new Error('Listing not found');
    if (listing.seller_id === user.id) throw new Error('Cannot buy your own listing');

    // Get seller's Stripe Connect account
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('stripe_account_id, stripe_onboarding_complete')
      .eq('id', listing.seller_id)
      .single();

    const sellerStripeAccountId = sellerProfile?.stripe_account_id;
    const sellerOnboarded = sellerProfile?.stripe_onboarding_complete;

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' });

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    let amount: number;
    let description: string;

    switch (type) {
      case 'buy_now':
        if (!listing.buy_now_price) throw new Error('No buy now price set');
        amount = Math.round(listing.buy_now_price * 100);
        description = `Buy Now: ${listing.title}`;
        break;
      case 'grab_bag':
        amount = Math.round(listing.starting_price * quantity * 100);
        description = `Grab Bag: ${listing.title} x${quantity}`;
        break;
      case 'break_slot':
        if (slot_id) {
          const { data: slot } = await supabase.from('break_slots').select('*').eq('id', slot_id).single();
          if (!slot || slot.taken) throw new Error('Slot unavailable');
          amount = Math.round(slot.price * 100);
          description = `Break Slot: ${slot.slot_label} — ${listing.title}`;
        } else {
          amount = Math.round(listing.starting_price * 100);
          description = `Break Slot: ${listing.title}`;
        }
        break;
      default:
        throw new Error('Invalid checkout type');
    }

    const platformFee = Math.round(amount * 0.10); // 10% platform fee
    const origin = req.headers.get('origin') || 'https://nab-it-fast.lovable.app';

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description,
            ...(listing.images?.[0] ? { images: [listing.images[0]] } : {}),
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/listing/${listing_id}?cancelled=true`,
      metadata: {
        listing_id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        type,
        quantity: quantity.toString(),
        platform_fee: platformFee.toString(),
        ...(slot_id ? { slot_id } : {}),
      },
    };

    // If seller has completed Stripe Connect onboarding, split the payment
    // Platform keeps the fee, seller gets the rest automatically
    if (sellerStripeAccountId && sellerOnboarded) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Create pending order
    await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: listing.seller_id,
      listing_id,
      amount: amount / 100,
      platform_fee: platformFee / 100,
      stripe_checkout_session_id: session.id,
      status: 'pending',
      ...(listing.auctions?.[0] ? { auction_id: listing.auctions[0].id } : {}),
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
