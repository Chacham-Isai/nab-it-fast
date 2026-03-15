import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle, Shield } from "lucide-react";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

const Signup = () => {
  usePageMeta({ title: "Sign Up — nabbit.ai", description: "Create your free nabbit.ai account. Start hunting deals with AI in seconds.", path: "/signup" });
  const { session, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  const perks = [
    "AI-powered deal hunting across 200+ retailers",
    "Personalized taste-matched feed",
    "Dream Buy tracking & alerts",
  ];

  // Redirect if already authenticated
  if (!authLoading && session) {
    return <Navigate to="/feed" replace />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 max-w-md w-full text-center space-y-6 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <CheckCircle className="w-16 h-16 text-nab-cyan mx-auto" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Confirm your account, then log in.
          </p>
          <Link to="/login">
            <Button className="w-full h-12 rounded-xl font-semibold shimmer-btn mt-4">Go to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-purple))" }} />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-15 blur-[100px]" style={{ background: "hsl(var(--nab-cyan))" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="glass-card gradient-border p-8 space-y-6">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img src={nabbitLogo} alt="nabbit.ai" className="h-12 mx-auto" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Create your account</h1>
              <p className="text-sm text-muted-foreground mt-1">Stop chasing. Start nabbing.</p>
            </div>
          </div>

          {/* Perks */}
          <div className="space-y-2 p-3 rounded-xl bg-nab-cyan/5 border border-nab-cyan/10">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-nab-cyan shrink-0" />
                <span className="text-xs text-foreground">{perk}</span>
              </div>
            ))}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </motion.div>
          )}

          <div className="space-y-3">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            <Input placeholder="Password (6+ chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            <Input placeholder="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shimmer-btn gap-2" disabled={loading}>
            {loading ? "Creating account..." : <><Shield className="w-4 h-4" /> Create Account <ArrowRight className="w-4 h-4" /></>}
          </Button>

          <div className="text-center pt-2">
            <div className="gradient-divider mb-3" />
            <p className="text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-nab-cyan font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
