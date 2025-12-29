# Source Inventory (apps/*/src)

This inventory is derived from scanning all `apps/**/src` files and cross-checking docs. It captures the intended feature surface and highlights areas that look duplicated or legacy.

## apps/web/src (Public + Dashboard)

### Public Content Experience
- **Homepage**: `HomepageNew.tsx` (CMS sections + fallback)
- **Domains**: `DomainsHub.tsx`, `DomainPage.tsx`
- **Services**: `/services` hub + `ServicePage.tsx`
- **Articles**: `ArticlesPage.tsx`, `ArticlePage.tsx`
- **Authors**: `AuthorsPage.tsx`, `AuthorPage.tsx`
- **Docs**: `ApiDocsPage.tsx`, `X402DocsPage.tsx`
- **Marketing**: About, Contact, FAQ, HowItWorks, Pricing, Support, Search, Terms, Privacy

### Dashboard (Customer)
- **Dashboard shell**: `DashboardLayout`, `DashboardWrapper`
- **Orders**: `pages/dashboard/Orders.tsx`
- **Documents**: `DocumentsUpload` + uploader components
- **Messages**: `Messages.tsx`, `UserMessaging.tsx`
- **Profile/Settings**: `Profile.tsx`, `Settings.tsx`

Note: duplicated dashboard components under `components/Dashboard/*` were removed when not referenced by the router. The canonical pages live under `pages/dashboard/*`.

### Admin (Operations)
- **Admin dashboard**: `AdminDashboard.tsx`
- **Content editor**: `ArticleEditor.tsx` (custom editor)
- **Publishing**: `ContentPublisher.tsx`
- **Messaging**: `AdminMessaging.tsx`
- **Turnitin reports**: `TurnitinReports.tsx`

### Content + CMS Integration
- `hooks/useCMS.ts` and `lib/cms.ts` (REST + React Query)
- `CMSContext.tsx` for domain config and media URL
- Landing components: Hero, FeaturedGrid, DomainShowcase, ServiceCard, ArticleCard, TestimonialSection
- Rich content renderer: `components/Services/RichContentRenderer.tsx`

### Cloudflare (Frontend)
- Direct Cloudflare SDK usage removed from the web app; all storage/signing should go through `apps/api`.

### Messaging (Mattermost)
- `lib/mm-client.ts`, `lib/mm-ws.ts`, `lib/mm-analytics.ts`
- Hooks consolidated under `hooks/mattermost/*` (legacy root-level hooks removed)

### Payments
- Payment pages under `pages/payment/*`
- Services: `paymentService.ts`, `stableLinkPaymentService.ts`
- UI: `components/Payments/*`

### Turnitin + Tools
- `TurnitinSubmission.tsx`, `turnitin-check.tsx`

### UI System
- Large component inventory under `components/ui/*`
- Toast + unused UI components consolidated and removed; remaining UI primitives are the canonical set.

## apps/api/src (Backend API)
- **Core routes**: `/routes/uploads.ts`, `/routes/payments.ts`, `/routes/messaging.ts`, `/routes/turnitin.ts`, `/routes/webhooks.ts`, `/routes/cms.ts`, `/routes/sitemap.ts`
- **Middleware**: logger + error handling
- **Clerk**: server helper in `lib/clerk.ts`

## apps/strapi/src (CMS)
- **Content types**: article, service, author, category, tag, testimonial, domain-page, landing-section
- **Components**: SEO, landing items, domain highlight/feature/faq
- **Services/controllers**: custom endpoints for domain pages, landing sections

## Notable Duplication / Cleanup Targets
- Toast system consolidated on `react-hot-toast` (duplicates removed).
- Mattermost hooks consolidated on `hooks/mattermost/*` (legacy hooks removed).
- Orders UX split between `components/Dashboard/Dashboard.tsx` and `pages/dashboard/*` (still needs consolidation).
- Legacy order form still present (`LegacyOrderForm.tsx`) and used by `/dashboard/new-order`.

These will be prioritized in the cleanup phase.
