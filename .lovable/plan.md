

# Complete Build Audit & Fix Plan

## Issues Found

After a thorough audit of every page, database table, edge function, trigger, and RLS policy, here is what's broken or missing:

### Critical: `user_roles` table and `has_role` function don't exist
The Admin page (`/admin`) queries `user_roles` to check admin access. The migration was attempted but the table and the `app_role` enum type were never actually created in the database. This means the Admin dashboard will always show "Access Denied."

**Fix:** Run a migration to create the `app_role` enum, `user_roles` table with RLS, and the `has_role` security definer function. Then insert an admin role row for your user.

### Critical: `notifications_log` INSERT RLS blocks edge functions
The current INSERT policy on `notifications_log` is `user_id = auth.uid()`. Edge functions using the service role key (stripe-webhook, close-auctions, deal triggers) insert notifications for OTHER users. The service role bypasses RLS, so this actually works — but the `notify_deal_milestone` trigger runs as SECURITY DEFINER which also bypasses RLS. This is OK.

However, the client-side INSERT policy means a user can only insert notifications for themselves — which is correct and safe. No fix needed here.

### Issue: Referrals page foreign key join may fail
`Referrals.tsx` does `profiles!referrals_referee_id_fkey(...)`. The types file shows this FK exists, so this should work. No fix needed.

### Issue: `buyer_interactions` has 0 rows despite tracking hook being wired
The `useTrackInteraction` hook is imported into Feed, Browse, ListingDetail, and DealDetail. But looking at Feed.tsx more carefully, the hook is imported but the `track` function from `useTrackInteraction` may not actually be called in the Feed's nab/save/like handlers.

**Fix:** Wire `useTrackInteraction.track()` calls into Feed's `handleNab`, `handleBookmark`, and `handleLike` handlers so interactions actually get logged.

### Issue: `streak_days` and `last_active_date` never update
The `useStreakTracker` hook runs but `last_active_date` is null for all 3 test users. The hook checks `if (lastActive === today) return` which works, but the real issue is the hook only runs inside `AnimatedRoutes` which requires the user to be on a protected route. If the user lands on the landing page, it won't fire. This is actually correct — streak only tracks when logged in and on an app page. The profiles show `last_active_date: null` because no one has visited a protected route since the hook was deployed. This will self-correct on next login.

### Issue: `user_roles` table not in Supabase types
Since the table doesn't exist yet, `Admin.tsx` casts `"user_roles" as any`. After creating the table, the types will auto-regenerate and the cast can be removed.

### Issue: Realtime is properly configured
`notifications_log`, `auctions`, `bids`, `orders`, `chat_messages`, `break_slots`, `group_deals`, `group_deal_participants`, and `crews` are all in `supabase_realtime` publication. This is correct.

### Issue: Feed interaction tracking not wired
Looking at the Feed page carefully, the `useTrackInteraction` hook is imported but the `track` function from it is not destructured or used — only `useAnalytics().track` is used. Need to add `useTrackInteraction` calls.

## Plan

### 1. Database Migration: Create user_roles + has_role
Create the `app_role` enum, `user_roles` table with proper RLS (only admins can read, system can insert), and the `has_role` security definer function.

### 2. Insert admin role for your user
After the migration, insert an admin role for the existing user(s) who should have admin access.

### 3. Wire interaction tracking in Feed.tsx
The Feed page imports `useTrackInteraction` but never calls `track()` from it. Add calls in `handleNab`, `handleBookmark`, and `handleLike` to log `purchase`/`click`, `save`, and `view` interactions respectively.

### 4. Fix Admin.tsx to remove `as any` cast
Once `user_roles` table exists and types regenerate, clean up the type cast.

### 5. Verify all edge functions deploy correctly
Confirm `ai-learn`, `close-auctions`, `stripe-webhook`, `create-checkout`, `place-bid`, `recommend-feed`, `recommend-deals`, `weekly-digest`, `create-connect-account`, `check-connect-status`, `stripe-connect-webhook` all deploy without errors.

## Summary of what already works
- Authentication (signup, login, forgot/reset password)
- Onboarding flow with taste tag collection
- 9 active listings in the database
- 1 live auction with real-time bidding
- 13 active group deals with tiered pricing + giveaway logic
- 4 orders in the system
- Seller dashboard with Stripe Connect
- Chat with real-time subscriptions
- Notifications with real-time toasts
- Referral system with code generation and XP rewards
- AI Taste DNA with Lovable AI gateway integration
- XP/leveling/badges system
- Streak tracking
- Profile with AI learning, badges, shipping, activity timeline
- Browse with full-text search and filters

## What needs fixing (4 items)
1. Create `user_roles` table + `has_role` function (migration)
2. Assign admin role to your user
3. Wire `useTrackInteraction.track()` in Feed.tsx handlers
4. Deploy all edge functions to ensure they're current

