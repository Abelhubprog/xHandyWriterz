# CMS Implementation Checklist

> **Last Updated:** December 2024  
> **Status:** Phase 2 Complete ✓

## Active Fixes (CMS Domain Alignment)
- [x] Use options object when calling `fetchDomainsList` in `apps/web/src/pages/domains/DomainsHub.tsx`.
- [x] Add `adult-nursing` alias mappings in `apps/web/src/components/landing/ServiceCard.tsx`.
- [x] Route service cards through `/domains/:domain/services/:slug` for domain-first navigation.
- [x] Add `adult-nursing` fallback support in `apps/web/src/pages/services/ServicesHub.tsx`.
- [x] Add `adult-nursing` metadata in `apps/web/src/pages/services/ServicesHub.tsx`.
- [x] Rebuild `/services` to list CMS domains with service CTA buttons (no placeholder content).
- [x] Support `/domains/:domain/services/:slug` and `/domains/:domain/articles/:slug` links in `CmsSectionRenderer`.
- [x] Add domain fallback fetch in `DomainPage` when featured services/articles are missing.
- [x] Remove legacy pages (`Homepage.tsx`, `Services.tsx`, `LearningHub*`) and redirect `/services/:domain/*` to `/domains/:domain/*`.
- [x] Populate article domain filters from Strapi domains instead of static taxonomy.
- [x] Render homepage sections from Strapi `landing-section` entries with CMS-driven fallback content.
- [x] Add `adult-nursing` to Strapi domain enums and taxonomy fallbacks for services/articles/categories/testimonials.
- [x] Redesign `ServicePage`, `ArticlePage`, `ArticlesPage`, `AuthorsPage`, and `AuthorPage` to CMS-first editorial layouts with conditional sections (no placeholders).

## Active Fixes (Platform Hardening)
- [x] Use Clerk `publicMetadata.role` for admin gating in `Dashboard.tsx`.
- [x] Add `enterprise` + `general` domain entries to taxonomy fallbacks.
- [x] Support legacy `adult-health` content on canonical `adult-nursing` pages.
- [x] Centralize domain alias normalization for routing and CMS filters.
- [x] Remove mock order payloads from dashboard UI.

## Phase 1: Strapi Content Models ✓ COMPLETE

### Author Collection Type ✓
- [x] Create `apps/strapi/src/api/author/content-types/author/schema.json`
- [x] Fields: name, slug, bio, avatar, credentials, email, social links
- [x] Add relationship to articles
- [x] Add relationship to services

### Category Collection Type ✓
- [x] Create `apps/strapi/src/api/category/content-types/category/schema.json`
- [x] Fields: name, slug, description, icon, domain, order
- [x] Add relationship to articles

### Tag Collection Type ✓
- [x] Create `apps/strapi/src/api/tag/content-types/tag/schema.json`
- [x] Fields: name, slug, color

### Testimonial Collection Type ✓
- [x] Create `apps/strapi/src/api/testimonial/content-types/testimonial/schema.json`
- [x] Fields: quote, author_name, role, company, avatar, rating

### Article Schema (with x402) ✓
- [x] Add `author` relationship (many-to-one)
- [x] Add `categories` relationship (many-to-many)
- [x] Add `tags` relationship (many-to-many)
- [x] Add `related_articles` self-reference
- [x] Add `reading_time` computed field
- [x] Add `featured` boolean
- [x] Add `x402_price` decimal field
- [x] Add `x402_enabled` boolean field

### Service Schema (with x402) ✓
- [x] Add `author` relationship
- [x] Add `categories` relationship
- [x] Add `pricing_tiers` component
- [x] Add `x402_price` decimal field
- [x] Add `x402_enabled` boolean field

### New Components ✓
- [x] Create `content.rich-text` component
- [x] Create `content.code-block` component
- [x] Create `content.media-gallery` component
- [x] Create `content.cta` component
- [x] Create `pricing.tier` component
- [x] Create `author.credentials` component

---

## Phase 2: Public Pages ✓ COMPLETE

### Homepage Redesign ✓
- [x] Create `HomepageNew.tsx` with animated hero
- [x] Domain selection grid
- [x] Featured services section
- [x] Testimonials carousel
- [x] CTA sections

### Article Page ✓
- [x] CMS-first hero with domain/category + x402 indicator
- [x] Table of contents with scroll tracking
- [x] Social share buttons (Twitter, Facebook, LinkedIn, Copy)
- [x] Author bio panel and related articles grid
- [x] SEO meta tags via Helmet
- [x] View count increment on load

### Articles Index ✓
- [x] Editorial hero with search + domain/category filters
- [x] Featured layout with hero + horizontal cards
- [x] Grid/list toggle with CMS data

### Service Page ✓
- [x] CMS-first hero with domain navigation
- [x] Conditional features, pricing, attachments, testimonials, related services
- [x] x402 indicator and CTA flow to order

### Author Pages ✓
- [x] Authors index with search + featured toggle
- [x] Author profile with social links and published articles

---

## Phase 3: CMS Integration Hooks ✓ COMPLETE

### React Query Hooks (useCMS.ts) ✓
- [x] `useArticles(filters)` - List articles with pagination
- [x] `useArticle(slug)` - Get single article by slug
- [x] `useFeaturedArticles(limit)` - Featured articles
- [x] `useArticlesByDomain(domain, limit)` - Domain filtering
- [x] `useRelatedArticles(id, domain, limit)` - Related content
- [x] `useServices(filters)` - List services
- [x] `useService(slug)` - Single service
- [x] `useServicesByDomain(domain, limit)` - Domain services
- [x] `useTestimonials(domain?, featured?)` - Testimonials
- [x] `useIncrementViewCount()` - Mutation hook

