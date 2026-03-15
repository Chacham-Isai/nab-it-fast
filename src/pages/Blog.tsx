import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const posts = [
  { title: "How AI is Changing Online Shopping", date: "Feb 10, 2026", readTime: "5 min", excerpt: "Explore how artificial intelligence is revolutionizing the way consumers find and purchase products online.", category: "AI & Tech" },
  { title: "5 Ways to Never Overpay Again", date: "Feb 5, 2026", readTime: "4 min", excerpt: "Practical strategies and tools that ensure you always get the best possible price on every purchase.", category: "Tips" },
  { title: "Inside the Nabbit Engine", date: "Jan 28, 2026", readTime: "7 min", excerpt: "A deep dive into the proprietary technology stack that powers autonomous price hunting and purchasing.", category: "Engineering" },
  { title: "Why Price Tracking Alone Isn't Enough", date: "Jan 20, 2026", readTime: "4 min", excerpt: "Price alerts are just the beginning. Learn why autonomous purchasing is the future of smart shopping.", category: "Insights" },
  { title: "The Rise of Autonomous Shopping Agents", date: "Jan 12, 2026", readTime: "6 min", excerpt: "From manual comparison to fully autonomous buying — the evolution of consumer AI technology.", category: "AI & Tech" },
  { title: "nabbit.ai Launch: What You Need to Know", date: "Jan 5, 2026", readTime: "3 min", excerpt: "Everything about our public launch, early access features, and what's coming next on the roadmap.", category: "News" },
];

const categoryColors: Record<string, string> = {
  "AI & Tech": "bg-primary/10 text-primary",
  "Tips": "bg-green-500/10 text-green-500",
  "Engineering": "bg-blue-500/10 text-blue-500",
  "Insights": "bg-amber-500/10 text-amber-600",
  "News": "bg-purple-500/10 text-purple-500",
};

const Blog = () => {
  usePageMeta({ title: "Blog — nabbit.ai", description: "Insights on AI shopping, price tracking, and autonomous purchasing. Stay ahead of the deal curve.", path: "/blog" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SectionWrapper className="pt-32 pb-20">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="section-label mb-4">BLOG</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-heading font-bold text-foreground mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Latest from <span className="gradient-text">nabbit</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-md mx-auto">
            Insights, engineering deep-dives, and the future of AI-powered commerce.
          </motion.p>
        </div>

        {/* Featured post */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden mb-8 cursor-pointer group">
          <div className="md:flex">
            <div className="md:w-2/5 h-48 md:h-auto bg-gradient-to-br from-primary/20 via-primary/10 to-secondary relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">🤖</span>
              </div>
            </div>
            <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
              <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold mb-3 ${categoryColors[posts[0].category]}`}>{posts[0].category}</span>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{posts[0].title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{posts[0].excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {posts[0].date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {posts[0].readTime}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              <div className="h-40 bg-gradient-to-br from-primary/15 via-secondary to-card relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="text-4xl">{i % 2 === 0 ? "📊" : i % 3 === 0 ? "⚡" : "🎯"}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${categoryColors[post.category] || "bg-secondary text-secondary-foreground"}`}>{post.category}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <span className="text-sm text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </SectionWrapper>
      <Footer />
    </div>
  );
};

export default Blog;
