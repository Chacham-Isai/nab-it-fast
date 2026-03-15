import { useState } from "react";
import { Link } from "react-router-dom";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("You're on the list! 🐇");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={nabbitLogo} alt="nabbit.ai" className="h-8" />
              <span className="font-heading font-bold text-foreground text-lg">nabbit.ai</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stop chasing. Start nabbing. The Nabbit Engine never sleeps.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border text-sm h-9"
              />
              <Button type="submit" size="sm" className="rounded-full px-3 h-9 shrink-0 shimmer-btn">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex gap-4 pt-1">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm">𝕏</a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Discord</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Instagram</a>
            </div>
          </div>

          {/* Ways to Nab */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Ways to Nab</h4>
            <div className="flex flex-col gap-3">
              <Link to="/grab-bags" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Grab Bags</Link>
              <Link to="/breaks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Live Breaks</Link>
              <Link to="/auctions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auctions</Link>
              <Link to="/dream-buys" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dream Buys</Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Company</h4>
            <div className="flex flex-col gap-3">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Support</h4>
            <div className="flex flex-col gap-3">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            </div>
          </div>
        </div>

        <div className="gradient-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Nabbit Inc. · Stop chasing. Start nabbing.</p>
          <div className="flex gap-6">
            <span className="text-xs text-muted-foreground">Privacy</span>
            <span className="text-xs text-muted-foreground">Terms</span>
            <span className="text-xs text-muted-foreground">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
