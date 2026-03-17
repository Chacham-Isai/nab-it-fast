import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notif-badge")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications_log",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setUnreadCount((prev) => prev + 1);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications_log",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if ((payload.new as any).is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user) return null;

  return (
    <Link to="/notifications" className="relative w-8 h-8 rounded-full bg-secondary/50 border border-border/50 flex items-center justify-center hover:bg-secondary transition-colors">
      <Bell className="w-4 h-4 text-muted-foreground" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center px-1"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </motion.div>
      )}
    </Link>
  );
};

export default NotificationBell;
