# 🎯 STRAPI V5 - QUICK REFERENCE CARD

## ✅ CURRENT STATUS (October 1, 2025)

**Strapi Version:** 5.25.0 Enterprise
**Status:** ✅ RUNNING
**Admin Account:** ✅ CREATED
**Database:** SQLite
**Port:** 1337

---

## 🌐 IMPORTANT URLS

| Service | URL | Status |
|---------|-----|--------|
| **Admin Panel** | http://localhost:1337/admin | ✅ Working |
| **API Endpoint** | http://localhost:1337/api | ✅ Ready |
| **GraphQL Playground** | http://localhost:1337/graphql | ✅ Ready |
| **Web App** | http://localhost:5173 | ⏳ Need to update |

---

## 🔥 CRITICAL NEXT STEP

### **Generate API Token NOW**

You need this token for your React app to connect to Strapi.

**Steps:**

1. Open: http://localhost:1337/admin
2. Login with your admin credentials
3. Click **Settings** (⚙️ gear icon, left sidebar)
4. Under "Global Settings" → Click **API Tokens**
5. Click **Create new API Token** button
6. Fill in:
   ```
   Name: Web App Access
   Description: Token for React application
   Token duration: Unlimited
   Token type: Full access
   ```
7. Click **Save**
8. **COPY THE TOKEN IMMEDIATELY** (You won't see it again!)

**Update your web app:**

Edit: `D:/HandyWriterzNEW/apps/web/.env`

Find:
```bash
VITE_CMS_TOKEN=
```

Replace with:
```bash
VITE_CMS_TOKEN=your_copied_token_here
```

**Example:**
```bash
VITE_CMS_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Restart web app:**
```bash
cd D:/HandyWriterzNEW/apps/web
npm run dev
```

**Test:**
- Go to: http://localhost:5173/admin/content/new
- Create an article
- Click **Save**
- ✅ Should see "Article saved successfully!" (not "Failed to save")

---

## 📋 CREATE CONTENT TYPES (After Getting Token)

### **1. Service Content Type**

**In Strapi Admin:**

1. Click **Content-Type Builder** (🎨 paint palette icon)
2. Click **Create new collection type**
3. Display name: `Service`
4. Click **Continue**
5. Add fields (click **Add another field** for each):

**Fields:**
```
✅ title          → Text (required, max 255)
✅ slug           → UID (attached to title)
✅ domain         → Enumeration (nursing, ai, marketing, enterprise, education, research)
✅ summary        → Long text (required)
✅ body           → Rich text (required)
✅ heroImage      → Media (single image)
✅ featured       → Boolean (default: false)
✅ order          → Number (integer, default: 0)
```

6. Click **Save** (Strapi will restart)

### **2. Article Content Type**

Same process, create "Article" with:

```
✅ title          → Text (required)
✅ slug           → UID (attached to title)
✅ content        → Rich text (required)
✅ author         → Text
✅ category       → Text
✅ heroImage      → Media (single image)
✅ publishedAt    → DateTime
```

### **3. Enable Draft & Publish**

For both content types:
1. Click content type name → Click **Edit** (✏️)
2. **Advanced Settings** tab
3. Enable: **Draft & Publish**
4. Click **Save**

---

## 📝 ADD SAMPLE CONTENT

### **Create Nursing Service**

1. **Content Manager** → **Service** → **Create new entry**
2. Fill in:
   ```
   Title: Nursing Essay Writing Services
   Slug: nursing-essay-writing (auto)
   Domain: nursing
   Summary: Expert nursing essay writing with clinical precision
   Body: [Add detailed description]
   Featured: ✅
   Order: 1
   ```
3. Click **Save**
4. Click **Publish** ⬆️

### **Repeat for All Domains:**
- ai (Order: 2)
- marketing (Order: 3)
- enterprise (Order: 4)
- education (Order: 5)
- research (Order: 6)

---

## 🔗 UPDATE REACT DOMAIN PAGES

### **Example: Nursing Page**

**File:** `apps/web/src/pages/domains/NursingDomainPage.tsx`

**Remove hardcoded array, add:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '@/lib/cms-client';

export const NursingDomainPage: React.FC = () => {
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', 'nursing'],
    queryFn: async () => {
      const result = await cmsClient.getServices({
        filters: { domain: { $eq: 'nursing' } },
        sort: ['order:asc'],
        populate: ['heroImage'],
        publicationState: 'live'
      });
      return result.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <div className="min-h-screen">
      <ServiceGrid services={services} />
    </div>
  );
};
```

**Copy pattern for:**
- AIDomainPage.tsx (domain: 'ai')
- MarketingDomainPage.tsx (domain: 'marketing')
- EnterpriseDomainPage.tsx (domain: 'enterprise')
- EducationDomainPage.tsx (domain: 'education')
- ResearchDomainPage.tsx (domain: 'research')

---

## 🎨 FIX UI CONTRAST (Phase 3)

### **Input Fields**

**File:** `apps/web/src/components/ui/input.tsx`

Change:
```typescript
"text-muted-foreground"  // ❌ Faded
```

To:
```typescript
"text-foreground font-medium"  // ✅ Bold
"placeholder:text-muted-foreground"
"dark:text-white light:text-gray-900"
```

### **Textarea**

**File:** `apps/web/src/components/ui/textarea.tsx`

Same changes.

### **Fonts**

**File:** `apps/web/src/index.css`

Add at top:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');

@layer base {
  :root {
    --font-sans: 'Inter', sans-serif;
    --font-serif: 'Playfair Display', serif;
    font-family: var(--font-sans);
  }

  input, textarea, select {
    color: hsl(var(--foreground)) !important;
    font-weight: 500;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif);
  }
}
```

---

## ✅ VALIDATION CHECKLIST

**For EACH domain page:**

- [ ] Navigate to domain route
- [ ] Services load (no hardcoded)
- [ ] Open DevTools → Network → See GraphQL request
- [ ] Click service → Detail loads
- [ ] Edit in Strapi → Title changes
- [ ] Refresh page → See change ✅
- [ ] Unpublish in Strapi
- [ ] Refresh → Service disappears ✅
- [ ] Republish → Reappears ✅

**UI:**
- [ ] Input fields have dark text (readable)
- [ ] Headings use Playfair Display
- [ ] Body uses Inter
- [ ] Dark mode works

---

## 🚨 TROUBLESHOOTING

### **Strapi not starting**
```bash
cd D:/HandyWriterzNEW/apps/strapi
npm run develop
```

### **Can't save articles**
1. Check `VITE_CMS_TOKEN` in `apps/web/.env`
2. Verify token has "Full access"
3. Restart web app

### **Services not loading**
1. Check content is **Published** (not draft)
2. Verify `domain` field matches query
3. Check browser console for errors

### **GraphQL playground not working**
- http://localhost:1337/graphql
- If 404, check `config/plugins.ts` has graphql enabled

---

## 📞 START STRAPI

```bash
cd D:/HandyWriterzNEW/apps/strapi
npm run develop
```

## 📞 START WEB APP

```bash
cd D:/HandyWriterzNEW/apps/web
npm run dev
```

---

## 🎯 SUCCESS = ALL GREEN

✅ Strapi running on :1337
✅ API token generated
✅ Web app has token in .env
✅ Can save articles
✅ Domain pages load Strapi content
✅ Input fields readable
✅ Professional fonts loaded

---

**Full guide:** `STRAPI_V5_INSTALL_SUCCESS.md`
**Implementation plan:** `STRAPI_FIX_IMPLEMENTATION_PLAN.md`
