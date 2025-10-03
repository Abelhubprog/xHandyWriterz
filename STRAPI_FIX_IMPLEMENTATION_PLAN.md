# Strapi Connection & CMS Implementation Plan

**Date:** October 1, 2025
**Status:** 🚧 Implementation in Progress
**Priority:** P0 - CRITICAL

---

## 🎯 Objectives

### Phase 1: Strapi Setup ✅ (Current)
1. ✅ Fix Strapi package versions (upgrade to v5)
2. ✅ Start Strapi service
3. ✅ Create admin account
4. ✅ Generate API token
5. ✅ Configure web app connection

### Phase 2: Content Management 🔄 (Next)
1. Create content types (Service, Article, Domain)
2. Populate with initial content
3. Test publish/draft workflows in all domain pages
4. Remove hardcoded content after validation

### Phase 3: UI/UX Improvements 🎨
1. Fix input field text contrast (faded → black)
2. Apply professional fonts
3. Enhance file upload UI
4. Add content management tools

### Phase 4: File Sharing & Messaging 💬
1. Complete file sharing implementation
2. Fix messaging integration
3. Validate end-to-end

### Phase 5: Mattermost Integration 🚀
1. Build real-time messaging
2. Add collaboration features
3. Connect to content editor

---

## 📋 Phase 1: Strapi Setup - DETAILED STEPS

### Step 1.1: Upgrade Strapi to v5

**Problem:** Currently using Strapi v4.25.0, need v5 for GraphQL compatibility

**Solution:**

#### Update `apps/strapi/package.json`:
```json
{
  "name": "@handywriterz/strapi",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build",
    "strapi": "strapi",
    "export": "strapi export",
    "import": "strapi import",
    "lint": "echo 'Strapi uses ESLint internally'",
    "type-check": "tsc --project tsconfig.json --noEmit"
  },
  "dependencies": {
    "@strapi/plugin-cloud": "5.0.0",
    "@strapi/plugin-graphql": "5.0.0",
    "@strapi/plugin-i18n": "5.0.0",
    "@strapi/plugin-users-permissions": "5.0.0",
    "@strapi/provider-upload-aws-s3": "5.0.0",
    "@strapi/strapi": "5.0.0",
    "better-sqlite3": "11.3.0",
    "pg": "^8.13.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "styled-components": "^6.1.13"
  },
  "devDependencies": {
    "@strapi/sdk-plugin": "5.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.7.2"
  },
  "strapi": {
    "uuid": "00000000-0000-4000-8000-000000000000"
  },
  "engines": {
    "node": ">=18.0.0 <=22.x.x",
    "npm": ">=6.0.0"
  }
}
```

#### Commands:
```bash
cd apps/strapi
rm -rf node_modules package-lock.json
pnpm install
```

---

### Step 1.2: Create Content Type Schemas

#### Service Content Type
**File:** `apps/strapi/src/api/service/content-types/service/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "services",
  "info": {
    "singularName": "service",
    "pluralName": "services",
    "displayName": "Service",
    "description": "Academic services offered"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "summary": {
      "type": "text",
      "required": true
    },
    "body": {
      "type": "richtext",
      "required": true
    },
    "domain": {
      "type": "enumeration",
      "enum": [
        "nursing",
        "ai",
        "marketing",
        "enterprise",
        "education",
        "research"
      ],
      "required": true
    },
    "typeTags": {
      "type": "json",
      "default": []
    },
    "heroImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    },
    "attachments": {
      "type": "media",
      "multiple": true,
      "required": false
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "seo.metadata"
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "order": {
      "type": "integer",
      "default": 0
    }
  }
}
```

