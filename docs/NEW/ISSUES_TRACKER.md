# HandyWriterz - Production Issues Tracker

> This document tracks all identified issues, their status, and resolution steps.  
> Last Updated: December 28, 2025

---

## Issue Summary

| Priority | Total | Open | In Progress | Resolved |
|----------|-------|------|-------------|----------|
| P0 - Critical | 8 | 2 | 0 | 6 |
| P1 - High | 12 | 9 | 0 | 3 |
| P2 - Medium | 15 | 15 | 0 | 0 |
| P3 - Low | 10 | 10 | 0 | 0 |
| **Total** | **45** | **36** | **0** | **9** |

---

## Recent Session Updates (Dec 28, 2025)

### Build Status: ✅ PASSING
- TypeScript: No errors
- Vite Build: 4034 modules transformed, outputs to `dist/`

### Completed This Session:
1. **C-01**: Dashboard Monolith → OrderForm Module (8 files)
2. **C-06**: Orders.tsx Placeholder → Full API Integration
3. **C-07**: Dual CMS Clients → Unified lib/cms Module
4. **UI Fixes**: RoleGuard, DataTable, box, animated, form, Breadcrumbs
5. **Import Cleanup**: Removed MUI/Next.js imports, updated CMS imports

---

## P0 - Critical Issues (Blockers)

### C-01: Dashboard Monolithic Component
- **Status**: ✅ Resolved
- **Location**: `apps/web/src/components/Dashboard/Dashboard.tsx`
- **Lines**: 2027 → Now modularized
- **Impact**: Unmaintainable, untestable, performance issues
- **Description**: The Dashboard component was a massive 2027-line monolith containing order form, file upload, pricing calculator, admin features, and more.
- **Resolution**: 
  1. ✅ Extracted OrderForm module (8 files)
  2. ✅ Created `components/Dashboard/OrderForm/` directory
  3. ✅ Split into: types.ts, PriceCalculator.tsx, SupportAreaSelector.tsx, ServiceTypeSelector.tsx, FileUploadSection.tsx, OrderDetailsForm.tsx, OrderSummary.tsx, OrderFormContainer.tsx
  4. ✅ Updated NewOrder.tsx to use OrderFormContainer
- **Effort**: ✅ Completed
- **Dependencies**: None

### C-02: Strapi Backend Not Deployed
- **Status**: 🔴 Open
- **Location**: `apps/strapi/`
- **Impact**: No CMS functionality working
- **Description**: Strapi is configured but not properly deployed to Railway. Previous deployment used wrong builder (RAILPACK instead of DOCKERFILE).
- **Resolution**:
  1. Fix `apps/strapi/railway.json` to use DOCKERFILE builder
  2. Set up PostgreSQL on Railway
  3. Configure all environment variables
  4. Deploy and verify
- **Effort**: 1-2 days
- **Dependencies**: Railway account, PostgreSQL provisioning

### C-03: ~~Cloudflare Workers Not Deployed~~ OBSOLETE
- **Status**: ⚫ Obsolete (Architecture Changed)
- **Location**: N/A - Workers removed from stack
- **Impact**: None - functionality moved to Railway API
- **Description**: Originally planned to use Cloudflare Workers for:
  - upload-broker → Now handled by `apps/api/src/routes/uploads.ts` (R2 presigned URLs)
  - mm-auth → Now handled by `apps/api/src/routes/messaging.ts`
  - strapi-webhooks → Now handled by `apps/api/src/routes/webhooks.ts`
  - strapi-scheduler → Now handled by Railway cron jobs
  - subpath-router → Now handled by Railway routing
- **Resolution**: ✅ All functionality consolidated into Railway-hosted Express API
- **Effort**: 0 days (already complete)
- **Dependencies**: None

### C-04: Mock Orders Data in Production Code
- **Status**: ✅ Resolved
- **Location**: `apps/web/src/components/Dashboard/Dashboard.tsx:mockOrders`
- **Impact**: No real order tracking, fake data displayed
- **Description**: The dashboard uses a hardcoded `mockOrders` array instead of fetching real order data.
```typescript
const mockOrders = [
  { id: '1', status: 'completed', title: 'Research Paper', ... },
  ...
]
```
- **Resolution**:
  1. Removed mock order payload from the Dashboard UI
  2. Orders now render only when real API data is available
- **Effort**: 1 hour
- **Dependencies**: C-02 (Strapi deployment)
- **Notes**: Real order endpoints still required (see C-06).

### C-05: Empty/Dead Hook Files
- **Status**: ✅ Resolved
- **Location**: 
  - `apps/web/src/hooks/useMMAuth.ts` (EMPTY)
  - `apps/web/src/hooks/useChannels.ts` (EMPTY)
