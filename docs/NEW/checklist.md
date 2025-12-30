# HandyWriterz Feature Implementation Checklist

> Reference knowledge base: `docs/intel.md` (HandyWriterz Architecture Intel). Every feature below maps to explicit evidence tags (`[TAG]`) from that document. Status codes distinguish fully delivered capabilities from partial or outstanding work.
>
> **Status legend**
> - ✅ Fully implemented end to end (feature works in production/staging with code in repo)
> - 🟡 Partially implemented (feature exists but requires follow-up, instrumentation, or coverage to meet target scope)
> - ⛔ Pending (planned in roadmap, no working implementation yet)
> - 🚫 Not started / blocked (explicitly called out as absent or deferred)
>
> Formatting: Each feature block includes Description, Status, Evidence, Dependencies, and Outstanding Work. Blocks are grouped by domain. Feature IDs are unique.

---

## 1. Platform Core & Monorepo Hygiene

### Feature F-001: pnpm monorepo scaffolding
- **Description:** Ensure `pnpm-workspace.yaml` orchestrates apps (`web`, `strapi`, `mattermost`) and workers.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-12][COMP-01][COMP-14][COMP-41]`
- **Dependencies:** Node 18+, pnpm, workspace config committed.
- **Outstanding Work:** None.

### Feature F-002: Unified package management scripts
- **Description:** Provide per-app scripts (`dev`, `build`, `type-check`) across workspace packages.
- **Status:** 🟡 partially implemented (missing successful TypeScript pass)
- **Evidence:** `[OVERVIEW-12][OBS-31]`
- **Dependencies:** `package.json` scripts, pnpm tasks.
- **Outstanding Work:** Resolve `tsc` failures noted in terminal context and integrate lint pipeline.

### Feature F-003: Shared documentation index
- **Description:** Maintain aligned architecture docs in `docs/` and root guides describing stack.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-25][COMP-45][COMP-48][ROADMAP-68]`
- **Dependencies:** `docs/context.md`, `docs/dataflow.md`, `docs/intel.md`.
- **Outstanding Work:** Regular review when services evolve.

### Feature F-004: Root README with quick start
- **Description:** Provide onboarding instructions for repo and tooling.
- **Status:** 🟡 partially implemented (baseline README exists, but lacks Strapi/Mattermost run steps)
- **Evidence:** `[ROADMAP-37][OVERVIEW-25]`
- **Dependencies:** README maintenance.
- **Outstanding Work:** Expand README per roadmap item 37.

### Feature F-005: Workspace lint configuration
- **Description:** Establish ESLint/Prettier/Tailwind configs under `apps/web`.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-14][COMP-55][FRONTEND-30]`
- **Dependencies:** `apps/web/eslint.config.js`, `tailwind.config.cjs`.
- **Outstanding Work:** Integrate CI enforcement.

### Feature F-006: Typescript project references
- **Description:** Provide `tsconfig` layering for web app and shared types.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-14][COMP-55][OBS-31]`
- **Dependencies:** `tsconfig.app.json`, `tsconfig.json`.
- **Outstanding Work:** Address outstanding type errors to restore clean checks.

### Feature F-007: Vite-based SPA bootstrap
- **Description:** Boot React 18 SPA with Vite 5 configuration.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-02][COMP-14][COMP-55]`
- **Dependencies:** `apps/web/vite.config.ts`.
- **Outstanding Work:** None.

### Feature F-008: React Router navigation contract
- **Description:** Maintain marketing and dashboard routes in `router.tsx`.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-02][COMP-16][FRONTEND-09]`
- **Dependencies:** React Router v6.
- **Outstanding Work:** Extend when new routes appear (e.g., analytics deep dive).

### Feature F-009: Polyfill and global style loading
- **Description:** Guarantee `polyfills.ts`, Tailwind, and base CSS load before app boot.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-57][COMP-58][COMP-59]`
- **Dependencies:** `main.tsx`, `polyfills.ts`.
- **Outstanding Work:** Monitor when adding new browser targets.

### Feature F-010: Environment schema validation
- **Description:** Validate Vite environment variables using Zod.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-30][SECURITY-24][SECURITY-25]`
- **Dependencies:** `apps/web/src/env.ts`.
- **Outstanding Work:** Expand schema when new env keys added.

---

## 2. Authentication & Identity

### Feature F-011: Clerk provider integration
- **Description:** Wrap SPA with `ClerkProvider`, ensuring router interplay.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-03][FRONTEND-11][SECURITY-01]`
- **Dependencies:** `main.tsx`, `ClerkProvider` configuration.
- **Outstanding Work:** None.

### Feature F-012: useAuth hook exposing metadata
- **Description:** Provide hook returning `userRole`, `isAdmin`, `isEditor`, `logout`.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-02][FRONTEND-33][ADMIN-01]`
- **Dependencies:** `apps/web/src/hooks/useAuth.ts`.
- **Outstanding Work:** Keep role logic synced with Clerk metadata schema.

### Feature F-013: Dashboard auth guard
- **Description:** Gate `/dashboard` routes behind Clerk session check.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-09][FRONTEND-13][SECURITY-05]`
- **Dependencies:** `DashboardWrapper`.
- **Outstanding Work:** None.

### Feature F-014: Admin route protection
- **Description:** Restrict `/admin` pages to `admin` or `editor` roles.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-46][ADMIN-04][SECURITY-43]`
- **Dependencies:** `AdminDashboard.tsx`, `useAuth`.
- **Outstanding Work:** Add server-side gating when Strapi SSO arrives.

### Feature F-015: Signed-in/out navbar states
- **Description:** Switch CTA vs dashboard link via Clerk components.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-05][FRONTEND-06][SECURITY-07]`
- **Dependencies:** `Navbar.tsx`.
- **Outstanding Work:** Ensure new nav items respect state.

### Feature F-016: Redirect-on-logout handling
- **Description:** Provide `logout` with error catch and redirect fallback.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-03][FRONTEND-33]`
- **Dependencies:** `useAuth.ts`.
- **Outstanding Work:** None.

### Feature F-017: Clerk OIDC for Mattermost
- **Description:** Use Clerk as IdP for Mattermost SSO.
- **Status:** ⛔ pending
- **Evidence:** `[MM-06][ROADMAP-03][SECURITY-45]`
- **Dependencies:** Mattermost OIDC config, Clerk app.
- **Outstanding Work:** Configure OIDC, test session bridging.

### Feature F-018: Clerk ↔ Strapi SSO
- **Description:** Map Clerk identities to Strapi admin login.
- **Status:** ⛔ pending
- **Evidence:** `[STRAPI-27][ROADMAP-03]`
- **Dependencies:** Strapi Enterprise SSO plugin or Access gateway.
- **Outstanding Work:** Evaluate licensing, implement bridging worker.

### Feature F-019: Email verification enforcement
- **Description:** Confirm verified email before granting dashboard access.
- **Status:** 🚫 not started
- **Evidence:** (No direct reference; implied gap)
- **Dependencies:** Clerk configuration.
- **Outstanding Work:** Set Clerk requirement, update onboarding doc.

### Feature F-020: Session timeout handling
- **Description:** Handle Clerk session expiry gracefully in dashboard.
- **Status:** 🟡 partially implemented (default Clerk behavior, but lacking custom UI messaging)
- **Evidence:** `[FRONTEND-13][SECURITY-05]`
- **Dependencies:** Clerk session listeners.
- **Outstanding Work:** Add toast/in-app message when session refresh fails.

---

## 3. Strapi Content Types & API Surface

