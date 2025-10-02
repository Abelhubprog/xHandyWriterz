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
  title: string;
  subtitle: string | null;
  description: string | null;
  iconKey: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  accentGradient: string | null;
  backgroundGradient: string | null;
  badge: string | null;
};

export type LandingSection = {
  id: string;
  sectionKey: string;
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
};

export type DomainPage = {
  id: string;
  domain: string;
  title: string;
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroDescription: string | null;
  heroImageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  highlights: DomainHighlight[];
  spotlight: LandingSectionItem[];
  serviceSlugs: string[];
  articleSlugs: string[];
  metaDescription: string | null;
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