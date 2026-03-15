import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get users with activity in the past 7 days
    const { data: activeEvents, error: eventsErr } = await supabase
      .from("analytics_events")
      .select("user_id, event_name, event_data, created_at")
      .gte("created_at", sevenDaysAgo);

    if (eventsErr) throw eventsErr;
    if (!activeEvents || activeEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No active users this week" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group events by user
    const userEvents: Record<string, typeof activeEvents> = {};
    for (const event of activeEvents) {
      if (!userEvents[event.user_id]) userEvents[event.user_id] = [];
      userEvents[event.user_id].push(event);
    }

    const userIds = Object.keys(userEvents);

    // Get user profiles + emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji")
      .in("id", userIds);

    // Get emails from auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    authUsers?.users?.forEach((u: any) => {
      if (u.email) emailMap[u.id] = u.email;
    });

    const results: { userId: string; email: string; sent: boolean; error?: string }[] = [];

    for (const userId of userIds) {
      const email = emailMap[userId];
      if (!email) continue;

      const events = userEvents[userId];
      const profile = profiles?.find((p: any) => p.id === userId);
      const displayName = profile?.display_name || "Nabbit User";

      // Compute stats
      const swipeRights = events.filter((e: any) => e.event_name === "swipe_right").length;
      const swipeLefts = events.filter((e: any) => e.event_name === "swipe_left").length;
      const totalSwipes = swipeRights + swipeLefts;
      const nabRate = totalSwipes > 0 ? Math.round((swipeRights / totalSwipes) * 100) : 0;
      const bookmarks = events.filter((e: any) => e.event_name === "bookmark").length;
      const bidsPlaced = events.filter((e: any) => e.event_name === "bid_placed").length;
      const dealsJoined = events.filter((e: any) => e.event_name === "group_deal_joined").length;
      const crewsJoined = events.filter((e: any) => e.event_name === "crew_joined").length;
      const crewsLeft = events.filter((e: any) => e.event_name === "crew_left").length;

      // Top category
      const catMap: Record<string, number> = {};
      events
        .filter((e: any) => e.event_name === "swipe_right")
        .forEach((e: any) => {
          const cat = (e.event_data as any)?.category || "Other";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
      const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      const weekStart = new Date(sevenDaysAgo).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const weekEnd = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const html = buildDigestEmail({
        displayName,
        weekStart,
        weekEnd,
        totalSwipes,
        nabRate,
        bookmarks,
        bidsPlaced,
        dealsJoined,
        crewsJoined,
        crewsLeft,
        topCategory,
        totalEvents: events.length,
      });

      // Store digest as a notification so users can see it in-app too
      await supabase.from("notifications_log").insert({
        user_id: userId,
        type: "weekly_digest",
        title: "📊 Your Weekly Recap",
        body: `You had ${totalSwipes} swipes (${nabRate}% nab rate), ${bidsPlaced} bids, and joined ${dealsJoined} deals this week.`,
        action_label: "View Analytics",
      });

      // Try sending email via Lovable email API if available
      try {
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
        if (lovableApiKey) {
          const emailRes = await fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ test: true }),
          });
          // If queue infrastructure exists, enqueue the email
          if (emailRes.ok) {
            await supabase.rpc("enqueue_email", {
              p_queue_name: "transactional_emails",
              p_message_id: `weekly-digest-${userId}-${new Date().toISOString().split("T")[0]}`,
              p_to_email: email,
              p_subject: `📊 ${displayName}, here's your weekly nabbit recap`,
              p_html: html,
              p_template_name: "weekly-digest",
            });
            results.push({ userId, email, sent: true });
            continue;
          }
        }
      } catch {
        // Queue not available yet, fall back to notification only
      }

      results.push({ userId, email, sent: false, error: "Email queue not ready — notification sent instead" });
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface DigestData {
  displayName: string;
  weekStart: string;
  weekEnd: string;
  totalSwipes: number;
  nabRate: number;
  bookmarks: number;
  bidsPlaced: number;
  dealsJoined: number;
  crewsJoined: number;
  crewsLeft: number;
  topCategory: string;
  totalEvents: number;
}

function buildDigestEmail(d: DigestData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin: 0; padding: 0; background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e2e8f0; }
  .container { max-width: 560px; margin: 0 auto; padding: 32px 20px; }
  .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1e293b; }
  .logo { font-size: 28px; font-weight: 800; color: #00e5ff; letter-spacing: -0.5px; }
  .subtitle { color: #94a3b8; font-size: 13px; margin-top: 4px; }
  .greeting { font-size: 18px; font-weight: 700; margin: 24px 0 8px; }
  .period { color: #94a3b8; font-size: 13px; margin-bottom: 20px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
  .stat-card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-value { font-size: 28px; font-weight: 800; color: #00e5ff; }
  .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  .stat-sub { font-size: 11px; color: #22c55e; margin-top: 2px; }
  .highlight { background: linear-gradient(135deg, #111827, #0f172a); border: 1px solid #00e5ff33; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center; }
  .highlight-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
  .highlight-value { font-size: 20px; font-weight: 700; color: #00e5ff; margin-top: 4px; }
  .cta { display: inline-block; background: #00e5ff; color: #0a0a0f; font-weight: 700; font-size: 14px; padding: 12px 32px; border-radius: 10px; text-decoration: none; margin: 24px 0; }
  .footer { text-align: center; color: #475569; font-size: 11px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1e293b; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">🐇 nabbit.ai</div>
    <div class="subtitle">Your Weekly Engagement Recap</div>
  </div>

  <div class="greeting">Hey ${d.displayName} 👋</div>
  <div class="period">${d.weekStart} — ${d.weekEnd}</div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${d.totalSwipes}</div>
      <div class="stat-label">Swipes</div>
      <div class="stat-sub">${d.nabRate}% nab rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${d.bookmarks}</div>
      <div class="stat-label">Bookmarks</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${d.bidsPlaced}</div>
      <div class="stat-label">Bids Placed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${d.dealsJoined}</div>
      <div class="stat-label">Deals Joined</div>
    </div>
  </div>

  ${d.crewsJoined > 0 ? `<div class="highlight">
    <div class="highlight-label">Crews Joined</div>
    <div class="highlight-value">+${d.crewsJoined} this week</div>
  </div>` : ""}

  <div class="highlight">
    <div class="highlight-label">Top Category</div>
    <div class="highlight-value">${d.topCategory}</div>
  </div>

  <div style="text-align:center">
    <a href="https://nab-it-fast.lovable.app/analytics" class="cta">View Full Dashboard →</a>
  </div>

  <div class="footer">
    <p>You received this because you were active on nabbit.ai this week.</p>
    <p>© ${new Date().getFullYear()} nabbit.ai — All rights reserved</p>
  </div>
</div>
</body>
</html>`;
}