### Feature F-021: Service collection type schema
- **Description:** Define Strapi `service` type with slug, hero, SEO, attachments.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-01][STRAPI-04][STRAPI-28]`
- **Dependencies:** Strapi schema JSON.
- **Outstanding Work:** Monitor for additional fields (e.g., pricing tiers).

### Feature F-022: Article collection type schema
- **Description:** Define Strapi `article` type with author, gallery, metrics.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-01][STRAPI-05][STRAPI-29]`
- **Dependencies:** Strapi schema JSON.
- **Outstanding Work:** Extend attachments for audio/podcast if required.

### Feature F-023: SEO component reuse
- **Description:** Provide reusable Strapi component for SEO metadata.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-06][STRAPI-60]`
- **Dependencies:** `apps/strapi/src/components/seo`.
- **Outstanding Work:** Add canonical URL field.

### Feature F-024: Strapi REST API consumption from SPA
- **Description:** Use `cms.ts` to fetch service lists/details.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-25][PUBLISH-03][PUBLISH-06]`
- **Dependencies:** `fetchServicesList`, `fetchServiceBySlug`.
- **Outstanding Work:** Add caching headers when Strapi caches introduced.

### Feature F-025: Strapi GraphQL admin queries
- **Description:** `cms-client.ts` executes article/service GraphQL operations.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-10][STRAPI-13][FRONTEND-47]`
- **Dependencies:** `graphql-request`, admin token.
- **Outstanding Work:** Harden error handling; add query retries.

### Feature F-026: GraphQL mutations for article lifecycle
- **Description:** Create/update/publish/delete article mutations.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-15][STRAPI-16][STRAPI-17][STRAPI-19]`
- **Dependencies:** `cms-client.ts` mutation exports.
- **Outstanding Work:** Connect to admin UI for direct editing.

### Feature F-027: GraphQL service hero query
- **Description:** Fetch service hero CTA, sections, SEO via GraphQL.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-13][FRONTEND-47]`
- **Dependencies:** GraphQL query definitions.
- **Outstanding Work:** Use in SPA once admin analytics require hero data.

### Feature F-028: Domain-based filtering filters
- **Description:** Support `filters[domain]=...` for service queries.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-20][FRONTEND-63][PUBLISH-15]`
- **Dependencies:** Query builder in `cms.ts`.
- **Outstanding Work:** Add multi-domain support.

### Feature F-029: Publication state toggles (LIVE vs PREVIEW)
- **Description:** Use `publicationState=preview` for draft retrieval.
- **Status:** ✅ fully implemented (available in utilities; preview UI partially wired)
- **Evidence:** `[CREATION-13][STRAPI-44]`
- **Dependencies:** `cms.ts` query parameters.
- **Outstanding Work:** Fully integrate with admin preview page (see F-065).

### Feature F-030: Strapi upload provider to R2
- **Description:** Connect Strapi uploads to Cloudflare R2 via AWS S3 provider.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-07][STRAPI-08][STRAPI-60]`
- **Dependencies:** `config/plugins.ts`.
- **Outstanding Work:** Add AV metadata tagging once pipeline ready.

### Feature F-031: Strapi database configuration (Postgres)
- **Description:** Configure Strapi `database.ts` to use Postgres connection strings.
- **Status:** ✅ fully implemented
- **Evidence:** `[STRAPI-05][STRAPI-34]`
- **Dependencies:** `DATABASE_URL` env.
- **Outstanding Work:** Document local Postgres spin-up in README.

### Feature F-032: Strapi webhooks for publish events
- **Description:** Emit events to FE or worker when entries publish.
- **Status:** ⛔ pending
- **Evidence:** `[CREATION-18][ROADMAP-22]`
- **Dependencies:** Strapi webhook config, worker endpoint.
- **Outstanding Work:** Implement webhook target and cache purge.

### Feature F-033: Strapi scheduled publishing
- **Description:** Schedule `publishedAt` in future with automation.
- **Status:** 🟡 partially implemented (manual `publishedAt` support, automation pending)
- **Evidence:** `[CREATION-09][ROADMAP-46]`
- **Dependencies:** Strapi scheduling features.
- **Outstanding Work:** Add UI + CRON check.

### Feature F-034: Strapi localization support
- **Description:** Enable i18n plugin for multi-locale content.
- **Status:** ⛔ pending
- **Evidence:** `[STRAPI-41][ROADMAP-48]`
- **Dependencies:** Strapi i18n plugin.
- **Outstanding Work:** Define locales, update frontend fetchers.

---

## 4. Content Authoring Workflow

### Feature F-035: Editor login flow guidance
- **Description:** Document how editors access Strapi admin (Clerk future, local now).
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-01][STRAPI-27]`
- **Dependencies:** Docs, Strapi admin credentials.
- **Outstanding Work:** Update once Clerk SSO lands.

### Feature F-036: Service authoring fields completeness
- **Description:** Ensure editors capture title, summary, domain, tags, body, hero, attachments.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-04][CREATION-05][CREATION-07]`
- **Dependencies:** Strapi UI.
- **Outstanding Work:** Add validation for tag taxonomy alignment.

### Feature F-037: Attachment upload guidance
- **Description:** Provide instructions for uploading hero images and attachments via Strapi.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-05][CREATION-07][STRAPI-60]`
- **Dependencies:** Strapi media library.
- **Outstanding Work:** Document R2 quotas.

### Feature F-038: SEO best practices for editors
- **Description:** Document SEO component fields and expectations.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-08][PUBLISH-41]`
- **Dependencies:** `seo` component.
- **Outstanding Work:** Add canonical linking once implemented.

### Feature F-039: Preview token workflow
- **Description:** Provide mechanism to copy preview token and view draft in SPA.
- **Status:** 🟡 partially implemented (token generation documented, UI integration pending)
- **Evidence:** `[CREATION-11][CREATION-12][ROADMAP-19]`
- **Dependencies:** Strapi preview tokens, front-end preview route.
- **Outstanding Work:** Build preview page in admin dashboard.

### Feature F-040: Draft review process
- **Description:** Use Strapi Draft & Publish to collaborate before go-live.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-24][STRAPI-58]`
- **Dependencies:** Strapi default workflow.
- **Outstanding Work:** Add comment plugin if needed.

### Feature F-041: Publication checklist
- **Description:** Document pre-publish steps (timing, attachments, SEO, fallback).
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-46][CREATION-67][ROADMAP-70]`
- **Dependencies:** docs and admin quick actions.
- **Outstanding Work:** Link to QA automation once available.

### Feature F-042: Domain taxonomy alignment
- **Description:** Align `domain` field with `config/taxonomy.ts` definitions.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-26][COMP-50][PUBLISH-15]`
- **Dependencies:** Strapi domain field choices.
- **Outstanding Work:** Add invariants to prevent mismatch.

### Feature F-043: Content migration from Microfeed
- **Description:** Port Microfeed JSON into Strapi.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-17][OVERVIEW-07]`
- **Dependencies:** Migration scripts in `apps/strapi/scripts`.
- **Outstanding Work:** Build importer, cross-verify data.

### Feature F-044: Attachment naming conventions
- **Description:** Document how to name attachments (prefix, user-friendly).
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-45][FILES-20]`
- **Dependencies:** Strapi instructions, R2 guidelines.
- **Outstanding Work:** Provide automation script to rename on upload.

### Feature F-045: Editorial rollback strategy
- **Description:** Outline steps to revert service/article to prior version.
- **Status:** 🟡 partially implemented (manual steps via Strapi version history; plugin pending)
- **Evidence:** `[CREATION-32][ADMIN-55]`
- **Dependencies:** Strapi draft history.
- **Outstanding Work:** Install versioning plugin for richer diff.

