import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";

const ResetPassword = () => {
  usePageMeta({ title: "Set New Password — nabbit.ai", description: "Set your new password.", path: "/reset-password" });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) setError(error.message);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card gradient-border p-8 max-w-md w-full text-center space-y-6 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Password updated!</h1>
          <p className="text-muted-foreground text-sm">Your password has been reset. You can now log in with your new password.</p>
          <Button onClick={() => navigate("/feed")} className="w-full h-12 rounded-xl font-semibold shimmer-btn mt-4">
            Go to Feed
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card gradient-border p-8 max-w-md w-full text-center space-y-6 relative z-10">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="font-heading text-xl font-bold text-foreground">Invalid or expired link</h1>
          <p className="text-muted-foreground text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
          <Link to="/forgot-password">
            <Button className="w-full h-12 rounded-xl font-semibold shimmer-btn mt-4">Request New Link</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="glass-card gradient-border p-6 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img src={nabbitIcon} alt="nabbit.ai" className="h-12 mx-auto" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Set new password</h1>
              <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirm Password</label>
              <Input placeholder="••••••••" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shimmer-btn gap-2" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
