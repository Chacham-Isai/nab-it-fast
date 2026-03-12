import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Zap, Flame, Users, User } from "lucide-react";

const tabs = [
  { label: "Feed", icon: ShoppingBag, path: "/feed" },
  { label: "Dreams", icon: Zap, path: "/dream-buys" },
  { label: "Play", icon: Flame, path: "/play", isCenter: true },
  { label: "Tribe", icon: Users, path: "/community" },
  { label: "Me", icon: User, path: "/profile" },
];

const playPaths = ["/play", "/breaks", "/grab-bags", "/auctions"];
const hiddenPaths = ["/", "/onboarding"];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (hiddenPaths.includes(location.pathname)) return null;

  const isActive = (path: string, isCenter?: boolean) => {
    if (isCenter) return playPaths.includes(location.pathname);
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.isCenter);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className="relative -mt-6 flex flex-col items-center"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 ${
                    active ? "ring-4 ring-primary/20" : ""
                  }`}
                  style={{
                    boxShadow: "0 0 20px hsl(var(--coral) / 0.4), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-1 text-primary font-semibold">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 transition-colors"
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] ${
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
