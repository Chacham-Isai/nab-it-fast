import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Subscribes to real-time notifications and shows toast alerts
 * for outbid, deal funded, new drops, and other events.
 */
const useRealtimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-notifs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications_log",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as any;
          const iconMap: Record<string, string> = {
            outbid: "🔔",
            deal_funded: "🎉",
            deal_milestone: "🔥",
            referral: "🎁",
            order_shipped: "📦",
            new_drop: "🚀",
          };
          const icon = iconMap[notif.type] || "🔔";

          toast(`${icon} ${notif.title}`, {
            description: notif.body,
            action: notif.action_label
              ? { label: notif.action_label, onClick: () => window.location.href = "/notifications" }
              : undefined,
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};

export default useRealtimeNotifications;
