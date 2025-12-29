# HandyWriterz Cleanup Plan

> **Purpose**: Remove legacy files, consolidate duplicates, establish clean codebase  
> **Priority**: Execute before redesign implementation

---

## Files to Delete

### 1. Empty Hook Files

These files are empty stubs that cause confusion:

```
apps/web/src/hooks/useMMAuth.ts       # EMPTY - real impl in hooks/mattermost/
apps/web/src/hooks/useChannels.ts     # EMPTY - real impl in hooks/mattermost/
```

**Action**: Delete and update any imports to use `hooks/mattermost/` versions.

---

### 2. Legacy Components

```
apps/web/src/components/Orders/LegacyOrderForm.tsx
```

**Reason**: Replaced by Dashboard order creation flow.

---

### 3. Duplicate Toast System

Keep the root-level toast and remove the nested folder:

```
# DELETE (duplicate)
apps/web/src/components/ui/toast/
  ├── index.tsx
  ├── toaster.tsx
  └── use-toast.ts

# KEEP (primary)
apps/web/src/components/ui/toast.tsx
apps/web/src/components/ui/toaster.tsx
apps/web/src/components/ui/use-toast.ts
apps/web/src/components/ui/use-toast.tsx
```

**Action**: 
1. Audit imports using `toast/` folder
2. Update to use root-level toast
3. Delete `toast/` folder

---

### 4. Duplicate CMS Client

```
# DELETE (GraphQL duplicate)
apps/web/src/lib/cms-client.ts   (507 lines)

# KEEP (REST primary)
apps/web/src/lib/cms.ts          (687 lines)
```

**Reason**: Two completely separate clients cause inconsistency. Standardize on REST.

**Action**:
1. Identify all imports of `cms-client.ts`
2. Migrate to `cms.ts` equivalents
3. Delete `cms-client.ts`

---

## Files to Consolidate

### 1. Mattermost Hooks

Current structure has duplication:

```
# Root level (some empty)
apps/web/src/hooks/useMMAuth.ts
apps/web/src/hooks/useChannels.ts
apps/web/src/hooks/useTimeline.ts
apps/web/src/hooks/useTyping.ts

# Subfolder (actual implementations)
apps/web/src/hooks/mattermost/
  ├── useMMAuth.ts
  ├── useMattermostChannels.ts
  ├── useMattermostTimeline.ts
  └── useMattermostUsers.ts
```

**Target structure**:
```
apps/web/src/hooks/
  ├── index.ts                   # Re-exports
  ├── useAuth.ts
  ├── useCMS.ts
  ├── useDocumentSubmission.ts
  ├── useSubscription.ts
  ├── useUploads.ts
  ├── useUploadsHistory.ts
  └── mattermost/               # All MM hooks here
      ├── index.ts              # Re-exports
      ├── useMMAuth.ts
      ├── useMattermostChannels.ts
      ├── useMattermostTimeline.ts
      ├── useMattermostTyping.ts
      └── useMattermostUsers.ts
```

---

### 2. Dashboard Components

Current monolith needs decomposition:

```
# CURRENT (2027 lines!)
apps/web/src/components/Dashboard/Dashboard.tsx

# TARGET (decomposed)
apps/web/src/components/dashboard/
  ├── index.ts
  ├── DashboardHome.tsx         # Main dashboard view
  ├── QuickActions.tsx          # Action buttons
  ├── RecentOrders.tsx          # Order list widget
  ├── Notifications.tsx         # Notification feed
  │
  ├── order-creator/
  │   ├── index.tsx             # Order creation flow
  │   ├── AreaSelector.tsx      # Support area selection
  │   ├── ServiceSelector.tsx   # Service type selection
  │   ├── OrderForm.tsx         # Order details form
  │   ├── PriceCalculator.tsx   # Dynamic pricing
  │   └── PaymentCTA.tsx        # Proceed to payment
  │
  ├── document-uploader/
  │   ├── index.tsx             # Upload flow
  │   ├── DropZone.tsx          # Drag & drop area
  │   ├── FileList.tsx          # Queued files
  │   ├── UploadProgress.tsx    # Progress indicators
  │   └── AdminNotify.tsx       # Send to admin
  │
  └── messaging/
      ├── index.tsx             # Messaging center
      ├── ChannelList.tsx       # Channel sidebar
      ├── Timeline.tsx          # Message thread
      └── Composer.tsx          # Message input
```

---

### 3. Duplicate Order Components

```
# CURRENT (duplication)
apps/web/src/components/Dashboard/Orders.tsx
apps/web/src/pages/dashboard/Orders.tsx

# TARGET (single source)
apps/web/src/pages/dashboard/Orders.tsx      # Page component
apps/web/src/components/dashboard/orders/    # Shared components
  ├── OrderList.tsx
  ├── OrderCard.tsx
  ├── OrderFilters.tsx
  └── OrderStatus.tsx
```

---

## Schema Alignment

### Domain Enum Mismatch

**Strapi Schema** (`apps/strapi/src/api/service/content-types/service/schema.json`):
```json
{
  "domain": {
    "type": "enumeration",
    "enum": ["nursing", "ai", "crypto", "marketing", "enterprise", "education", "research"]
  }
}
```

