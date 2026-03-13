import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";

const Signup = () => {
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

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md card-surface p-8 space-y-6 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Confirm your account, then log in.
          </p>
          <Link to="/login">
            <Button className="w-full rounded-full font-semibold mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md card-surface p-8 space-y-6">
        <div className="text-center mb-4">
          <Link to="/">
            <img src={nabbitLogo} alt="nabbit.ai" className="h-8 mx-auto" style={{ mixBlendMode: "lighten" }} />
          </Link>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground text-center">Create account</h1>
        {error && (
          <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{error}</p>
        )}
        <div className="space-y-4">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" required />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required />
          <Input placeholder="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-secondary border-border" required />
        </div>
        <Button type="submit" className="w-full rounded-full font-semibold" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