#### Article Content Type
**File:** `apps/strapi/src/api/article/content-types/article/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article",
    "description": "Blog articles and content"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "summary": {
      "type": "text"
    },
    "content": {
      "type": "richtext",
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "review", "scheduled", "published", "archived"],
      "default": "draft"
    },
    "domain": {
      "type": "enumeration",
      "enum": [
        "nursing",
        "ai",
        "marketing",
        "enterprise",
        "education",
        "research"
      ]
    },
    "categories": {
      "type": "json",
      "default": []
    },
    "tags": {
      "type": "json",
      "default": []
    },
    "heroImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "gallery": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images", "videos"]
    },
    "attachments": {
      "type": "media",
      "multiple": true
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "admin::user"
    },
    "scheduledAt": {
      "type": "datetime"
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "seo.metadata"
    },
    "viewCount": {
      "type": "integer",
      "default": 0
    },
    "likeCount": {
      "type": "integer",
      "default": 0
    },
    "shareCount": {
      "type": "integer",
      "default": 0
    }
  }
}
```

#### SEO Component
**File:** `apps/strapi/src/components/seo/metadata.json`

```json
{
  "collectionName": "components_seo_metadata",
  "info": {
    "displayName": "SEO Metadata",
    "description": "SEO fields for content"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "maxLength": 60
    },
    "description": {
      "type": "text",
      "maxLength": 160
    },
    "keywords": {
      "type": "json",
      "default": []
    },
    "ogImage": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "canonical": {
      "type": "string"
    }
  }
}
```

---

### Step 1.3: Start Strapi

```bash
cd apps/strapi
pnpm run develop
```

**Expected Output:**
```
[2025-10-01 10:00:00.000] info: Welcome back!
[2025-10-01 10:00:00.000] info: To manage your project 🚀, go to the administration panel at:
http://localhost:1337/admin

[2025-10-01 10:00:00.000] info: To access the server ⚡️, go to:
http://localhost:1337
```

---

### Step 1.4: Create Admin Account

1. Open browser: `http://localhost:1337/admin`
2. Fill registration form:
   - **First name:** Admin
   - **Last name:** User
   - **Email:** admin@handywriterz.com
   - **Password:** (use strong password)
3. Click "Let's start"

---

### Step 1.5: Generate API Token

1. In Strapi admin, go to: **Settings** → **API Tokens** → **Create new API Token**
2. Configure:
   - **Name:** Web App Access
   - **Description:** Token for web application to access content
   - **Token duration:** Unlimited
   - **Token type:** Full access
3. Click **Save**
4. **IMPORTANT:** Copy the generated token immediately (you won't see it again)

Example token format:
```
e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
```

---

### Step 1.6: Configure Web App

**File:** `apps/web/.env`

Update line 6:
```bash
VITE_CMS_TOKEN=e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
```

**Restart web app:**
```bash
cd apps/web
pnpm run dev
```

---

### Step 1.7: Verify Connection

**Test in browser console:**
```javascript
// Open http://localhost:5173/admin/content/new
// Open DevTools → Console
// Run:
fetch('http://localhost:1337/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    query: '{ articles { data { id attributes { title } } } }'
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ Strapi connected:', data))
  .catch(err => console.error('❌ Connection failed:', err));
```

**Expected:** `✅ Strapi connected: { data: { articles: { data: [] } } }`

---

## 📋 Phase 2: Content Management

### Step 2.1: Create Initial Services

**In Strapi admin:**

1. Go to **Content Manager** → **Service** → **Create new entry**

#### Nursing Services
```yaml
Title: "Nursing Essay Writing Services"
Slug: "nursing-essay-writing"
Summary: "Expert nursing essay writing with clinical precision"
Body: |
  Our nursing essay writing services combine academic excellence with clinical expertise.
  We help nursing students with:

  - Clinical case studies
  - Reflective essays
  - Evidence-based practice papers
  - Nursing care plans
  - Literature reviews

  All our writers hold advanced nursing degrees and understand HIPAA compliance.
Domain: nursing
Type Tags: ["essay", "writing", "clinical"]
Featured: true
Order: 1
Status: Published
```

#### AI Services
```yaml
Title: "AI & Machine Learning Research Papers"
Slug: "ai-research-papers"
Summary: "Cutting-edge AI research assistance"
Body: |
  We provide expert assistance with AI and machine learning research papers:

  - Algorithm design and analysis
  - Model evaluation papers
  - Survey papers on AI trends
  - Technical white papers
  - Conference paper preparation

  Our team includes PhD researchers in AI/ML.
Domain: ai
Type Tags: ["research", "technical", "papers"]
Featured: true
Order: 2
Status: Published
```

#### Marketing Services
```yaml
Title: "Marketing Strategy Case Studies"
Slug: "marketing-case-studies"
Summary: "Professional marketing analysis and strategy"
Body: |
  Expert marketing case study assistance:

  - Brand analysis
  - Market research reports
  - Digital marketing strategies
  - Consumer behavior studies
  - Campaign performance analysis

  Real-world marketing expertise applied to academic requirements.
Domain: marketing
Type Tags: ["case-study", "analysis", "strategy"]
Featured: true
Order: 3
Status: Published
```

**Repeat for:** Enterprise, Education, Research domains

---

### Step 2.2: Update Domain Pages to Use Strapi

**File:** `apps/web/src/pages/domains/NursingDomainPage.tsx`

**Current (hardcoded):**
```typescript
const services = [
  { id: 1, title: 'Nursing Essays', description: '...' },
  // ... hardcoded array
];
```

**New (Strapi-powered):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchServicesList } from '@/lib/cms';

