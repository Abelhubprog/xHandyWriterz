import { env } from '@/env';
import type {
  ArticleSummary,
  DomainHighlight,
  DomainListItem,
  DomainPage,
  LandingSection,
  LandingSectionItem,
  ServiceDetail,
  ServiceListItem,
  ServiceListResponse,
  SeoMeta,
  TestimonialEntry,
} from '@/types/cms';

type FetchParams = Record<string, string | number | boolean | undefined | null>;

const CMS_URL = env.VITE_CMS_URL;
const CMS_TOKEN = env.VITE_CMS_TOKEN;

function buildParams(base: FetchParams): string {
  const params = new URLSearchParams();
  Object.entries(base).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  return params.toString();
}

async function request<T>(path: string, params: FetchParams = {}, init: RequestInit = {}): Promise<T | null> {
  const url = new URL(path, CMS_URL);
  const query = buildParams(params);
  if (query) {
    url.search = query;
  }

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (CMS_TOKEN) {
    headers.set('Authorization', `Bearer ${CMS_TOKEN}`);
  }

  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers,
      cache: 'no-store',
    });
    if (!response.ok) {
      console.warn('[cms] request failed', response.status);
      return null;
    }
    const json = await response.json();
    return json as T;
  } catch (error) {
    console.warn('[cms] network error', error);
    return null;
  }
}

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:/i.test(url)) return url;
  return new URL(url, CMS_URL).toString();
}

function mapSeoMeta(entry: any): SeoMeta | null {
  if (!entry) return null;
  const ogImageUrl = resolveMediaUrl(entry.ogImage?.data?.attributes?.url ?? entry.ogImage?.url ?? null);
  return {
    title: entry.title ?? null,
    description: entry.description ?? entry.metaDescription ?? null,
    ogImage: ogImageUrl,
  };
}

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `strapi_${Math.random().toString(36).slice(2, 10)}`;
}

function mapServiceEntry(entry: any): ServiceListItem | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;
  const heroImageUrl = resolveMediaUrl(
    attributes.heroImage?.data?.attributes?.url ?? attributes.heroImage?.url ?? null
  );
  const summary = attributes.summary ?? attributes.Summary ?? null;
  const contentForReading = attributes.body ?? attributes.content ?? '';
  const readingMinutes = contentForReading ? estimateReadingTime(String(contentForReading)) : null;
  const typeTags = Array.isArray(attributes.typeTags)
    ? attributes.typeTags
    : Array.isArray(attributes.type_tags)
      ? attributes.type_tags
      : [];
  const seo = mapSeoMeta(attributes.seo ?? null);

  return {
    id: String(id ?? attributes.slug ?? safeRandomId()),
    slug: attributes.slug ?? String(id),
    title: attributes.title ?? 'Untitled',
    summary,
    domain: attributes.domain ?? null,
    typeTags,
    heroImageUrl,
    publishedAt: attributes.publishedAt ?? null,
    readingMinutes,
    authorName: attributes.author ?? attributes.authorName ?? null,
    seo,
  };
}

function mapServiceDetail(entry: any): ServiceDetail | null {
  const base = mapServiceEntry(entry);
  if (!base) return null;
  const { attributes } = entry;
  const attachmentsData = attributes?.attachments?.data;
  const attachments = Array.isArray(attachmentsData)
    ? attachmentsData
    : Array.isArray(attributes?.attachments)
      ? attributes.attachments
      : [];
  const mappedAttachments = attachments.map((attachment: any) => {
    const file = attachment?.attributes ?? attachment;
    return {
      url: resolveMediaUrl(file?.url ?? file?.url?.url ?? null),
      mimeType: file?.mimeType || file?.mime_type || null,
      sizeInBytes: file?.sizeInBytes ?? file?.size_in_bytes ?? file?.size ?? null,
    };
  });

  return {
    ...base,
    body: attributes?.body ?? attributes?.content ?? null,
    attachments: mappedAttachments,
  };
}

