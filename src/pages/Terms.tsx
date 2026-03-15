import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import usePageMeta from "@/hooks/usePageMeta";

const Terms = () => {
  usePageMeta({ title: "Terms of Service — nabbit.ai", description: "Terms of Service for nabbit.ai marketplace platform.", path: "/terms" });

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using nabbit.ai ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any modifications.`,
    },
    {
      title: "2. Eligibility",
      content: `You must be at least 18 years of age to use the Platform. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.`,
    },
    {
      title: "3. Account Registration",
      content: `To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.`,
    },
    {
      title: "4. Marketplace Services",
      content: `nabbit.ai provides a marketplace platform connecting buyers and sellers of goods including but not limited to trading cards, sneakers, electronics, watches, collectibles, and fashion items. We facilitate transactions but are not a party to any transaction between buyers and sellers. We do not guarantee the quality, safety, legality, or availability of any items listed on the Platform.`,
    },
    {
      title: "5. Buying & Selling",
      content: `Sellers are responsible for accurately describing items, setting fair prices, and fulfilling orders in a timely manner. Buyers agree to pay for items they purchase. All sales are subject to our payment processing terms. We charge a platform fee on completed transactions. nabbit.ai reserves the right to remove listings that violate our policies or applicable laws.`,
    },
    {
      title: "6. Auctions & Bidding",
      content: `Bids placed on auction items are binding. Once you place a bid, you are obligated to complete the purchase if you are the winning bidder. Proxy bids and auto-extend features operate as described on the Platform. We reserve the right to cancel auctions if we suspect fraud or manipulation.`,
    },
    {
      title: "7. Payments & Fees",
      content: `All payments are processed through our third-party payment processor (Stripe). By making a purchase, you agree to Stripe's terms of service. Platform fees, shipping costs, and applicable taxes will be clearly displayed before purchase confirmation. Refunds are subject to our Return Policy and seller-specific return policies.`,
    },
    {
      title: "8. Prohibited Conduct",
      content: `You may not: (a) use the Platform for any illegal purpose; (b) post counterfeit, stolen, or prohibited items; (c) manipulate bidding processes or prices; (d) harass, abuse, or threaten other users; (e) create multiple accounts for deceptive purposes; (f) scrape, crawl, or otherwise extract data from the Platform without permission; (g) interfere with the Platform's operation or security; (h) circumvent any fees or charges.`,
    },
    {
      title: "9. Intellectual Property",
      content: `All content, features, and functionality of the Platform — including but not limited to the Nabbit Engine, AI deal-finding technology, logos, and design — are owned by Nabbit Inc. and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.`,
    },
    {
      title: "10. AI-Powered Features",
      content: `The Platform uses artificial intelligence to provide deal recommendations, price analysis, and product matching. While we strive for accuracy, AI-generated recommendations are not guarantees. You acknowledge that AI features are provided "as-is" and should not be relied upon as the sole basis for purchasing decisions.`,
    },
    {
      title: "11. Limitation of Liability",
      content: `To the maximum extent permitted by law, Nabbit Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim. We are not liable for disputes between buyers and sellers.`,
    },
    {
      title: "12. Indemnification",
      content: `You agree to indemnify, defend, and hold harmless Nabbit Inc. and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising out of your use of the Platform, your violation of these Terms, or your violation of any rights of a third party.`,
    },
    {
      title: "13. Termination",
      content: `We may suspend or terminate your account at any time for any reason, including violation of these Terms. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination shall survive, including but not limited to intellectual property rights, limitation of liability, and indemnification.`,
    },
    {
      title: "14. Dispute Resolution",
      content: `Any disputes arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive any right to a jury trial or to participate in a class action lawsuit. The arbitration shall take place in the state of Delaware.`,
    },
    {
      title: "15. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.`,
    },
    {
      title: "16. Contact",
      content: `For questions about these Terms, please contact us at legal@nabbit.ai or through our Contact page.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground mb-2">Terms of Service</h1>
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

export default Terms;