### Feature F-046: Persona-driven content planning
- **Description:** Align content to personas (students, professionals) per dataflow doc.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-49][OVERVIEW-64][docs/dataflow.md personas]`
- **Dependencies:** Editorial guidelines.
- **Outstanding Work:** Automate persona tagging in Strapi.

### Feature F-047: Preview sharing externally
- **Description:** Provide preview URL to stakeholders without publishing.
- **Status:** 🟡 partially implemented (concept documented; secure preview gating incomplete)
- **Evidence:** `[CREATION-12][CREATION-50]`
- **Dependencies:** Preview route security.
- **Outstanding Work:** Add token validation + expiry.

### Feature F-048: Content QA on staging
- **Description:** Document QA checklist for verifying Strapi content on staging.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-47][ROADMAP-40]`
- **Dependencies:** docs, staging environment.
- **Outstanding Work:** Automate with Playwright tests.

---

## 5. Front-end Content Surfaces

### Feature F-049: Homepage hero and CTA logic
- **Description:** Render hero with dynamic CTA based on auth state; smooth scroll to services.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-01][FRONTEND-02][FRONTEND-62]`
- **Dependencies:** `HomepageNew.tsx`.
- **Outstanding Work:** Hook hero list to Strapi (see F-055).

### Feature F-050: Homepage feature list animations
- **Description:** Animate features with `framer-motion` for marketing impact.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-38][FRONTEND-04]`
- **Dependencies:** `framer-motion` components.
- **Outstanding Work:** None.

### Feature F-051: Navbar service dropdown
- **Description:** Provide service navigation aligned to domain taxonomy.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-07][COMP-30][OVERVIEW-32]`
- **Dependencies:** `Navbar.tsx` service links.
- **Outstanding Work:** Convert to dynamic fetch from Strapi (roadmap F-055).

### Feature F-052: RootLayout marketing shell
- **Description:** Wrap marketing routes with Navbar, Footer, Toaster.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-11][COMP-29][FRONTEND-30]`
- **Dependencies:** `RootLayout.tsx`.
- **Outstanding Work:** None.

### Feature F-053: DashboardLayout app shell
- **Description:** Provide sidebar, header, and nested routing for authed experience.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-12][COMP-29]`
- **Dependencies:** `DashboardLayout.tsx`.
- **Outstanding Work:** Add responsive collapse.

### Feature F-054: Services list page with Strapi data
- **Description:** Render service cards using `fetchServicesList` with skeleton states.
- **Status:** ✅ fully implemented
- **Evidence:** `[PUBLISH-03][PUBLISH-10][FRONTEND-63]`
- **Dependencies:** `ServicesHub.tsx`.
- **Outstanding Work:** Expand filtering UI.

### Feature F-055: Services domain view
- **Description:** Filter services by domain parameter, show metadata.
- **Status:** ✅ fully implemented
- **Evidence:** `[PUBLISH-15][FRONTEND-63][FRONTEND-67]`
- **Dependencies:** `DomainPage.tsx` and `ServicesHub.tsx`.
- **Outstanding Work:** Replace static homepage service list with domain data.

### Feature F-056: Service detail attachments
- **Description:** Render attachments with type-specific UI and download links.
- **Status:** ✅ fully implemented
- **Evidence:** `[PUBLISH-06][PUBLISH-27][PUBLISH-58]`
- **Dependencies:** `mapServiceDetail`, `RichContentRenderer`.
- **Outstanding Work:** Add preview for videos (if required).

### Feature F-057: Microfeed fallback rendering
- **Description:** On Strapi miss, fallback to Microfeed via MDX components.
- **Status:** ✅ fully implemented
- **Evidence:** `[PUBLISH-08][PUBLISH-21][PUBLISH-52]`
- **Dependencies:** `lib/api.ts`, `MDXRenderer.tsx`.
- **Outstanding Work:** Monitor usage to plan retirement.

### Feature F-058: Domain analytics stubs
- **Description:** Render analytics placeholders (top tags, engagement) while real data pending.
- **Status:** 🟡 partially implemented (UI present, real data pending)
- **Evidence:** `[FRONTEND-63][FRONTEND-66][FRONTEND-67]`
- **Dependencies:** Domain page components.
- **Outstanding Work:** Integrate Strapi analytics fields once available.

### Feature F-059: Dashboard pricing calculator
- **Description:** Provide cost estimation form with word count, service type, academic level.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-19][FRONTEND-21][FRONTEND-31]`
- **Dependencies:** `Dashboard.tsx` calculator.
- **Outstanding Work:** Link to payment flow automatically.

### Feature F-060: Dashboard order submission CTA
- **Description:** Open messaging/support channels when order ready for handoff.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-17][FRONTEND-18][ADMIN-27]`
- **Dependencies:** Buttons linking to support channels, toasts.
- **Outstanding Work:** Connect to backend order API in future.

### Feature F-061: Documents upload UI
- **Description:** Provide drag-and-drop, file validation, progress display, history list.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-34][FILES-01][FILES-52]`
- **Dependencies:** `DocumentsUpload.tsx`, `useDocumentSubmission`.
- **Outstanding Work:** Persist history beyond session (roadmap F-086).

### Feature F-062: Copy download link
- **Description:** Provide button to copy presigned URL for uploaded document.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-39][FILES-28][FILES-30]`
- **Dependencies:** `navigator.clipboard`, transforms.
- **Outstanding Work:** Add audit logging when copying.

### Feature F-063: Mattermost embed on dashboard
- **Description:** Render iframe with environment-driven URL and fallback warning.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-42][FRONTEND-44][MM-10]`
- **Dependencies:** `MessageCenter.tsx`, env var.
- **Outstanding Work:** Replace with native client (see F-106).

### Feature F-064: Admin dashboard metrics cards
- **Description:** Display article counts, views, likes, comments with animations.
- **Status:** 🟡 partially implemented (UI ready, live data placeholder)
- **Evidence:** `[FRONTEND-46][FRONTEND-48][FRONTEND-55][STRAPI-63]`
- **Dependencies:** `AdminDashboard.tsx`.
- **Outstanding Work:** Wire to real analytics fields.

### Feature F-065: Admin article preview launchpad
- **Description:** Provide quick link to preview article before publishing.
- **Status:** ⛔ pending
- **Evidence:** `[FRONTEND-46][ROADMAP-19][STRAPI-27]`
- **Dependencies:** Admin UI updates, preview token usage.
- **Outstanding Work:** Build route and integrate tokens.

### Feature F-066: Admin content search
- **Description:** Search bar to filter articles/services.
- **Status:** 🟡 partially implemented (UI present, search handler pending)
- **Evidence:** `[FRONTEND-56][ADMIN-18]`
- **Dependencies:** GraphQL search query.
- **Outstanding Work:** Implement GraphQL filter invocation.

### Feature F-067: Admin domain filters
- **Description:** Filter analytics by domain inside admin dashboard.
- **Status:** 🟡 partially implemented (UI toggles exist, data binding pending)
- **Evidence:** `[FRONTEND-57][ADMIN-15][ADMIN-31]`
- **Dependencies:** GraphQL domain filters.
- **Outstanding Work:** Connect to Strapi aggregated metrics.

### Feature F-068: Admin quick action navigation
- **Description:** Provide quick links to content creation, media upload, user management, messaging, analytics, settings.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-50][ADMIN-07][ADMIN-09]`
- **Dependencies:** Admin dashboard quick action buttons.
- **Outstanding Work:** Wire to actual routes when pages built.

### Feature F-069: Admin activity feed
- **Description:** Show recent content events (created, published) in feed.
- **Status:** 🟡 partially implemented (list draws from placeholder data)
- **Evidence:** `[FRONTEND-49][ADMIN-13]`
- **Dependencies:** GraphQL `recentArticles` query.
- **Outstanding Work:** Replace placeholder with real query results.

### Feature F-070: Support CTA integration
- **Description:** Provide quick links to messaging, email, and external channels for assistance.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-17][FRONTEND-18][MM-10]`
- **Dependencies:** Buttons linking to channels.
- **Outstanding Work:** None.

