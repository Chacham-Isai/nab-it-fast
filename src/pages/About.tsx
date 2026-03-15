import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import BackToTop from "@/components/BackToTop";
import { motion } from "framer-motion";
import { Zap, Shield, Users, Rocket, Brain, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import usePageMeta from "@/hooks/usePageMeta";

const stats = [
  { value: "200+", label: "Retailers Scanned" },
  { value: "<3s", label: "Auto-Nab Speed" },
  { value: "4", label: "Ways to Score" },
  { value: "24/7", label: "AI Deal Hunting" },
];

const values = [
  {
    icon: Zap,
    title: "Speed Wins",
    desc: "The best deals disappear in seconds. We built the Nabbit Engine to move faster than humanly possible.",
  },
  {
    icon: Shield,
    title: "No Dark Patterns. Ever.",
    desc: "No hidden fees, no bait-and-switch, no pressure tactics. What you see is what you get.",
  },
  {
    icon: Users,
    title: "Your Taste. Your Feed.",
    desc: "Every deal is curated by your choices and purchase history. Not by algorithms optimizing for ad revenue.",
  },
  {
    icon: Brain,
    title: "AI That Works For You",
    desc: "The Nabbit Engine learns what you love and hunts deals 24/7 so you don't have to.",
  },
  {
    icon: Globe,
    title: "200+ Retailers. One Engine.",
    desc: "We scan across every major retailer and marketplace so you never miss a price drop.",
  },
  {
    icon: Rocket,
    title: "Built Different",
    desc: "Grab bags, live breaks, auctions, dream buys — we turned deal-hunting into something you actually enjoy.",
  },
];

const milestones = [
  { year: "2024", event: "nabbit.ai founded — the idea that deal-hunting should be fun, not work." },
  { year: "2024", event: "Nabbit Engine v1 goes live — AI-powered deal curation across 50+ retailers." },
  { year: "2025", event: "Grab Bags & Live Breaks launch — gamified shopping hits different." },
  { year: "2025", event: "200+ retailers. 4 game modes. One engine that never sleeps." },
];

const About = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: "About — nabbit.ai | The AI Deal Engine",
    description: "We built the Nabbit Engine to find you better deals, faster — powered by AI, curated by your taste, and delivered in ways that actually feel rewarding.",
    path: "/about",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackToTop />
      <main>
        {/* Hero */}
        <SectionWrapper className="pt-32 pb-12">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary blur-[200px] pointer-events-none"
            />
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <p className="section-label mb-4">WHO WE ARE</p>
              <h1
                className="font-heading font-black text-foreground mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                We built the engine that{" "}
                <span className="gradient-text">finds your wins.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                nabbit.ai started with a simple frustration: great deals exist everywhere, but finding them
                takes forever. So we built an AI that does it for you — and made the whole experience
                something you actually look forward to.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* Stats bar */}
        <SectionWrapper className="py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card gradient-border p-6 text-center"
              >
                <p className="font-heading font-black text-3xl sm:text-4xl gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <div className="gradient-divider" />

        {/* The story */}
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="section-label mb-4">THE STORY</p>
              <h2
                className="font-heading font-black text-foreground mb-6"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
              >
                Deal-hunting shouldn't feel like a job.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We were tired of opening 15 tabs, comparing prices across sites, setting up
                  price alerts that never worked, and still missing the deal by minutes.
                </p>
                <p>
                  So we built <strong className="text-foreground">the Nabbit Engine</strong> — proprietary
                  AI that scans 200+ retailers, learns your taste from every interaction, and delivers
                  personalized deals you can bid on, spin for, or auto-buy at your price.
                </p>
                <p>
                  No more manual hunting. No more missing out. Just{" "}
                  <strong className="text-foreground">better deals, found faster, delivered your way.</strong>
                </p>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card gradient-border p-5 flex gap-4 items-start"
                >
                  <span className="font-heading font-black text-primary text-sm mt-0.5 shrink-0">
                    {m.year}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.event}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </SectionWrapper>

        <div className="gradient-divider" />

        {/* Values */}
        <SectionWrapper>
          <div className="text-center mb-14">
            <p className="section-label mb-4">WHAT WE STAND FOR</p>
            <h2
              className="font-heading font-black text-foreground mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
            >
              Built on principles,{" "}
              <span className="gradient-text">not gimmicks.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card gradient-border p-7 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <div className="gradient-divider" />

        {/* CTA */}
        <SectionWrapper>
          <div className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden glass-card gradient-border">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary blur-[150px] pointer-events-none"
            />
            <div className="relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2
                  className="font-heading font-black text-foreground mb-6"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
                >
                  Ready to let AI{" "}
                  <span className="gradient-text">find your deals?</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  The Nabbit Engine is live. Your personalized deal feed is waiting.
                </p>
                <Button
                  size="lg"
                  className="rounded-full px-10 font-black text-lg gap-2 shimmer-btn shadow-[0_0_50px_-5px_hsl(var(--nab-cyan)/0.4)]"
                  onClick={() => navigate("/signup")}
                >
                  Start Nabbing Free <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-5">No credit card · Setup in 30 seconds · Cancel anytime</p>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default About;