function mapLandingSectionItem(entry: any): LandingSectionItem | null {
  if (!entry) return null;
  const id = entry.id ?? safeRandomId();
  const mediaUrl = resolveMediaUrl(entry.media?.data?.attributes?.url ?? null);
  return {
    id: String(id),
    eyebrow: entry.eyebrow ?? null,
    title: entry.title ?? 'Untitled',
    subtitle: entry.subtitle ?? null,
    description: entry.description ?? null,
    metricValue: entry.metricValue ?? null,
    metricLabel: entry.metricLabel ?? null,
    iconKey: entry.iconKey ?? null,
    mediaUrl,
    quote: entry.quote ?? null,
    authorName: entry.authorName ?? null,
    authorRole: entry.authorRole ?? null,
    rating: typeof entry.rating === 'number' ? entry.rating : null,
    tag: entry.tag ?? null,
    linkLabel: entry.linkLabel ?? null,
    linkUrl: entry.linkUrl ?? null,
    accentGradient: entry.accentGradient ?? null,
    backgroundGradient: entry.backgroundGradient ?? null,
    badge: entry.badge ?? null,
  };
}

function mapLandingSection(entry: any): LandingSection | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;
  const mediaUrl = resolveMediaUrl(attributes.media?.data?.attributes?.url ?? null);
  const rawItems = Array.isArray(attributes.items) ? attributes.items : [];
  const items = rawItems
    .map((raw) => mapLandingSectionItem(raw))
    .filter((item): item is LandingSectionItem => Boolean(item));

  return {
    id: String(id ?? attributes.pageSlug ?? safeRandomId()),
    sectionKey: attributes.sectionKey ?? 'hero',
    theme: attributes.theme ?? null,
    anchorId: attributes.anchorId ?? null,
    pageSlug: attributes.pageSlug ?? 'homepage',
    eyebrow: attributes.eyebrow ?? null,
    heading: attributes.heading ?? null,
    subheading: attributes.subheading ?? null,
    body: attributes.body ?? null,
    ctaLabel: attributes.ctaLabel ?? null,
    ctaUrl: attributes.ctaUrl ?? null,
    secondaryCtaLabel: attributes.secondaryCtaLabel ?? null,
    secondaryCtaUrl: attributes.secondaryCtaUrl ?? null,
    mediaUrl,
    order: attributes.order ?? 0,
    items,
  };
}

function mapDomainHighlight(entry: any): DomainHighlight | null {
  if (!entry) return null;
  const id = entry.id ?? safeRandomId();
  return {
    id: String(id),
    label: entry.label ?? 'Highlight',
    value: entry.value ?? '',
    description: entry.description ?? null,
    iconKey: entry.iconKey ?? null,
    color: entry.color ?? null,
  };
}

function mapDomainFeature(entry: any): DomainFeature | null {
  if (!entry) return null;
  const id = entry.id ?? safeRandomId();
  const imageUrl = resolveMediaUrl(entry.image?.data?.attributes?.url ?? entry.image?.url ?? null);
  return {
    id: String(id),
    title: entry.title ?? 'Feature',
    description: entry.description ?? null,
    iconKey: entry.iconKey ?? null,
    imageUrl,
    linkUrl: entry.linkUrl ?? null,
    linkLabel: entry.linkLabel ?? null,
    order: entry.order ?? 0,
  };
}

function mapDomainFaq(entry: any): DomainFaq | null {
  if (!entry) return null;
  const id = entry.id ?? safeRandomId();
  return {
    id: String(id),
    question: entry.question ?? 'Question',
    answer: entry.answer ?? '',
    order: entry.order ?? 0,
  };
}

function mapDomainListItem(entry: any): DomainListItem | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;
  const heroImageUrl = resolveMediaUrl(attributes.heroImage?.data?.attributes?.url ?? null);
  
  return {
    id: String(id ?? safeRandomId()),
    name: attributes.name ?? 'Domain',
    slug: attributes.slug ?? String(id ?? safeRandomId()),
    description: attributes.description ?? null,
    tagline: attributes.tagline ?? null,
    heroImageUrl,
    themeColor: attributes.themeColor ?? '#6366f1',
    gradient: attributes.gradient ?? 'from-indigo-500 to-purple-600',
    iconKey: attributes.iconKey ?? null,
    order: attributes.order ?? 0,
    isActive: attributes.isActive ?? true,
    showInNav: attributes.showInNav ?? true,
    showInFooter: attributes.showInFooter ?? true,
  };
}

