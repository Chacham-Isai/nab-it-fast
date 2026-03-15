import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import usePageMeta from "@/hooks/usePageMeta";

const Privacy = () => {
  usePageMeta({ title: "Privacy Policy — nabbit.ai", description: "Privacy Policy for nabbit.ai marketplace platform.", path: "/privacy" });

  const sections = [
    {
      title: "1. Introduction",
      content: `Nabbit Inc. ("we," "us," or "our") operates nabbit.ai. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. Please read this policy carefully. By using the Platform, you consent to the practices described herein.`,
    },
    {
      title: "2. Information We Collect",
      content: `We collect information you provide directly: name, email address, shipping address, payment information, and profile preferences (taste tags, brand affinities, spending style). We also collect information automatically: device information, IP address, browser type, pages viewed, interactions with listings, search queries, bidding activity, and usage patterns through analytics events.`,
    },
    {
      title: "3. How We Use Your Information",
      content: `We use your information to: (a) provide and maintain the Platform; (b) process transactions and send related notices; (c) personalize your experience using AI-powered recommendations; (d) analyze usage patterns to improve our services; (e) detect and prevent fraud; (f) send promotional communications (with your consent); (g) comply with legal obligations; (h) enforce our Terms of Service.`,
    },
    {
      title: "4. AI & Personalization",
      content: `Our Nabbit Engine uses artificial intelligence to analyze your preferences, browsing history, and purchase patterns to provide personalized deal recommendations and price alerts. You can manage your AI personalization preferences in your profile settings. We do not sell your personal data to train third-party AI models.`,
    },
    {
      title: "5. Information Sharing",
      content: `We may share your information with: (a) sellers — to facilitate transactions (name and shipping address only); (b) payment processors — Stripe processes all payments under their own privacy policy; (c) service providers — who assist in operating the Platform; (d) law enforcement — when required by law or to protect rights and safety; (e) business transfers — in the event of a merger, acquisition, or sale of assets.`,
    },
    {
      title: "6. Data Retention",
      content: `We retain your personal information for as long as your account is active or as needed to provide services. Transaction records are retained for 7 years for legal and tax compliance. You may request deletion of your account and personal data at any time, subject to our legal retention obligations.`,
    },
    {
      title: "7. Data Security",
      content: `We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted data at rest, secure authentication, and regular security audits. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security. We use row-level security policies to ensure users can only access their own data.`,
    },
    {
      title: "8. Cookies & Tracking",
      content: `We use essential cookies for authentication and session management. We use analytics cookies to understand how users interact with the Platform. We do not use third-party advertising cookies. You can control cookie preferences through your browser settings, though disabling essential cookies may affect Platform functionality.`,
    },
    {
      title: "9. Your Rights",
      content: `Depending on your jurisdiction, you may have the right to: (a) access your personal data; (b) correct inaccurate data; (c) delete your data; (d) port your data to another service; (e) opt out of marketing communications; (f) restrict processing of your data; (g) withdraw consent. To exercise these rights, contact us at privacy@nabbit.ai.`,
    },
    {
      title: "10. California Privacy Rights (CCPA)",
      content: `California residents have additional rights under the CCPA: the right to know what personal information we collect and how it is used; the right to request deletion of personal information; the right to opt out of the sale of personal information (we do not sell personal information); and the right to non-discrimination for exercising privacy rights.`,
    },
    {
      title: "11. European Privacy Rights (GDPR)",
      content: `If you are in the European Economic Area, we process your data based on: consent, contractual necessity, legitimate interests, or legal obligations. You have the right to lodge a complaint with your local data protection authority. Our legal basis for processing is primarily contractual necessity (to provide the marketplace service) and legitimate interest (to improve and secure the Platform).`,
    },
    {
      title: "12. Children's Privacy",
      content: `The Platform is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 18, we will take steps to delete such information promptly.`,
    },
    {
      title: "13. Third-Party Links",
      content: `The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.`,
    },
    {
      title: "14. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on the Platform and updating the "Last updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: "15. Contact Us",
      content: `For questions or concerns about this Privacy Policy, contact our Data Protection Officer at privacy@nabbit.ai or write to us at: Nabbit Inc., Attn: Privacy, Delaware, USA.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 15, 2026</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-heading font-bold text-lg text-foreground mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Privacy;
