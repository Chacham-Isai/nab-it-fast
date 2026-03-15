import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Get user profile for personalization
    const [{ data: profile }, { data: tribes }, { data: savedItems }] = await Promise.all([
      supabase.from("profiles").select("taste_tags, brand_affinities, spending_style, buy_speed").eq("id", user.id).single(),
      supabase.from("tribe_memberships").select("tribe_name").eq("user_id", user.id),
      supabase.from("saved_items").select("item_name, category").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);

    const tasteTags = profile?.taste_tags || [];
    const brands = profile?.brand_affinities || [];
    const style = profile?.spending_style || "moderate";
    const buySpeed = profile?.buy_speed || "browsing";
    const tribeNames = tribes?.map((t: any) => t.tribe_name) || [];
    const recentSaves = savedItems?.map((s: any) => `${s.item_name} (${s.category})`).slice(0, 5) || [];

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
            content: `You are a personalized deal recommendation engine for nabbit.ai, a premium marketplace for collectors and deal hunters. Generate highly personalized product recommendations that feel handpicked. Each item should feel like a real product with realistic pricing. Categories: Cards, Sneakers, Watches, Electronics, Collectibles, Fashion, Gaming, Vinyl.`
          },
          {
            role: "user",
            content: `Generate 5 personalized deal recommendations for this user:
- Taste tags: ${tasteTags.join(", ") || "general interests"}
- Favorite brands: ${brands.join(", ") || "various brands"}
- Spending style: ${style}
- Buy speed: ${buySpeed}
- Crews: ${tribeNames.join(", ") || "none yet"}
- Recently saved: ${recentSaves.join(", ") || "nothing yet"}

Make each recommendation feel personal with a short reason why it's recommended for THIS user. Use realistic product names and prices.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_items",
            description: "Return 5 personalized product recommendations for the user's feed",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Product name" },
                      category: { type: "string", enum: ["Cards", "Sneakers", "Watches", "Electronics", "Collectibles", "Fashion", "Gaming", "Vinyl"] },
                      price: { type: "number", description: "Deal price" },
                      was: { type: "number", description: "Original retail price" },
                      reason: { type: "string", description: "Short personalized reason why this is recommended, e.g. 'Matches your Nike affinity'" },
                      match_score: { type: "number", description: "AI match percentage 75-99" },
                      tag: { type: "string", enum: ["DREAM MATCH", "AI PICK", "FOR YOU", "TRENDING"] },
                      urgency: { type: "string", description: "Short urgency text like '3 left' or 'Ends in 2h'" }
                    },
                    required: ["name", "category", "price", "was", "reason", "match_score", "tag", "urgency"],
                    additionalProperties: false
                  }
                }
              },
              required: ["items"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_items" } },
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
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error(`AI gateway error: ${status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    const items = toolCall ? JSON.parse(toolCall.function.arguments).items : [];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-feed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