function mapDomainPage(entry: any): DomainPage | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;
  
  const highlights = Array.isArray(attributes.highlights)
    ? attributes.highlights
        .map((item: any) => mapDomainHighlight(item))
        .filter((item): item is DomainHighlight => Boolean(item))
    : [];
  
  const features = Array.isArray(attributes.features)
    ? attributes.features
        .map((item: any) => mapDomainFeature(item))
        .filter((item): item is DomainFeature => Boolean(item))
        .sort((a, b) => a.order - b.order)
    : [];
  
  const faqs = Array.isArray(attributes.faqs)
    ? attributes.faqs
        .map((item: any) => mapDomainFaq(item))
        .filter((item): item is DomainFaq => Boolean(item))
        .sort((a, b) => a.order - b.order)
    : [];
  
  const heroImageUrl = resolveMediaUrl(attributes.heroImage?.data?.attributes?.url ?? null);
  const heroVideoUrl = resolveMediaUrl(attributes.heroVideo?.data?.attributes?.url ?? null);
  const seoImageUrl = resolveMediaUrl(attributes.seoImage?.data?.attributes?.url ?? null);
  
  // Extract relation slugs/IDs for featured content
  const featuredServiceSlugs = attributes.featuredServices?.data
    ?.map((s: any) => s.attributes?.slug)
    .filter(Boolean) ?? [];
  const featuredArticleSlugs = attributes.featuredArticles?.data
    ?.map((a: any) => a.attributes?.slug)
    .filter(Boolean) ?? [];
  const testimonialIds = attributes.testimonials?.data
    ?.map((t: any) => String(t.id))
    .filter(Boolean) ?? [];

  return {
    id: String(id ?? safeRandomId()),
    name: attributes.name ?? 'Domain',
    slug: attributes.slug ?? String(id ?? safeRandomId()),
    description: attributes.description ?? null,
    tagline: attributes.tagline ?? null,
    heroTitle: attributes.heroTitle ?? attributes.name ?? 'Domain',
    heroSubtitle: attributes.heroSubtitle ?? null,
    heroImageUrl,
    heroVideoUrl,
    themeColor: attributes.themeColor ?? '#6366f1',
    gradient: attributes.gradient ?? 'from-indigo-500 to-purple-600',
    iconKey: attributes.iconKey ?? null,
    highlights,
    features,
    faqs,
    featuredServiceSlugs,
    featuredArticleSlugs,
    testimonialIds,
    ctaLabel: attributes.ctaLabel ?? 'Get Started',
    ctaUrl: attributes.ctaUrl ?? null,
    secondaryCtaLabel: attributes.secondaryCtaLabel ?? null,
    secondaryCtaUrl: attributes.secondaryCtaUrl ?? null,
    seoTitle: attributes.seoTitle ?? null,
    seoDescription: attributes.seoDescription ?? null,
    seoImageUrl,
    keywords: attributes.keywords ?? null,
    order: attributes.order ?? 0,
    isActive: attributes.isActive ?? true,
    showInNav: attributes.showInNav ?? true,
    showInFooter: attributes.showInFooter ?? true,
  };
}

function mapArticleSummary(entry: any): ArticleSummary | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;

  const imageData = attributes.images?.data;
  let heroImageUrl: string | null = null;
  if (Array.isArray(imageData) && imageData.length > 0) {
    heroImageUrl = resolveMediaUrl(imageData[0]?.attributes?.url ?? null);
  } else if (Array.isArray(attributes.images) && attributes.images.length > 0) {
    heroImageUrl = resolveMediaUrl(attributes.images[0]?.url ?? null);
  } else if (attributes.heroImage?.data || attributes.heroImage?.url) {
    heroImageUrl = resolveMediaUrl(attributes.heroImage?.data?.attributes?.url ?? attributes.heroImage?.url ?? null);
  }
  const contentForReading = attributes.body ?? attributes.content ?? '';
  const authorName =
    attributes.author?.data?.attributes?.name ??
    attributes.authorName ??
    attributes.author ??
    null;
  const categoryName =
    attributes.category ??
    attributes.categories?.data?.[0]?.attributes?.name ??
    null;
  const readingMinutes = typeof attributes.readingTime === 'number'
    ? attributes.readingTime
    : contentForReading
      ? estimateReadingTime(String(contentForReading))
      : null;

  return {
    id: String(id ?? attributes.slug ?? safeRandomId()),
    slug: attributes.slug ?? String(id ?? safeRandomId()),
    title: attributes.title ?? 'Untitled article',
    excerpt: attributes.excerpt ?? attributes.summary ?? null,
    publishedAt: attributes.publishedAt ?? attributes.datePublished ?? null,
    heroImageUrl,
    authorName,
    category: categoryName,
    readingMinutes,
  };
}

