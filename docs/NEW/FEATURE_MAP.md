# HandyWriterz Platform - Complete Feature & Capability Map

**Generated**: December 2024  
**Updated**: December 28, 2024  
**Version**: Production Build

---

## ✅ Recent Completions (Dec 28, 2024)

- **Orders API** - Full CRUD `/api/orders/*` endpoint created
- **Payment Integrations** - StableLink, PayPal, Stripe, Coinbase with real API calls
- **Webhook Verification** - Signature verification for all payment providers
- **Turnitin Notifications** - Email + Mattermost admin notifications implemented
- **Receipt Emails** - User confirmation emails via Resend/SendGrid

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HandyWriterz Platform                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + TypeScript)                                   │
│  ├── Public Site (Landing, Articles, Services, Domains)                │
│  ├── User Dashboard (Orders, Documents, Messages, Profile)             │
│  └── Admin Dashboard (CMS, Analytics, Turnitin, Messaging)             │
├─────────────────────────────────────────────────────────────────────────┤
│  API Layer (Express + Railway)                                          │
│  ├── /api/uploads (R2 Presigned URLs)                                  │
│  ├── /api/orders (CRUD, Payment Flow, Admin)                           │
│  ├── /api/payments (Stripe, PayPal, StableLink, Coinbase)              │
│  ├── /api/messaging (Mattermost SSO)                                    │
│  ├── /api/turnitin (Submission & Receipt Notifications)                │
│  ├── /api/cms (Strapi Proxy - GraphQL & REST)                          │
│  └── /api/webhooks (Payment Events, Strapi, R2 Scan)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Backend Services                                                       │
│  ├── Strapi 5 CMS (Content Management)                                 │
│  ├── Cloudflare R2 (File Storage)                                      │
│  ├── Mattermost (Real-time Messaging)                                  │
│  └── Clerk (Authentication)                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Domain Structure

| Domain | Slug | Description |
|--------|------|-------------|
| Adult Nursing | `adult-nursing` | Clinical practice, care plans, evidence-based research |
| Mental Health Nursing | `mental-health` | Therapeutic techniques, behavioral health |
| Child Nursing | `child-nursing` | Pediatric best practices, family education |
| Social Work | `social-work` | Policy updates, community programmes |
| Healthcare Technology | `technology` | AI workflows, healthcare informatics |
| Artificial Intelligence | `ai` | AI applications, machine learning models |
| Blockchain & Crypto | `crypto` | Cryptocurrency, decentralized records |
| Enterprise | `enterprise` | Strategy, operational excellence |
| General | `general` | Interdisciplinary resources |

---

## 👥 User Roles & Capabilities

| Role | Capabilities |
|------|--------------|
| **Guest** | Browse public content, view pricing, register |
| **Customer** | Place orders, upload documents, chat support, track orders, payments |
| **Editor** | Create/edit CMS content, preview articles, manage drafts |
| **Admin** | Full CMS access, user management, analytics, Turnitin reports, messaging |

---

## 🌐 Public Website Features

### Homepage (`/`)
- Hero section with primary CTA
- Featured articles grid (CMS-driven)
- Domain showcase carousel
- Service highlights
- Testimonials section
- Author spotlights
- SEO-optimized metadata

### Content Pages

| Route | Component | Features |
|-------|-----------|----------|
| `/articles` | ArticlesPage | Article listing, domain filtering, search |
| `/articles/:slug` | ArticlePage | Full article view, related content, comments |
| `/authors` | AuthorsPage | Author directory |
| `/authors/:slug` | AuthorPage | Author profile, articles list |
| `/domains` | DomainsHub | All domains hub |
| `/domains/:slug` | DomainPage | Domain landing with articles, services |
| `/domains/:slug/articles/:articleSlug` | ArticlePage | Domain-scoped article |
| `/domains/:slug/services/:serviceSlug` | ServicePage | Domain-scoped service |
| `/services` | ServicesHub | Service directory with domain CTAs |

### Static Pages

| Route | Purpose |
|-------|---------|
| `/pricing` | Service pricing tiers |
| `/about` | Company information |
| `/contact` | Contact form & details |
| `/faq` | Frequently asked questions |
| `/how-it-works` | Process explainer |
| `/support` | Help resources |
| `/docs/x402` | X402 documentation |
| `/api` | API documentation |

---

## 👤 User Dashboard Features (`/dashboard`)

### Navigation Tabs
- **Orders** - Order history and status
- **Messages** - Support communication
- **Profile** - Account settings
- **Settings** - Preferences
- **Documents** - File uploads

### Order Creation System