---

## 6. Admin & Governance Capabilities

### Feature F-071: Admin role enforcement in UI
- **Description:** Hide admin-only content from non-admin users.
- **Status:** ✅ fully implemented
- **Evidence:** `[ADMIN-01][ADMIN-04][SECURITY-43]`
- **Dependencies:** `useAuth`.
- **Outstanding Work:** Add server enforcement when API endpoints exist.

### Feature F-072: Access denied fallback page
- **Description:** Render friendly message and redirect option for unauthorized visitors to admin pages.
- **Status:** ✅ fully implemented
- **Evidence:** `[ADMIN-05][ADMIN-61]`
- **Dependencies:** Admin dashboard component check.
- **Outstanding Work:** None.

### Feature F-073: Admin metrics oversight
- **Description:** Provide aggregated counts for published/draft articles.
- **Status:** 🟡 partially implemented (UI in place; data placeholder)
- **Evidence:** `[FRONTEND-48][ADMIN-12][STRAPI-63]`
- **Dependencies:** GraphQL metrics.
- **Outstanding Work:** Hook to Strapi analytics.

### Feature F-074: Admin quick navigation to media uploads
- **Description:** Shortcut to Strapi media management view.
- **Status:** ✅ fully implemented
- **Evidence:** `[ADMIN-07][FRONTEND-50]`
- **Dependencies:** Quick action linking to `/admin/media/upload`.
- **Outstanding Work:** Build target page when Strapi embedded or proxied.

### Feature F-075: Admin user management shortcut
- **Description:** Link to user management interface.
- **Status:** 🟡 partially implemented (link exists, page stub pending)
- **Evidence:** `[FRONTEND-50][ADMIN-08]`
- **Dependencies:** Quick action.
- **Outstanding Work:** Implement user management UI.

### Feature F-076: Admin message oversight link
- **Description:** Provide quick navigation to messaging oversight.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-50][ADMIN-26]`
- **Dependencies:** Quick action linking to `/admin/messages`.
- **Outstanding Work:** Build oversight view (see F-109).

### Feature F-077: Admin analytics quick link
- **Description:** Provide navigation to analytics hub.
- **Status:** 🟡 partially implemented (link exists; page incomplete)
- **Evidence:** `[FRONTEND-50][ROADMAP-50]`
- **Dependencies:** Quick action.
- **Outstanding Work:** Build analytics page with real data.

### Feature F-078: Admin settings access
- **Description:** Provide quick action to platform settings page.
- **Status:** 🟡 partially implemented (link exists; page stub pending)
- **Evidence:** `[FRONTEND-50][ROADMAP-31]`
- **Dependencies:** Quick action.
- **Outstanding Work:** Build settings UI referencing Strapi config.

### Feature F-079: Admin file review workflow
- **Description:** Provide pipeline for reviewing uploads, verifying AV status, and closing tasks.
- **Status:** ⛔ pending
- **Evidence:** `[ADMIN-27][FILES-15][ROADMAP-13]`
- **Dependencies:** Persist metadata, build UI.
- **Outstanding Work:** Add backend to log uploads + admin list view.

### Feature F-080: Admin governance documentation
- **Description:** Maintain governance guidelines for content moderation and workflow.
- **Status:** ✅ fully implemented
- **Evidence:** `[CREATION-46][ADMIN-39][ROADMAP-40]`
- **Dependencies:** docs folder.
- **Outstanding Work:** Update as policies change.

### Feature F-081: Admin SLA monitoring
- **Description:** Monitor service level adherence (message response, publish times).
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-23][ROADMAP-62]`
- **Dependencies:** Analytics pipeline.
- **Outstanding Work:** Capture metrics from Mattermost/Strapi and display in admin UI.

### Feature F-082: Admin export/compliance tooling
- **Description:** Provide data export for compliance (Mattermost & Strapi).
- **Status:** ⛔ pending
- **Evidence:** `[MM-19][ADMIN-49][ROADMAP-30]`
- **Dependencies:** Export scripts, UI.
- **Outstanding Work:** Build connectors for Strapi and Mattermost exports.

### Feature F-083: Admin content scheduling calendar
- **Description:** Visualize upcoming publish dates.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-46][ADMIN-66]`
- **Dependencies:** Scheduling data.
- **Outstanding Work:** Build calendar UI and integrate Strapi scheduling.

### Feature F-084: Admin collaborator visibility
- **Description:** Show authors/editors per article in UI.
- **Status:** ✅ fully implemented (data pulled in GraphQL response; UI displays tags)
- **Evidence:** `[STRAPI-11][FRONTEND-48][ADMIN-50]`
- **Dependencies:** GraphQL article query.
- **Outstanding Work:** Display avatars once available.

### Feature F-085: Admin legal compliance checklist
- **Description:** Provide checklist for educational compliance during publication.
- **Status:** 🟡 partially implemented (docs note compliance; UI integration pending)
- **Evidence:** `[ADMIN-56][ROADMAP-60]`
- **Dependencies:** docs.
- **Outstanding Work:** Surface as UI overlay.

---

## 7. Mattermost Messaging

### Feature F-086: Mattermost Docker environment
- **Description:** Provide docker-compose with Mattermost + Postgres, plus bootstrap script.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-11][COMP-12][COMP-13][MM-01]`
- **Dependencies:** Docker, Compose.
- **Outstanding Work:** Document start instructions in README.

### Feature F-087: Mattermost R2 file storage config
- **Description:** Configure `mattermost.json` to use R2 S3-compatible storage.
- **Status:** ✅ fully implemented
- **Evidence:** `[MM-04][MM-07][FILES-60]`
- **Dependencies:** config file.
- **Outstanding Work:** Add environment templating for secrets.

### Feature F-088: Dashboard embed of Mattermost
- **Description:** Expose Mattermost web UI via iframe with environment variable control.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-42][MM-10][SECURITY-08]`
- **Dependencies:** `MessageCenter.tsx`.
- **Outstanding Work:** Add theme alignment.

### Feature F-089: Missing config alert
- **Description:** Display callout when `VITE_MATTERMOST_URL` absent.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-44][SECURITY-08]`
- **Dependencies:** `MessageCenter` fallback.
- **Outstanding Work:** Provide link to setup guide.

