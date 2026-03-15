import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface CreateCrewFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const categoryOptions = ["Fashion", "Collectibles", "Electronics", "Luxury", "Home", "Music", "Art", "Sports", "General"];

const emojiOptions = ["🎯", "🔥", "⚡", "🎮", "🎸", "📷", "🏀", "🎨", "🧩", "🛹", "🏄", "🎭", "🪴", "🧸", "🎲", "🔧"];

const CreateCrewForm = ({ open, onClose, onCreated }: CreateCrewFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");

  const handleSubmit = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      toast({ title: "Crew name is required", variant: "destructive" });
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 40) {
      toast({ title: "Name must be 3–40 characters", variant: "destructive" });
      return;
    }
    if (trimmedDesc.length > 200) {
      toast({ title: "Description must be under 200 characters", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("crews" as any).insert({
      name: trimmedName,
      emoji,
      description: trimmedDesc || null,
      category,
      is_active: true,
      member_count: 0,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Crew name already taken", description: "Try a different name.", variant: "destructive" });
      } else {
        toast({ title: "Failed to create crew", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Crew created! 🎉", description: `${emoji} ${trimmedName} is live. Invite others to join!` });
    setName("");
    setDescription("");
    setEmoji("🎯");
    setCategory("General");
    onCreated();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-foreground text-lg">Start a Crew</h3>
              </div>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-3">
              {/* Emoji picker */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Pick an Emoji</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        emoji === e
                          ? "bg-primary/20 border-2 border-primary scale-110"
                          : "bg-secondary border border-border hover:border-primary/30"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Crew Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Retro Gamers"
                  maxLength={40}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{name.length}/40</p>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this crew about?"
                  maxLength={200}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{description.length}/200</p>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        category === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-background/50 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Preview</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{name || "Crew Name"}</p>
                  <p className="text-[10px] text-muted-foreground">{category} · 0 members</p>
                </div>
              </div>
            </div>

            <Button className="w-full rounded-xl h-11" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${emoji} Launch Crew`}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCrewForm;
