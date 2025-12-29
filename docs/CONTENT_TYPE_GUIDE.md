# 📋 STRAPI CONTENT TYPE CREATION GUIDE

## ✅ STEP 1: CREATE "SERVICE" CONTENT TYPE

### Navigation:
1. Click **Content-Type Builder** (🎨 paint palette icon on left sidebar)
2. Click **"Create new collection type"** button

### Configuration:

**Display name:** `Service` (singular)
**API ID:** `service` (auto-generated)
**Draft & Publish:** ✅ Enable this

---

## 📝 ADD 8 FIELDS TO SERVICE

Click **"Add another field"** button for each field below:

### Field 1: Title
- **Type:** Text
- **Name:** `title`
- **Settings:**
  - ✅ Required field
  - Max length: 255
  - ✅ Unique
- Click **"Finish"**

### Field 2: Slug (URL-friendly identifier)
- **Type:** UID
- **Name:** `slug`
- **Settings:**
  - Attached field: `title` (select from dropdown)
  - ✅ Required field
- Click **"Finish"**

### Field 3: Domain (Which domain this belongs to)
- **Type:** Enumeration
- **Name:** `domain`
- **Values:** Add these one by one:
  ```
  nursing
  ai
  marketing
  enterprise
  education
  research
  ```
- **Settings:**
  - ✅ Required field
- Click **"Finish"**

### Field 4: Summary (Short description)
- **Type:** Text (Long text)
- **Name:** `summary`
- **Settings:**
  - ✅ Required field
- Click **"Finish"**

### Field 5: Body (Main content)
- **Type:** Rich text
- **Name:** `body`
- **Settings:**
  - ✅ Required field
- Click **"Finish"**

### Field 6: Hero Image
- **Type:** Media
- **Name:** `heroImage`
- **Settings:**
  - Type: Single media
  - Allowed types: Images only
- Click **"Finish"**

### Field 7: Featured (Show on homepage?)
- **Type:** Boolean
- **Name:** `featured`
- **Settings:**
  - Default value: false
- Click **"Finish"**

### Field 8: Order (Display order)
- **Type:** Number
- **Name:** `order`
- **Settings:**
  - Number format: integer
  - Default value: 0
- Click **"Finish"**

---

## 💾 SAVE THE CONTENT TYPE

1. Click **"Save"** button (top right)
2. Wait for Strapi to restart (~30 seconds)
3. You'll see "Service" in the left sidebar under "Collection Types"

---

## ✅ STEP 2: CREATE "ARTICLE" CONTENT TYPE

### Repeat process:
1. Click **"Create new collection type"** again
2. **Display name:** `Article`
3. **Draft & Publish:** ✅ Enable

### 📝 ADD 7 FIELDS TO ARTICLE

### Field 1: Title
- **Type:** Text
- **Name:** `title`
- **Settings:**
  - ✅ Required field
  - Max length: 255
- Click **"Finish"**

### Field 2: Slug
- **Type:** UID
- **Name:** `slug`
- **Settings:**
  - Attached field: `title`
  - ✅ Required field
- Click **"Finish"**

### Field 3: Content
- **Type:** Rich text
- **Name:** `content`
- **Settings:**
  - ✅ Required field
- Click **"Finish"**

### Field 4: Author
- **Type:** Text
- **Name:** `author`
- Click **"Finish"**

### Field 5: Category
- **Type:** Text
- **Name:** `category`
- Click **"Finish"**

### Field 6: Hero Image
- **Type:** Media
- **Name:** `heroImage`
- **Settings:**
  - Type: Single media
  - Allowed types: Images only
- Click **"Finish"**

### Field 7: Published At
- **Type:** Date (DateTime)
- **Name:** `publishedAt`
- Click **"Finish"**

---

## 💾 SAVE ARTICLE CONTENT TYPE

1. Click **"Save"** button
2. Wait for restart
3. Both "Service" and "Article" now appear in sidebar

---

## 🎯 NEXT STEPS

After creating both content types:
1. Go to **Content Manager** (📝 icon in sidebar)
2. Start adding services for each domain
3. I'll guide you through adding the first one!

---

**TIPS:**
- If you make a mistake, you can edit fields later
- Required fields have a red asterisk (*)
- Slug auto-generates from title
- You can reorder fields by dragging

**Let's do this! 🚀**
