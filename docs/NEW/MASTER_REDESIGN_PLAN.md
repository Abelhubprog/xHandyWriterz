# HandyWriterz Master Redesign Plan

> **Version**: 2.0  
> **Date**: December 2024  
> **Status**: ACTIVE

---

## Executive Summary

HandyWriterz is an academic writing services platform that combines:
1. **Public CMS Experience** — Editorial content organized by specialized domains
2. **User Dashboard** — Order management, document uploads, messaging
3. **x402 Protocol** — AI agent-paid content access

This document consolidates all analysis and provides the definitive roadmap for production readiness.

---

## 1. Current State Analysis

### Stack
| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React 18 + Vite + TypeScript | ✅ Solid |
| Routing | React Router v6 | ✅ Working |
| State | React Query + Context | ✅ Good patterns |
| Styling | Tailwind CSS | ✅ Working |
| Auth | Clerk | ✅ Integrated |
| CMS | Strapi 5 | 🟡 Needs deployment |
| Storage | Cloudflare R2 | 🟡 Via API |
| Messaging | Mattermost | 🟡 Docker ready |
| Hosting | Railway | ✅ Target platform |

### Critical Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| Dashboard Monolith | P0 | 2027-line component needs decomposition |
| Dual CMS Clients | P0 | Two separate clients (REST/GraphQL) |
| Empty Hooks | ✅ Resolved | Removed unused hooks; Mattermost hooks consolidated |
| Mock Data | ✅ Resolved | Mock order payload removed from dashboard |
| Schema Mismatch | P1 | Strapi domains ≠ frontend taxonomy |
| Duplicate Toast | ✅ Resolved | Consolidated on react-hot-toast |
| Legacy Files | P2 | Unused components remain |
| Cloudflare SDK in Web | ✅ Resolved | Frontend Cloudflare SDKs removed |

---

## 2. Domain Model

### Service Domains
```
┌─────────────────────────────────────────────────────┐
│                    DOMAINS                           │
├─────────────────────────────────────────────────────┤
│  adult-nursing     │  Adult Nursing                 │
│  mental-health     │  Mental Health Nursing         │
│  child-nursing     │  Child Nursing                 │
│  social-work       │  Social Work                   │
│  technology        │  Technology                    │
│  ai                │  Artificial Intelligence       │
│  crypto            │  Blockchain & Crypto           │
│  enterprise        │  Enterprise                    │
│  general           │  General                       │
└─────────────────────────────────────────────────────┘
```

### Content Types (Strapi)
- **Articles** — Long-form editorial content
- **Services** — Service offerings per domain
- **Authors** — Content creators
- **Testimonials** — Social proof
- **Domain Pages** — CMS-driven landing pages
- **Landing Sections** — Homepage components

---

## 3. Frontend Redesign Strategy

### Design Philosophy (from SKILL.md)

**Aesthetic Direction**: Editorial Studio × Research Journal
- High-contrast surfaces
- Rich typography (Newsreader display + Manrope body)
- Calm gradients, confident spacing
- Domain-specific micro-branding

**Anti-patterns to Avoid**:
- Generic SaaS templates
- Purple-on-white gradients
- Cookie-cutter component patterns
- Inter/Roboto/Arial defaults

### Typography Scale
```
Display:  Newsreader (serif, editorial)
Body/UI:  Manrope (clean, modern)
Scale:    1.25 ratio
Headings: Large, confident
Body:     16-18px, readable
```

### Color Architecture
```css
/* Base Neutrals */
--slate-950: canvas backgrounds
--warm-white: content surfaces

/* Domain Palettes (each domain gets unique accent) */
--adult-nursing:   #E11D48 (rose)
--mental-health:   #7C3AED (violet)
--child-nursing:   #06B6D4 (cyan)
--social-work:     #F59E0B (amber)
--technology:      #3B82F6 (blue)
--ai:              #10B981 (emerald)
--crypto:          #F97316 (orange)
```

### Layout System
```
Grid:           12 columns
Hero gutters:   80-120px
Content width:  60-72ch (articles)
Section gaps:   80-140px
```

### Motion Principles
1. **Page Load**: Staged reveal (hero → summary → CTA)
2. **Cards**: Vertical lift with shadow color shift
3. **Scroll**: Subtle parallax or opacity for imagery
4. **Micro**: Reserve for high-impact moments

---

## 4. Component Architecture

