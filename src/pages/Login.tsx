import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md card-surface p-8 space-y-6">
        <div className="text-center mb-4">
          <Link to="/">
            <img src={nabbitLogo} alt="nabbit.ai" className="h-8 mx-auto" style={{ mixBlendMode: "lighten" }} />
          </Link>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground text-center">Log in</h1>
        {error && (
          <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{error}</p>
        )}
        <div className="space-y-4">
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required />
        </div>
        <Button type="submit" className="w-full rounded-full font-semibold" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </Button>
        <div className="text-center text-sm space-y-2">
          <a href="#" className="text-primary hover:underline block">Forgot password?</a>
          <p className="text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