### Feature F-090: Support instructions overlay
- **Description:** Describe messaging expectations to user around Mattermost embed.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-43][MM-26]`
- **Dependencies:** `MessageCenter` copy.
- **Outstanding Work:** Add dynamic status indicator once SSO integrated.

### Feature F-091: Native REST/WS integration
- **Description:** Replace iframe with React client talking to Mattermost API/WebSocket.
- **Status:** ⛔ pending
- **Evidence:** `[MM-14][ROADMAP-05]`
- **Dependencies:** API client, token bridging.
- **Outstanding Work:** Build service, ensure data transforms.

### Feature F-092: Clerk SSO bridging for Mattermost
- **Description:** Sign user into Mattermost automatically via Clerk.
- **Status:** ⛔ pending
- **Evidence:** `[MM-06][ROADMAP-03]`
- **Dependencies:** OIDC config, session exchange service.
- **Outstanding Work:** Build handshake worker or server route.

### Feature F-093: Attachment AV gating in Mattermost
- **Description:** Ensure attachments scanned before download (R2 metadata check).
- **Status:** 🟡 partially implemented (R2 pipeline planned, enforcement pending)
- **Evidence:** `[MM-22][FILES-44][ROADMAP-10]`
- **Dependencies:** Worker, R2 metadata.
- **Outstanding Work:** Implement gating check in worker + Mattermost plugin.

### Feature F-094: Support analytics from Mattermost
- **Description:** Gather message volume, response time for admin dashboards.
- **Status:** ⛔ pending
- **Evidence:** `[MM-41][ROADMAP-01][ROADMAP-07]`
- **Dependencies:** Mattermost API queries, dashboards.
- **Outstanding Work:** Fetch data, expose in admin UI.

### Feature F-095: Mattermost compliance exports
- **Description:** Provide ability to export channel history for compliance.
- **Status:** ⛔ pending
- **Evidence:** `[MM-19][ROADMAP-30]`
- **Dependencies:** Mattermost admin config.
- **Outstanding Work:** Document process, integrate into admin quick actions.

### Feature F-096: Mattermost message notifications
- **Description:** Notify dashboard of new messages (toast/indicator).
- **Status:** 🚫 not started
- **Evidence:** `[MM-14][ROADMAP-05]`
- **Dependencies:** WebSocket integration.
- **Outstanding Work:** Implement once native client built.

### Feature F-097: Messaging channel naming conventions
- **Description:** Document naming pattern for organization/ticket channels.
- **Status:** ✅ fully implemented
- **Evidence:** `[MM-17][MM-24]`
- **Dependencies:** Operational runbooks.
- **Outstanding Work:** Automate creation via worker or Strapi webhook.

### Feature F-098: Messaging instructions for support agents
- **Description:** Provide guidelines for agent response using Mattermost.
- **Status:** ✅ fully implemented
- **Evidence:** `[MM-15][MM-54][ROADMAP-07]`
- **Dependencies:** docs.
- **Outstanding Work:** Sync with admin analytics once built.

### Feature F-099: Mattermost retention policy configuration
- **Description:** Align retention with compliance (e.g., 180 days).
- **Status:** ⛔ pending
- **Evidence:** `[MM-19][MM-42][ROADMAP-11]`
- **Dependencies:** Mattermost config.
- **Outstanding Work:** Document and enforce retention schedule.

### Feature F-100: Mattermost mobile readiness
- **Description:** Ensure embed works on mobile devices or provide alternative.
- **Status:** 🟡 partially implemented (iframe works on desktop; mobile experience limited)
- **Evidence:** `[MM-40][FRONTEND-43]`
- **Dependencies:** Responsive container.
- **Outstanding Work:** Explore deep link to Mattermost mobile app, adjust UI.

---

## 8. File Sharing & Cloudflare R2 Pipeline

### Feature F-101: Upload broker worker
- **Description:** Implement worker endpoints for multipart create/sign/complete, GET presign.
- **Status:** ✅ fully implemented
- **Evidence:** `[COMP-41][FILES-01][FILES-41]`
- **Dependencies:** `workers/upload-broker/src/index.ts`.
- **Outstanding Work:** Add rate limiting, AV enforcement.

### Feature F-102: Worker signature correctness (SigV4)
- **Description:** Use proper canonical requests and HMAC for R2 compatibility.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-34][FILES-35][FILES-36]`
- **Dependencies:** Worker sign logic.
- **Outstanding Work:** Add checksums to uploads.

### Feature F-103: Multipart upload support
- **Description:** Support large files via `createMultipartUpload`, `signPart`, `completeMultipartUpload`.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-08][FILES-32][FILES-33]`
- **Dependencies:** Worker endpoints.
- **Outstanding Work:** Add abort cleanup job.

### Feature F-104: Download presign functionality
- **Description:** Provide GET presigned URLs with TTL for downloads.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-09][FILES-27][FRONTEND-39]`
- **Dependencies:** Worker `/s3/presign` endpoint.
- **Outstanding Work:** Enforce `x-scan=clean` check (see F-110).

### Feature F-105: Upload metadata tracking in client
- **Description:** Store upload name, size, key, timestamp in dashboard state.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-20][FILES-30][FRONTEND-40]`
- **Dependencies:** `useDocumentSubmission`.
- **Outstanding Work:** Persist server-side for admin view.

### Feature F-106: Upload cancellation support
- **Description:** Provide ability to cancel ongoing upload.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-18][SECURITY-29]`
- **Dependencies:** `useDocumentSubmission` abort controller.
- **Outstanding Work:** Expose UI button for cancellation.

### Feature F-107: File type and size validation
- **Description:** Validate file count, size, allowed types before upload.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-35][FILES-02][FILES-48]`
- **Dependencies:** `DocumentsUpload.tsx` constants.
- **Outstanding Work:** Update accepted types list as business evolves.

### Feature F-108: Filename sanitization
- **Description:** Sanitize filenames to avoid invalid characters in R2 keys.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-21][FILES-51][SECURITY-27]`
- **Dependencies:** `sanitizeFileName` helper.
- **Outstanding Work:** Provide sanitized display name to user.

### Feature F-109: Admin upload review dashboard
- **Description:** Provide admin view listing uploaded files with status.
- **Status:** ⛔ pending
- **Evidence:** `[ADMIN-27][FILES-15][ROADMAP-13]`
- **Dependencies:** Backend storage of metadata.
- **Outstanding Work:** Build API + UI, integrate with AV results.

### Feature F-110: Antivirus enforcement before download
- **Description:** Deny download until `x-scan=clean` metadata present.
- **Status:** 🟡 partially implemented (plan documented, enforcement pending)
- **Evidence:** `[OVERVIEW-67][FILES-44][SECURITY-22]`
- **Dependencies:** R2 event pipeline, worker check.
- **Outstanding Work:** Hook worker to metadata, block when not clean.

### Feature F-111: Upload notification to admin
- **Description:** Notify admin via API/Message when user uploads file.
- **Status:** 🟡 partially implemented (hooks exist in `useDocumentSubmission`, backend endpoint pending)
- **Evidence:** `[FILES-15][FILES-16][ADMIN-27]`
- **Dependencies:** `/api/turnitin/notify` endpoint.
- **Outstanding Work:** Implement backend worker or Cloudflare Function.

### Feature F-112: Turnitin receipt email
- **Description:** Optionally email user receipt after upload.
- **Status:** 🟡 partially implemented (client code prepared; backend endpoint pending)
- **Evidence:** `[FILES-16][FRONTEND-27]`
- **Dependencies:** `/api/turnitin/receipt` endpoint.
- **Outstanding Work:** Build serverless function.

### Feature F-113: Upload history persistence
- **Description:** Persist uploads to backend for later retrieval.
- **Status:** ⛔ pending
- **Evidence:** `[FILES-20][ROADMAP-12][ROADMAP-47]`
- **Dependencies:** Database table and API.
- **Outstanding Work:** Implement data persistence and retrieval hook.

