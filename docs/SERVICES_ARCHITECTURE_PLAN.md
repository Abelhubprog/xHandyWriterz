# Services Architecture & Strapi CMS Integration Plan

## 📊 **Current State vs Target State**

### **Current Issues:**
1. ❌ `/services` page is too basic (just a placeholder)
2. ❌ Domain pages (`/d/adult-health`) show "coming soon" 
3. ❌ No article detail pages exist yet
4. ❌ Homepage service cards have faded text
5. ✅ ModernContentRenderer exists and ready to handle mixed content

### **Target Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                             │
│  (localhost:5173/)                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ Adult Health│ │Mental Health│ │ Child Nurse │  ← Service Cards
│  │  Nursing   │ │   Nursing   │ │            │             │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘             │
│        │              │               │                      │
└────────┼──────────────┼───────────────┼──────────────────────┘
         │              │               │
         │              │               └──────────┐
         │              └──────────┐              │
         └──────────┐              │              │
                    ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES HUB PAGE                         │
│  (localhost:5173/services)                                   │
│                                                              │
│  🔍 Search & Filter                                         │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Grid of ALL Services (6-12 cards)              │      │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │      │
│  │  │Adult │ │Mental│ │Child │ │Social│  ...      │      │
│  │  │Health│ │Health│ │Nurse │ │Work  │          │      │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘          │      │
│  └─────┼────────┼────────┼────────┼─────────────────┘      │
│        │        │        │        │                         │
└────────┼────────┼────────┼────────┼─────────────────────────┘
         │        │        │        │
         ▼        ▼        ▼        ▼
┌─────────────────────────────────────────────────────────────┐
│              DOMAIN DETAIL PAGE                              │
│  (localhost:5173/d/adult-health)                            │
│                                                              │
│  🎯 Hero Section                                            │
│  📝 Domain Overview                                         │
│  📚 Articles in this Domain:                                │
│     ┌─────────────────────────────────────┐                │
│     │ Article 1: Basic Adult Care         │ ← Click        │
│     │ Article 2: Advanced Techniques      │                │
│     │ Article 3: Mental Health in Adults  │                │
│     └─────────────────────────────────────┘                │
│  🔗 Related Domains (sidebar)                               │
│        │                                                     │
└────────┼─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              ARTICLE DETAIL PAGE                             │
│  (localhost:5173/d/adult-health/basic-adult-care)          │
│                                                              │
│  📖 Table of Contents (sticky sidebar)                      │
│  📝 Full Article Content:                                   │
│     ┌─────────────────────────────────────┐                │
│     │ # Heading                           │ ← TEXT         │
│     │ Lorem ipsum dolor sit...            │                │
│     │                                     │                │
│     │ [Video Player with Controls]        │ ← VIDEO        │
│     │                                     │                │
│     │ More text content here...           │ ← TEXT         │
│     │                                     │                │
│     │ [Audio Player]                      │ ← AUDIO        │
│     │                                     │                │
│     │ [Image with Caption]                │ ← IMAGE        │
│     │                                     │                │
│     │ ```python                           │ ← CODE         │
│     │ def hello():                        │                │
│     │     print("Hello")                  │                │
│     │ ```                                 │                │
│     │                                     │                │
│     │ Final paragraph...                  │ ← TEXT         │
│     └─────────────────────────────────────┘                │
│  💬 Comments & Reactions                                    │
│  🔗 Related Articles                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Strapi CMS Structure**

### **Content Types to Create:**

#### 1. **Service** (Collection Type)
```javascript
{
  title: "Adult Health Nursing",
  slug: "adult-health",
  description: "Expert support for adult nursing students",
  icon: "GraduationCap", // Icon name
  color: "from-emerald-500 to-emerald-600",
  bgColor: "from-emerald-100/40 to-emerald-200/20",
  badge: "Popular", // Optional
  featured: true,
  heroImage: Media,
  heroVideo: Media, // Optional
  overview: RichText, // Domain overview content
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  articles: Relation (has many Article)
}
```

