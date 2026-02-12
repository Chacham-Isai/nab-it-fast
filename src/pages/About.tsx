import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Target, Heart, Eye } from "lucide-react";

const team = [
  { name: "Alex Chen", title: "CEO & Co-Founder" },
  { name: "Sarah Park", title: "CTO & Co-Founder" },
  { name: "Marcus Rivera", title: "Head of AI" },
  { name: "Priya Sharma", title: "Head of Product" },
];

const values = [
  { icon: Target, title: "Relentless Optimization", desc: "We never stop improving our algorithms, our speed, and the savings we deliver." },
  { icon: Heart, title: "Consumer-First", desc: "Every decision we make starts with: does this save our users more money?" },
  { icon: Eye, title: "Radical Transparency", desc: "No hidden fees, no dark patterns. You see exactly what we do and how we do it." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SectionWrapper className="pt-32">
        <div className="text-center mb-16">
          <p className="section-label mb-4">ABOUT US</p>
          <h1 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Built for smart shoppers.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            We started nabbit with a simple belief: nobody should overpay for anything, ever. By combining cutting-edge AI with autonomous purchasing, we're eliminating the time, effort, and money wasted on manual deal-hunting.
          </p>
        </div>

        {/* Team */}
        <div className="mb-24">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface p-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4" />
                <p className="font-heading font-bold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-surface p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-5">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>
      <Footer />
    </div>
  );
};

export default About;
