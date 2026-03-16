

# Crew Deals: AI-Powered Collective Buying Engine — Full Build Plan

## The Vision
Transform the current flat-price group deals into a **tiered early-bird pricing system** with a **buying power visualization**, **giveaway mechanics**, and **supplier aggregation storytelling** — the "Groupon 2.0" that actually works because AI targets deals to the right users.

---

## Database Changes

### 1. Add tiered pricing to `group_deals`
New columns on `group_deals`:
- `price_tiers jsonb DEFAULT '[]'` — Array of `{tier_name, price, slots, slots_filled}` objects (e.g. Early Bird $150/5 slots, Standard $180/10 slots, Late $210/5 slots)
- `giveaway_enabled boolean DEFAULT false`
- `giveaway_prize text` — e.g. "1 FREE order"
- `giveaway_winner_id uuid` — set when deal funds
- `total_savings numeric DEFAULT 0` — running aggregate of retail - deal prices across all participants
- `source_status text DEFAULT 'sourcing'` — values: sourcing, quoted, locked, ordered

### 2. Add `group_deal_participants` columns
- `tier_name text` — which price tier they locked in at
- `price_paid numeric` — the price at the tier they joined

### 3. Update the `handle_group_deal_join` trigger
Modify to auto-fill tier slots and calculate the correct tier price. When `giveaway_enabled` and deal hits funded, randomly pick a `giveaway_winner_id`.

---

## Backend (Edge Function)

### Update `recommend-deals`
Enhance the AI prompt to generate deals with **tiered pricing arrays** instead of a single flat price. Each AI-recommended deal will include 3 tiers (Early Bird, Standard, Late Entry) with escalating prices.

---

## Frontend — Crew Deals Tab Redesign

### 1. Hero Section: "Collective Buying Power" Dashboard
A live stats banner showing:
- Total platform savings counter (animated counting up)
- Active deals count
- Total participants across all deals
- "Your Buying Power" personalized stat

### 2. Deal Cards — Tiered Price Ladder
Each deal card gets a complete redesign:
- **Price Ladder Visualization**: 3-tier horizontal bar showing Early Bird → Standard → Late Entry prices, with the current active tier highlighted and previous tiers struck through
- **"You Save" callout**: Dynamic savings vs retail
- **Buying Power Meter**: Visual showing how collective demand drives the price down
- **Giveaway Badge**: When enabled, animated "🎰 1 FREE order at fund!" badge
- **Source Status Indicator**: "Sourcing best price..." → "3 suppliers quoted" → "Price locked!" pipeline visualization
- **Participant Avatars + Tier Badges**: Show which tier each person joined at

### 3. Deal Detail Expansion
When tapping a deal card, expand to show:
- Full tier breakdown with slots remaining per tier
- "How it works" explainer (3-step: Join → We aggregate → We negotiate)
- Supplier sourcing pipeline animation
- Giveaway odds calculator ("1 in {participants} chance!")

### 4. Create Deal Form Update
Add tier pricing builder: user sets 3 price points and slot counts. Toggle for giveaway. The form auto-calculates discount percentages per tier.

### 5. AI Picks Banner Enhancement
Show AI-recommended deals with tier pricing preview and "Early Bird spots left!" urgency.

### 6. Celebration & Giveaway
When a deal funds:
- Existing confetti celebration
- If giveaway enabled: dramatic reveal animation showing the winner
- "Sourcing started!" status update

---

## Technical Details

### Price Tier Logic
```text
Tier Structure:
┌─────────────┬────────┬───────┬────────────┐
│ Tier        │ Price  │ Slots │ Discount   │
├─────────────┼────────┼───────┼────────────┤
│ Early Bird  │ $150   │ 5     │ -55%       │
│ Standard    │ $180   │ 10    │ -45%       │
│ Late Entry  │ $210   │ 5     │ -36%       │
└─────────────┴────────┴───────┴────────────┘
Current tier auto-advances as slots fill.
```

### Files to Create/Modify
- **Migration**: Add columns to `group_deals` and `group_deal_participants`, update trigger
- **`supabase/functions/recommend-deals/index.ts`**: Update AI prompt for tiered output
- **`src/pages/Community.tsx`**: Major redesign of crew-deals tab with tiered cards, buying power dashboard, giveaway badges, source pipeline
- **`src/components/community/CreateDealForm.tsx`**: Add tier builder UI, giveaway toggle
- **`src/components/community/AIPicksBanner.tsx`**: Update to show tier previews
- **`src/components/community/DealCard.tsx`** (new): Extract deal card into premium standalone component with tier ladder, expandable detail, source status
- **`src/components/community/BuyingPowerDashboard.tsx`** (new): Animated stats banner
- **`src/components/community/GiveawayReveal.tsx`** (new): Winner reveal animation
- **`src/components/community/TierPriceLadder.tsx`** (new): Reusable tier visualization component

