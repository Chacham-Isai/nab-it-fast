import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";

const ForgotPassword = () => {
  usePageMeta({ title: "Reset Password — nabbit.ai", description: "Reset your nabbit.ai password.", path: "/forgot-password" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card gradient-border p-8 max-w-md w-full text-center space-y-6 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <Mail className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Check your inbox</h1>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link in the email to set a new password.
          </p>
          <Link to="/login">
            <Button className="w-full h-12 rounded-xl font-semibold shimmer-btn mt-4">Back to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-[100px]" style={{ background: "hsl(var(--nab-purple))" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="glass-card gradient-border p-6 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img src={nabbitIcon} alt="nabbit.ai" className="h-12 mx-auto" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <Input placeholder="you@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shimmer-btn gap-2" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