function mapTestimonialEntry(entry: any): TestimonialEntry | null {
  if (!entry) return null;
  const { id, attributes } = entry;
  if (!attributes) return null;
  const avatarUrl = resolveMediaUrl(attributes.authorAvatar?.data?.attributes?.url ?? null);

  return {
    id: String(id ?? safeRandomId()),
    quote: attributes.quote ?? '',
    authorName: attributes.authorName ?? 'Anonymous',
    authorRole: attributes.authorRole ?? null,
    authorCompany: attributes.authorCompany ?? null,
    authorAvatarUrl: avatarUrl,
    rating: typeof attributes.rating === 'number' ? attributes.rating : null,
    domain: attributes.domain ?? null,
    featured: Boolean(attributes.featured),
    order: typeof attributes.order === 'number' ? attributes.order : 0,
  };
}

export async function fetchServicesList(options: {
  domain?: string | null;
  type?: string | null;
  page?: number;
  pageSize?: number;
  includeDraft?: boolean;
  locale?: string | null;
} = {}): Promise<ServiceListResponse> {
  const {
    domain = null,
    type = null,
    page = 1,
    pageSize = 12,
    includeDraft = false,
    locale = null,
  } = options;

  const filters: FetchParams = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort[0]': 'publishedAt:desc',
    publicationState: includeDraft ? 'preview' : 'live',
    ...(locale ? { locale } : {}),
    populate: 'heroImage,seo',
  };

  if (domain) {
    filters['filters[domain][$eq]'] = domain;
  }
  if (type) {
    filters['filters[typeTags][$contains]'] = type;
  }

  const data = await request<any>('/api/services', filters);
  if (!data) {
    return {
      items: [],
      pagination: {
        page,
        pageSize,
        pageCount: 0,
        total: 0,
      },
    };
  }

  const entries = Array.isArray(data.data) ? data.data : [];
  const items = entries
    .map(mapServiceEntry)
    .filter((item): item is ServiceListItem => Boolean(item));

  const pagination = data.meta?.pagination ?? { page, pageSize, pageCount: 1, total: items.length };

  return {
    items,
    pagination: {
      page: pagination.page ?? page,
      pageSize: pagination.pageSize ?? pageSize,
      pageCount: pagination.pageCount ?? 1,
      total: pagination.total ?? items.length,
    },
  };
}

export async function fetchServiceBySlug(
  slug: string,
  options: { previewToken?: string; locale?: string } = {},
): Promise<ServiceDetail | null> {
  if (!slug) return null;
  const params: FetchParams = {
    'filters[slug][$eq]': slug,
    publicationState: options.previewToken ? 'preview' : 'live',
    populate: 'heroImage,attachments,seo',
  };
  if (options.previewToken) {
    params['filters[previewToken][$eq]'] = options.previewToken;
  }
  if (options.locale) {
    params.locale = options.locale;
  }

  const data = await request<any>('/api/services', params);
  if (!data) return null;
  const entry = Array.isArray(data.data) ? data.data[0] : null;
  return entry ? mapServiceDetail(entry) : null;
}

export async function fetchLandingSections(
  pageSlug: string,
  options: { includeDraft?: boolean } = {},
): Promise<LandingSection[]> {
  const { includeDraft = false } = options;
  const params: FetchParams = {
    'filters[pageSlug][$eq]': pageSlug,
    'pagination[pageSize]': 100,
    'sort[0]': 'order:asc',
    publicationState: includeDraft ? 'preview' : 'live',
    populate: 'items,media',
    'populate[items][populate]': 'media',
  };

  const data = await request<any>('/api/landing-sections', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapLandingSection)
    .filter((section): section is LandingSection => Boolean(section));
}

export async function fetchDomainPage(
  slug: string,
  options: { includeDraft?: boolean } = {},
): Promise<DomainPage | null> {
  if (!slug) return null;
  const { includeDraft = false } = options;
  const params: FetchParams = {
    'filters[slug][$eq]': slug,
    publicationState: includeDraft ? 'preview' : 'live',
    populate: 'highlights,features,features.image,faqs,heroImage,heroVideo,seoImage,featuredServices,featuredArticles,testimonials',
  };
  const data = await request<any>('/api/domain-pages', params);
  if (!data) return null;
  const entry = Array.isArray(data.data) ? data.data[0] : null;
  return mapDomainPage(entry);
}

