export type SeoMeta = {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
};

export type ServiceListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  domain: string | null;
  typeTags: string[];
  heroImageUrl: string | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  authorName: string | null;
  seo: SeoMeta | null;
};

export type ServiceDetail = ServiceListItem & {
  body: string | null;
  attachments: Array<{
    url: string | null;
    mimeType: string | null;
    sizeInBytes: number | null;
  }>;
};

export type ServiceListResponse = {
  items: ServiceListItem[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export type LandingSectionItem = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  metricValue: string | null;
  metricLabel: string | null;
  iconKey: string | null;
  mediaUrl: string | null;
  quote: string | null;
  authorName: string | null;
  authorRole: string | null;
  rating: number | null;
  tag: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  accentGradient: string | null;
  backgroundGradient: string | null;
  badge: string | null;
};

export type LandingSection = {
  id: string;
  sectionKey: string;
  theme: string | null;
  anchorId: string | null;
  pageSlug: string;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  mediaUrl: string | null;
  order: number;
  items: LandingSectionItem[];
};

export type DomainHighlight = {
  id: string;
  label: string;
  value: string;
  description: string | null;
  iconKey: string | null;
  color: string | null;
};

export type DomainFeature = {
  id: string;
  title: string;
  description: string;
  iconKey: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  order: number;
};

export type DomainFaq = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

// Domain page - CMS-driven landing pages for content domains (Adult Nursing, AI, Crypto, etc.)
export type DomainPage = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  heroTitle: string;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  themeColor: string;
  gradient: string;
  iconKey: string | null;
  highlights: DomainHighlight[];
  features: DomainFeature[];
  faqs: DomainFaq[];
  // Relations - slugs for fetching related content
  featuredServiceSlugs: string[];
  featuredArticleSlugs: string[];
  testimonialIds: string[];
  ctaLabel: string;
  ctaUrl: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  keywords: string | null;
  order: number;
  isActive: boolean;
  showInNav: boolean;
  showInFooter: boolean;
};

// List item for domains hub page
export type DomainListItem = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  heroImageUrl: string | null;
  themeColor: string;
  gradient: string;
  iconKey: string | null;
  order: number;
  isActive: boolean;
  showInNav: boolean;
  showInFooter: boolean;
};

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  heroImageUrl: string | null;
  authorName: string | null;
  category: string | null;
  readingMinutes: number | null;
};

export type TestimonialEntry = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatarUrl: string | null;
  rating: number | null;
  domain: string | null;
  featured: boolean;
  order: number;
};
