import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const [{ data: profile }, { data: tribes }] = await Promise.all([
      supabase.from("profiles").select("taste_tags, brand_affinities, spending_style").eq("id", user.id).single(),
      supabase.from("tribe_memberships").select("tribe_name").eq("user_id", user.id),
    ]);

    const tribeNames = tribes?.map((t: any) => t.tribe_name) || [];
    const tasteTags = profile?.taste_tags || [];
    const brands = profile?.brand_affinities || [];
    const style = profile?.spending_style || "moderate";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a deal recommendation engine for nabbit.ai, a marketplace for collectors and deal hunters. Generate personalized group deal suggestions with TIERED early-bird pricing. Each deal has 3 price tiers: Early Bird (cheapest, fewest slots), Standard (mid-price, most slots), Late Entry (highest price, fewer slots). The earlier you join, the more you save. Deals should feel urgent and exciting."
          },
          {
            role: "user",
            content: `Generate 4 group deal suggestions with tiered pricing for a user with these preferences:
- Crews: ${tribeNames.join(", ") || "none yet"}
- Taste tags: ${tasteTags.join(", ") || "general"}
- Favorite brands: ${brands.join(", ") || "various"}
- Spending style: ${style}

Each deal must include:
- title, description, emoji, category, tribe_name
- retail_price (number - full retail)
- price_tiers: array of exactly 3 objects with {tier_name, price, slots, slots_filled: 0}
  - Tier 1: "Early Bird" (biggest discount, 3-5 slots)
  - Tier 2: "Standard" (medium discount, 5-10 slots)
  - Tier 3: "Late Entry" (smallest discount, 3-5 slots)
- giveaway_enabled: boolean (true for ~50% of deals)
- giveaway_prize: string if enabled (e.g. "1 FREE order", "$50 credit")
- target_participants: sum of all tier slots`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_deals",
            description: "Return 4 personalized group deal suggestions with tiered pricing",
            parameters: {
              type: "object",
              properties: {
                deals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      emoji: { type: "string" },
                      category: { type: "string" },
                      tribe_name: { type: "string" },
                      retail_price: { type: "number" },
                      price_tiers: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            tier_name: { type: "string" },
                            price: { type: "number" },
                            slots: { type: "number" },
                            slots_filled: { type: "number" }
                          },
                          required: ["tier_name", "price", "slots", "slots_filled"],
                          additionalProperties: false
                        }
                      },
                      giveaway_enabled: { type: "boolean" },
                      giveaway_prize: { type: "string" },
                      target_participants: { type: "number" }
                    },
                    required: ["title", "description", "emoji", "category", "tribe_name", "retail_price", "price_tiers", "giveaway_enabled", "target_participants"],
                    additionalProperties: false
                  }
                }
              },
              required: ["deals"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_deals" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    const deals = toolCall ? JSON.parse(toolCall.function.arguments).deals : [];

    return new Response(JSON.stringify({ deals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-deals error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
