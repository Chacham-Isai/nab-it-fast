import { motion } from "framer-motion";
import { Eye, Bookmark, ShoppingBag, Gavel, Users, Share2, Zap } from "lucide-react";

interface Interaction {
  id: string;
  interaction_type: string;
  item_id?: string;
  item_type?: string;
  category?: string;
  price?: number;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  view: { icon: Eye, label: "Viewed", color: "text-muted-foreground" },
  save: { icon: Bookmark, label: "Saved", color: "text-nab-cyan" },
  purchase: { icon: ShoppingBag, label: "Purchased", color: "text-success" },
  bid: { icon: Gavel, label: "Bid on", color: "text-primary" },
  join: { icon: Users, label: "Joined", color: "text-nab-blue" },
  share: { icon: Share2, label: "Shared", color: "text-nab-purple" },
  click: { icon: Zap, label: "Clicked", color: "text-accent" },
  skip: { icon: Eye, label: "Skipped", color: "text-muted-foreground/50" },
};

const ActivityTimeline = ({ interactions }: { interactions: Interaction[] }) => {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 rounded-2xl glass-card border border-border/50">
        <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No activity yet — start browsing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {interactions.slice(0, 20).map((item, i) => {
        const config = typeConfig[item.interaction_type] || typeConfig.click;
        const Icon = config.icon;
        const time = new Date(item.created_at);
        const ago = getTimeAgo(time);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/20 transition-colors"
          >
            <div className={`w-6 h-6 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 ${config.color}`}>
              <Icon className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-foreground truncate">
                <span className="font-bold">{config.label}</span>
                {item.category && <span className="text-muted-foreground"> in {item.category}</span>}
                {item.item_type && <span className="text-muted-foreground/60"> ({item.item_type})</span>}
              </p>
            </div>
            {item.price && <span className="text-[10px] font-bold text-foreground">${item.price}</span>}
            <span className="text-[9px] text-muted-foreground/50 shrink-0">{ago}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default ActivityTimeline;