### Target Structure
```
apps/web/src/
├── components/
│   ├── landing/              # Public CMS components
│   │   ├── HeroSection.tsx
│   │   ├── DomainShowcase.tsx
│   │   ├── FeaturedGrid.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── AuthorCard.tsx
│   │   ├── TestimonialSection.tsx
│   │   └── CmsSectionRenderer.tsx
│   │
│   ├── layouts/              # Page shells
│   │   ├── RootLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── dashboard/            # Dashboard decomposed
│   │   ├── OrderCreator/
│   │   │   ├── index.tsx
│   │   │   ├── AreaSelector.tsx
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── PriceCalculator.tsx
│   │   ├── DocumentUploader/
│   │   ├── MessageCenter/
│   │   └── QuickActions.tsx
│   │
│   └── ui/                   # Design system primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Toast/            # Single toast system
│       └── [primitives...]
│
├── pages/
│   ├── HomepageNew.tsx       # CMS-driven homepage
│   ├── domains/
│   │   ├── DomainsHub.tsx
│   │   └── DomainPage.tsx
│   ├── articles/
│   │   ├── ArticlesPage.tsx
│   │   └── ArticlePage.tsx
│   ├── services/
│   │   ├── ServicesHub.tsx
│   │   └── ServicePage.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx     # Decomposed
│   │   ├── Orders.tsx
│   │   ├── Documents.tsx
│   │   └── Messages.tsx
│   └── admin/
│       └── [admin pages...]
│
├── lib/
│   ├── cms.ts               # Single CMS client
│   ├── api.ts               # API utilities
│   ├── mm-client.ts         # Mattermost
│   └── utils.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCMS.ts            # Consolidated
│   └── mattermost/          # MM hooks
│
└── types/
    ├── cms.ts
    └── api.ts
```

---

## 5. Page-by-Page Redesign

### Public Pages

#### Homepage (`/`)
```
┌────────────────────────────────────────────────┐
│ EDITORIAL HERO                                  │
│ • Domain highlight + Primary CTA               │
│ • Animated gradient, staged reveal             │
├────────────────────────────────────────────────┤
│ DOMAIN GRID                                     │
│ • Multi-column domain cards                    │
│ • Each with icon, summary, metric              │
├────────────────────────────────────────────────┤
│ FEATURED SERVICES                               │
│ • Two-column with context blurbs               │
├────────────────────────────────────────────────┤
│ FEATURED ARTICLES                               │
│ • Editor picks + recent list                   │
│ • Spotlight layout (1 hero + 3 supporting)     │
├────────────────────────────────────────────────┤
│ TESTIMONIALS                                    │
│ • Carousel with ratings                        │
├────────────────────────────────────────────────┤
│ NEWSLETTER/CTA                                  │
└────────────────────────────────────────────────┘
```

#### Domain Page (`/domains/:slug`)
```
┌────────────────────────────────────────────────┐
│ DOMAIN HERO                                     │
│ • Domain icon + gradient background            │
│ • Title, tagline, primary/secondary CTA        │
│ • Key highlights (3 metrics)                   │
├────────────────────────────────────────────────┤
│ FEATURED SERVICES (3-4 cards)                  │
├────────────────────────────────────────────────┤
│ FEATURED ARTICLES (4 cards)                    │
├────────────────────────────────────────────────┤
│ TESTIMONIALS (domain-filtered)                 │
├────────────────────────────────────────────────┤
│ FAQ (accordion)                                 │
├────────────────────────────────────────────────┤
│ FINAL CTA                                       │
└────────────────────────────────────────────────┘
```

#### Articles Page (`/articles`)
```
┌────────────────────────────────────────────────┐
│ HERO + SEARCH                                   │
├────────────────────────────────────────────────┤
│ DOMAIN FILTERS                                  │
├────────────────────────────────────────────────┤
│ FEATURED (1 hero + 2-3 supporting)             │
├────────────────────────────────────────────────┤
│ ARTICLE LIST (grid/list toggle)                │
└────────────────────────────────────────────────┘
```

### Dashboard Pages

#### Dashboard Home (`/dashboard`)
```
┌────────────────────────────────────────────────┐
│ SIDEBAR │ MAIN CONTENT                         │
│         │                                       │
│ Nav     │ ┌─── QUICK ACTIONS ────────────┐    │
│         │ │ New Order | Upload | Support │    │
│         │ └─────────────────────────────┘    │
│         │                                       │
│         │ ┌─── RECENT ORDERS ────────────┐    │
│         │ │ [Order list with status]     │    │
│         │ └─────────────────────────────┘    │
│         │                                       │
│         │ ┌─── NOTIFICATIONS ────────────┐    │
│         │ │ Messages + Updates           │    │
│         │ └─────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

---

## 6. Data Architecture

### CMS Data Flow
```
Strapi Admin → Publish → REST API → React Query Cache → UI
                    ↓
              Webhook → Cache Purge