| Feature | Status | Description |
|---------|--------|-------------|
| Support Area Selection | ✅ | 6 areas (Adult Health, Mental Health, Child, Disability, Social Work, Special Ed) |
| Service Type Selection | ✅ | 5 services (Dissertation, Essays, Reflection, Reports, Portfolio, Turnitin) |
| Word Count Input | ✅ | 100-100,000 words with validation |
| Study Level | ✅ | Level 4-7 academic levels |
| Due Date Picker | ✅ | Calendar selection with urgency pricing |
| Instructions Field | ✅ | Free-text requirements |
| Price Calculator | ✅ | Dynamic pricing (£15-18/275 words) |
| File Upload | ✅ | Drag-drop, multi-file, R2 integration |
| Email Submission | ✅ | Optional email copy |
| Admin Notification | ✅ | Automatic admin alert |

### Pricing Logic
```
Base Rate: £15 per 275 words
Premium Rate: £18 per 275 words (applied when):
  - Service = Dissertation
  - Level = Level 7
  - Days until due < 2
```

### File Upload Features

| Feature | Implementation |
|---------|----------------|
| Supported Formats | PDF, DOC, DOCX, TXT, MD, RTF, ODT, JPG, PNG, MP4, MOV, M4A, MP3, WAV |
| Max File Size | 200 MB |
| Max Files | 10 per upload |
| Storage | Cloudflare R2 |
| URL Generation | Presigned PUT/GET URLs (5 min expiry) |
| Progress Tracking | Real-time upload progress |

---

## 🔍 Turnitin Plagiarism Check System

### User Flow (`/turnitin/submit`, `/check-turnitin`)

| Step | Feature |
|------|---------|
| 1 | Upload document(s) for checking |
| 2 | Add optional notes |
| 3 | Pay £9.99 per check |
| 4 | Receive confirmation email |
| 5 | Admin processes submission |
| 6 | Receive reports via email (2 PDFs) |

### Admin Flow (`/admin/turnitin-reports`)

| Step | Feature |
|------|---------|
| 1 | Search by Order ID |
| 2 | View submission details |
| 3 | Upload Originality Report PDF |
| 4 | Upload Detailed Analysis PDF |
| 5 | Submit → User emailed with download links |

### Technical Implementation

| Component | File |
|-----------|------|
| User Submission | `pages/TurnitinSubmission.tsx` |
| Quick Check | `pages/turnitin-check.tsx` |
| Admin Panel | `pages/admin/TurnitinReports.tsx` |
| API Notify | `api/routes/turnitin.ts` → `/api/turnitin/notify` |
| API Receipt | `api/routes/turnitin.ts` → `/api/turnitin/receipt` |
| Email Service | `services/emailService.ts` |

---

## 🛡️ Admin Dashboard Features (`/admin`)

### Overview Panel
- Published articles count
- Draft articles count
- Services count
- Recent drafts list
- Quick action buttons
- Environment status checks (CMS, Mattermost, API)

### Content Management

| Route | Feature |
|-------|---------|
| `/admin/content` | Content overview |
| `/admin/content/new` | Create new article |
| `/admin/content/:id` | Edit article |
| `/admin/publish` | Publishing queue |
| `/admin/publish/:id` | Publish specific article |

### Article Editor (`ArticleEditor.tsx`)
- Rich text editing
- Domain selection
- Category/tag assignment
- Hero image upload
- SEO fields (title, description, keywords)
- Preview mode
- Draft/Publish status
- Scheduling

### Additional Admin Routes

| Route | Feature |
|-------|---------|
| `/admin/messaging` | Admin messaging hub |
| `/admin/support` | Support ticket management |
| `/admin/turnitin-reports` | Turnitin report management |
| `/admin/media/upload` | Media library |
| `/admin/users` | User management |
| `/admin/analytics` | Platform analytics |
| `/admin/settings` | Admin settings |
| `/admin/domains/:domain/analytics` | Domain-specific analytics |

---

## 💳 Payment System

### Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| StableLink | ✅ Configured | Crypto-friendly payments |
| PayPal | 🔧 Ready | Standard PayPal checkout |
| Stripe | 🔧 Ready | Card payments, subscriptions |
| Coinbase | 🔧 Ready | Cryptocurrency payments |

### Payment Flow

| Route | Purpose |
|-------|---------|
| `/payment` | Payment options |
| `/payment/gateway` | Payment gateway integration |
| `/payment/success` | Payment success confirmation |
| `/payment/cancel` | Payment cancellation |
| `/payment/failure` | Payment failure handling |

### API Endpoints (`/api/payments`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/create` | POST | Create payment session |
| `/process` | POST | Process payment |
| `/intent` | POST | Create Stripe payment intent |
| `/history` | GET | Get user payment history |
| `/:id` | GET | Get payment details |
| `/:id/refund` | POST | Refund payment |

