import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
}

const WaitlistModal = ({ open, onClose, source = "landing" }: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("waitlist").insert({ email: email.trim(), source });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "You're already on the list! 🎉", description: "We'll notify you when it's your turn." });
        setSuccess(true);
      } else {
        toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      }
    } else {
      setSuccess(true);
      toast({ title: "You're in! 🐇", description: "We'll notify you when nabbit.ai launches." });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 glass-card gradient-border p-6 sm:p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>

            {success ? (
              <div className="text-center space-y-4 py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                  <CheckCircle className="w-16 h-16 text-success mx-auto" />
                </motion.div>
                <h3 className="font-heading font-black text-xl text-foreground">You're on the list!</h3>
                <p className="text-sm text-muted-foreground">We'll send you an invite as soon as we're ready. Get excited 🐇</p>
                <Button onClick={onClose} className="rounded-full font-bold shimmer-btn">Got it</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-black text-xl text-foreground">Get Early Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Be first to join crew deals, AI curation, and live drops.
                  </p>
                </div>

                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-secondary/50 border-border"
                    required
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold text-base shimmer-btn gap-2"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : <>Join the Waitlist <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">No spam ever. Unsubscribe anytime.</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaitlistModal;
