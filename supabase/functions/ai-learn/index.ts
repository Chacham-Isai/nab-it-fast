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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub;

    // Gather all user data for AI analysis
    const [interactionsRes, savedRes, ordersRes, dealsRes, profileRes] = await Promise.all([
      supabase.from("buyer_interactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
      supabase.from("saved_items").select("*").eq("user_id", userId).limit(50),
      supabase.from("orders").select("*, listings(title, category)").eq("buyer_id", userId).limit(30),
      supabase.from("group_deal_participants").select("*, group_deals(title, category, deal_price)").eq("user_id", userId).limit(20),
      supabase.from("profiles").select("taste_tags, brand_affinities, spending_style, buy_speed, total_xp, streak_days").eq("id", userId).single(),
    ]);

    const userData = {
      interactions: interactionsRes.data || [],
      saved_items: savedRes.data || [],
      orders: ordersRes.data || [],
      deals_joined: dealsRes.data || [],
      profile: profileRes.data,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a behavioral AI analyst for a marketplace app called nabbit. Analyze user activity data and produce a taste profile summary. Use the tool provided to return structured output.`
          },
          {
            role: "user",
            content: `Analyze this user's marketplace behavior and generate their AI taste profile:\n\n${JSON.stringify(userData, null, 2)}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "update_taste_profile",
            description: "Update the user's AI-generated taste profile based on their behavior",
            parameters: {
              type: "object",
              properties: {
                top_categories: {
                  type: "array",
                  items: { type: "object", properties: { name: { type: "string" }, score: { type: "number" }, trend: { type: "string", enum: ["rising", "stable", "declining"] } }, required: ["name", "score", "trend"] },
                  description: "Top 5 categories ranked by interest score 0-100"
                },
                price_sensitivity: { type: "number", description: "0-100 where 0=budget-focused 100=price-insensitive" },
                avg_price_range: { type: "object", properties: { min: { type: "number" }, max: { type: "number" } }, required: ["min", "max"] },
                buying_patterns: { type: "array", items: { type: "string" }, description: "3-5 behavioral insights" },
                brand_affinities: { type: "array", items: { type: "string" }, description: "Top brands the user gravitates toward" },
                deal_preference: { type: "string", enum: ["solo_buyer", "group_deal_lover", "auction_hunter", "mixed"], description: "Preferred buying mode" },
                engagement_level: { type: "string", enum: ["casual", "regular", "power_buyer", "collector"] },
                recommended_categories: { type: "array", items: { type: "string" }, description: "Categories to recommend exploring" },
                personality_tag: { type: "string", description: "A fun 2-3 word buyer personality like 'The Sniper' or 'Deal Hunter Supreme'" }
              },
              required: ["top_categories", "price_sensitivity", "avg_price_range", "buying_patterns", "brand_affinities", "deal_preference", "engagement_level", "recommended_categories", "personality_tag"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "update_taste_profile" } }
      })
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let tasteSummary = {};
    if (toolCall?.function?.arguments) {
      tasteSummary = JSON.parse(toolCall.function.arguments);
    }

    // Save AI summary to profile
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient.from("profiles").update({
      ai_taste_summary: { ...tasteSummary, updated_at: new Date().toISOString() }
    }).eq("id", userId);

    return new Response(JSON.stringify({ success: true, taste_summary: tasteSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("ai-learn error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