- **Impact**: Confusion, dead imports, potential runtime errors
- **Description**: Root-level hooks are empty files. Real implementations exist in `hooks/mattermost/` subfolder.
- **Resolution**:
  1. Deleted empty hooks
  2. Consolidated Mattermost hooks under `hooks/mattermost`
- **Effort**: 30 minutes
- **Dependencies**: None
- **Notes**: Removed unused hook files and updated imports to use `hooks/mattermost`.

### C-06: Orders Page is Placeholder
- **Status**: ✅ Resolved
- **Location**: `apps/web/src/pages/dashboard/Orders.tsx`
- **Impact**: Users cannot view their orders
- **Description**: Orders.tsx was a stub that just showed auth status. No actual order display functionality.
- **Resolution**:
  1. ✅ Implemented order list fetching with real API
  2. ✅ Added order detail view with OrderCard component
  3. ✅ Added order status tracking with badges
  4. ✅ Added filtering (all/active/completed)
  5. ✅ Added refresh functionality
  6. ✅ Added EmptyState component
- **Effort**: ✅ Completed
- **Dependencies**: C-04 (Order API)

### C-07: Dual CMS Client Architecture
- **Status**: ✅ Resolved
- **Location**: 
  - `apps/web/src/lib/cms.ts` (REST) → now `lib/cms/rest-client.ts`
  - `apps/web/src/lib/cms-client.ts` (GraphQL) → now `lib/cms/graphql-client.ts`
- **Impact**: Inconsistent data fetching, duplicate code, maintenance burden
- **Description**: Two completely separate CMS clients existed. Different components used different clients, causing inconsistency.
- **Resolution**:
  1. ✅ Created unified CMS module at `lib/cms/index.ts`
  2. ✅ Moved REST client to `lib/cms/rest-client.ts`
  3. ✅ Moved GraphQL client to `lib/cms/graphql-client.ts`
  4. ✅ Unified exports through single entry point
  5. Legacy files remain for backwards compatibility
- **Effort**: ✅ Completed
- **Dependencies**: C-02 (Strapi deployment)

### C-08: Schema Mismatch Between Strapi and Frontend
- **Status**: ✅ Resolved
- **Location**: 
  - `apps/strapi/src/api/service/content-types/service/schema.json`
  - `apps/web/src/config/taxonomy.json`
- **Impact**: Domain filtering may fail, content not appearing correctly
- **Description**: Strapi domain enum has different values than frontend taxonomy:
  - Strapi: `nursing, ai, crypto, marketing, enterprise, education, research`
  - Taxonomy: `adult-health, mental-health, child-nursing, social-work, technology, ai, crypto`
- **Resolution**:
  1. Aligned taxonomy slugs with Strapi enum
  2. Added `enterprise` + `general` to taxonomy
  3. Added alias support for legacy `adult-health`
- **Effort**: 1-2 days
- **Dependencies**: C-02 (Strapi deployment)

---

## P1 - High Priority Issues

### H-01: Admin Role Detection via Email Domain
- **Status**: ✅ Resolved
- **Location**: `apps/web/src/components/Dashboard/Dashboard.tsx`
- **Impact**: Security risk, unreliable admin detection
- **Description**: Admin detection uses email domain heuristic instead of proper Clerk roles:
```typescript
const isAdmin = user?.emailAddresses?.some(email => 
  email.emailAddress.includes('@handywriterz') || 
  email.emailAddress.includes('@admin')
);
```
- **Resolution**: Use `user.publicMetadata.role` as implemented in `useAuth.ts`
- **Effort**: 1 hour
- **Dependencies**: None
 - **Notes**: Dashboard now derives admin role from Clerk public metadata instead of email heuristics.

### H-02: Payment Gateways Incomplete
- **Status**: 🔴 Open
- **Location**: `apps/web/src/pages/payment/PaymentGateway.tsx`
- **Impact**: Only StableLink partially works, 3/4 gateways non-functional
- **Description**: 
  - StableLink: 🟡 Partial (API configured)
  - PayPal: 🔴 Not implemented
  - Stripe: 🔴 Not implemented
  - Coinbase: 🔴 Not implemented
- **Resolution**:
  1. Complete StableLink integration
  2. Add Stripe SDK integration
  3. Either implement PayPal/Coinbase or remove from UI
- **Effort**: 5-7 days
- **Dependencies**: Payment provider accounts

### H-03: Missing Error Boundaries
- **Status**: 🔴 Open
- **Location**: Throughout application
- **Impact**: Unhandled errors crash entire app
- **Description**: No React Error Boundaries to catch and handle component errors gracefully.
- **Resolution**:
  1. Create ErrorBoundary component
  2. Wrap route layouts
  3. Add error reporting (Sentry)
