import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Zap, CheckCircle, Shield } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import usePageMeta from "@/hooks/usePageMeta";

const Signup = () => {
  usePageMeta({ title: "Sign Up — nabbit.ai", description: "Create your free nabbit.ai account. Start hunting deals with AI in seconds.", path: "/signup" });
  const { session, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setGoogleLoading(false);
    if (error) setError(error.message);
  };

  const handleAppleSignIn = async () => {
    setError("");
    setAppleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    setAppleLoading(false);
    if (error) setError(error.message);
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
        <form onSubmit={handleSubmit} className="glass-card gradient-border p-6 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-block">
              <img src={nabbitIcon} alt="nabbit.ai" className="h-12 mx-auto" />
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

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold text-sm gap-3 bg-secondary/30 border-border hover:bg-secondary/50"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Apple Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold text-sm gap-3 bg-secondary/30 border-border hover:bg-secondary/50"
            onClick={handleAppleSignIn}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            Continue with Apple
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

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
