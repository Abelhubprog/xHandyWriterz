# Frontend Redesign Masterplan 2025

This plan delivers a production-grade redesign that preserves all existing features while creating a distinctive, high-trust, editorial-grade experience across public, dashboard, and admin surfaces.

## Purpose and Constraints
- Keep the current stack and routing: Vite + React + React Router.
- Preserve all routes and features already in use.
- CMS-first public site driven by Strapi.
- Dashboard and admin remain operational and task-focused.
- No AWS services; storage uses R2 via S3-compatible APIs.

## Design Thesis: The Scriptorium Atlas
A digital editorial studio that feels like a modern research archive. The signature memory is a set of domain "specimens" presented as atlas plates with annotations, stamps, and micro-data.

### Tone
- Authoritative, academic, premium.
- Confident typography with deliberate asymmetry.
- Calm but distinctive palettes per domain.

### Differentiation
- Each domain has a micro-brand: color, motif, and hero treatment.
- Public pages feel like a curated journal, not a generic SaaS landing.
- Dashboard feels like an operations console with precise hierarchy and zero fluff.

## Visual System

### Typography
- Display: Fraunces (serif, editorial, expressive)
- Body/UI: Atkinson Hyperlegible (clear, accessible)
- Mono/metrics: Azeret Mono (numbers, code, tokens)

### Color
Base palette (global):
- Ink: #121417
- Paper: #f6f1e9
- Fog: #e9e3d9
- Slate: #303645

Domain accents (no purple bias):
- Adult Nursing: #c43d3d (oxide red)
- Mental Health: #1f6f5b (deep teal)
- Child Nursing: #2d78a8 (mid blue)
- Social Work: #b46b2b (copper)
- Technology: #2a5bd7 (cobalt)
- AI: #1f8f7a (emerald)
- Crypto: #d9722d (amber)
- Enterprise: #6b5c8a (muted violet, optional)

### Surfaces and Texture
- Paper-like backgrounds with subtle grain (CSS noise overlay).
- Section separators using thin rules and micro-grid patterns.
- Atlas stamps, marginal notes, and callouts as a visual motif.

### Layout
- 12-column grid with generous gutters.
- Large section gaps (80-140px) for editorial pacing.
- Reading width 60-72ch on articles and services.

### Motion
- Page load: staged reveal (hero -> summary -> CTA).
- Section transitions: subtle parallax on media, opacity fades.
- Cards: lift with shadow color shift on hover.
- Dashboard: minimal motion, focus on speed and clarity.

## Information Architecture (Preserve Existing Routes)

### Public
- Home: domain atlas hero, featured domains, editorial picks, services, testimonials.
- Domains: filterable grid with domain plates and micro-metrics.
- Domain page: hero, highlights, services, articles, FAQ, CTA.
- Services: directory and detail pages with clear conversion path.
- Articles: editorial index and reading experience.
- Authors: directory and profiles.
- Docs: x402 and API pages styled as technical briefs.

### Dashboard
- Home: status overview, active orders, quick actions, message previews.
- Orders: timeline, status filters, payment state.
- New Order: structured flow with pricing clarity.
- Messages: Mattermost integrated view with clear connection state.
- Documents: upload queue with scan status and provenance.
- Profile/Settings: simple forms, security focus.

### Admin
- Overview: operational metrics + environment status.
- Content: deep links to Strapi admin, recent drafts, publish queue.
- Messaging: live support view and escalation.
- Turnitin: report submission flow with audit trail.

## Page-by-Page Blueprint

### Home
- Atlas hero with domain selector.
- Featured domains as plates (image + metrics + CTA).
- Editorial picks (1 hero + 3 supporting).
- Services spotlight with trust markers.
- Testimonials and credibility row.

### Domains Hub
- Filter bar + chips.
- Domain plates with badges (expert count, turnaround time).

### Domain Page
- Hero with domain signature stamp and gradient panel.
- Highlights row (metrics, guarantees, compliance).
- Services and articles sections.
- FAQ + CTA band.

### Service Page
- Hero with scope and outcome.
- Deliverables list, timeline, pricing.
- CMS body rendered with callouts.
- Related services and case examples.

### Article Page
- Editorial hero, author, reading time.
- Rich body with margin notes.
- Related articles, author bio.

### Dashboard Home
- Status cards, timeline, recent uploads.
- Message preview with connection badge.
- Quick actions for new order, upload, pay.

### Messages
- Mattermost native UI in a contained shell.
- Offline state and reconnection path.

### Documents
- Upload queue, scan status, audit trail, re-download.

### Admin Dashboard
- Environment status (Strapi, Mattermost, R2, API).
- Publish queue, recent edits, support alerts.

## Component System Upgrades
- Consolidate on `components/ui/*` primitives and remove unused UI libraries.
- Create new design tokens for type, spacing, color, and elevation.
- Define a common card system: plate, panel, ledger, and chip variants.
- Introduce an "atlas stamp" badge component for domain identity.

## Data and State Design
- Explicit empty states for CMS, messaging, and orders.
- Skeleton loaders for editorial content.
- Error states with recovery actions (retry, status page, contact support).

## Implementation Phases
1. Token refactor (type, color, spacing) and base styles.
2. Public pages redesign (home, domains, articles, services).
3. Dashboard shell redesign and navigation cleanup.
4. Admin shell redesign and operational widgets.
5. QA: accessibility, performance, and regression checks.

## Production Readiness Targets
- Lighthouse 90+ on public pages.
- Keyboard navigation and contrast compliance.
- SSR-safe loading fallbacks (client-side data in React Query).
- Media optimization and lazy loading.

## Non-Negotiables
- No feature loss.
- No AWS services.
- R2 is the single source of object storage.
- Railway services are used where sufficient.
