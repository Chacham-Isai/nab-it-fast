import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EventName =
  | "swipe_right"
  | "swipe_left"
  | "bookmark"
  | "nab_item"
  | "like_item"
  | "bid_placed"
  | "group_deal_joined"
  | "group_deal_left"
  | "crew_joined"
  | "crew_left"
  | "crew_created"
  | "listing_viewed"
  | "feed_refreshed"
  | "dream_buy_created";

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback(
    async (event: EventName, data: Record<string, unknown> = {}) => {
      if (!user) return;
      try {
        await supabase.from("analytics_events" as any).insert({
          user_id: user.id,
          event_name: event,
          event_data: data,
        });
      } catch (err) {
        // Fire-and-forget — don't block UX
        console.debug("[analytics]", event, err);
      }
    },
    [user]
  );

  return { track };
};
