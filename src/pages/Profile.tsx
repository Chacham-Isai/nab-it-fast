import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, ShoppingBag, Star, Zap, Heart, Bell, DollarSign, Moon, Shield, Trash2, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";

const tasteTags = ["Sneakers", "Cards", "Tech", "Watches", "Streetwear"];

const savedItems = [
  { id: 1, emoji: "👟", name: "Air Jordan 1 Chicago", category: "Sneakers", saved: "2h ago", price: 289 },
  { id: 2, emoji: "🃏", name: "1986 Fleer Jordan RC", category: "Cards", saved: "1d ago", price: 4200 },
  { id: 3, emoji: "⌚", name: "Rolex Submariner", category: "Watches", saved: "3d ago", price: 12800 },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"saved" | "history" | "settings">("saved");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "Navigator User");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const settingsGroups = [
    {
      label: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", value: "On" },
        { icon: DollarSign, label: "Currency", value: "USD" },
        { icon: Moon, label: "Theme", value: "System" },
      ],
    },
    {
      label: "Account",
      items: [
        { icon: Star, label: "Subscription", value: "Free" },
        { icon: Shield, label: "Privacy & Data", value: "" },
      ],
    },
    {
      label: "Danger Zone",
      items: [
        { icon: Trash2, label: "Delete Account", value: "", danger: true },
        { icon: LogOut, label: "Sign Out", value: "", danger: true, action: handleSignOut },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Profile</h1>
          <button onClick={() => setEditing(!editing)}><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-3xl">🐇</div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-background" />
          </div>
          {editing ? (
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => setEditing(false)}
              className="text-center max-w-[200px] bg-secondary border-border"
              autoFocus
            />
          ) : (
            <h2 className="font-heading font-bold text-foreground text-xl">{displayName}</h2>
          )}
          {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
          <span className="text-xs text-muted-foreground">Early Access Member</span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {tasteTags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
            ))}
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6 px-2">Edit Taste</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ShoppingBag, label: "Nabbed", value: "12" },
            { icon: Star, label: "Saved", value: "8" },
            { icon: Zap, label: "Dream Buys", value: "3" },
            { icon: Heart, label: "Gave Back", value: "$24" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-card border border-border text-center">
              <s.icon className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["saved", "history", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "saved" && (
          <div className="space-y-2">
            {savedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · {item.saved}</p>
                </div>
                <span className="font-bold text-foreground text-sm">${item.price.toLocaleString()}</span>
                <Button variant="ghost" size="sm" className="text-primary text-xs">Buy</Button>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📦</span>
            <p className="text-muted-foreground">Purchase history coming soon</p>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6">
            {settingsGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</h3>
                <div className="bg-card rounded-xl border border-border divide-y divide-border">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={(item as any).action || undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left ${(item as any).danger ? "text-destructive" : "text-foreground"}`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