---

## 📧 Email Service

### Email Types

| Email | Trigger | Recipient |
|-------|---------|-----------|
| Turnitin Submission | User submits documents | Admin |
| Submission Confirmation | User submits documents | User |
| Reports Ready | Admin uploads reports | User |
| Payment Confirmation | Payment succeeds | User |
| Order Status Update | Status changes | User |

### Implementation
- Provider: **Resend API**
- Service: `services/emailService.ts`
- Templates: HTML email templates with branding

---

## 💬 Messaging System (Mattermost Integration)

### Features

| Feature | Implementation |
|---------|----------------|
| SSO Authentication | Clerk → Mattermost token exchange |
| User Provisioning | Auto-create MM user from Clerk |
| Session Management | 24-hour token TTL |
| Channel Access | Team-based channel assignment |
| Embedded Client | MM web client embed in dashboard |

### API Endpoints (`/api/messaging`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/exchange` | POST | Exchange Clerk token for MM session |
| `/auth/refresh` | POST | Validate/refresh MM session |
| `/auth/logout` | POST | Clear MM session |
| `/status` | GET | Check MM service status |

### Dashboard Integration
- `pages/dashboard/Messages.tsx` - User message center
- `pages/dashboard/UserMessaging.tsx` - User support chat
- `pages/admin/AdminMessaging.tsx` - Admin messaging hub

---

## 📤 File Upload System

### API Endpoints (`/api/uploads`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/presign-put` | POST | Generate presigned PUT URL |
| `/presign-get` | POST | Generate presigned GET URL |
| `/presign` | POST | Legacy presign endpoint |
| `/complete` | POST | Mark upload complete |
| `/list` | GET | List user uploads |
| `/submit` | POST | Submit documents |
| `/url` | POST | Generate upload URL |
| `/:key` | DELETE | Delete file |

### Features
- Presigned URL expiry: 5 minutes
- Bucket: `handywriterz-uploads`
- Anonymous uploads: Configurable via `ALLOW_ANON_UPLOADS`
- Metadata tracking: In-memory (production: use DB)

---

## 🔐 Authentication (Clerk)

### Features

| Feature | Implementation |
|---------|----------------|
| Sign Up | `/sign-up` |
| Sign In | `/sign-in` |
| Admin Login | `/auth/admin-login` |
| Role-based Access | `publicMetadata.role` |
| Token Verification | `verifyClerkToken()` |
| Protected Routes | `RoleGuard` component |

### Role Metadata
```typescript
user.publicMetadata = {
  role: 'admin' | 'editor' | 'customer'
}
```

---

## 📊 CMS Integration (Strapi 5)

### Content Types

| Type | Fields |
|------|--------|
| **Article** | title, slug, content, heroImage, domain, author, categories, tags, featured, x402Enabled, readingTime, viewCount |
| **Service** | title, slug, description, domain, pricing, features, heroImage |
| **Author** | name, slug, bio, avatar, credentials, socialLinks, featured |
| **Category** | name, slug, description, color, icon |
| **Tag** | name, slug |
| **Testimonial** | quote, authorName, authorRole, rating, domain, featured |

### API Client (`lib/cms-client.ts`)

| Method | Purpose |
|--------|---------|
| `getArticles()` | Fetch article list with filters |
| `getArticle()` | Get single article |
| `createArticle()` | Create new article |
| `updateArticle()` | Update existing article |
| `publishArticle()` | Publish article |
| `deleteArticle()` | Delete article |
| `getServices()` | Fetch services by domain |
| `getService()` | Get single service |
| `uploadMedia()` | Upload media to Strapi |
| `incrementViewCount()` | Track article views |
| `toggleLike()` | Like/unlike article |

### React Query Hooks (`hooks/useCMS.ts`)

| Hook | Purpose |
|------|---------|
| `useArticles()` | Fetch articles list |
| `useArticle()` | Fetch single article |
| `useFeaturedArticles()` | Fetch featured articles |
| `useArticlesByDomain()` | Fetch domain articles |
| `useRelatedArticles()` | Fetch related content |
| `useServices()` | Fetch services |
| `useService()` | Fetch single service |
| `useAuthors()` | Fetch authors |
| `useAuthor()` | Fetch single author |
| `useCategories()` | Fetch categories |
| `useTags()` | Fetch tags |
| `useTestimonials()` | Fetch testimonials |
| `useIncrementViewCount()` | View tracking mutation |

---

## 🎨 Design System

### Typography
- Primary Font: **Newsreader** (serif, editorial)
- Secondary Font: **Manrope** (sans-serif, body)

