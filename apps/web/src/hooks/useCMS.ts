/**
 * CMS Data Fetching Hooks
 * 
 * React Query hooks for fetching content from Strapi 5 CMS
 * with proper TypeScript types and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================
// Types - CMS Content Models
// ============================================================

export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: StrapiMedia;
  credentials?: string;
  featured?: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface StrapiTestimonial {
  id: number;
  documentId: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  authorAvatar?: StrapiMedia;
  rating: number;
  domain?: string;
  featured?: boolean;
}

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  body?: string;
  heroImage?: StrapiMedia;
  images?: StrapiMedia[];
  coverImage?: StrapiMedia;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  domain: string;
  featured?: boolean;
  readingTime?: number;
  viewCount?: number;
  x402Enabled?: boolean;
  x402Price?: number;
  author?: StrapiAuthor;
  categories?: StrapiCategory[];
  category?: StrapiCategory;
  tagsList?: StrapiTag[];
  tags?: StrapiTag[];
}

export interface StrapiService {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string;
  excerpt?: string;
  description?: string;
  body?: string;
  heroImage?: StrapiMedia;
  attachments?: StrapiMedia[];
  coverImage?: StrapiMedia;
  domain: string;
  features?: string[];
  pricing?: Record<string, unknown> | Array<Record<string, unknown>>;
  deliveryTime?: string;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  x402Enabled?: boolean;
  x402Price?: number;
  authorProfile?: StrapiAuthor;
  testimonials?: StrapiTestimonial[];
}

// Pagination meta from Strapi
export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: StrapiPagination;
  };
}

// ============================================================
// Configuration
// ============================================================

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
const CMS_TOKEN = import.meta.env.VITE_CMS_TOKEN;

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CMS_TOKEN && { Authorization: `Bearer ${CMS_TOKEN}` }),
};

// ============================================================
// API Fetchers
// ============================================================

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${CMS_URL}/api${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// Strapi Normalizers
// ============================================================

type StrapiEntity<T> = { id: number; attributes: T };
type StrapiRelation<T> = { data?: StrapiEntity<T> | Array<StrapiEntity<T>> | null };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');

function normalizeEntity<T extends Record<string, any>>(entry?: any): (T & { id: number }) | undefined {
  if (!entry) return undefined;
  if (entry.attributes) {
    return {
      id: entry.id ?? entry.attributes?.id ?? 0,
      ...entry.attributes,
    } as T & { id: number };
  }
  return entry as T & { id: number };
}

function normalizeRelationOne<T extends Record<string, any>>(relation?: StrapiRelation<T> | T | null) {
  if (!relation) return undefined;
  const data = (relation as any).data ?? relation;
  return normalizeEntity<T>(data);
}

function normalizeRelationMany<T extends Record<string, any>>(relation?: StrapiRelation<T> | Array<T> | null) {
  const data = (relation as any)?.data ?? relation;
  if (!Array.isArray(data)) return [] as Array<T & { id: number }>;
  return data
    .map((item) => normalizeEntity<T>(item))
    .filter(Boolean) as Array<T & { id: number }>;
}

const normalizeMedia = (input?: any) => normalizeRelationOne<StrapiMedia>(input);
const normalizeMediaArray = (input?: any) => normalizeRelationMany<StrapiMedia>(input);

function normalizeAuthor(entry?: any): StrapiAuthor | undefined {
  const author = normalizeRelationOne<StrapiAuthor>(entry);
  if (!author) return undefined;
  return {
    ...author,
    avatar: normalizeMedia(author.avatar),
  };
}

function normalizeCategory(entry?: any): StrapiCategory | undefined {
  return normalizeRelationOne<StrapiCategory>(entry);
}

function normalizeTag(entry?: any): StrapiTag | undefined {
  return normalizeRelationOne<StrapiTag>(entry);
}

function normalizeTestimonial(entry?: any): StrapiTestimonial | undefined {
  const testimonial = normalizeRelationOne<StrapiTestimonial>(entry);
  if (!testimonial) return undefined;
  return {
    ...testimonial,
    authorAvatar: normalizeMedia(testimonial.authorAvatar),
  };
}

function normalizeArticle(entry?: any): StrapiArticle {
  const base = normalizeEntity<any>(entry) ?? {};
  const author = normalizeAuthor(base.author);
  const categories = normalizeRelationMany<StrapiCategory>(base.categories);
  const tagsList = normalizeRelationMany<StrapiTag>(base.tagsList);
  const category =
    (categories[0] as StrapiCategory | undefined) ??
    normalizeCategory(base.category) ??
    (typeof base.category === 'string'
      ? { id: 0, documentId: '', name: base.category, slug: slugify(base.category) }
      : undefined);

  let tags: StrapiTag[] = [];
  if (tagsList.length > 0) {
    tags = tagsList;
  } else if (Array.isArray(base.tags)) {
    tags = base.tags.map((tag: any, index: number) => {
      if (typeof tag === 'string') {
        return { id: index, documentId: '', name: tag, slug: slugify(tag) };
      }
      return normalizeTag(tag) || { id: index, documentId: '', name: 'Tag', slug: 'tag' };
    });
  }

  const heroImage = normalizeMedia(base.heroImage ?? base.coverImage);
  const images = normalizeMediaArray(base.images);

  return {
    id: base.id ?? 0,
    documentId: base.documentId ?? '',
    title: base.title ?? '',
    slug: base.slug ?? '',
    summary: base.summary ?? undefined,
    excerpt: base.excerpt ?? base.summary ?? undefined,
    content: base.content ?? base.body ?? '',
    body: base.body ?? base.content ?? undefined,
    heroImage,
    images,
    coverImage: heroImage,
    publishedAt: base.publishedAt ?? base.datePublished,
    createdAt: base.createdAt ?? '',
    updatedAt: base.updatedAt ?? '',
    status: base.status ?? 'draft',
    domain: base.domain ?? 'general',
    featured: base.featured ?? false,
    readingTime: base.readingTime,
    viewCount: base.viewCount,
    x402Enabled: base.x402Enabled ?? false,
    x402Price: base.x402Price,
    author,
    categories,
    category,
    tagsList,
    tags,
  };
}

function normalizeService(entry?: any): StrapiService {
  const base = normalizeEntity<any>(entry) ?? {};
  const heroImage = normalizeMedia(base.heroImage ?? base.coverImage);
  const testimonials = normalizeRelationMany<StrapiTestimonial>(base.testimonials)
    .map((item) => normalizeTestimonial(item))
    .filter(Boolean) as StrapiTestimonial[];

  return {
    id: base.id ?? 0,
    documentId: base.documentId ?? '',
    title: base.title ?? '',
    slug: base.slug ?? '',
    summary: base.summary ?? undefined,
    excerpt: base.excerpt ?? base.summary ?? undefined,
    description: base.description ?? undefined,
    body: base.body ?? undefined,
    heroImage,
    attachments: normalizeMediaArray(base.attachments),
    coverImage: heroImage,
    domain: base.domain ?? 'general',
    features: Array.isArray(base.features) ? base.features : base.features?.items ?? undefined,
    pricing: base.pricing ?? undefined,
    deliveryTime: base.deliveryTime ?? undefined,
    featured: base.featured ?? false,
    status: base.status ?? undefined,
    x402Enabled: base.x402Enabled ?? false,
    x402Price: base.x402Price ?? undefined,
    authorProfile: normalizeAuthor(base.authorProfile),
    testimonials,
  };
}

// ============================================================
// Query Keys Factory
// ============================================================

export const cmsKeys = {
  all: ['cms'] as const,
  articles: () => [...cmsKeys.all, 'articles'] as const,
  article: (slug: string) => [...cmsKeys.articles(), slug] as const,
  articlesList: (filters?: ArticleFilters) => [...cmsKeys.articles(), 'list', filters] as const,
  services: () => [...cmsKeys.all, 'services'] as const,
  service: (slug: string) => [...cmsKeys.services(), slug] as const,
  servicesList: (filters?: ServiceFilters) => [...cmsKeys.services(), 'list', filters] as const,
  authors: () => [...cmsKeys.all, 'authors'] as const,
  author: (slug: string) => [...cmsKeys.authors(), slug] as const,
  categories: () => [...cmsKeys.all, 'categories'] as const,
  tags: () => [...cmsKeys.all, 'tags'] as const,
  testimonials: () => [...cmsKeys.all, 'testimonials'] as const,
};

// ============================================================
// Filter Types
// ============================================================

export interface ArticleFilters {
  domain?: string;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  status?: 'draft' | 'review' | 'published' | 'archived';
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface ServiceFilters {
  domain?: string;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

// ============================================================
// Query String Builder
// ============================================================

function buildQueryString(filters: Record<string, unknown> = {}): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'page') {
        params.append('pagination[page]', String(value));
      } else if (key === 'pageSize') {
        params.append('pagination[pageSize]', String(value));
      } else if (key === 'sort') {
        params.append('sort', String(value));
      } else if (key === 'search') {
        params.append('filters[$or][0][title][$containsi]', String(value));
        params.append('filters[$or][1][excerpt][$containsi]', String(value));
      } else if (key === 'domain' || key === 'status') {
        params.append(`filters[${key}][$eq]`, String(value));
      } else if (key === 'featured') {
        params.append(`filters[${key}][$eq]`, String(value));
      } else if (key === 'category') {
        params.append('filters[categories][slug][$eq]', String(value));
      } else if (key === 'tag') {
        params.append('filters[tagsList][slug][$eq]', String(value));
      } else if (key === 'author') {
        params.append('filters[author][slug][$eq]', String(value));
      }
    }
  });

  return params.toString();
}

// ============================================================
// Article Hooks
// ============================================================

export function useArticles(filters: ArticleFilters = {}) {
  const populate = 'populate=author,author.avatar,categories,tagsList,heroImage,images';
  const queryString = buildQueryString({
    sort: 'publishedAt:desc',
    status: filters.status ?? 'published',
    ...filters,
  });
  
  return useQuery({
    queryKey: cmsKeys.articlesList(filters),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/articles?publicationState=live&${populate}&${queryString}`
      ),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeArticle) : [],
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useArticle(slug: string) {
  const populate = 'populate=author,author.avatar,categories,tagsList,heroImage,images';
  
  return useQuery({
    queryKey: cmsKeys.article(slug),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/articles?publicationState=live&filters[slug][$eq]=${slug}&${populate}`
      ),
    select: (data) => (Array.isArray(data.data) && data.data[0] ? normalizeArticle(data.data[0]) : undefined),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedArticles(limit = 6) {
  return useArticles({
    featured: true,
    pageSize: limit,
    sort: 'publishedAt:desc',
  });
}

export function useArticlesByDomain(domain: string, limit = 10) {
  return useArticles({
    domain,
    pageSize: limit,
    sort: 'publishedAt:desc',
  });
}

export function useRelatedArticles(articleId: number, domain: string, limit = 4) {
  return useQuery({
    queryKey: [...cmsKeys.articles(), 'related', articleId, domain],
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/articles?publicationState=live&filters[domain][$eq]=${domain}&filters[id][$ne]=${articleId}&pagination[pageSize]=${limit}&populate=author,author.avatar,heroImage&sort=publishedAt:desc`
      ),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeArticle) : [],
    }),
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// Service Hooks
// ============================================================

export function useServices(filters: ServiceFilters = {}) {
  const populate = 'populate=authorProfile,authorProfile.avatar,testimonials,testimonials.authorAvatar,heroImage,attachments';
  const { status: _status, ...restFilters } = filters;
  const queryString = buildQueryString({ sort: 'createdAt:desc', ...restFilters });
  
  return useQuery({
    queryKey: cmsKeys.servicesList(filters),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/services?publicationState=live&${populate}&${queryString}`
      ),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeService) : [],
    }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useService(slug: string) {
  const populate = 'populate=authorProfile,authorProfile.avatar,testimonials,testimonials.authorAvatar,heroImage,attachments';
  
  return useQuery({
    queryKey: cmsKeys.service(slug),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/services?publicationState=live&filters[slug][$eq]=${slug}&${populate}`
      ),
    select: (data) => (Array.isArray(data.data) && data.data[0] ? normalizeService(data.data[0]) : undefined),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedServices(limit = 6) {
  return useServices({
    featured: true,
    pageSize: limit,
  });
}

export function useServicesByDomain(domain: string, limit = 10) {
  return useServices({
    domain,
    pageSize: limit,
  });
}

// ============================================================
// Author Hooks
// ============================================================

export function useAuthors(featured?: boolean) {
  const filters = featured ? 'filters[featured][$eq]=true' : '';
  const populate = 'populate=avatar';
  
  return useQuery({
    queryKey: [...cmsKeys.authors(), featured],
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/authors?${populate}&${filters}`
      ),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeAuthor).filter(Boolean) : [],
    }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAuthor(slug: string) {
  const populate = 'populate=avatar';
  
  return useQuery({
    queryKey: cmsKeys.author(slug),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/authors?filters[slug][$eq]=${slug}&${populate}`
      ),
    select: (data) => (Array.isArray(data.data) && data.data[0] ? normalizeAuthor(data.data[0]) : undefined),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAuthorArticles(authorSlug: string, limit = 10) {
  return useArticles({
    author: authorSlug,
    pageSize: limit,
  });
}

// ============================================================
// Category & Tag Hooks
// ============================================================

export function useCategories() {
  return useQuery({
    queryKey: cmsKeys.categories(),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>('/categories'),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeCategory).filter(Boolean) : [],
    }),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTags() {
  return useQuery({
    queryKey: cmsKeys.tags(),
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>('/tags'),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeTag).filter(Boolean) : [],
    }),
    staleTime: 1000 * 60 * 30,
  });
}

// ============================================================
// Testimonial Hooks
// ============================================================

export function useTestimonials(domain?: string, featured?: boolean) {
  let filters = '';
  if (domain) filters += `filters[domain][$eq]=${domain}&`;
  if (featured) filters += `filters[featured][$eq]=true&`;
  
  return useQuery({
    queryKey: [...cmsKeys.testimonials(), domain, featured],
    queryFn: () =>
      fetchAPI<StrapiResponse<Array<StrapiEntity<Record<string, unknown>>>>>(
        `/testimonials?publicationState=live&populate=authorAvatar&${filters}`
      ),
    select: (data) => ({
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeTestimonial).filter(Boolean) : [],
    }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// ============================================================
// View Count Mutation
// ============================================================

export function useIncrementViewCount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, currentCount }: { articleId: number; currentCount: number }) => {
      return fetchAPI(`/articles/${articleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: { viewCount: currentCount + 1 },
        }),
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific article to refetch with new count
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
}

// ============================================================
// Data Transformers (Strapi → Component Props)
// ============================================================

export function transformArticleToCard(article: StrapiArticle) {
  const coverImageUrl =
    resolveMediaUrl(article.coverImage ?? article.heroImage ?? article.images?.[0]) ?? undefined;

  const category = article.category
    ? {
        name: article.category.name,
        slug: article.category.slug,
        color: (article.category as StrapiCategory).color,
      }
    : undefined;

  return {
    id: String(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    coverImage: coverImageUrl,
    domain: article.domain,
    publishedAt: article.publishedAt || article.createdAt,
    readingTime: article.readingTime || 5,
    author: article.author ? {
      name: article.author.name,
      slug: article.author.slug,
      avatar: resolveMediaUrl(article.author.avatar),
    } : undefined,
    category,
    featured: article.featured,
    x402Enabled: article.x402Enabled,
    x402Price: article.x402Price,
  };
}

export function transformServiceToCard(service: StrapiService) {
  const coverImageUrl = resolveMediaUrl(service.coverImage ?? service.heroImage) ?? undefined;
  let pricing: { startingPrice?: number; currency?: string; unit?: string } | undefined;

  if (Array.isArray(service.pricing) && service.pricing.length > 0) {
    const firstTier = service.pricing[0] as { price?: number; currency?: string; unit?: string };
    pricing = {
      startingPrice: typeof firstTier?.price === 'number' ? firstTier.price : undefined,
      currency: firstTier?.currency,
      unit: firstTier?.unit,
    };
  } else if (service.pricing && !Array.isArray(service.pricing)) {
    pricing = {
      startingPrice: (service.pricing as any).startingPrice,
      currency: (service.pricing as any).currency,
      unit: (service.pricing as any).unit,
    };
  }

  return {
    id: String(service.id),
    title: service.title,
    slug: service.slug,
    excerpt: service.excerpt || service.summary || '',
    description: service.description,
    coverImage: coverImageUrl,
    domain: service.domain,
    features: service.features,
    pricing,
    deliveryTime: service.deliveryTime,
    featured: service.featured,
    x402Enabled: service.x402Enabled,
    x402Price: service.x402Price,
  };
}

export function transformAuthorToCard(author: StrapiAuthor) {
  return {
    id: String(author.id),
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    avatar: resolveMediaUrl(author.avatar),
    credentials: author.credentials,
    featured: author.featured,
    socialLinks: author.socialLinks,
  };
}

export function transformTestimonialToCard(testimonial: StrapiTestimonial) {
  return {
    id: String(testimonial.id),
    quote: testimonial.quote,
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole,
    authorCompany: testimonial.authorCompany,
    authorAvatar: resolveMediaUrl(testimonial.authorAvatar),
    rating: testimonial.rating,
    domain: testimonial.domain,
    featured: testimonial.featured,
  };
}

// ============================================================
// Utility: Resolve Media URL
// ============================================================

export function resolveMediaUrl(media?: StrapiMedia | string): string | undefined {
  if (!media) return undefined;
  if (typeof media === 'string') return media;
  
  // If it's a full URL, return as-is
  if (media.url.startsWith('http')) return media.url;
  
  // Otherwise, prepend the CMS URL
  return `${CMS_URL}${media.url}`;
}

export function getMediaFormat(media: StrapiMedia, format: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  const formatUrl = media.formats?.[format]?.url;
  if (formatUrl) {
    return formatUrl.startsWith('http') ? formatUrl : `${CMS_URL}${formatUrl}`;
  }
  return resolveMediaUrl(media) || '';
}