**Frontend Taxonomy** (`config/taxonomy.json`):
```json
{
  "domains": [
    { "slug": "adult-nursing" },
    { "slug": "adult-health" },
    { "slug": "mental-health" },
    { "slug": "child-nursing" },
    { "slug": "social-work" },
    { "slug": "technology" },
    { "slug": "ai" },
    { "slug": "crypto" }
  ]
}
```

**Action**: Update Strapi enum to match taxonomy slugs:
```json
{
  "domain": {
    "type": "enumeration",
    "enum": [
      "adult-nursing",
      "mental-health",
      "child-nursing",
      "social-work",
      "technology",
      "ai",
      "crypto"
    ]
  }
}
```

---

## Import Path Cleanup

### Update Required

After cleanup, update imports across the codebase:

```typescript
// Before
import { useToast } from '@/components/ui/toast/use-toast';
import { fetchArticles } from '@/lib/cms-client';
import { useMMAuth } from '@/hooks/useMMAuth';  // empty file

// After
import { useToast } from '@/components/ui/use-toast';
import { fetchArticlesList } from '@/lib/cms';
import { useMMAuth } from '@/hooks/mattermost';
```

---

## Old Documentation Cleanup

### Files to Archive

Move to `docs/archive/` for reference:

```
docs/
├── ACTION_PLAN_NEXT_STEPS.md
├── ADMIN_CONFIG_FIXED.md
├── ADMIN_CONTENT_EDITOR_ANALYSIS.md
├── ADMIN_CREATED_SUCCESS.md
├── BACKLOG_PRIORITIES.md
├── CLEANUP_SUMMARY.md
├── CRITICAL_FIXES_AND_DEPLOYMENT.md
├── DEPLOYMENT_COMMANDS.md
├── DEPLOYMENT_FIXES.md
├── DEPLOYMENT_READY.md
├── DEPLOYMENT_RESTARTED_WITH_URL.md
├── ERROR_FIX_PLAN.md
├── EXECUTE_NOW.md
├── FIX_VISUAL_SUMMARY.md
├── IMMEDIATE_ACTION_CHECKLIST.md
├── IMMEDIATE_DEPLOYMENT_STEPS.md
├── IMMEDIATE_NEXT_STEPS.md
├── IMPLEMENTATION_PRIORITIES.md
├── IMPLEMENTATION_SUMMARY.md
├── IMPROVEMENT_PLAN.md
├── ISSUE_RESOLUTION_SUMMARY.md
├── MIDDLEWARE_FIX_FINAL.md
├── PHASE1_PROGRESS.md
├── POST_LOGIN_CHECKLIST.md
├── PRE_DEPLOYMENT_VALIDATION.md
├── PRODUCTION_ADMIN_RESET.md
├── PRODUCTION_DEPLOYMENT.md
├── PRODUCTION_READY_STATUS.md
├── PRODUCTION_READY_SUMMARY.md
├── PRODUCTION_STATUS.md
├── QUICK_ACTION_CHECKLIST.md
├── QUICK_FIX_RAILWAY_ADMIN.md
├── RAILWAY_*.md (all Railway troubleshooting docs)
├── RELEASE_BLOCKERS_COMPLETE.md
├── RESET_ADMIN_NOW.md
├── RESET_PASSWORD_GUIDE.md
├── SESSION_SUMMARY.md
├── SUCCESS_SUMMARY.md
├── TYPESCRIPT_ERROR_RESOLUTION.md
├── UI_FIXES_SUMMARY.md
├── UI_UX_FIXES_COMPLETE.md
├── URGENT_FIX_NOW.md
├── WEB_BUILD_TIME_ENV_FIX.md
├── WEB_DEPLOYMENT_STATUS.md
└── WEB_SERVICE_GITHUB_FIX.md
```

### Files to Keep (Consolidate into docs/NEW/)

```
docs/
├── PRODUCT_SPEC.md       → Reference only
├── ARCHITECTURE_DIAGRAM.md → Merge into ARCHITECTURE.md
├── DEVELOPMENT_ROADMAP.md  → Update with new plan
├── TESTING_GUIDE.md        → Keep, update
├── QUICK_START.md          → Keep, update
└── README.md               → Keep, update
```

---

## Execution Order

### Phase 1: Safe Deletions
1. Delete empty hook files
2. Delete `LegacyOrderForm.tsx`
3. Delete duplicate `toast/` folder

### Phase 2: Import Updates
1. Find all imports of deleted files
2. Update to correct paths
3. Verify build succeeds

### Phase 3: CMS Client Consolidation
1. Audit `cms-client.ts` usage
2. Create migration mapping
3. Update imports
4. Delete `cms-client.ts`

### Phase 4: Documentation Archive
1. Create `docs/archive/`
2. Move old docs
3. Consolidate remaining into `docs/NEW/`

### Phase 5: Schema Alignment
1. Update Strapi domain enum
2. Test CMS filtering
3. Verify frontend displays correctly

---

## Verification

After cleanup, verify:

```bash
# Build passes
pnpm --filter web build

# Type check passes
pnpm --filter web type-check

# No dead imports
grep -r "cms-client" apps/web/src/
grep -r "toast/" apps/web/src/
grep -r "LegacyOrderForm" apps/web/src/

# Tests pass (if any)
pnpm test
```

---

*Execute this cleanup before starting redesign implementation to ensure a clean foundation.*