export const NursingDomainPage: React.FC = () => {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', 'nursing'],
    queryFn: () => fetchServicesList({
      filters: { domain: { $eq: 'nursing' } },
      sort: ['order:asc', 'title:asc'],
      populate: ['heroImage', 'seo']
    }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="min-h-screen">
      <DomainHeader
        title="Nursing Academic Services"
        description="Clinical expertise meets academic excellence"
      />

      <ServiceGrid services={services} />
    </div>
  );
};
```

**Repeat for all domain pages:**
- `NursingDomainPage.tsx` ✅
- `AIDomainPage.tsx` ✅
- `MarketingDomainPage.tsx` ✅
- `EnterpriseDomainPage.tsx` ✅
- `EducationDomainPage.tsx` ✅
- `ResearchDomainPage.tsx` ✅

---

### Step 2.3: Validation Checklist

**Test each domain:**

1. ✅ Navigate to `/d/nursing`
2. ✅ Verify services load from Strapi (not hardcoded)
3. ✅ Click service → opens detail page
4. ✅ Detail page shows Strapi content
5. ✅ Check SEO metadata in `<head>`
6. ✅ Test publish workflow in admin
7. ✅ Test draft visibility (drafts not shown)
8. ✅ Test edit → save → refresh flow

**Repeat for:** `/d/ai`, `/d/marketing`, `/d/enterprise`, `/d/education`, `/d/research`

---

### Step 2.4: Remove Hardcoded Content

**Once validated, remove:**

```bash
# Search for hardcoded service arrays
grep -r "const services = \[" apps/web/src/pages/domains/

# Replace each with Strapi queries
# Delete old JSON files if any
find apps/web/src/data -name "*.json" -type f
```

---

## 📋 Phase 3: UI/UX Improvements

### Step 3.1: Fix Input Field Contrast

**Problem:** Input fields have faded text, hard to read

**Files to update:**
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/pages/admin/ArticleEditor.tsx`

**Solution:**

```typescript
// apps/web/src/components/ui/input.tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // OLD: "text-muted-foreground"
          // NEW: "text-foreground font-medium",
          "text-foreground font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Add better contrast for light/dark mode
          "dark:text-white dark:bg-gray-800 dark:border-gray-700",
          "light:text-gray-900 light:bg-white light:border-gray-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
);
```

```typescript
// apps/web/src/components/ui/textarea.tsx
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // NEW: Better contrast
          "text-foreground font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:text-white dark:bg-gray-800",
          "light:text-gray-900 light:bg-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
);
```

---

### Step 3.2: Apply Professional Fonts