- **Effort**: 1-2 days
- **Dependencies**: None

### H-04: No Loading States for CMS Data
- **Status**: 🔴 Open
- **Location**: Various pages
- **Impact**: Blank screens during data fetch
- **Description**: Many components don't handle loading states properly when fetching from Strapi.
- **Resolution**: Add proper loading skeletons to all CMS-consuming components
- **Effort**: 1-2 days
- **Dependencies**: None

### H-05: Hardcoded Service Configuration
- **Status**: 🔴 Open
- **Location**: `apps/web/src/components/Orders/LegacyOrderForm.tsx`
- **Impact**: Can't modify services without code changes
- **Description**: Support areas, services, and pricing are hardcoded:
```typescript
const supportAreas = [
  'Adult Health Nursing',
  'Mental Health Nursing',
  ...
];
```
- **Resolution**: Move to Strapi or config file that can be updated dynamically
- **Effort**: 2-3 days
- **Dependencies**: C-02 (Strapi deployment)

### H-06: No Input Validation on Server
- **Status**: 🔴 Open
- **Location**: Workers and API endpoints
- **Impact**: Security vulnerability
- **Description**: While frontend has Zod validation, server-side validation is minimal.
- **Resolution**: Add Zod schemas to all worker endpoints
- **Effort**: 2-3 days
- **Dependencies**: None

### H-07: Missing CORS Configuration
- **Status**: 🔴 Open
- **Location**: `workers/*`
- **Impact**: API calls may fail from different origins
- **Description**: Workers have basic CORS but may not be properly configured for production domains.
- **Resolution**: Configure proper CORS with allowed origins
- **Effort**: 1 day
- **Dependencies**: C-03 (Worker deployment)

### H-08: Mattermost WebSocket Reconnection
- **Status**: 🟡 Partial
- **Location**: `apps/web/src/lib/mm-ws.ts`
- **Impact**: Messages may not sync after connection drop
- **Description**: WebSocket has reconnect logic but may not handle all edge cases.
- **Resolution**: Improve reconnection with exponential backoff and state recovery
- **Effort**: 1-2 days
- **Dependencies**: None

### H-09: No Order Status Updates
- **Status**: 🔴 Open
- **Location**: N/A (feature missing)
- **Impact**: Users can't track order progress
- **Description**: There's no mechanism for order status updates or notifications.
- **Resolution**: Implement order status workflow with notifications
- **Effort**: 3-5 days
- **Dependencies**: C-04 (Order API)

### H-10: Missing Admin Audit Log
- **Status**: 🔴 Open
- **Location**: Admin features
- **Impact**: No accountability for admin actions
- **Description**: Admin actions (content publish, user management) are not logged.
- **Resolution**: Add audit logging to all admin operations
- **Effort**: 2-3 days
- **Dependencies**: C-02 (Strapi deployment)

### H-11: File Upload Size Limits Not Enforced
- **Status**: 🔴 Open
- **Location**: `apps/web/src/hooks/useDocumentSubmission.ts`
- **Impact**: Large files could crash uploads or incur costs
- **Description**: No file size validation before upload initiation.
- **Resolution**: Add size limits and validation
- **Effort**: 1 day
- **Dependencies**: None

### H-12: Preview Token Security
- **Status**: 🔴 Open
- **Location**: `apps/web/src/lib/preview-tokens.ts`
- **Impact**: Preview tokens may be easily forged
- **Description**: Preview tokens use base64 encoding without proper signing.
- **Resolution**: Implement JWT-based preview tokens with signing
- **Effort**: 2 days
- **Dependencies**: None

---

## P2 - Medium Priority Issues

### M-01: TypeScript Strict Mode Violations
- **Status**: 🔴 Open
- **Description**: Many `any` types and type assertions throughout codebase
- **Resolution**: Enable strict mode, fix all type errors
- **Effort**: 3-5 days

### M-02: No Test Coverage
- **Status**: 🔴 Open
- **Description**: No unit or integration tests
- **Resolution**: Add Jest/Vitest, write tests for critical paths
- **Effort**: 5-10 days

### M-03: Console.log Statements in Production
- **Status**: 🔴 Open
- **Description**: Many debug logs left in code
- **Resolution**: Remove or replace with proper logging
- **Effort**: 1 day

### M-04: Inconsistent Error Handling
- **Status**: 🔴 Open
- **Description**: Some errors shown to user, some silently fail
- **Resolution**: Standardize error handling pattern
- **Effort**: 2-3 days

