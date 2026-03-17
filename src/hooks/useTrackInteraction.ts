import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type InteractionType = "view" | "save" | "skip" | "purchase" | "bid" | "share" | "click" | "join";
type ItemType = "listing" | "deal" | "ai_rec" | "grab_bag";

export const useTrackInteraction = () => {
  const { user } = useAuth();

  const track = useCallback(
    async (
      interactionType: InteractionType,
      itemId?: string,
      itemType?: ItemType,
      category?: string,
      price?: number,
      metadata?: Record<string, unknown>
    ) => {
      if (!user) return;
      try {
        await supabase.from("buyer_interactions").insert([{
          user_id: user.id,
          interaction_type: interactionType,
          item_id: itemId,
          item_type: itemType,
          category,
          price,
          metadata: metadata || {},
        }]);
      } catch {
        // Fire and forget — don't break UX
      }
    },
    [user]
  );

  return { track };
};