### Context (CMSContext.tsx) ✓
- [x] `CMSProvider` - Context provider
- [x] `useCMSContext()` - Context hook
- [x] `useDomain(domain)` - Domain info with gradients
- [x] `useX402()` - x402 configuration
- [x] `resolveMediaUrl()` - Media URL helper
- [x] Domain constants (9 domains)

---

## Phase 4: Landing Components ✓ COMPLETE

### Component Library (8 components, 25+ variants)
- [x] `HeroSection` - 4 variants (default, centered, split, video)
- [x] `FeatureSection` - 3 variants (grid, list, alternating)
- [x] `ServiceCard` - 3 variants (default, compact, featured)
- [x] `PricingSection` - 3 variants (simple, featured, comparison)
- [x] `TestimonialSection` - 4 variants (cards, carousel, single, masonry)
- [x] `CTASection` - 3 variants (default, newsletter, split)
- [x] `FAQSection` - 2 variants (accordion, grid)
- [x] `TeamSection` - 3 variants (grid, list, featured)

---

## Phase 5: Admin Dashboard (NOT STARTED)

### Homepage Redesign
- [x] Add CMS section renderer (`CmsSectionRenderer.tsx`)
- [x] Create `components/landing/HeroSection.tsx`
- [x] Create `components/landing/FeaturedGrid.tsx`
- [x] Create `components/landing/DomainShowcase.tsx`
- [x] Create `components/landing/TestimonialSection.tsx`
- [ ] Create `components/landing/NewsletterCTA.tsx`
- [x] Redesign `pages/HomepageNew.tsx` (CMS section renderer wired)

### Article Pages
- [ ] Create `components/content/ArticleHero.tsx`
- [ ] Create `components/content/ArticleBody.tsx`
- [ ] Create `components/content/TableOfContents.tsx`
- [ ] Create `components/content/AuthorBio.tsx`
- [ ] Create `components/content/RelatedContent.tsx`
- [ ] Create `components/content/SocialShare.tsx`
- [ ] Create `pages/articles/[slug].tsx`
- [ ] Create `pages/articles/index.tsx`

### Domain Pages
- [ ] Create unified `pages/domains/[domain].tsx`
- [ ] Create `components/domain/DomainHero.tsx`
- [ ] Create `components/domain/DomainStats.tsx`
- [ ] Create `components/domain/ContentFeed.tsx`
- [ ] Create `components/domain/ExpertShowcase.tsx`

### Service Pages
- [ ] Enhance `pages/services/[slug].tsx`
- [ ] Create `components/services/ServiceHero.tsx`
- [ ] Create `components/services/PricingTable.tsx`
- [ ] Create `components/services/ServiceFeatures.tsx`

---

## Phase 3: Admin Dashboard

### Content Management
- [ ] Enhance `pages/admin/ContentManager.tsx`
- [ ] Create `components/admin/ContentEditor/Editor.tsx`
- [ ] Create `components/admin/ContentEditor/Toolbar.tsx`
- [ ] Create `components/admin/ContentEditor/Preview.tsx`
- [ ] Create `components/admin/MediaManager/Library.tsx`
- [ ] Create `components/admin/MediaManager/Upload.tsx`

### Publishing Workflow
- [ ] Create `components/admin/PublishingWorkflow/StatusBadge.tsx`
- [ ] Create `components/admin/PublishingWorkflow/Timeline.tsx`
- [ ] Create `components/admin/PublishingWorkflow/Actions.tsx`
- [ ] Implement draft → review → schedule → publish flow

### Analytics Dashboard
- [ ] Create `pages/admin/Analytics.tsx`
- [ ] Create `components/admin/AnalyticsDashboard/ViewsChart.tsx`
- [ ] Create `components/admin/AnalyticsDashboard/PopularContent.tsx`
- [ ] Create `components/admin/AnalyticsDashboard/AuthorStats.tsx`

---

## Phase 4: x402 Protocol

### Backend Integration
- [ ] Create `workers/x402-gateway/src/index.ts`
- [ ] Implement payment verification middleware
- [ ] Set up Lightning Network connection
- [ ] Create usage tracking database

### Frontend Integration
- [ ] Create `lib/x402.ts` client library
- [ ] Add payment gate components
- [ ] Create `components/x402/PaymentModal.tsx`
- [ ] Create `components/x402/UsageDisplay.tsx`

### API Enhancements
- [ ] Add x402 headers to content endpoints
- [ ] Implement rate limiting for free tier
- [ ] Create payment webhook handlers

---

## Phase 5: Quality & Polish

### Performance
- [ ] Implement lazy loading for images
- [ ] Add skeleton loaders
- [ ] Optimize bundle size
- [ ] Add caching headers

### SEO
- [ ] Implement dynamic meta tags
- [ ] Generate sitemap.xml
- [ ] Add structured data (JSON-LD)
- [ ] Implement canonical URLs

### Accessibility
- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Achieve WCAG 2.1 AA compliance

### Testing
- [ ] Add unit tests for CMS functions
- [ ] Add integration tests for API
- [ ] Add E2E tests for critical flows
- [ ] Performance testing

---

## Deployment

### Strapi
- [ ] Database migrations
- [ ] Content seeding
- [ ] Media storage configuration
- [ ] API permissions

### Web App
- [ ] Build optimization
- [ ] Environment variables
- [ ] CDN configuration
- [ ] Error tracking

### x402 Gateway
- [ ] Worker deployment
- [ ] Payment provider setup
- [ ] Monitoring
