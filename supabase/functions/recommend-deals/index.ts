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

    // ─── DEEP BEHAVIORAL DATA COLLECTION ───
    const [
      { data: profile },
      { data: tribes },
      { data: pastDeals },
      { data: savedItems },
      { data: orders },
      { data: trendingDeals },
    ] = await Promise.all([
      // 1. Core profile preferences
      supabase
        .from("profiles")
        .select("taste_tags, brand_affinities, spending_style, buy_speed, travel_vibes, streak_days, total_xp")
        .eq("id", user.id)
        .single(),

      // 2. Crew memberships
      supabase
        .from("tribe_memberships")
        .select("tribe_name, tribe_emoji")
        .eq("user_id", user.id),

      // 3. Past deal join history — categories, tiers chosen, price points
      supabase
        .from("group_deal_participants")
        .select("tier_name, price_paid, deal:deal_id(title, category, retail_price, deal_price, discount_pct, tribe_name)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(20),

      // 4. Saved/wishlisted items — categories, price ranges, brands
      supabase
        .from("saved_items")
        .select("item_name, category, price, was_price, retailer, tag")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),

      // 5. Purchase history — actual spending behavior
      supabase
        .from("orders")
        .select("amount, listing:listing_id(title, category, listing_type)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),

      // 6. Currently trending deals (high participation, recently created)
      supabase
        .from("group_deals")
        .select("title, category, tribe_name, current_participants, target_participants, discount_pct, retail_price")
        .eq("status", "active")
        .order("current_participants", { ascending: false })
        .limit(10),
    ]);

    // ─── BEHAVIORAL ANALYSIS ───

    // Category affinity from all signals
    const categorySignals: Record<string, number> = {};
    const addCatSignal = (cat: string | null | undefined, weight: number) => {
      if (!cat) return;
      const key = cat.toLowerCase();
      categorySignals[key] = (categorySignals[key] || 0) + weight;
    };

    // From past deals (strongest signal — they committed money)
    pastDeals?.forEach((d: any) => {
      addCatSignal(d.deal?.category, 5);
    });

    // From orders (bought it — very strong)
    orders?.forEach((o: any) => {
      addCatSignal(o.listing?.category, 4);
    });

    // From saved items (interested but didn't buy yet)
    savedItems?.forEach((s: any) => {
      addCatSignal(s.category, 2);
    });

    // Sort categories by affinity
    const topCategories = Object.entries(categorySignals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, score]) => `${cat} (score: ${score})`);

    // Price sensitivity analysis
    const allPrices: number[] = [];
    pastDeals?.forEach((d: any) => { if (d.price_paid) allPrices.push(Number(d.price_paid)); });
    orders?.forEach((o: any) => { if (o.amount) allPrices.push(Number(o.amount)); });
    savedItems?.forEach((s: any) => { if (s.price) allPrices.push(Number(s.price)); });

    const avgPrice = allPrices.length > 0
      ? Math.round(allPrices.reduce((s, p) => s + p, 0) / allPrices.length)
      : null;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

    // Tier preference from past deals
    const tierCounts: Record<string, number> = {};
    pastDeals?.forEach((d: any) => {
      if (d.tier_name) tierCounts[d.tier_name] = (tierCounts[d.tier_name] || 0) + 1;
    });
    const preferredTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Brand signals from saved items
    const brandSignals: string[] = [];
    savedItems?.forEach((s: any) => {
      if (s.retailer && !brandSignals.includes(s.retailer)) brandSignals.push(s.retailer);
      if (s.tag && !brandSignals.includes(s.tag)) brandSignals.push(s.tag);
    });

    // Discount sensitivity — do they prefer high discounts or premium items?
    const discounts: number[] = [];
    pastDeals?.forEach((d: any) => {
      if (d.deal?.discount_pct) discounts.push(Number(d.deal.discount_pct));
    });
    const avgDiscount = discounts.length > 0
      ? Math.round(discounts.reduce((s, d) => s + d, 0) / discounts.length)
      : null;

    // Engagement level
    const engagementLevel = (profile?.total_xp || 0) > 500 ? "power user" :
      (profile?.total_xp || 0) > 100 ? "active" : "new user";

    // Trending context
    const trendingContext = trendingDeals?.slice(0, 5).map((d: any) =>
      `${d.title} (${d.category}, ${d.current_participants}/${d.target_participants} joined, ${d.discount_pct}% off)`
    ).join("; ") || "none";

    // ─── BUILD INTELLIGENCE PROMPT ───
    const tribeNames = tribes?.map((t: any) => `${t.tribe_emoji || ""} ${t.tribe_name}`.trim()) || [];
    const tasteTags = profile?.taste_tags || [];
    const brands = [...(profile?.brand_affinities || []), ...brandSignals.slice(0, 5)];
    const uniqueBrands = [...new Set(brands)];
    const style = profile?.spending_style || "moderate";
    const speed = profile?.buy_speed || "unknown";

    const userIntelligence = `
## USER BEHAVIORAL PROFILE (use this to deeply personalize deals)

### Identity & Preferences
- Crews: ${tribeNames.join(", ") || "none yet"}
- Taste tags: ${tasteTags.join(", ") || "general"}
- Brand affinities: ${uniqueBrands.join(", ") || "various"}
- Spending style: ${style}
- Buy speed: ${speed} (${speed === "sniper" ? "waits for perfect deal" : speed === "impulse" ? "buys fast on good deals" : "moderate decision maker"})
- Engagement: ${engagementLevel} (${profile?.total_xp || 0} XP, ${profile?.streak_days || 0}-day streak)

### Behavioral Signals (from actual purchase/save/join history)
- Top categories by affinity: ${topCategories.length > 0 ? topCategories.join(", ") : "not enough data — suggest diverse popular categories"}
- Price range: ${avgPrice ? `avg $${avgPrice}, min $${minPrice}, max $${maxPrice}` : "unknown — suggest mid-range ($50-200)"}
- Discount preference: ${avgDiscount ? `typically joins deals with ~${avgDiscount}% off` : "unknown — aim for 30-50% off"}
- Tier preference: ${preferredTier ? `tends to join "${preferredTier}" tier` : "no pattern — make Early Bird very attractive"}
- Past deals joined: ${pastDeals?.length || 0}
- Items saved/wishlisted: ${savedItems?.length || 0}
- Orders completed: ${orders?.length || 0}

### Saved Items (what they WANT but haven't bought — HIGH-VALUE SIGNALS)
${savedItems && savedItems.length > 0
  ? savedItems.slice(0, 10).map((s: any) => `- ${s.item_name}${s.category ? ` [${s.category}]` : ""}${s.price ? ` $${s.price}` : ""}${s.was_price ? ` (was $${s.was_price})` : ""}${s.retailer ? ` from ${s.retailer}` : ""}`).join("\n")
  : "- No saved items yet"}

### Past Deals Joined (what they actually committed to)
${pastDeals && pastDeals.length > 0
  ? pastDeals.slice(0, 8).map((d: any) => `- ${d.deal?.title || "Unknown"} [${d.deal?.category || "?"}] — paid $${d.price_paid || "?"} (${d.tier_name || "unknown"} tier)`).join("\n")
  : "- No deals joined yet — these are their FIRST recommendations, make them irresistible"}

### What's Trending Now (social proof context)
${trendingContext}
`;

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
            content: `You are nabbit.ai's DEAL INTELLIGENCE ENGINE — the brain behind AI-powered collective buying.

Your job: Generate hyper-personalized group deal suggestions that feel like they were hand-picked for THIS specific user. You have deep behavioral data about them — USE IT ALL.

## Core Principles:
1. **Saved items are gold** — if a user saved a Nike Dunk Low, suggest a group buy for Nike Dunks. Match their wishlist.
2. **Category affinity matters** — weight deals toward categories they've actually engaged with (joined deals, bought items, saved things).
3. **Price calibration** — if they typically spend $100-200, don't suggest $500 items. Match their wallet.
4. **Tier psychology** — if they always pick Early Bird, make Early Bird tiers extra attractive. If they're price-sensitive, make the discount spread wider.
5. **Trending = social proof** — reference trending deals to create FOMO and urgency.
6. **New users** — if behavioral data is thin, suggest diverse popular items with strong discounts to build engagement.
7. **Crew context** — tie deals to their crews when possible. A Sneakerhead crew member should see sneaker deals.

## Pricing Rules:
- Early Bird: 40-55% off retail (biggest discount, fewest slots 3-5)
- Standard: 25-40% off retail (mid-discount, most slots 5-10)  
- Late Entry: 15-25% off retail (smallest discount, fewer slots 3-5)
- Prices must be realistic for the category
- Retail prices must reflect actual market prices for the items

## Deal Quality:
- Titles should be specific product names, not generic (e.g. "Nike Dunk Low Panda Pack" not "Sneaker Deal")
- Descriptions should create excitement and urgency
- Giveaway prizes should match the deal (e.g. sneaker deal → free pair, electronics → free accessory)
- Target 50% of deals with giveaways enabled`
          },
          {
            role: "user",
            content: `Generate 4 hyper-personalized group deal suggestions for this user:

${userIntelligence}

IMPORTANT: Make deals that feel personally curated based on ALL the behavioral signals above. If they saved specific items, create deals around those exact products. If they favor certain categories, lead with those. Match their price sensitivity and tier preferences.

Each deal must include:
- title (specific product/brand name), description (exciting, urgent), emoji, category, tribe_name
- retail_price (realistic market price)
- price_tiers: array of exactly 3 objects with {tier_name, price, slots, slots_filled: 0}
  - Tier 1: "Early Bird" (biggest discount, 3-5 slots)
  - Tier 2: "Standard" (medium discount, 5-10 slots)
  - Tier 3: "Late Entry" (smallest discount, 3-5 slots)
- giveaway_enabled: boolean (true for ~50% of deals)
- giveaway_prize: string if enabled
- target_participants: sum of all tier slots
- match_reason: 1 sentence explaining WHY this deal was picked for this specific user (reference their actual data)`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_deals",
            description: "Return 4 hyper-personalized group deal suggestions with tiered pricing and match reasoning",
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
                      target_participants: { type: "number" },
                      match_reason: { type: "string" }
                    },
                    required: ["title", "description", "emoji", "category", "tribe_name", "retail_price", "price_tiers", "giveaway_enabled", "target_participants", "match_reason"],
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
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
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