### Feature F-114: Upload retention lifecycle
- **Description:** Automatically expire old uploads in R2.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-11][ROADMAP-52][SECURITY-66]`
- **Dependencies:** R2 lifecycle rules.
- **Outstanding Work:** Configure lifecycle policies, document retention.

### Feature F-115: Upload rate limiting
- **Description:** Throttle presign requests per user.
- **Status:** ⛔ pending
- **Evidence:** `[SECURITY-66][ROADMAP-46][OBS-38]`
- **Dependencies:** Worker KV or Durable Object.
- **Outstanding Work:** Implement rate limiter, integrate with worker.

### Feature F-116: Upload audit logging
- **Description:** Log upload events for compliance/troubleshooting.
- **Status:** ⛔ pending
- **Evidence:** `[SECURITY-50][OBS-24][ROADMAP-27]`
- **Dependencies:** Logging pipeline.
- **Outstanding Work:** Add log push to R2 or analytics.

### Feature F-117: Upload abort cleanup job
- **Description:** Clean partial multipart uploads if user cancels.
- **Status:** 🚫 not started
- **Evidence:** `[FILES-36][FILES-37][ROADMAP-52]`
- **Dependencies:** Scheduled worker.
- **Outstanding Work:** Implement periodic cleanup.

### Feature F-118: Worker instrumentation metrics
- **Description:** Capture metrics for worker (success/failure counts).
- **Status:** ⛔ pending
- **Evidence:** `[OBS-38][ROADMAP-46]`
- **Dependencies:** Analytics pipeline.
- **Outstanding Work:** Add logs, integrate with Cloudflare analytics.

### Feature F-119: Worker automated tests
- **Description:** Provide unit/integration tests for worker endpoints.
- **Status:** 🚫 not started
- **Evidence:** `[ROADMAP-45][OBS-45]`
- **Dependencies:** Testing harness.
- **Outstanding Work:** Create test suite with mocked R2.

### Feature F-120: Upload error messaging
- **Description:** Show user-friendly error messages via toasts.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-21][FILES-68][OBS-14]`
- **Dependencies:** `useDocumentSubmission`, toast utility.
- **Outstanding Work:** Localize copy.

---

## 9. Security & Compliance

### Feature F-121: Environment warning logger
- **Description:** Log environment readiness at startup to console.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-30][SECURITY-25][OBS-04]`
- **Dependencies:** `logEnvironmentStatus`.
- **Outstanding Work:** Consider gating start on critical env missing.

### Feature F-122: Role-based UI gating
- **Description:** Hide admin/editor functionality from general users.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-04][FRONTEND-46][ADMIN-01]`
- **Dependencies:** `useAuth`.
- **Outstanding Work:** Extend to new routes as added.

### Feature F-123: Presign server-only secret management
- **Description:** Keep R2 credentials in worker env, not client.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-09][FILES-41]`
- **Dependencies:** Cloudflare secrets.
- **Outstanding Work:** Add rotation schedule documentation.

### Feature F-124: Upload TTL enforcement
- **Description:** Limit presigned URL lifetime for GET and PUT.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-14][FILES-27]`
- **Dependencies:** Worker TTL checks.
- **Outstanding Work:** Parameterize TTL per feature.

### Feature F-125: Filetype restrictions for uploads
- **Description:** Only allow safe file extensions.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-35][SECURITY-27][FILES-48]`
- **Dependencies:** Front-end validation.
- **Outstanding Work:** Mirror validation server-side once backend exists.

### Feature F-126: Session redirect on unauthorized access
- **Description:** Redirect to sign-in when session missing.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-05][FRONTEND-22]`
- **Dependencies:** `DashboardWrapper`.
- **Outstanding Work:** Provide message on redirect page.

### Feature F-127: Missing env callouts
- **Description:** Show UI warnings when critical env (Mattermost URL, Upload broker) missing.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-08][FRONTEND-39]`
- **Dependencies:** `MessageCenter`, `DocumentsUpload`.
- **Outstanding Work:** Add knowledge base links.

### Feature F-128: AV pipeline documentation
- **Description:** Document antivirus gating requirements for uploads.
- **Status:** 🟡 partially implemented (docs capture plan; enforcement pending)
- **Evidence:** `[OVERVIEW-67][SECURITY-22][ROADMAP-09]`
- **Dependencies:** `docs/intel.md`.
- **Outstanding Work:** Build enforcement (see F-110).

### Feature F-129: Rate limiting plan for worker
- **Description:** Document need for rate limiting on presign endpoints.
- **Status:** 🟡 partially implemented (docs flag requirement; implementation pending)
- **Evidence:** `[SECURITY-66][ROADMAP-46]`
- **Dependencies:** documentation.
- **Outstanding Work:** Implement actual limiter (F-115).

### Feature F-130: Audit logging plan
- **Description:** Document need for audit logs across services.
- **Status:** 🟡 partially implemented (plan documented; instrumentation pending)
- **Evidence:** `[SECURITY-49][OBS-24][ROADMAP-27]`
- **Dependencies:** docs.
- **Outstanding Work:** Build logging pipeline (F-116).

### Feature F-131: Clerk domain-restricted invites
- **Description:** Ensure admin invites limited to org domain.
- **Status:** 🚫 not started
- **Evidence:** `[SECURITY-45]`
- **Dependencies:** Clerk configuration.
- **Outstanding Work:** Configure domain restriction.

### Feature F-132: Strapi admin protection (network restrictions)
- **Description:** Restrict Strapi admin to VPN or Access until OIDC ready.
- **Status:** 🚫 not started (documented as recommended but not implemented)
- **Evidence:** `[SECURITY-63][ROADMAP-31]`
- **Dependencies:** Cloudflare Access.
- **Outstanding Work:** Configure firewall/Access policy.

### Feature F-133: Payment flow sanitization
- **Description:** Ensure payment-related pages sanitize input.
- **Status:** 🟡 partially implemented (legacy pages exist; verification pending)
- **Evidence:** `[OVERVIEW-28][SECURITY-58]`
- **Dependencies:** Payment components.
- **Outstanding Work:** Audit and document.

### Feature F-134: Worker request signature verification
- **Description:** Optionally require client to sign requests to worker.
- **Status:** ⛔ pending
- **Evidence:** `[SECURITY-61][ROADMAP-46]`
- **Dependencies:** Additional signature scheme.
- **Outstanding Work:** Implement HMAC gating if necessary.

### Feature F-135: Sensitive logs scrubbing
- **Description:** Ensure no secrets printed in logs.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-40][OBS-38]`
- **Dependencies:** Worker error messages sanitized.
- **Outstanding Work:** Audit new logs when added.

### Feature F-136: Data retention policy documentation
- **Description:** Document retention for chat, uploads, content.
- **Status:** 🟡 partially implemented (some references; complete policy pending)
- **Evidence:** `[MM-19][FILES-64][ROADMAP-11]`
- **Dependencies:** docs.
- **Outstanding Work:** Finalize retention schedule.

### Feature F-137: Strapi API token rotation
- **Description:** Set rotation plan for `CMS_TOKEN`.
- **Status:** 🟡 partially implemented (documented as recommendation; process pending)
- **Evidence:** `[STRAPI-51][SECURITY-54]`
- **Dependencies:** Secrets management.
- **Outstanding Work:** Document rotation cadence.

### Feature F-138: Compliance review of uploads
- **Description:** Ensure upload compliance with educational policies.
- **Status:** 🟡 partially implemented (manual review; automated workflow pending)
- **Evidence:** `[ADMIN-54][ROADMAP-60]`
- **Dependencies:** Admin oversight.
- **Outstanding Work:** Implement file review UI (F-109).

### Feature F-139: Worker error confidentiality
- **Description:** Return sanitized error JSON to clients.
- **Status:** ✅ fully implemented
- **Evidence:** `[FILES-39][SECURITY-40]`
- **Dependencies:** Worker error responses.
- **Outstanding Work:** Maintain when extending worker.

### Feature F-140: Clerk logout reliability
- **Description:** Guarantee logout clears session and returns to marketing page.
- **Status:** ✅ fully implemented
- **Evidence:** `[SECURITY-03][FRONTEND-33]`
- **Dependencies:** `useAuth.logout`.
- **Outstanding Work:** Add tracking for logout events.

---

## 10. Observability & Reliability

### Feature F-141: Console warnings for CMS failures
- **Description:** Log warning when Strapi request fails for debugging.
- **Status:** ✅ fully implemented
- **Evidence:** `[OBS-01][PUBLISH-53]`
- **Dependencies:** `cms.ts` error handling.
- **Outstanding Work:** Add error reporting to monitoring system.