### M-05: Missing Retry Logic
- **Status**: 🔴 Open
- **Description**: API calls don't retry on failure
- **Resolution**: Add retry with exponential backoff
- **Effort**: 1-2 days

### M-06: No Rate Limiting
- **Status**: 🔴 Open
- **Description**: No rate limiting on workers or API calls
- **Resolution**: Implement rate limiting
- **Effort**: 2-3 days

### M-07: Missing SEO Optimization
- **Status**: 🔴 Open
- **Description**: Meta tags, Open Graph not fully implemented
- **Resolution**: Add SEO component to all public pages
- **Effort**: 2 days

### M-08: Accessibility Issues
- **Status**: 🔴 Open
- **Description**: ARIA labels, keyboard navigation incomplete
- **Resolution**: Audit and fix accessibility
- **Effort**: 3-5 days

### M-09: Missing 404 Page
- **Status**: 🟡 Partial
- **Description**: Basic 404 exists but not comprehensive
- **Resolution**: Improve 404 with suggestions
- **Effort**: 1 day

### M-10: No Offline Support
- **Status**: 🔴 Open
- **Description**: App doesn't work offline at all
- **Resolution**: Add service worker for basic offline
- **Effort**: 3-5 days

### M-11: Image Optimization
- **Status**: 🔴 Open
- **Description**: Images not optimized or lazy loaded
- **Resolution**: Add image optimization, lazy loading
- **Effort**: 2 days

### M-12: Bundle Size Not Optimized
- **Status**: 🔴 Open
- **Description**: No code splitting, large initial bundle
- **Resolution**: Add route-based code splitting
- **Effort**: 2-3 days

### M-13: Missing Breadcrumbs
- **Status**: 🔴 Open
- **Description**: No breadcrumb navigation
- **Resolution**: Add breadcrumbs to nested pages
- **Effort**: 1 day

### M-14: No User Profile Page
- **Status**: 🔴 Open
- **Description**: Users can't view/edit their profile
- **Resolution**: Add profile page with Clerk integration
- **Effort**: 2-3 days

### M-15: Missing Terms/Privacy Pages
- **Status**: 🔴 Open
- **Description**: Legal pages not implemented
- **Resolution**: Add legal pages with CMS content
- **Effort**: 1-2 days

---

## P3 - Low Priority Issues

### L-01: Dark Mode Incomplete
- **Status**: 🟡 Partial
- **Description**: Dark mode exists but some components not styled
- **Effort**: 1-2 days

### L-02: Print Styles Missing
- **Status**: 🔴 Open
- **Description**: Pages don't print well
- **Effort**: 1 day

### L-03: Mobile App Consideration
- **Status**: 🔴 Future
- **Description**: No native mobile app
- **Effort**: Weeks/Months

### L-04: Multi-language Support
- **Status**: 🔴 Future
- **Description**: Only English supported
- **Effort**: 5-10 days

### L-05: Social Login Options
- **Status**: 🔴 Open
- **Description**: Only email auth, no Google/GitHub login
- **Effort**: 1-2 days

### L-06: Order Export Feature
- **Status**: 🔴 Open
- **Description**: Can't export order history
- **Effort**: 1-2 days

### L-07: Admin Bulk Actions
- **Status**: 🔴 Open
- **Description**: No bulk publish/delete in admin
- **Effort**: 2-3 days

### L-08: Search Functionality
- **Status**: 🔴 Open
- **Description**: No global search
- **Effort**: 3-5 days

### L-09: Notification Preferences
- **Status**: 🔴 Open
- **Description**: Users can't control notifications
- **Effort**: 2-3 days

### L-10: Analytics Dashboard
- **Status**: 🔴 Open
- **Description**: No usage analytics for admins
- **Effort**: 5-7 days

---

## Resolution Progress Tracker

### Week 1 Goals
- [ ] Deploy Strapi to Railway (C-02)
- [ ] Deploy Workers to Cloudflare (C-03)
- [ ] Delete empty hook files (C-05)
- [ ] Fix admin role detection (H-01)

### Week 2 Goals
- [ ] Start Dashboard decomposition (C-01)
- [ ] Consolidate CMS clients (C-07)
- [ ] Fix schema mismatch (C-08)

### Week 3 Goals
- [ ] Implement Order API (C-04)
- [ ] Complete Orders page (C-06)
- [ ] Add error boundaries (H-03)

### Week 4 Goals
- [ ] Complete payment integrations (H-02)
- [ ] Add input validation (H-06)
- [ ] Fix CORS configuration (H-07)

---

## Notes

- Issues are tracked in order of business impact
- Effort estimates assume single developer
- Some issues may be resolved together
- Prioritization may change based on business needs

---

*Last reviewed: January 2025*
