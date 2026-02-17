import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/hooks/use-theme";

const sectionIds = ["how-it-works", "technology", "categories", "pricing"];

const navLinks = [
  { label: "How It Works", href: "/#how-it-works", id: "how-it-works" },
  { label: "Technology", href: "/#technology", id: "technology" },
  { label: "Categories", href: "/#categories", id: "categories" },
  { label: "Pricing", href: "/#pricing", id: "pricing" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <img src={nabbitLogo} alt="nabbit.ai" className="h-8" style={{ mixBlendMode: theme === "dark" ? "lighten" : "normal" }} />
        </Link>

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
          <Button size="sm" className="rounded-full px-6 font-semibold">
            Get Started Free
          </Button>
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
              <Button className="rounded-full font-semibold mt-4">
                Get Started Free
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Scroll progress indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
        style={{ scaleX }}
      />
    </nav>
  );
};

export default Navbar;
