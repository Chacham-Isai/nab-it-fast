import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.text();
    let event: Stripe.Event;

    if (STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers.get('stripe-signature')!;
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { listing_id, buyer_id, seller_id, type } = session.metadata!;

        // Update order to paid
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('stripe_checkout_session_id', session.id);

        // Update listing if buy_now
        if (type === 'buy_now') {
          await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', listing_id);
        }

        // Update seller stats
        await supabase.rpc('increment_seller_sales', {
          p_seller_id: seller_id,
          p_amount: (session.amount_total || 0) / 100,
        });

        // Notify buyer
        await supabase.from('notifications_log').insert({
          user_id: buyer_id,
          title: 'Purchase confirmed! 🎉',
          body: `Your order has been confirmed. The seller will ship your item soon.`,
          type: 'order',
          action_label: 'View Order',
        });

        // Notify seller
        await supabase.from('notifications_log').insert({
          user_id: seller_id,
          title: 'New sale! 💰',
          body: `You have a new order to fulfill.`,
          type: 'order',
          action_label: 'View Order',
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
