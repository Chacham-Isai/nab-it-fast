import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

const Login = () => {
  usePageMeta({ title: "Log In — nabbit.ai", description: "Sign in to your nabbit.ai account to track deals and auto-purchase.", path: "/login" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-[100px]" style={{ background: "hsl(var(--nab-purple))" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <form onSubmit={handleSubmit} className="glass-card gradient-border p-8 space-y-6">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img src={nabbitLogo} alt="nabbit.ai" className="h-12 mx-auto" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Stop chasing. Start nabbing.</p>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <Input placeholder="you@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <Input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border h-12 rounded-xl" required />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shimmer-btn gap-2" disabled={loading}>
            {loading ? (
              <><Zap className="w-4 h-4 animate-pulse" /> Signing in...</>
            ) : (
              <>Log In <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>

          <div className="text-center text-sm space-y-3 pt-2">
            <a href="#" className="text-nab-cyan hover:underline block text-xs">Forgot password?</a>
            <div className="gradient-divider" />
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-nab-cyan font-semibold hover:underline">Sign up free</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