### Feature F-142: Console warnings for upload failures
- **Description:** Log warnings within upload hook when errors occur.
- **Status:** ✅ fully implemented
- **Evidence:** `[OBS-02][FILES-68]`
- **Dependencies:** `useDocumentSubmission`.
- **Outstanding Work:** Pipe into logging platform.

### Feature F-143: Error boundaries in UI
- **Description:** Catch rendering errors and show fallback UIs.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-30][OBS-13]`
- **Dependencies:** `ErrorBoundary` component.
- **Outstanding Work:** Provide telemetry when boundary triggered.

### Feature F-144: Toast notifications for user feedback
- **Description:** Provide immediate feedback on success and failure events.
- **Status:** ✅ fully implemented
- **Evidence:** `[FRONTEND-21][OBS-14]`
- **Dependencies:** `toaster.tsx`.
- **Outstanding Work:** Standardize copy.

### Feature F-145: Smoke test plan documentation
- **Description:** Document manual smoke tests for content, upload, messaging.
- **Status:** ✅ fully implemented
- **Evidence:** `[OBS-40][ROADMAP-40]`
- **Dependencies:** docs.
- **Outstanding Work:** Automate tests.

### Feature F-146: Automated content publish test
- **Description:** Script to create Strapi entry and verify front-end fetch.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-34][OBS-40]`
- **Dependencies:** E2E testing framework.
- **Outstanding Work:** Implement Playwright/Cypress flow.

### Feature F-147: Automated file upload/download test
- **Description:** Automated test verifying R2 upload pipeline.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-35][OBS-40]`
- **Dependencies:** Integration pipeline.
- **Outstanding Work:** Build test harness using worker.

### Feature F-148: Automated messaging test
- **Description:** Verify messaging send/receive via Mattermost API.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-36][OBS-40]`
- **Dependencies:** Mattermost CLI/API.
- **Outstanding Work:** Build test suite.

### Feature F-149: Centralized logging pipeline
- **Description:** Send logs to central system (e.g., Logpush, Sentry).
- **Status:** ⛔ pending
- **Evidence:** `[OBS-07][ROADMAP-27]`
- **Dependencies:** Logging infrastructure.
- **Outstanding Work:** Configure pipeline.

### Feature F-150: Cloudflare analytics for worker
- **Description:** Monitor worker usage and error rates using Cloudflare analytics.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-07][ROADMAP-28]`
- **Dependencies:** Cloudflare analytics integration.
- **Outstanding Work:** Enable analytics via API or dashboard.

### Feature F-151: Postgres health monitoring
- **Description:** Monitor Strapi and Mattermost database health (connections, backups).
- **Status:** ⛔ pending
- **Evidence:** `[OBS-35][ROADMAP-29]`
- **Dependencies:** Monitoring tool.
- **Outstanding Work:** Set up alerts and backup verification.

### Feature F-152: R2 storage monitoring
- **Description:** Track object count, size, lifecycle actions.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-37][ROADMAP-11]`
- **Dependencies:** R2 metrics.
- **Outstanding Work:** Configure dashboards.

### Feature F-153: TypeScript CI gate
- **Description:** Ensure CI fails when `tsc` fails.
- **Status:** 🟡 partially implemented (scripts exist; failures unresolved; CI gating not noted)
- **Evidence:** `[OBS-31][ROADMAP-56]`
- **Dependencies:** CI config.
- **Outstanding Work:** Fix type errors, add CI step.

### Feature F-154: Lint CI gate
- **Description:** Run ESLint in CI.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-57][OBS-32]`
- **Dependencies:** CI pipeline.
- **Outstanding Work:** Add to GitHub Actions.

### Feature F-155: Sentry integration for SPA
- **Description:** Capture runtime errors via Sentry.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-20][ROADMAP-27]`
- **Dependencies:** Sentry SDK.
- **Outstanding Work:** Implement and configure DSN.

### Feature F-156: Upload throughput monitoring
- **Description:** Track upload durations, errors.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-26][ROADMAP-46]`
- **Dependencies:** Logging/metrics.
- **Outstanding Work:** Add instrumentation.

### Feature F-157: Messaging uptime monitoring
- **Description:** Monitor Mattermost availability, WS stats.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-25][ROADMAP-62]`
- **Dependencies:** Monitoring integration.
- **Outstanding Work:** Add health checks.

### Feature F-158: Cache purge verification
- **Description:** Confirm CDN purge occurs on publish.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-22][OBS-27]`
- **Dependencies:** Publish webhook.
- **Outstanding Work:** Build pipeline.

### Feature F-159: Staging parity documentation
- **Description:** Document staging environment requirements.
- **Status:** 🟡 partially implemented (docs mention staging; needs more detail)
- **Evidence:** `[OBS-52][ROADMAP-33]`
- **Dependencies:** docs.
- **Outstanding Work:** Expand staging runbook.

### Feature F-160: Incident response runbooks
- **Description:** Provide runbooks for worker, Strapi, Mattermost incidents.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-25][ROADMAP-40][OBS-49]`
- **Dependencies:** docs folder.
- **Outstanding Work:** Keep updated after major changes.

---

## 11. Migration Roadmap Execution

### Feature F-161: Phase 1 Chat-first documentation
- **Description:** Document steps to prioritize Mattermost integration.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-15][ROADMAP-01]`
- **Dependencies:** docs.
- **Outstanding Work:** Execute outstanding chat tasks (see F-091, F-092, F-094).

### Feature F-162: Phase 1 implementation progress
- **Description:** Evaluate chat-first tasks completion.
- **Status:** 🟡 partially implemented (embed done; SSO+native pending)
- **Evidence:** `[FRONTEND-42][ROADMAP-01..07]`
- **Dependencies:** Mattermost tasks.
- **Outstanding Work:** Complete F-091, F-092, F-094.

### Feature F-163: Phase 2 Files pipeline documentation
- **Description:** Outline upload pipeline steps, AV gate, retention.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-67][ROADMAP-08..15][FILES-44]`
- **Dependencies:** docs.
- **Outstanding Work:** Execute pending pipeline tasks (F-110, F-111, F-113, F-114).

### Feature F-164: Phase 2 implementation progress
- **Description:** Evaluate file pipeline readiness.
- **Status:** 🟡 partially implemented (worker + UI done; AV, persistence pending)
- **Evidence:** `[FILES-01..70][ROADMAP-08..15]`
- **Dependencies:** Upload tasks.
- **Outstanding Work:** Build persistence, AV gating, retention.

### Feature F-165: Phase 3 CMS swap documentation
- **Description:** Document Strapi migration strategy including Microfeed fallback.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-07][PUBLISH-45][ROADMAP-16..25]`
- **Dependencies:** docs.
- **Outstanding Work:** Execute migration (F-043, F-065).

### Feature F-166: Phase 3 implementation progress
- **Description:** Evaluate CMS swap readiness.
- **Status:** 🟡 partially implemented (Strapi live; Microfeed fallback active; import pending)
- **Evidence:** `[PUBLISH-08][ROADMAP-17]`
- **Dependencies:** Strapi tasks.
- **Outstanding Work:** Import Microfeed data, implement preview UI.

### Feature F-167: Phase 4 Harden documentation
- **Description:** Document hardening plan (logging, backups, DR).
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-15][ROADMAP-26..31]`
- **Dependencies:** docs.
- **Outstanding Work:** Implement instrumentation (F-149..F-157).

### Feature F-168: Phase 4 implementation progress
- **Description:** Evaluate hardening actions.
- **Status:** ⛔ pending (instrumentation not yet executed)
- **Evidence:** `[OBS-07..31][ROADMAP-26..31]`
- **Dependencies:** Observability tasks.
- **Outstanding Work:** Build logging, alerts, DR runbooks.