**File:** `apps/web/src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Typography */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-serif: 'Playfair Display', Georgia, serif;

    /* Better text rendering */
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Input fields with better contrast */
  input, textarea, select {
    color: hsl(var(--foreground)) !important;
    font-weight: 500;
  }

  input::placeholder,
  textarea::placeholder {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 0.6;
  }

  /* Dark mode specific */
  .dark input,
  .dark textarea,
  .dark select {
    color: #ffffff !important;
    background-color: hsl(var(--background));
  }

  /* Headings with serif font */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif);
    font-weight: 700;
  }
}
```

**Update Tailwind config:**

```javascript
// apps/web/tailwind.config.cjs
module.exports = {
  // ... existing config
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      // ... rest of config
    }
  }
};
```

---

### Step 3.3: Enhance File Upload UI

**File:** `apps/web/src/pages/dashboard/DocumentsUpload.tsx`

**Add better visual feedback:**

```typescript
// Improve dropzone styling
<div
  className={cn(
    "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
    isDragging
      ? "border-primary bg-primary/5 scale-105"
      : "border-gray-300 dark:border-gray-700 hover:border-primary/50",
    "cursor-pointer"
  )}
  onDrop={handleDrop}
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
>
  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
  <p className="text-lg font-semibold text-foreground mb-2">
    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
  </p>
  <p className="text-sm text-muted-foreground mb-4">
    or click to browse
  </p>
  <Button variant="outline" size="sm">
    Select Files
  </Button>
</div>
```

---

### Step 3.4: Add Content Management Tools

**Create toolbar component:**

**File:** `apps/web/src/components/admin/ContentToolbar.tsx` (NEW)

```typescript
import React from 'react';
import {
  Save,
  Eye,
  Clock,
  Trash2,
  Copy,
  Share2,
  FileText,
  Image,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onSchedule: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  saving?: boolean;
  canDelete?: boolean;
}

export const ContentToolbar: React.FC<ContentToolbarProps> = ({
  onSave,
  onPreview,
  onSchedule,
  onDelete,
  onDuplicate,
  onShare,
  saving = false,
  canDelete = false,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Button onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>

        <Button variant="outline" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>

        <Button variant="outline" onClick={onSchedule}>
          <Clock className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
```

**Integrate into ArticleEditor:**

```typescript
// At top of ArticleEditor return statement
<ContentToolbar
  onSave={() => handleSave(false)}
  onPreview={handlePreview}
  onSchedule={handleScheduleModal}
  onDelete={handleDelete}
  onDuplicate={handleDuplicate}
  onShare={handleShare}
  saving={saving}
  canDelete={isEditing}
/>
```

---

## 📋 Phase 4: File Sharing & Messaging

### Step 4.1: Complete Upload Broker Integration

**Verify worker is running:**

```bash
cd workers/upload-broker
pnpm run dev
```

**Expected:** `⛅️ wrangler 3.x.x Running on http://127.0.0.1:8787`

---

### Step 4.2: Test File Upload Flow

1. Navigate to `/dashboard/documents`
2. Select file
3. **Expected behavior:**
   - Progress bar appears
   - File uploads to R2
   - Success message shows
   - File appears in history
   - Copy link works
   - Download works

---

### Step 4.3: Fix MessageCenter Integration

**File:** `apps/web/src/components/Messaging/MessageCenter.tsx`

**Add connection status indicator:**

```typescript
const [mattermostStatus, setMattermostStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

useEffect(() => {
  const checkMattermost = async () => {
    if (!mattermostUrl) {
      setMattermostStatus('disconnected');
      return;
    }

    try {
      const response = await fetch(`${mattermostUrl}/api/v4/system/ping`);
      if (response.ok) {
        setMattermostStatus('connected');
      } else {
        setMattermostStatus('disconnected');
      }
    } catch {
      setMattermostStatus('disconnected');
    }
  };

  checkMattermost();
}, [mattermostUrl]);

// Add status badge
<div className="flex items-center gap-2 mb-4">
  <Badge variant={mattermostStatus === 'connected' ? 'default' : 'destructive'}>
    {mattermostStatus === 'connected' ? '● Connected' : '○ Disconnected'}
  </Badge>
</div>
```

---

## 📋 Phase 5: Mattermost Real-Time Integration

### Step 5.1: Create Mattermost Client Hook

