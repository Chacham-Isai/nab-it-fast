import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NabbitLogo from "./NabbitLogo";
import NotificationBell from "./NotificationBell";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";

const sectionIds = ["live-deals", "how-it-drops", "game-modes", "nabbit-engine"];

const navLinks = [
  { label: "Live Deals", href: "/#live-deals", id: "live-deals" },
  { label: "How It Works", href: "/#how-it-drops", id: "how-it-drops" },
  { label: "Ways to Nab", href: "/#game-modes", id: "game-modes" },
  { label: "The Engine", href: "/#nabbit-engine", id: "nabbit-engine" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (location.pathname !== "/") {
        setActiveSection(null);
        return;
      }
      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-8">
        <NabbitLogo size="lg" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className={`text-sm transition-colors relative ${
                activeSection === link.id
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link to="/profile" className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                {user.email?.[0]?.toUpperCase() || "U"}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-full px-6 font-bold" asChild>
              <Link to="/signup">Start Nabbing</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-border w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-lg transition-colors text-left ${
                    activeSection === link.id
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <Link to="/about" onClick={() => setOpen(false)} className="text-lg text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/blog" onClick={() => setOpen(false)} className="text-lg text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="text-lg text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <Button variant="destructive" className="rounded-full font-semibold mt-4" onClick={() => { setOpen(false); handleSignOut(); }}>
                  Sign Out
                </Button>
              ) : (
                <Button className="rounded-full font-bold mt-4" asChild>
                  <Link to="/signup" onClick={() => setOpen(false)}>Start Nabbing</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>



    </nav>
  );
};

export default Navbar;