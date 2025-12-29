# HandyWriterz Design System

> **Version**: 2.0  
> **Aesthetic**: Editorial Studio × Research Journal  
> **Status**: Production Ready

---

## Design Philosophy

HandyWriterz delivers a distinctive, production-grade interface that avoids generic "AI slop" aesthetics. We implement real working code with exceptional attention to aesthetic details and creative choices.

### Core Principles

1. **Editorial Quality** — Strong typography hierarchy, generous whitespace, high-quality imagery
2. **Domain Authority** — Each domain is a micro-brand with unique palette
3. **Task-First** — Dashboard UI focused on quick completion, not decoration
4. **Motion with Purpose** — Animations for delight at key moments, not everywhere

---

## Typography

### Font Families

```css
:root {
  --font-display: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --font-body: 'Manrope', 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Consolas, monospace;
}
```

### Type Scale (1.25 ratio)

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px | 1.5 | Captions, badges |
| `text-sm` | 14px | 1.5 | Secondary text |
| `text-base` | 16px | 1.6 | Body copy |
| `text-lg` | 18px | 1.6 | Lead paragraphs |
| `text-xl` | 20px | 1.5 | Card titles |
| `text-2xl` | 24px | 1.4 | Section headings |
| `text-3xl` | 30px | 1.3 | Page titles |
| `text-4xl` | 36px | 1.2 | Hero subheads |
| `text-5xl` | 48px | 1.1 | Hero titles |
| `text-6xl` | 60px | 1.1 | Display headlines |

### Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

## Color System

### Base Neutrals

```css
:root {
  /* Slate scale for dark surfaces */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --slate-950: #020617;

  /* Warm white for content */
  --white: #ffffff;
  --warm-white: #fefefe;
}
```

### Brand Colors

```css
:root {
  --brand-50: #fff1f2;
  --brand-100: #ffe4e6;
  --brand-200: #fecdd3;
  --brand-300: #fda4af;
  --brand-400: #fb7185;
  --brand-500: #f43f5e;
  --brand-600: #e11d48;
  --brand-700: #be123c;
  --brand-800: #9f1239;
  --brand-900: #881337;
}
```

### Domain Palettes

Each domain has a primary and accent color for micro-branding.

```css
:root {
  /* Adult Nursing */
  --domain-adult-primary: #e11d48;
  --domain-adult-gradient: from-rose-500/20 to-pink-500/10;

  /* Mental Health */
  --domain-mental-primary: #7c3aed;
  --domain-mental-gradient: from-violet-500/20 to-purple-500/10;

  /* Child Nursing */
  --domain-child-primary: #06b6d4;
  --domain-child-gradient: from-cyan-500/20 to-teal-500/10;

  /* Social Work */
  --domain-social-primary: #f59e0b;
  --domain-social-gradient: from-amber-500/20 to-yellow-500/10;

  /* Technology */
  --domain-tech-primary: #3b82f6;
  --domain-tech-gradient: from-blue-500/20 to-indigo-500/10;

  /* AI */
  --domain-ai-primary: #10b981;
  --domain-ai-gradient: from-emerald-500/20 to-green-500/10;

  /* Crypto */
  --domain-crypto-primary: #f97316;
  --domain-crypto-gradient: from-orange-500/20 to-red-500/10;
}
```

### Semantic Colors

```css
:root {
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

---

## Spacing

### Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### Layout Conventions

| Element | Spacing |
|---------|---------|
| Section gap | 80-140px |
| Card padding | 24-32px |
| Content width | 60-72ch |
| Hero gutters | 80-120px |
| Inline elements | 8-16px |

---

## Grid System

### 12-Column Grid

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: var(--space-4);
}

@media (min-width: 640px) {
  .container { padding-inline: var(--space-6); }
}

@media (min-width: 1024px) {
  .container { padding-inline: var(--space-8); }
}
```

### Common Layouts

```
/* Hero (full-bleed) */
12 cols, 80-120px gutters

/* Two-column content */
7 + 5 cols (content + sidebar)

/* Three-column grid */
4 + 4 + 4 cols

/* Four-column cards */
3 + 3 + 3 + 3 cols

/* Article body */
8 cols centered (60-72ch)
```

