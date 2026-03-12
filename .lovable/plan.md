

# Navigator — Complete Build Plan

## Current State
The project contains a **nabbit.ai marketing site** with 7 pages (Index, About, Blog, Contact, Login, Signup, NotFound). **Zero** Navigator pages, components, or routing exist. This is a ground-up build of a new application layered into the existing project.

## Approach
Build iteratively in phases, keeping existing nabbit.ai pages intact (they can serve as the marketing site at `/`). Each phase produces working, testable pages.

---

## Phase 1: Routing, Layout & BottomNav

- **Update AnimatedRoutes.tsx** to add all 12 Navigator routes (`/onboarding`, `/feed`, `/dream-buys`, `/community`, `/profile`, `/notifications`, `/giving`, `/play`, `/breaks`, `/grab-bags`, `/auctions`)
- **Create `src/components/BottomNav.tsx`** — fixed bottom bar with 5 tabs (Feed, Dreams, Play center hero button, Tribe, Me). Hidden on `/` and `/onboarding`. Play tab uses coral elevated circle with pulsing shadow. Active state detection via `useLocation`.
- **Create stub pages** for all 12 routes so navigation works end-to-end

## Phase 2: Landing Page Retrofit

- **Adapt existing Index.tsx** to serve as Navigator landing page, OR create a new `Landing.tsx` at `/` that includes: rotating word hero animation, HowItWorks (4 steps), sample drops, dream buy preview, community preview, testimonials, final CTA, footer
- Wire "Get Early Access" and "Build My Feed" CTAs to `/onboarding`

## Phase 3: Onboarding (7-Step Quiz)

- **Create `src/pages/Onboarding.tsx`** with step state machine (steps 1–7)
- Step components: image-multi grid (Q1), multi-chip pills (Q2), dream-input with tags (Q3), single-card radio (Q4), brand grid (Q5), multi-chip (Q6), single-card (Q7)
- Progress bar header with step counter
- Loading animation sequence after Q7 (5 phases, 700ms each)
- Auto-navigate to `/feed` passing taste profile via router state

## Phase 4: Feed (Swipe Cards)

- **Create `src/pages/Feed.tsx`** — header with logo/bell/bookmark, horizontal category filter chips
- **Swipe card stack** — 3 visible cards with depth illusion. Top card draggable via pointer events. Swipe right = "NAB IT" green overlay, swipe left = "PASS" red overlay. Threshold ±80px.
- Action buttons below stack (Pass, Nab, Bookmark)
- Toast notifications on swipe
- Saved drops list below stack
- Mock feed data scored against taste profile from onboarding

## Phase 5: Dream Buys

- **Create `src/pages/DreamBuy.tsx`** — add/remove dream buys, hunting/found status, closest match display, stats row (Active Hunts, Avg Find Time, Matches Found)
- Local state management with mock data

## Phase 6: Community

- **Create `src/pages/Community.tsx`** — 3 tabs (Feed, Group Deals, Tribes)
- Feed tab: live activity list with user actions
- Group Deals tab: deal cards with progress bars and join toggle
- Tribes tab: grid of tribe cards with join/joined toggle

## Phase 7: Profile, Notifications, Giving

- **Profile.tsx** — avatar, editable name, taste tags, stats row, Saved/History/Settings tabs
- **Notifications.tsx** — filterable notification list with type icons, unread dots, mark-all-read
- **Giving.tsx** — 3 tabs (Causes with round-up toggle, My Giving history, Impact stats)

## Phase 8: Play Hub + Sub-Pages

- **Play.tsx** — live ticker, 3 mode cards linking to sub-pages, recent wins feed
- **Breaks.tsx** — Live/Upcoming/My Breaks tabs, slot grid with buy mechanic, countdown timer
- **GrabBags.tsx** — 4 tier cards with quantity selector, full-screen 3-phase reveal animation with rarity roll logic
- **Auctions.tsx** — auction cards with live countdown, Place Bid / Bid History tabs, quick-select bids, proxy bidding, Buy Now

## Phase 9: Shared Components

- **Countdown component** — live-ticking timer, red + pulse when urgent
- **Reusable card patterns** — product card, stat tile, filter chip bar
- All animations use Framer Motion (fade-up on scroll, scale transitions)

## Phase 10: Backend Integration (Lovable Cloud)

- Create database tables per the schema spec (users, taste_profiles, dream_buys, feed_items, swipes, saved_items, breaks, break_slots, grab_bag_orders, auctions, bids, group_deals, tribes, tribe_members, giving_preferences, giving_transactions, notifications)
- RLS policies per table
- Auth flow (email + password signup/login)
- Realtime subscriptions for auctions, breaks, notifications
- Edge functions for affiliate link generation and dream buy hunting

---

## Technical Notes

- **State management**: React state + React Router state for onboarding flow. Supabase for persistence in Phase 10.
- **Fonts**: Will add Clash Display, DM Sans, DM Mono via Google Fonts / CDN
- **All mock data** hardcoded in each page until backend connected
- **Existing nabbit.ai pages** (About, Blog, Contact) kept intact — can be repurposed or removed later
- **Build order priority**: Phases 1–4 first (core loop: land → onboard → feed → swipe), then expand outward

## Estimated Scope

This is a very large build — approximately 12 new pages, 15+ new components, and eventually 17 database tables. I recommend building it in batches of 2–3 pages per conversation to maintain quality. Starting with **Phase 1 + Phase 3 (routing + onboarding)** would be the most impactful first step.

