import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import nabbitLogo from "@/assets/nabbit-logo.png";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md card-surface p-8 space-y-6">
        <div className="text-center mb-4">
          <Link to="/">
            <img src={nabbitLogo} alt="nabbit.ai" className="h-8 invert mx-auto" />
          </Link>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground text-center">Log in</h1>
        <div className="space-y-4">
          <Input placeholder="Email" type="email" className="bg-secondary border-border" />
          <Input placeholder="Password" type="password" className="bg-secondary border-border" />
        </div>
        <Button className="w-full rounded-full font-semibold">Log In</Button>
        <div className="text-center text-sm space-y-2">
          <a href="#" className="text-primary hover:underline block">Forgot password?</a>
          <p className="text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