**(Already detailed in ADMIN_CONTENT_EDITOR_ANALYSIS.md)**

Key files to create:
1. `apps/web/src/hooks/useMattermost.ts`
2. `apps/web/src/components/Messaging/MessageThread.tsx`
3. Update `ArticleEditor.tsx` with collaboration panel

---

## ✅ Implementation Checklist

### Phase 1: Strapi Setup
- [ ] Upgrade to Strapi v5
- [ ] Install dependencies
- [ ] Start Strapi server
- [ ] Create admin account
- [ ] Generate API token
- [ ] Update web app .env
- [ ] Verify GraphQL connection

### Phase 2: Content Management
- [ ] Create Service content type
- [ ] Create Article content type
- [ ] Create SEO component
- [ ] Add 6+ services (one per domain)
- [ ] Update NursingDomainPage to use Strapi
- [ ] Update AIDomainPage to use Strapi
- [ ] Update MarketingDomainPage to use Strapi
- [ ] Update EnterpriseDomainPage to use Strapi
- [ ] Update EducationDomainPage to use Strapi
- [ ] Update ResearchDomainPage to use Strapi
- [ ] Test publish/draft in each domain
- [ ] Validate all 6 domains working
- [ ] Remove hardcoded content

### Phase 3: UI/UX Improvements
- [ ] Fix Input component contrast
- [ ] Fix Textarea component contrast
- [ ] Add professional fonts (Inter + Playfair Display)
- [ ] Improve file upload dropzone
- [ ] Create ContentToolbar component
- [ ] Test dark mode contrast
- [ ] Test light mode contrast

### Phase 4: File Sharing & Messaging
- [ ] Start upload-broker worker
- [ ] Test file upload end-to-end
- [ ] Add MessageCenter status indicator
- [ ] Verify Mattermost embed works
- [ ] Test file history retrieval

### Phase 5: Mattermost Integration
- [ ] Create useMattermost hook
- [ ] Create MessageThread component
- [ ] Add to ArticleEditor sidebar
- [ ] Test channel creation
- [ ] Test message send/receive
- [ ] Test real-time updates

---

## 🚨 Known Issues & Fixes

### Issue 1: Strapi v4 → v5 Migration
**Symptom:** Invalid package.json
**Fix:** Update all @strapi packages to v5.0.0

### Issue 2: Faded Input Text
**Symptom:** Can barely see text in inputs
**Fix:** Change text color from `text-muted-foreground` to `text-foreground font-medium`

### Issue 3: Missing API Token
**Symptom:** "Failed to save article"
**Fix:** Generate token in Strapi admin, add to VITE_CMS_TOKEN

### Issue 4: Hardcoded Services
**Symptom:** Content not editable
**Fix:** Replace hardcoded arrays with Strapi queries

---

## 📊 Success Criteria

**Phase 1 Complete When:**
- ✅ Strapi starts without errors
- ✅ Admin can log into http://localhost:1337/admin
- ✅ API token generated
- ✅ Web app connects to GraphQL endpoint
- ✅ Test query returns data

**Phase 2 Complete When:**
- ✅ All 6 domain pages show Strapi content
- ✅ Can publish service in admin
- ✅ Published service appears on domain page
- ✅ Draft service does NOT appear
- ✅ Can edit and re-save content
- ✅ No hardcoded content remains

**Phase 3 Complete When:**
- ✅ All input fields have black text (easily readable)
- ✅ Professional fonts loaded
- ✅ File upload UI looks polished
- ✅ ContentToolbar provides all tools
- ✅ Both light and dark modes work well

**Phase 4 Complete When:**
- ✅ File uploads succeed
- ✅ Download links work
- ✅ MessageCenter shows connection status
- ✅ Mattermost embed displays

**Phase 5 Complete When:**
- ✅ Real-time messaging works in ArticleEditor
- ✅ Can see other collaborators
- ✅ Messages appear in both directions
- ✅ Channels auto-create for articles

---

**NEXT:** Execute Phase 1 - Strapi v5 Upgrade