#### 2. **Article** (Collection Type)
```javascript
{
  title: "Basic Adult Care Techniques",
  slug: "basic-adult-care",
  service: Relation (belongs to Service),
  author: Relation (belongs to User),
  publishedAt: DateTime,
  readTime: Number, // minutes
  heroImage: Media,
  excerpt: Text,
  content: JSON, // Array of ContentBlock objects
  tableOfContents: JSON, // Auto-generated from headings
  tags: Relation (has many Tag),
  relatedArticles: Relation (has many Article),
  viewCount: Number,
  likes: Number,
  featured: Boolean,
  metaTitle: String,
  metaDescription: String
}
```

#### 3. **ContentBlock** Structure (JSON field in Article)
```typescript
// This matches ModernContentRenderer expectations!
type ContentBlock = 
  | { type: 'heading', level: 1-6, text: string, id: string }
  | { type: 'paragraph', text: string }
  | { type: 'image', url: string, alt: string, caption: string }
  | { type: 'video', url: string, caption: string, poster: string }
  | { type: 'audio', url: string, caption: string }
  | { type: 'code', language: string, code: string, filename: string }
  | { type: 'quote', text: string, author: string }
  | { type: 'list', ordered: boolean, items: string[] }
  | { type: 'callout', variant: 'info|warning|success|error', text: string }
  | { type: 'divider' }
  | { type: 'embed', html: string, caption: string }
```

**Example Article Content in Strapi:**
```json
{
  "content": [
    { "type": "heading", "level": 1, "text": "Introduction to Adult Care", "id": "intro" },
    { "type": "paragraph", "text": "Adult health nursing is a critical field..." },
    { 
      "type": "video", 
      "url": "https://cdn.example.com/videos/adult-care-intro.mp4",
      "caption": "Introduction to basic techniques",
      "poster": "https://cdn.example.com/thumbnails/adult-care.jpg"
    },
    { "type": "paragraph", "text": "After watching the video, let's dive into..." },
    {
      "type": "audio",
      "url": "https://cdn.example.com/audio/lecture-1.mp3",
      "caption": "Lecture: Fundamentals of Patient Care"
    },
    { "type": "heading", "level": 2, "text": "Key Techniques", "id": "techniques" },
    {
      "type": "image",
      "url": "https://cdn.example.com/images/technique-diagram.jpg",
      "alt": "Patient care technique diagram",
      "caption": "Figure 1: Proper patient positioning"
    },
    {
      "type": "code",
      "language": "python",
      "code": "def calculate_dosage(weight, age):\n    return weight * 0.5",
      "filename": "dosage_calculator.py"
    },
    { "type": "paragraph", "text": "In conclusion..." }
  ]
}
```

---

## 🏗️ **Implementation Steps**

### **Phase 1: Fix Homepage Faded Text** (5 min)
- [ ] Update card text colors to be more visible
- [ ] Ensure icons are visible (already done with solid colors)

### **Phase 2: Build Services Hub Page** (2 hours)
**File**: `apps/web/src/pages/services/ServicesHub.tsx`

**Features:**
- [ ] Grid layout showing ALL services
- [ ] Search bar (filter by title/description)
- [ ] Category filter buttons
- [ ] Each card links to `/d/{domain}`
- [ ] Fetch services from Strapi
- [ ] Fallback to hardcoded data if Strapi down

### **Phase 3: Build Domain Detail Page** (3 hours)
**File**: `apps/web/src/pages/domains/DomainDetailPage.tsx`

**Features:**
- [ ] Hero section with service info
- [ ] Overview content (from Strapi)
- [ ] List of articles in this domain
- [ ] Sidebar with related domains
- [ ] Breadcrumb navigation
- [ ] SEO metadata

### **Phase 4: Build Article Detail Page** (4 hours)
**File**: `apps/web/src/pages/articles/ArticleDetailPage.tsx`

**Features:**
- [ ] Sticky table of contents
- [ ] ModernContentRenderer for article content
- [ ] Author info card
- [ ] Read time & publish date
- [ ] Comments section
- [ ] Related articles
- [ ] Share buttons
- [ ] Print view