export async function fetchDomainsList(
  options: { includeDraft?: boolean; activeOnly?: boolean } = {},
): Promise<DomainListItem[]> {
  const { includeDraft = false, activeOnly = true } = options;
  const params: FetchParams = {
    'pagination[pageSize]': 50,
    'sort[0]': 'order:asc',
    publicationState: includeDraft ? 'preview' : 'live',
    populate: 'heroImage',
  };
  // Filter by isActive if requested
  if (activeOnly) {
    params['filters[isActive][$eq]'] = 'true';
  }
  const data = await request<any>('/api/domain-pages', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapDomainListItem)
    .filter((item): item is DomainListItem => Boolean(item));
}

/** Fetch domains that should appear in navigation */
export async function fetchNavDomains(): Promise<DomainListItem[]> {
  const params: FetchParams = {
    'pagination[pageSize]': 20,
    'sort[0]': 'order:asc',
    publicationState: 'live',
    populate: 'heroImage',
    'filters[isActive][$eq]': 'true',
    'filters[showInNav][$eq]': 'true',
  };
  const data = await request<any>('/api/domain-pages', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapDomainListItem)
    .filter((item): item is DomainListItem => Boolean(item));
}

/** Fetch domains that should appear in footer */
export async function fetchFooterDomains(): Promise<DomainListItem[]> {
  const params: FetchParams = {
    'pagination[pageSize]': 20,
    'sort[0]': 'order:asc',
    publicationState: 'live',
    populate: 'heroImage',
    'filters[isActive][$eq]': 'true',
    'filters[showInFooter][$eq]': 'true',
  };
  const data = await request<any>('/api/domain-pages', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapDomainListItem)
    .filter((item): item is DomainListItem => Boolean(item));
}

export async function fetchServicesBySlugs(
  slugs: string[],
  options: { includeDraft?: boolean } = {},
): Promise<ServiceListItem[]> {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const { includeDraft = false } = options;
  const params: FetchParams = {
    'pagination[pageSize]': Math.max(slugs.length, 1),
    'sort[0]': 'publishedAt:desc',
    populate: 'heroImage,seo',
    publicationState: includeDraft ? 'preview' : 'live',
  };

  slugs.forEach((slug, index) => {
    params[`filters[slug][$in][${index}]`] = slug;
  });

  const data = await request<any>('/api/services', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapServiceEntry)
    .filter((item): item is ServiceListItem => Boolean(item));
}

export async function fetchArticlesBySlugs(
  slugs: string[],
  options: { includeDraft?: boolean } = {},
): Promise<ArticleSummary[]> {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];
  const { includeDraft = false } = options;
  const params: FetchParams = {
    'pagination[pageSize]': Math.max(slugs.length, 1),
    'sort[0]': 'publishedAt:desc',
    populate: 'images,heroImage,author,categories',
    publicationState: includeDraft ? 'preview' : 'live',
  };

  slugs.forEach((slug, index) => {
    params[`filters[slug][$in][${index}]`] = slug;
  });

  const data = await request<any>('/api/articles', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapArticleSummary)
    .filter((item): item is ArticleSummary => Boolean(item));
}

export async function fetchArticlesList(
  options: { limit?: number; includeDraft?: boolean } = {},
): Promise<ArticleSummary[]> {
  const { limit = 6, includeDraft = false } = options;
  const params: FetchParams = {
    'pagination[pageSize]': limit,
    'sort[0]': 'publishedAt:desc',
    populate: 'images,heroImage,author,categories',
    publicationState: includeDraft ? 'preview' : 'live',
  };

  const data = await request<any>('/api/articles', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapArticleSummary)
    .filter((item): item is ArticleSummary => Boolean(item));
}

export async function fetchTestimonialsList(options: {
  domain?: string | null;
  limit?: number;
  includeDraft?: boolean;
} = {}): Promise<TestimonialEntry[]> {
  const { domain = null, limit = 12, includeDraft = false } = options;
  const params: FetchParams = {
    'pagination[pageSize]': limit,
    'sort[0]': 'order:asc',
    publicationState: includeDraft ? 'preview' : 'live',
    populate: 'authorAvatar',
  };

  if (domain) {
    params['filters[domain][$eq]'] = domain;
  }

  const data = await request<any>('/api/testimonials', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapTestimonialEntry)
    .filter((item): item is TestimonialEntry => Boolean(item));
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
}