### Color Palette (Domain-based)

| Domain | Gradient | Primary Color |
|--------|----------|---------------|
| Adult Nursing | rose → pink | `#f43f5e` |
| Mental Health | purple → violet | `#8b5cf6` |
| Child Nursing | blue → cyan | `#3b82f6` |
| Social Work | emerald → teal | `#10b981` |
| Technology | indigo → blue | `#6366f1` |
| AI | violet → purple | `#7c3aed` |
| Crypto | amber → orange | `#f59e0b` |

### UI Components (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Button variants |
| `card.tsx` | Card container |
| `input.tsx` | Form inputs |
| `checkbox.tsx` | Checkbox input |
| `alert.tsx` | Alert messages |
| `badge.tsx` | Status badges |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `form.tsx` | Form components |
| `label.tsx` | Form labels |
| `select.tsx` | Select inputs |
| `separator.tsx` | Visual separators |
| `skeleton.tsx` | Loading skeletons |
| `switch.tsx` | Toggle switches |
| `tabs.tsx` | Tab navigation |
| `textarea.tsx` | Text areas |
| `toast.tsx` | Toast notifications |
| `tooltip.tsx` | Tooltips |
| `Loader.tsx` | Loading spinners |
| `DataTable.tsx` | Data tables |
| `FileUploader.tsx` | File upload component |

### Landing Components (`components/landing/`)

| Component | Purpose |
|-----------|---------|
| `HeroSection.tsx` | Homepage hero |
| `ArticleCard.tsx` | Article preview card |
| `AuthorCard.tsx` | Author preview card |
| `ServiceCard.tsx` | Service preview card |
| `DomainShowcase.tsx` | Domain carousel |
| `FeaturedGrid.tsx` | Featured content grid |
| `TestimonialSection.tsx` | Testimonials display |
| `CmsSectionRenderer.tsx` | Dynamic CMS sections |

---

## 🔄 Webhooks System

### Strapi Webhooks (`/api/webhooks`)

| Endpoint | Trigger |
|----------|---------|
| `/strapi/publish` | Content published |
| `/strapi/unpublish` | Content unpublished |

### R2 Webhooks

| Endpoint | Trigger |
|----------|---------|
| `/r2/scan-complete` | Antivirus scan complete |

---

## 🚀 Deployment Architecture

### Services

| Service | Platform | Purpose |
|---------|----------|---------|
| Web App | Railway | React frontend |
| API | Railway | Express backend |
| Strapi CMS | Railway | Content management |
| PostgreSQL | Railway | Database |
| Mattermost | Railway | Messaging |
| R2 | Cloudflare | File storage |
| Clerk | Clerk.dev | Authentication |
| Resend | Resend.com | Email delivery |

### Environment Variables

#### Web App (Required)
```env
VITE_API_URL=https://api.handywriterz.com
VITE_CMS_URL=https://cms.handywriterz.com
VITE_CLERK_PUBLISHABLE_KEY=pk_xxx
VITE_MATTERMOST_URL=https://mm.handywriterz.com
```

#### API (Required)
```env
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_BUCKET=handywriterz-uploads
CLERK_SECRET_KEY=sk_xxx
STRAPI_URL=https://cms.handywriterz.com
STRAPI_TOKEN=xxx
MATTERMOST_URL=https://mm.handywriterz.com
MATTERMOST_ADMIN_TOKEN=xxx
```

---

## 📈 Feature Maturity Matrix

| Feature Area | Status | Maturity |
|--------------|--------|----------|
| Public Website | ✅ Complete | 90% |
| User Dashboard | ✅ Complete | 85% |
| Admin Dashboard | ✅ Complete | 80% |
| Order Management | 🟡 Partial | 60% |
| Payments | 🟡 Partial | 70% |
| Document Uploads | ✅ Complete | 95% |
| Messaging | ✅ Complete | 85% |
| Authentication | ✅ Complete | 95% |
| CMS Publishing | ✅ Complete | 85% |
| Turnitin System | ✅ Complete | 90% |
| Email Notifications | ✅ Complete | 85% |
| SEO | ✅ Complete | 80% |

---

## 📝 Technical Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| State | React Query, Context API |
| Routing | React Router v6 |
| Forms | React Hook Form, Zod |
| Backend | Express.js, Node.js |
| Database | PostgreSQL (via Strapi) |
| CMS | Strapi 5 |
| Auth | Clerk |
| Storage | Cloudflare R2 |
| Messaging | Mattermost |
| Email | Resend |
| Hosting | Railway |
| Icons | Lucide React |
| Charts | Recharts (ready) |
