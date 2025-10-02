import { env } from '@/env';
import type {
  ArticleSummary,
  DomainHighlight,
  DomainPage,
  LandingSection,
  LandingSectionItem,
  ServiceDetail,
  ServiceListItem,
  ServiceListResponse,
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
  const heroImage = attributes.heroImage?.data?.attributes ?? null;
  const heroImageUrl = resolveMediaUrl(heroImage?.url);
  const readingMinutes = attributes.body ? estimateReadingTime(attributes.body) : null;

  return {
    id: String(id ?? attributes.slug ?? safeRandomId()),
    slug: attributes.slug ?? String(id),
    title: attributes.title ?? 'Untitled',
    summary: attributes.summary ?? null,
    domain: attributes.domain ?? null,
    typeTags: Array.isArray(attributes.typeTags) ? attributes.typeTags : [],
    heroImageUrl,
    publishedAt: attributes.publishedAt ?? null,
    readingMinutes,
    authorName: attributes.author ?? null,
    seo: attributes.seo ?? null,
  };
}

function mapServiceDetail(entry: any): ServiceDetail | null {
  const base = mapServiceEntry(entry);
  if (!base) return null;
  const { attributes } = entry;
  const attachments = Array.isArray(attributes?.attachments) ? attributes.attachments : [];
  const mappedAttachments = attachments.map((attachment: any) => ({
    url: resolveMediaUrl(attachment?.url || attachment?.url?.url || null),
    mimeType: attachment?.mimeType || attachment?.mime_type || null,
    sizeInBytes: attachment?.sizeInBytes ?? attachment?.size_in_bytes ?? null,
  }));

  return {
    ...base,
    body: attributes?.body ?? null,
    attachments: mappedAttachments,
  };
}

function mapLandingSectionItem(entry: any): LandingSectionItem | null {
  if (!entry) return null;
  const id = entry.id ?? safeRandomId();
  return {
    id: String(id),
    title: entry.title ?? 'Untitled',
    subtitle: entry.subtitle ?? null,
    description: entry.description ?? null,
    iconKey: entry.iconKey ?? null,
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
  const spotlight = Array.isArray(attributes.spotlight)
    ? attributes.spotlight
        .map((item: any) => mapLandingSectionItem(item))
        .filter((item): item is LandingSectionItem => Boolean(item))
    : [];
  const heroImageUrl = resolveMediaUrl(attributes.heroImage?.data?.attributes?.url ?? null);
  const serviceSlugs = Array.isArray(attributes.serviceSlugs) ? attributes.serviceSlugs : [];
  const articleSlugs = Array.isArray(attributes.articleSlugs) ? attributes.articleSlugs : [];

  return {
    id: String(id ?? attributes.domain ?? safeRandomId()),
    domain: attributes.domain ?? 'general',
    title: attributes.title ?? 'Domain',
    heroEyebrow: attributes.heroEyebrow ?? null,
    heroTitle: attributes.heroTitle ?? null,
    heroDescription: attributes.heroDescription ?? null,
    heroImageUrl,
    ctaLabel: attributes.ctaLabel ?? null,
    ctaUrl: attributes.ctaUrl ?? null,
    highlights,
    spotlight,
    serviceSlugs,
    articleSlugs,
    metaDescription: attributes.metaDescription ?? null,
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
  }

  return {
    id: String(id ?? attributes.slug ?? safeRandomId()),
    slug: attributes.slug ?? String(id ?? safeRandomId()),
    title: attributes.title ?? 'Untitled article',
    excerpt: attributes.excerpt ?? null,
    publishedAt: attributes.publishedAt ?? null,
    heroImageUrl,
    authorName: attributes.author ?? null,
    category: attributes.category ?? null,
    readingMinutes: attributes.body ? estimateReadingTime(attributes.body) : null,
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
  };

  const data = await request<any>('/api/landing-sections', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapLandingSection)
    .filter((section): section is LandingSection => Boolean(section));
}

export async function fetchDomainPage(
  domain: string,
  options: { includeDraft?: boolean } = {},
): Promise<DomainPage | null> {
  if (!domain) return null;
  const { includeDraft = false } = options;
  const params: FetchParams = {
    'filters[domain][$eq]': domain,
    publicationState: includeDraft ? 'preview' : 'live',
    populate: 'highlights,spotlight,heroImage',
  };
  const data = await request<any>('/api/domain-pages', params);
  if (!data) return null;
  const entry = Array.isArray(data.data) ? data.data[0] : null;
  return mapDomainPage(entry);
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
    populate: 'images',
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
    populate: 'images',
    publicationState: includeDraft ? 'preview' : 'live',
  };

  const data = await request<any>('/api/articles', params);
  if (!data) return [];
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries
    .map(mapArticleSummary)
    .filter((item): item is ArticleSummary => Boolean(item));
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
}