### **Phase 5: Strapi CMS Setup** (2 hours)
- [ ] Create Service content type
- [ ] Create Article content type
- [ ] Create Tag content type
- [ ] Set up relationships
- [ ] Configure media library
- [ ] Create API permissions

### **Phase 6: API Integration** (2 hours)
**File**: `apps/web/src/lib/cms.ts`

- [ ] Add `fetchServices()` function
- [ ] Add `fetchServiceBySlug()` function
- [ ] Add `fetchArticles()` function
- [ ] Add `fetchArticleBySlug()` function
- [ ] Add error handling & caching

---

## 🎨 **UI Components Needed**

### **Already Built:**
✅ `ModernContentRenderer` - Handles mixed content types  
✅ `SEOHead` - Manages meta tags  
✅ Homepage service cards (need color fix)

### **Need to Build:**

#### 1. **ServiceCard** Component
```tsx
<ServiceCard 
  title="Adult Health Nursing"
  description="Expert support..."
  icon={GraduationCap}
  color="emerald"
  link="/d/adult-health"
  articleCount={12}
/>
```

#### 2. **ArticleCard** Component
```tsx
<ArticleCard
  title="Basic Adult Care"
  excerpt="Learn the fundamentals..."
  readTime={8}
  author={{ name: "Dr. Smith", avatar: "..." }}
  publishedAt="2024-10-01"
  heroImage="..."
  link="/d/adult-health/basic-adult-care"
/>
```

#### 3. **TableOfContents** Component
```tsx
<TableOfContents
  headings={[
    { id: 'intro', text: 'Introduction', level: 1 },
    { id: 'techniques', text: 'Key Techniques', level: 2 }
  ]}
  activeId="techniques"
/>
```

#### 4. **RelatedArticles** Component
```tsx
<RelatedArticles articles={[...]} />
```

#### 5. **CommentSection** Component
```tsx
<CommentSection articleId="123" />
```

---

## 📝 **Sample Data for Testing**

### **Service Data:**
```typescript
const sampleServices = [
  {
    slug: 'adult-health',
    title: 'Adult Health Nursing',
    description: 'Expert support for adult nursing students',
    icon: 'GraduationCap',
    articleCount: 12,
    overview: 'Adult health nursing focuses on...'
  },
  // ... more services
];
```

### **Article Data:**
```typescript
const sampleArticle = {
  slug: 'basic-adult-care',
  title: 'Basic Adult Care Techniques',
  service: 'adult-health',
  author: { name: 'Dr. Sarah Johnson', avatar: '...' },
  publishedAt: '2024-10-01',
  readTime: 8,
  content: [
    { type: 'heading', level: 1, text: 'Introduction' },
    { type: 'paragraph', text: 'Adult care is...' },
    { type: 'video', url: '...', caption: '...' },
    // ... more blocks
  ]
};
```

---

## 🚀 **Immediate Next Steps**

### **What to Do NOW:**

1. **Fix Homepage Faded Text** (I'll do this immediately)
2. **Decide on Priority:**
   - Option A: Start Strapi setup (I guide you)
   - Option B: Build pages with sample data first, integrate Strapi later
   - Option C: Do both in parallel

3. **Choose Architecture:**
   - Full Strapi integration (recommended for scale)
   - Hybrid (some hardcoded, some Strapi)
   - Phased migration (start with sample data, migrate to Strapi incrementally)

---

## ✅ **Deliverables**

After completion:
- ✅ Clear navigation path: Homepage → Services Hub → Domain → Article
- ✅ Rich article content with mixed media (text, video, audio, images, code)
- ✅ SEO-optimized pages
- ✅ Responsive design
- ✅ Fast loading with React Query caching
- ✅ Content managed through Strapi CMS
- ✅ Fallback data when CMS unavailable

---

## 🤔 **Questions for You:**

1. **Do you want me to start building the pages NOW with sample data?**
2. **Or should I help you set up Strapi first?**
3. **How many articles per domain on average?** (helps with pagination planning)
4. **Do you want comments enabled on articles?**
5. **Should articles support multiple authors?**

Let me know your preference and I'll start building immediately! 🚀
