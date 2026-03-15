

# Rename "Tribes" to "Crews" — Inclusive Language Update

## Why
The word "tribe" can carry cultural and racial connotations. Replacing it with **"Crews"** keeps the same energy (a group united by shared interests) while being universally inclusive. "Crew" is neutral, fun, and fits the brand voice.

## Scope of Changes

The rename touches **UI labels, variable names, database column references, toast messages, and the AI prompt**. The database table `tribe_memberships` and its columns (`tribe_name`, `tribe_emoji`) stay as-is to avoid a breaking migration — we only change what users see.

### Files to edit:

| File | What changes |
|------|-------------|
| `src/pages/Community.tsx` | Rename tab label "Tribes" → "Crews", rename `tribes` array display, update all user-facing strings ("Join tribes" → "Join crews", "Share it with your tribe" → "Share it with your crew", notification text, page meta description) |
| `src/components/community/CreateDealForm.tsx` | Label "Tribe (optional)" → "Crew (optional)", toast "Share it with your tribe" → "Share it with your crew" |
| `src/components/community/AIPicksBanner.tsx` | "based on your tribes & taste" → "based on your crews & taste" |
| `src/components/community/GroupDealCard.tsx` | "Share to Tribe" button text (if present) → "Share to Crew" |
| `src/components/sections/NavigatorSection.tsx` | "Tribes that shop together" → "Crews that shop together" |
| `src/pages/Giving.tsx` | `tribe:` labels on causes → `crew:` |
| `supabase/functions/recommend-deals/index.ts` | AI prompt text: "Tribes:" → "Crews:", `tribe_name` field label stays (it's a DB column) but the prompt context uses "crew" |
| `src/components/Footer.tsx` | Check for any "tribe" references in footer links |

### What stays the same
- Database table name `tribe_memberships` and columns `tribe_name`, `tribe_emoji` — no migration needed
- Variable names in code that reference DB columns (e.g., `tribe_name`) — these are internal, users never see them

This is a straightforward find-and-replace of user-facing strings only. No logic changes, no database changes.

