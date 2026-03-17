import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    let event: Stripe.Event;

    if (STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers.get("stripe-signature")!;
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const chargesEnabled = account.charges_enabled;
      const payoutsEnabled = account.payouts_enabled;

      if (chargesEnabled && payoutsEnabled) {
        // Mark seller as fully onboarded
        await supabase
          .from("seller_profiles")
          .update({ stripe_onboarding_complete: true })
          .eq("stripe_account_id", account.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Connect webhook error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
