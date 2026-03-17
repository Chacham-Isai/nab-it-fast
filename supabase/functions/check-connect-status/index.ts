import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: sellerProfile } = await supabaseAdmin
      .from("seller_profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", user.id)
      .single();

    if (!sellerProfile?.stripe_account_id) {
      return new Response(JSON.stringify({ onboarding_complete: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (sellerProfile.stripe_onboarding_complete) {
      return new Response(JSON.stringify({ onboarding_complete: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(sellerProfile.stripe_account_id);
    const complete = account.charges_enabled && account.payouts_enabled;

    if (complete) {
      await supabaseAdmin
        .from("seller_profiles")
        .update({ stripe_onboarding_complete: true })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify({ onboarding_complete: complete }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
