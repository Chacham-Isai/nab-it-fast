

# nabbit.ai — Full Marketing Website

A premium, dark-mode, conversion-focused marketing website for an AI-powered autonomous shopping agent. The logo image will be used as a reference for the brand identity (the "a" has a crosshair/target motif, ".ai" in coral).

---

## Phase 1: Foundation & Design System

- **Dark theme setup** — Override all CSS variables to the nabbit brand palette (#0A0A0A background, #FF6B5B coral accent, etc.)
- **Typography** — Import Google Fonts (Syne for headings, Plus Jakarta Sans for body) and configure Tailwind
- **Install Framer Motion** for scroll-triggered animations throughout the site
- **Reusable components** — Section wrapper with fade-up animation, gradient dividers, coral pill/badge, stat card

---

## Phase 2: Navigation & Layout Shell

- **Sticky navbar** — Transparent → glass blur on scroll, nabbit.ai text logo ("nabbit" white, ".ai" coral), desktop nav links with smooth scroll, coral "Get Started Free" CTA button
- **Mobile hamburger** — Slide-in drawer with all nav links
- **Footer** — 4-column layout (Brand, Product, Company, Support), bottom copyright bar

---

## Phase 3: Homepage Sections (Landing Page)

### Hero (Section 1)
- Two-column: headline + CTAs + inline stats on left, CSS phone mockup on right showing 3 product hunt cards (Jordan 4, Rolex, Chanel)
- Floating animated badges around the phone
- Coral radial glow background accents

### The Problem (Section 2)
- 4 stat cards in a grid with large coral values, descriptions, and source citations
- Closing italicized quote

### How It Works (Section 3)
- 3 step cards (Upload, Set Price, Auto-Purchase) connected by a faint line
- Each with icon, faded step number, description, and coral tag pill

### Proprietary Technology (Section 4)
- 2×2 grid of tech cards (NabVision AI, PriceGraph Engine, NabBot Agent, TrustShield)
- Horizontal metrics bar below with 5 key stats

### Use Cases / Categories (Section 5)
- 4×2 grid of category cards (Sneakers, Electronics, Fashion, Collectibles, Beauty, Home, Kids, Cars) with Lucide icons

### Traction (Section 6)
- 4 metric cards with large coral values
- Footnote bar with growth stats

### Competitive Comparison (Section 7)
- Feature comparison table: Nabbit vs Honey vs Camel vs Google Shopping
- Nabbit column highlighted with coral tint, using ● / — / ◐ indicators

### Pricing (Section 8)
- 3 pricing cards: Nibble (Free), Nabber ($9/mo — featured with coral border/glow), Nabbit Pro ($29/mo)
- Feature lists with coral checkmarks

### Final CTA (Section 9)
- Large banner card with coral glow, headline, and two CTA buttons

---

## Phase 4: Additional Pages

- **/about** — Mission statement, placeholder team member cards, 3 company values
- **/blog** — Grid of 6 placeholder blog post cards with titles, dates, and excerpts
- **/contact** — Contact form (Name, Email, Subject dropdown, Message) + email/social links
- **/login** — Dark centered card with email/password fields, links to signup/forgot password
- **/signup** — Dark centered card with name/email/password/confirm fields, link to login

All pages share the same navbar and footer. All UI-only (no backend auth needed).

---

## Design Details Applied Throughout

- Scroll-triggered Framer Motion fade-up animations on every section
- Cards with 1px borders, 20-24px rounded corners, hover lift effects
- Generous spacing (~140px desktop, ~100px mobile between sections)
- Gradient section dividers
- Fully responsive: mobile-first with tablet and desktop breakpoints
- Lucide React icons (no emojis)
- All copy exactly as specified in the brief

