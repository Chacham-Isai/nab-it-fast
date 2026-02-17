import { Link } from "react-router-dom";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { useTheme } from "@/hooks/use-theme";

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={nabbitLogo} alt="nabbit.ai" className="h-7" style={{ mixBlendMode: theme === "dark" ? "lighten" : "normal" }} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered price hunting that never sleeps. You name the price. We nab it.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Product</h4>
            <div className="flex flex-col gap-3">
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="/#technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Technology</a>
              <a href="/#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Company</h4>
            <div className="flex flex-col gap-3">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-foreground">Support</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</a>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</a>
            </div>
          </div>
        </div>

        <div className="gradient-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Nabbit Inc. · All rights reserved</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