---

## Shadows & Elevation

```css
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

### Elevation Levels

| Level | Shadow | Use Case |
|-------|--------|----------|
| 0 | none | Flat elements |
| 1 | shadow-sm | Cards at rest |
| 2 | shadow-md | Cards on hover |
| 3 | shadow-lg | Modals, popovers |
| 4 | shadow-xl | Floating elements |

---

## Border Radius

```css
:root {
  --radius-sm: 0.375rem;    /* 6px */
  --radius-md: 0.5rem;      /* 8px */
  --radius-lg: 0.75rem;     /* 12px */
  --radius-xl: 1rem;        /* 16px */
  --radius-2xl: 1.5rem;     /* 24px */
  --radius-3xl: 2rem;       /* 32px */
  --radius-full: 9999px;    /* Pills */
}
```

---

## Motion

### Duration

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### Easing

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Animation Patterns

#### Page Load (Staged Reveal)
```css
/* Hero first */
.hero { animation: fadeInUp 600ms ease-out; }

/* Content sections with stagger */
.section:nth-child(2) { animation: fadeInUp 600ms ease-out 100ms both; }
.section:nth-child(3) { animation: fadeInUp 600ms ease-out 200ms both; }
.section:nth-child(4) { animation: fadeInUp 600ms ease-out 300ms both; }
```

#### Card Hover
```css
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

#### Button Interaction
```css
.button {
  transition: transform 150ms ease-out, background 150ms ease-out;
}
.button:hover {
  transform: translateY(-1px);
}
.button:active {
  transform: translateY(0);
}
```

---

## Components

### Button Variants

```tsx
// Primary - main CTA
<Button variant="primary">Get Started</Button>

// Secondary - alternative action
<Button variant="secondary">Learn More</Button>

// Ghost - subtle action
<Button variant="ghost">Cancel</Button>

// Domain - colored by domain
<Button variant="domain" domain="ai">Explore AI</Button>
```

### Card Variants

```tsx
// Content card (articles, services)
<Card variant="content">
  <CardImage />
  <CardBody>
    <CardTitle />
    <CardDescription />
  </CardBody>
</Card>

// Domain card (domain showcase)
<Card variant="domain" domain="adult-nursing">
  <DomainIcon />
  <CardTitle />
  <CardMetric />
</Card>

// Dashboard card (stats, actions)
<Card variant="dashboard">
  <CardStat />
</Card>
```

### Input Variants

```tsx
// Text input
<Input type="text" placeholder="Enter title" />

// Textarea
<Textarea rows={4} placeholder="Instructions..." />

// Select
<Select options={options} />

// File upload
<FileUpload accept=".pdf,.doc" />
```

---

## Dark Mode

```css
.dark {
  color-scheme: dark;
  --bg-canvas: var(--slate-950);
  --bg-surface: var(--slate-900);
  --bg-elevated: var(--slate-800);
  --text-primary: var(--slate-100);
  --text-secondary: var(--slate-400);
  --border-default: var(--slate-700);
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Anti-Patterns

### ❌ Never Use

- Inter, Roboto, Arial as primary fonts
- Purple-on-white gradients
- Generic SaaS card layouts
- Cookie-cutter component patterns
- Excessive micro-animations
- Low-contrast text
- Template stock photos

### ✅ Always Use

- Distinctive typography choices
- Domain-specific color palettes
- Generous whitespace
- High-quality, contextual imagery
- Purposeful motion
- Strong visual hierarchy
- Editorial layouts

---

## Implementation

### CSS Custom Properties

All tokens are defined as CSS custom properties for runtime theming:

```css
/* In index.css */
@layer base {
  :root {
    /* All tokens defined here */
  }
  
  .dark {
    /* Dark mode overrides */
  }
}
```

### Tailwind Integration

Tailwind config extends with design system tokens:

```javascript
// tailwind.config.cjs
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Newsreader', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        brand: { /* brand scale */ },
        domain: {
          adult: '#e11d48',
          mental: '#7c3aed',
          // ...
        },
      },
    },
  },
};
```

---

*This design system defines the visual language for HandyWriterz. All new components and pages must adhere to these guidelines.*