```

### Single CMS Client (lib/cms.ts)
- Remove `cms-client.ts` (GraphQL duplicate)
- Standardize on REST with proper types
- Use React Query for caching

### API Endpoints (apps/api)
```
/health              → Health check
/api/uploads/*       → R2 presigned URLs
/api/cms/*           → CMS proxy (admin ops)
/api/payments/*      → Payment processing
/api/messaging/*     → Mattermost bridge
/api/turnitin/*      → Plagiarism checking
/api/webhooks/*      → External webhooks
```

---

## 7. Infrastructure (Railway-First)

### Services
```
┌────────────────────────────────────────────────┐
│                 RAILWAY                         │
├────────────────────────────────────────────────┤
│  web        │  Vite SPA + Static serving      │
│  api        │  Express backend                │
│  strapi     │  CMS (Dockerfile)               │
│  mattermost │  Messaging (Docker)             │
│  postgres   │  Database (Railway)             │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              CLOUDFLARE                         │
├────────────────────────────────────────────────┤
│  R2         │  Object storage                 │
│  (Optional) │  DNS/CDN                        │
└────────────────────────────────────────────────┘
```

### No AWS
- File uploads → Cloudflare R2 via API presign
- No S3, no Lambda
- All services on Railway

---

## 8. Cleanup Targets

### Files to Delete
```
# Duplicate toast system
apps/web/src/components/ui/toast/  (keep root toast.tsx)

# Empty hooks
apps/web/src/hooks/useMMAuth.ts  (empty)
apps/web/src/hooks/useChannels.ts  (empty)

# Legacy components
apps/web/src/components/Orders/LegacyOrderForm.tsx

# Duplicate CMS client
apps/web/src/lib/cms-client.ts  (consolidate to cms.ts)
```

### Files to Consolidate
```
# Mattermost hooks → single folder
hooks/useMMAuth.ts → hooks/mattermost/useMMAuth.ts
hooks/useChannels.ts → hooks/mattermost/useMattermostChannels.ts

# Dashboard components → decompose monolith
components/Dashboard/Dashboard.tsx → split into modules
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Clean up duplicate files
- [ ] Consolidate CMS client to single implementation
- [ ] Fix empty hooks
- [ ] Establish design system tokens

### Phase 2: Component Decomposition (Week 2)
- [ ] Extract Dashboard into modular components
- [ ] Build OrderCreator module
- [ ] Build DocumentUploader module
- [ ] Implement single toast system

### Phase 3: Public Pages Polish (Week 3)
- [ ] Redesign Homepage with editorial aesthetic
- [ ] Polish Domain pages
- [ ] Enhance Article layouts
- [ ] Add proper loading/error states

### Phase 4: Dashboard UX (Week 4)
- [ ] Real data wiring (replace mock data)
- [ ] Order management flow
- [ ] Document upload flow
- [ ] Messaging integration

### Phase 5: Infrastructure (Week 5)
- [ ] Deploy Strapi to Railway
- [ ] Configure R2 storage
- [ ] Set up Mattermost
- [ ] Environment variables

### Phase 6: Polish & Launch (Week 6)
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Accessibility audit
- [ ] Production deployment

---

## 10. Success Metrics

### Technical
- Lighthouse Performance: 90+
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Build time: < 3 minutes

### UX
- Order creation flow: < 3 minutes
- Document upload success rate: 99%+
- Page load: < 2 seconds
- Mobile usability: 100%

---

## Appendix A: Route Contract

```typescript
// Public Routes
'/'                           → HomepageNew
'/domains'                    → DomainsHub
'/domains/:slug'              → DomainPage
'/domains/:slug/services/:s'  → ServicePage
'/domains/:slug/articles/:a'  → ArticlePage
'/articles'                   → ArticlesPage
'/articles/:slug'             → ArticlePage
'/services'                   → ServicesHub
'/authors'                    → AuthorsPage
'/authors/:slug'              → AuthorPage
'/pricing'                    → Pricing
'/about'                      → About
'/contact'                    → Contact
'/faq'                        → FAQ
'/docs/x402'                  → X402DocsPage
'/api'                        → ApiDocsPage

// Dashboard Routes (authenticated)
'/dashboard'                  → DashboardWrapper
'/dashboard/orders'           → Orders
'/dashboard/new-order'        → NewOrder
'/dashboard/messages'         → Messages
'/dashboard/documents'        → DocumentsUpload
'/dashboard/profile'          → Profile
'/dashboard/settings'         → Settings

// Admin Routes (admin role)
'/admin'                      → AdminDashboard
'/admin/content/new'          → ArticleEditor
'/admin/publish/:id'          → ContentPublisher
'/admin/messaging'            → AdminMessaging
'/admin/turnitin-reports'     → TurnitinReports

// Legacy Redirects
'/d/:domain/*'                → /domains/:domain/*
'/services/:domain/:slug'     → /domains/:domain/services/:slug
```

---

## Appendix B: Environment Variables

```bash
# App
VITE_APP_NAME=HandyWriterz
VITE_APP_URL=https://handywriterz.com

# CMS
VITE_CMS_URL=https://cms.handywriterz.com
VITE_CMS_TOKEN=<strapi-api-token>

# Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# API
VITE_API_URL=https://api.handywriterz.com

# Messaging
VITE_MATTERMOST_URL=https://mm.handywriterz.com

# Features
VITE_ENABLE_TURNITIN=true
VITE_ENABLE_ADMIN_DASHBOARD=true
```

---

*This document supersedes all previous planning documents in /docs. Refer here as the single source of truth.*
