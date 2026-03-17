

# Full Buyer Profile + AI Learning System — Build Plan

## What's Missing

The buyer profile is currently thin: basic display name, taste tags from onboarding, and simple stats. There's no behavioral tracking, no AI learning loop, no shipping addresses, no wishlist intelligence, and no buyer reputation. The AI recommendations use profile data but never learn from actual interactions (clicks, purchases, saves, skips).

## Plan Overview

### 1. Database: Buyer Interaction Tracking Table
Create a `buyer_interactions` table to log every meaningful user action (view, save, skip, purchase, bid, share). This becomes the AI learning signal.

```sql
CREATE TABLE public.buyer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'view', 'save', 'skip', 'purchase', 'bid', 'share', 'click'
  item_id text, -- listing_id, deal_id, or AI rec name
  item_type text, -- 'listing', 'deal', 'ai_rec'
  category text,
  price numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
-- RLS: users insert/read own interactions
```

### 2. Database: Shipping Addresses Table
Create `shipping_addresses` table so buyers can save multiple addresses.

```sql
CREATE TABLE public.shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text DEFAULT 'US',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
-- RLS: full CRUD on own addresses
```

### 3. Database: Expand Profiles
Add columns to profiles for richer buyer identity:
- `bio` (text) — short about me
- `level` (integer, default 1) — computed from XP
- `badges` (jsonb, default '[]') — earned achievements
- `ai_learning_enabled` (boolean, default true) — opt-in for AI personalization
- `preferred_address_id` (uuid) — default shipping address

### 4. Edge Function: `ai-learn` — Behavioral Intelligence Processor
A new edge function that:
- Accepts user_id
- Queries `buyer_interactions` (last 100), `saved_items`, `orders`, `group_deal_participants`
- Sends to Lovable AI (gemini-3-flash-preview) with structured output
- Returns an "AI taste profile" summary: top categories, price sensitivity score, brand affinity updates, recommended deal types, buying pattern insights
- Stores the AI summary back into `profiles.metadata` or a new `ai_taste_summary` column

### 5. Frontend: Full Buyer Profile Page Overhaul
Rebuild `Profile.tsx` with these sections:
- **Hero card**: Avatar, name, bio, level badge, XP bar to next level, member since
- **AI Taste DNA**: Visual breakdown of the AI's understanding — top categories as a radar/donut chart, brand cloud, spending pattern, buy speed indicator
- **Shipping Addresses**: CRUD list with default selector
- **Badges & Achievements**: Grid of earned badges (first purchase, 10 saves, crew joiner, streak master, etc.)
- **Activity Timeline**: Recent interactions pulled from `buyer_interactions`
- **Settings**: Existing settings + AI learning toggle + address management

### 6. Frontend: Track Interactions Everywhere
Add lightweight tracking calls throughout the app:
- Feed: track `view`, `save`, `skip` on scroll
- ListingDetail: track `view` on mount, `bid` on bid placement
- Browse: track `click` on listing cards
- Orders: track `purchase` on successful checkout
- DealDetail: track `join` when joining a deal

Create a `useTrackInteraction` hook that calls `supabase.from('buyer_interactions').insert(...)`.

### 7. Frontend: AI Learning Widget on Profile
A "Your AI Brain" card on the profile that:
- Shows what the AI knows about you (categories, brands, price range)
- Has a "Refresh AI" button that invokes `ai-learn`
- Shows a confidence score for each category
- Lets users correct/override AI assumptions

### 8. Badges System
Define ~12 badges computed from real data:
- First Nab, Streak Master (7-day), Deal Hunter (join 5 deals), Collector (save 20 items), Big Spender ($500+), Community Builder (join 3 crews), Referral King (invite 5), Early Bird, etc.
- Compute on profile load from counts in relevant tables

## Technical Details

- **Migration**: Single SQL migration with `buyer_interactions`, `shipping_addresses`, profile column additions, and RLS policies
- **Edge function**: `ai-learn` using Lovable AI gateway with tool calling for structured output
- **Hook**: `useTrackInteraction(type, itemId, itemType, category, price)` — fire-and-forget insert
- **XP levels**: Level = floor(sqrt(total_xp / 100)) + 1, with progress bar showing % to next
- **No breaking changes**: All new columns have defaults, existing pages unaffected

## Files to Create/Edit

| Action | File |
|--------|------|
| Create | `supabase/functions/ai-learn/index.ts` |
| Create | `src/hooks/useTrackInteraction.ts` |
| Create | Migration SQL |
| Rewrite | `src/pages/Profile.tsx` (full overhaul) |
| Edit | `src/pages/Feed.tsx` (add interaction tracking) |
| Edit | `src/pages/ListingDetail.tsx` (track views/bids) |
| Edit | `src/pages/Browse.tsx` (track clicks) |
| Edit | `src/pages/DealDetail.tsx` (track joins) |
| Edit | `src/lib/xp.ts` (add level calculation) |

