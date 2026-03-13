import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SectionWrapper className="pt-32">
        <div className="text-center mb-16">
          <p className="section-label mb-4">CONTACT</p>
          <h1 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Get in touch
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Form */}
          <div className="card-surface p-8 space-y-6">
            <Input placeholder="Name" className="bg-secondary border-border" />
            <Input placeholder="Email" type="email" className="bg-secondary border-border" />
            <Select>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="press">Press</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Message" rows={5} className="bg-secondary border-border" />
            <Button className="w-full rounded-full font-semibold">Submit</Button>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">Email</h3>
              <a href="mailto:hello@nabbit.ai" className="text-primary hover:underline">hello@nabbit.ai</a>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-4">Social</h3>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/[0.08] hover:border-primary/30 transition-colors">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
      <Footer />
    </div>
  );
};

export default Contact;
