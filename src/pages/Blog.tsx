import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";

const posts = [
  { title: "How AI is Changing Online Shopping", date: "Feb 10, 2026", excerpt: "Explore how artificial intelligence is revolutionizing the way consumers find and purchase products online." },
  { title: "5 Ways to Never Overpay Again", date: "Feb 5, 2026", excerpt: "Practical strategies and tools that ensure you always get the best possible price on every purchase." },
  { title: "Inside the Nabbit Engine", date: "Jan 28, 2026", excerpt: "A deep dive into the proprietary technology stack that powers autonomous price hunting and purchasing." },
  { title: "Why Price Tracking Alone Isn't Enough", date: "Jan 20, 2026", excerpt: "Price alerts are just the beginning. Learn why autonomous purchasing is the future of smart shopping." },
  { title: "The Rise of Autonomous Shopping Agents", date: "Jan 12, 2026", excerpt: "From manual comparison to fully autonomous buying — the evolution of consumer AI technology." },
  { title: "nabbit.ai Launch: What You Need to Know", date: "Jan 5, 2026", excerpt: "Everything about our public launch, early access features, and what's coming next on the roadmap." },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SectionWrapper className="pt-32">
        <div className="text-center mb-16">
          <p className="section-label mb-4">BLOG</p>
          <h1 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Latest from nabbit
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-surface overflow-hidden group cursor-pointer"
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary" />
              <div className="p-6">
                <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <span className="text-sm text-primary font-semibold">Read more →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>
      <Footer />
    </div>
  );
};

export default Blog;
