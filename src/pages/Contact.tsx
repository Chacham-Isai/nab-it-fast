import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Twitter, Linkedin, Github, ArrowRight, MessageSquare, Handshake, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import usePageMeta from "@/hooks/usePageMeta";

const channels = [
  {
    icon: MessageSquare,
    title: "General & Support",
    desc: "Questions about nabbit.ai, your account, or how the Nabbit Engine works.",
    cta: "hello@nabbit.ai",
    href: "mailto:hello@nabbit.ai",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    desc: "Interested in integrating with nabbit or becoming a retail partner? Let's talk.",
    cta: "partners@nabbit.ai",
    href: "mailto:partners@nabbit.ai",
  },
  {
    icon: Newspaper,
    title: "Press & Media",
    desc: "Media inquiries, interviews, and press kit requests.",
    cta: "press@nabbit.ai",
    href: "mailto:press@nabbit.ai",
  },
];

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

const Contact = () => {
  usePageMeta({
    title: "Contact — nabbit.ai | Get In Touch",
    description: "Have a question, partnership idea, or just want to say hey? Reach the nabbit.ai team.",
    path: "/contact",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackToTop />
      <main>
        {/* Hero */}
        <SectionWrapper className="pt-32 pb-8">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary blur-[200px] pointer-events-none"
            />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <p className="section-label mb-4">GET IN TOUCH</p>
              <h1
                className="font-heading font-black text-foreground mb-6"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
              >
                Let's{" "}
                <span className="gradient-text">connect.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you've got a question, a partnership idea, or just want to say hey — we're all ears.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* Contact channels */}
        <SectionWrapper className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {channels.map((ch, i) => (
              <motion.a
                key={ch.title}
                href={ch.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card gradient-border p-6 group hover:border-primary/40 transition-all block"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                  <ch.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">{ch.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ch.desc}</p>
                <span className="text-sm font-semibold text-primary flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  {ch.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </motion.a>
            ))}
          </div>
        </SectionWrapper>

        <div className="gradient-divider" />

        {/* Form + Socials */}
        <SectionWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 glass-card gradient-border p-8 space-y-5"
            >
              <div>
                <p className="section-label mb-2">SEND A MESSAGE</p>
                <h2 className="font-heading font-bold text-foreground text-xl">Drop us a line.</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Your name" className="bg-secondary/50 border-border focus:border-primary/50" />
                <Input placeholder="Email address" type="email" className="bg-secondary/50 border-border focus:border-primary/50" />
              </div>
              <Select>
                <SelectTrigger className="bg-secondary/50 border-border focus:border-primary/50">
                  <SelectValue placeholder="What's this about?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="support">Account Support</SelectItem>
                  <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                  <SelectItem value="press">Press & Media</SelectItem>
                  <SelectItem value="feedback">Product Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Tell us what's on your mind..."
                rows={5}
                className="bg-secondary/50 border-border focus:border-primary/50 resize-none"
              />
              <Button className="w-full rounded-full font-black text-base gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--coral)/0.4)]">
                Send Message <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Direct email */}
              <div className="glass-card gradient-border p-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">Email us directly</h3>
                <a href="mailto:hello@nabbit.ai" className="text-sm text-primary hover:underline font-medium">
                  hello@nabbit.ai
                </a>
              </div>

              {/* Socials */}
              <div className="glass-card gradient-border p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Follow us</h3>
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="w-11 h-11 rounded-full bg-secondary/50 border border-border flex items-center justify-center hover:bg-primary/[0.1] hover:border-primary/30 transition-all"
                    >
                      <s.icon className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div className="glass-card gradient-border p-6">
                <h3 className="font-heading font-bold text-foreground mb-1">Response time</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We typically respond within <strong className="text-foreground">24 hours</strong> on business days.
                </p>
              </div>
            </motion.div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
