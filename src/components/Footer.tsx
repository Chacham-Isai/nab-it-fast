import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Activity, Zap, Shield } from "lucide-react";
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

  const linkClass = "text-sm text-muted-foreground hover:text-primary transition-colors duration-200";

  return (
    <footer className="relative overflow-hidden border-t border-border">
      {/* Background effects */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-nab-cyan blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-nab-purple blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top bar: newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card gradient-border p-8 mb-14 relative overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none"
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.img
                src={nabbitLogo}
                alt=""
                className="w-10 h-10 drop-shadow-[0_0_15px_hsl(var(--nab-cyan)/0.3)]"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div>
                <h3 className="font-heading font-black text-foreground text-lg">Don't miss the next drop.</h3>
                <p className="text-sm text-muted-foreground">Join 24K+ nabbers getting weekly deal intel.</p>
              </div>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 text-sm h-10 min-w-[220px] backdrop-blur-sm"
              />
              <Button type="submit" size="sm" className="rounded-full px-5 h-10 shrink-0 shimmer-btn font-bold gap-1.5">
                Join <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <img src={nabbitLogo} alt="nabbit.ai" className="h-8 drop-shadow-[0_0_10px_hsl(var(--nab-cyan)/0.2)]" />
              <span className="font-heading font-black text-foreground text-lg">nabbit.ai</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stop chasing. Start nabbing. The Nabbit Engine never sleeps — so you can.
            </p>
            <div className="flex gap-3">
              {[
                { label: "𝕏", href: "https://twitter.com" },
                { label: "Discord", href: "https://discord.gg" },
                { label: "Instagram", href: "https://instagram.com" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground border border-border hover:border-primary/30 hover:text-primary bg-background/30 backdrop-blur-sm transition-all duration-200"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Ways to Nab */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" /> Ways to Nab
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/grab-bags" className={linkClass}>Grab Bags</Link>
              <Link to="/breaks" className={linkClass}>Live Breaks</Link>
              <Link to="/auctions" className={linkClass}>Auctions</Link>
              <Link to="/dream-buys" className={linkClass}>Dream Buys</Link>
              <Link to="/browse" className={linkClass}>Browse All</Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" /> Company
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/about" className={linkClass}>About</Link>
              <Link to="/blog" className={linkClass}>Blog</Link>
              <Link to="/contact" className={linkClass}>Contact</Link>
              <Link to="/community" className={linkClass}>Community</Link>
              <Link to="/giving" className={linkClass}>Giving</Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" /> Support
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/contact" className={linkClass}>Help Center</Link>
              <Link to="/contact" className={linkClass}>Contact Us</Link>
              <Link to="/login" className={linkClass}>Sign In</Link>
              <Link to="/signup" className={linkClass}>Create Account</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[10px] font-bold text-success">ENGINE ACTIVE</span>
              </div>
              <p className="text-xs text-muted-foreground">© 2026 Nabbit Inc.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
