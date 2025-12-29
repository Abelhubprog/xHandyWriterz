# HandyWriterz Frontend Redesign Blueprint

## Purpose
Deliver a production-ready, CMS-first public experience plus a clean operational dashboard. The public site must feel like an editorial product with domain authority, while the app dashboard stays fast, task-focused, and reliable.

## Design Direction (from SKILL.md)
- **Aesthetic**: Editorial studio meets research journal. High-contrast surfaces, rich typography, calm gradients, confident spacing.
- **Tone**: Expert, serious, premium. No generic SaaS UI. Avoid template layouts and purple-on-white defaults.
- **Differentiation**: Domain-specific palettes and typography shifts per vertical. Each domain is a micro-brand.
- **Motion**: Staggered page load reveals, section pinning for key CTAs, and gentle scroll-driven fades.

## Information Architecture
- **Public**: Homepage, Domains hub, Domain pages, Services (domain directory + service detail), Articles, Authors, Docs.
- **Authenticated**: Dashboard (orders, docs, messages, payments), profile/settings.
- **Admin**: Ops dashboard, content monitoring, messaging, publishing workflow entrypoints.

## Design System
### Typography
- **Display**: Newsreader (editorial, authoritative)
- **Body/UI**: Manrope (clean, modern)
- **Scale**: Use a 1.25 ratio. Headings are large and confident; body stays readable at 16-18px.

### Color
- **Base**: Slate/ink neutrals with warm-white backgrounds.
- **Domain palettes**: Each domain uses a pair of tones (primary + accent). Keep gradients subtle.
- **Accent**: Use a single high-contrast action color per page, derived from domain color.

### Layout
- **Grid**: 12 columns with 80-120px outer gutters for hero sections.
- **Reading width**: 60-72ch on articles/services.
- **Spacing**: Large section gaps (80-140px). Avoid dense UI.

### Motion
- **Page load**: staged reveal (hero -> summary -> CTA)
- **Cards**: vertical lift with shadow color shift
- **Scroll**: subtle parallax or opacity for imagery

### Visual Devices
- Editorial index cards, thin separators, tinted background panels, data blocks, and glossary-style callouts.

## Public Page Layout Plan

### Homepage
1. **Editorial Hero** (domain highlight + primary CTA)
2. **Domain Grid** (multi-column with domain microcopy)
3. **Featured Services** (two-column with context blurbs)
4. **Featured Articles** (editor picks + list)
5. **Testimonials** (carousel)
6. **Newsletter / CTA**

### Domains Hub
- Filter by category, quick badges (ex: Nursing, AI, Crypto).
- Each card: icon, summary, highlight metric, CTA.

### Domain Page
- **Hero**: domain identity + primary/secondary CTA
- **Highlights**: 3-4 key metrics or value statements
- **Featured services**: 3 cards
- **Featured articles**: 4 cards
- **Testimonials**: 3-5
- **FAQ**: accordion
- **Final CTA**

### Service Page
- **Hero**: title, summary, domain chip, CTA
- **Scope**: feature list and deliverables
- **Body**: rich CMS content
- **Pricing**: tiers if provided
- **Resources**: attachments (if any)
- **Related services**

### Articles Page
- Editorial hero + search and filters
- Featured layout: 1 hero + 2-3 supporting articles
- Grid/list toggle

### Article Page
- Hero with domain/category, author, meta
- Reading body
- Tags, author bio
- Related articles

### Authors
- Directory with search and featured toggle
- Author profile with social links and published work

## Dashboard UI Plan
- **Dashboard home**: order status, latest messages, quick actions
- **Orders**: table + status filters
- **Docs**: upload queue + file history + AV status
- **Messages**: Mattermost embed + alerts when disconnected
- **Payments**: transaction history + x402 usage

## Admin UI Plan
- Operational dashboard only (not a CMS replacement)
- Shortcuts to Strapi admin, monitoring dashboards, and content review queue
- Messaging oversight and doc review

## Implementation Phasing
1. **Baseline**: unify typography, spacing, and color variables across all public pages
2. **Public pages**: enforce the editorial layout system per page
3. **Dashboard UI**: reduce visual noise, convert to task-first layouts
4. **Admin UI**: simplify to operational monitoring
5. **Cross-cutting**: SEO, accessibility, performance

## Production Readiness Checks
- Lighthouse 90+ on public pages
- Focus states and keyboard navigation
- Image optimization and lazy load
- Strapi data fallback for empty sections

