

# Make Group Deals & Gamification Real and Hot

## Current State

- **Community page** has Group Deals but they're **hardcoded static data** (not stored in DB). Joining a deal is local state only (`toggleDeal` uses `useState`, no persistence).
- **Tribes** are real (backed by `tribe_memberships` table).
- **Grab Bags, Breaks, Auctions** are functional and DB-backed.
- Group Deals have no database table, no AI recommendations, no real-time updates, and no reward/streak mechanics.

## Plan

### 1. Database: Create `group_deals` and `group_deal_participants` tables

**`group_deals`** table:
- `id`, `title`, `description`, `emoji`, `category`, `tribe_name`
- `deal_price`, `retail_price`, `discount_pct`
- `target_participants` (int), `current_participants` (int, default 0)
- `ends_at` (timestamptz), `status` (text: 'active', 'funded', 'expired', 'completed')
- `created_by` (uuid), `created_at`
- `reward_tier` (text: null, 'bronze', 'silver', 'gold') — unlocks when milestones hit

**`group_deal_participants`** table:
- `id`, `deal_id` (fk → group_deals), `user_id` (uuid), `joined_at`
- Unique constraint on `(deal_id, user_id)`

RLS: anyone can view active deals, authenticated users can join, creators can manage their own deals.

Add a trigger: on insert to `group_deal_participants`, increment `group_deals.current_participants` and check if target is met (auto-set status to 'funded').

Enable realtime on both tables for live participant counts.

### 2. AI-Powered Deal Recommendations Edge Function

Create `supabase/functions/recommend-deals/index.ts`:
- Takes user's tribe memberships, taste tags, and brand affinities from their profile
- Calls Lovable AI (gemini-3-flash-preview) to generate 3-5 personalized group deal suggestions with titles, descriptions, pricing, and urgency framing
- Returns structured output via tool calling
- Used on the Community page to show "AI Picks for You" section

### 3. Gamification: Streaks, XP, and Leaderboard

**Add columns to `profiles`** table:
- `streak_days` (int, default 0)
- `total_xp` (int, default 0)
- `last_active_date` (date)

**XP actions** (tracked client-side, written to profile):
- Join a group deal: +50 XP
- Deal fully funded (you were in it): +200 XP bonus
- Daily login streak: +10 × streak_days
- Open a grab bag: +25 XP
- Win an auction: +100 XP

**Leaderboard**: query top 20 profiles by `total_xp`, displayed on Community page as a new "Leaderboard" tab.

**Streak widget**: shown at top of Community page — "🔥 5 day streak · 1,240 XP"

### 4. Revamped Community Page UI

Replace the static Group Deals tab with real DB-backed deals:
- **Real-time participant counter** with animated progress bar that updates live via realtime subscriptions
- **Urgency indicators**: pulsing "Almost there!" when >80%, confetti animation when deal is funded
- **AI Picks banner** at top of deals tab showing personalized recommendations
- **"Create a Group Deal"** button for sellers to propose deals
- **Reward tiers**: visual badges that unlock as more people join (bronze at 50%, silver at 75%, gold at 100%)
- **New "Leaderboard" tab** with XP rankings, streaks, and tribe standings

### 5. Real-time Group Deal Cards (Component)

New `GroupDealCard` component with:
- Live participant avatars (show last 5 joiners' emojis)
- Animated progress ring instead of flat bar
- Countdown timer with urgency colors
- "Share to Tribe" button that creates a notification for tribe members
- Haptic-style scale animation on join
- Confetti burst when deal hits target while you're viewing

### 6. Feed Integration

- Add a "Group Deal" card type in the swipe Feed — when a deal from your tribe is trending, it appears in your daily drops
- Hot deals (>80% funded) get promoted to the Live Feed section on the landing page

## Files to Create/Edit

| Action | File |
|--------|------|
| Migration | New tables: `group_deals`, `group_deal_participants`; alter `profiles` add XP/streak columns |
| Create | `supabase/functions/recommend-deals/index.ts` |
| Create | `src/components/community/GroupDealCard.tsx` |
| Create | `src/components/community/LeaderboardTab.tsx` |
| Create | `src/components/community/StreakWidget.tsx` |
| Create | `src/components/community/AIPicksBanner.tsx` |
| Rewrite | `src/pages/Community.tsx` — 4 tabs (Feed, Group Deals, Tribes, Leaderboard), real data, realtime |
| Edit | `src/pages/Feed.tsx` — inject trending group deals into feed |
| Edit | `src/components/sections/LiveFeedSection.tsx` — show hot group deals |