### Feature F-169: Microfeed coexistence messaging
- **Description:** Communicate coexistence strategy in docs.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-07][PUBLISH-08][ROADMAP-20]`
- **Dependencies:** docs updates.
- **Outstanding Work:** Update once Microfeed decommissioned.

### Feature F-170: Microfeed decommission plan
- **Description:** Plan for final retirement of Microfeed paths.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-20][PUBLISH-45]`
- **Dependencies:** Strapi parity.
- **Outstanding Work:** Determine cutover date and remove fallback code.

### Feature F-171: Strapi import scripts
- **Description:** Provide scripts to import Microfeed data into Strapi.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-17][COMP-53]`
- **Dependencies:** script folder.
- **Outstanding Work:** Write import scripts, test mapping.

### Feature F-172: Analytics integration
- **Description:** Integrate analytics data (views, likes) into admin and domain pages.
- **Status:** ⛔ pending
- **Evidence:** `[STRAPI-63][FRONTEND-58][ROADMAP-23]`
- **Dependencies:** Data pipeline.
- **Outstanding Work:** Build analytics ingestion.

### Feature F-173: SEO automation from Strapi
- **Description:** Use Strapi SEO fields to update front-end metadata automatically.
- **Status:** 🟡 partially implemented (metadata consumption partially integrated)
- **Evidence:** `[PUBLISH-41][STRAPI-06][FRONTEND-53]`
- **Dependencies:** `HelmetProvider` usage.
- **Outstanding Work:** Propagate to all pages (domain, homepage future).

### Feature F-174: mattermost ↔ Strapi cross-linking
- **Description:** Provide cross-reference between chat threads and content items.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-63][MM-59]`
- **Dependencies:** Integration pipeline.
- **Outstanding Work:** Implement linking in both systems.

### Feature F-175: File pipeline cross-post to Mattermost
- **Description:** Notify support channels when user uploads file.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-14][MM-68]`
- **Dependencies:** Worker integration.
- **Outstanding Work:** Build webhook to Mattermost.

### Feature F-176: Upload pipeline retention governance
- **Description:** Document and implement retention rules aligning with compliance.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-11][SECURITY-66][FILES-64]`
- **Dependencies:** R2 lifecycle.
- **Outstanding Work:** Enforce retention with automation.

### Feature F-177: Observability tasks checklist
- **Description:** Provide explicit checklist for instrumentation tasks.
- **Status:** ✅ fully implemented
- **Evidence:** `[OBS-07..70][ROADMAP-26..31]`
- **Dependencies:** docs.
- **Outstanding Work:** Execute instrumentation tasks.

### Feature F-178: Security posture summary
- **Description:** Summarize security approach (AV gating, short-lived URLs, Clerk roles).
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-67][SECURITY-01..70]`
- **Dependencies:** docs.
- **Outstanding Work:** Update as security features implemented.

### Feature F-179: Knowledge sharing plan
- **Description:** Document expectation to update docs when features added.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-68][ROADMAP-61]`
- **Dependencies:** docs messaging.
- **Outstanding Work:** Reinforce during code reviews.

### Feature F-180: Training material for new hires
- **Description:** Provide `intel.md` plus checklist for onboarding.
- **Status:** ✅ fully implemented
- **Evidence:** `[OVERVIEW-70][ROADMAP-61]`
- **Dependencies:** docs.
- **Outstanding Work:** Add recorded walkthrough once available.

---

## 12. Additional Cross-cutting Enhancements

### Feature F-181: Homepage automation from Strapi
- **Description:** Replace static `services` array with data fetched from Strapi.
- **Status:** ⛔ pending
- **Evidence:** `[OVERVIEW-16][PUBLISH-61][ROADMAP-18]`
- **Dependencies:** Strapi API.
- **Outstanding Work:** Implement fetch + caching.

### Feature F-182: Service card theming from CMS
- **Description:** Use Strapi fields to control card appearance (gradients, icons).
- **Status:** 🚫 not started
- **Evidence:** `[OVERVIEW-63][ROADMAP-38]`
- **Dependencies:** Additional Strapi fields.
- **Outstanding Work:** Extend schema + front-end styling.

### Feature F-183: Messaging notifications in dashboard header
- **Description:** Provide indicator for unread chat messages.
- **Status:** 🚫 not started
- **Evidence:** `[MM-14][ROADMAP-05]`
- **Dependencies:** Native messaging integration.
- **Outstanding Work:** Implement once WebSocket client ready.

### Feature F-184: Payment integration modernization
- **Description:** Align payment flow with Strapi-managed pricing.
- **Status:** 🚫 not started
- **Evidence:** `[OVERVIEW-28][FRONTEND-59]`
- **Dependencies:** Payment API.
- **Outstanding Work:** Build new pricing integration.

### Feature F-185: Content-based messaging triggers
- **Description:** Auto-create Mattermost announcements when new content publishes.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-22][MM-47]`
- **Dependencies:** Strapi webhook.
- **Outstanding Work:** Build integration.

### Feature F-186: Analytics instrumentation for homepage conversion
- **Description:** Track CTA clicks vs conversions.
- **Status:** ⛔ pending
- **Evidence:** `[OVERVIEW-55][ROADMAP-41]`
- **Dependencies:** Analytics tooling.
- **Outstanding Work:** Implement tracking.

### Feature F-187: Domain-specific SEO enhancements
- **Description:** Provide domain-specific schema markup.
- **Status:** ⛔ pending
- **Evidence:** `[FRONTEND-63][ROADMAP-48]`
- **Dependencies:** SEO component.
- **Outstanding Work:** Extend Strapi SEO fields.

### Feature F-188: Content scheduling notifications
- **Description:** Notify editors when scheduled publish time approaches.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-49][ADMIN-60]`
- **Dependencies:** Scheduler.
- **Outstanding Work:** Build cron + email integration.

### Feature F-189: Worker-based presign analytics sharing
- **Description:** Provide metrics to analytics team on file uploads.
- **Status:** ⛔ pending
- **Evidence:** `[OBS-38][ROADMAP-46]`
- **Dependencies:** Logging pipeline.
- **Outstanding Work:** Implement metrics export.

### Feature F-190: Support knowledge base linking content to chat
- **Description:** Provide quick link inside chat to relevant Strapi article.
- **Status:** ⛔ pending
- **Evidence:** `[MM-49][ROADMAP-51]`
- **Dependencies:** Integration.
- **Outstanding Work:** Build plugin or slash command.

### Feature F-191: File download audit UI
- **Description:** Track which users downloaded which files.
- **Status:** ⛔ pending
- **Evidence:** `[SECURITY-50][ROADMAP-27]`
- **Dependencies:** Logging + UI.
- **Outstanding Work:** Implement logs + admin dashboard card.

### Feature F-192: Document submission backend handshake
- **Description:** Notify backend of upload completion for order processing.
- **Status:** ⛔ pending
- **Evidence:** `[FILES-15][ROADMAP-12]`
- **Dependencies:** API endpoint.
- **Outstanding Work:** Implement serverless function + DB storage.

### Feature F-193: Offline upload queue
- **Description:** Provide offline queue/resume for uploads.
- **Status:** ⛔ pending
- **Evidence:** `[ROADMAP-54]`
- **Dependencies:** Service worker or background sync.
- **Outstanding Work:** Implement offline queue logic.

### Feature F-194: Multi-tenant domain theming
- **Description:** Theme UI by domain using Strapi data.
- **Status:** 🟡 partially implemented (domain pages exist; theme control incomplete)
- **Evidence:** `[OVERVIEW-31][FRONTEND-63]`
- **Dependencies:** Domain components.
- **Outstanding Work:** Add theming tokens per domain.

### Feature F-195: Worker secrets rotation runbook
- **Description:** Document and implement process for rotating R2 keys.
