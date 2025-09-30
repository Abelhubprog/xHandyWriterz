import { env } from '@/env';
import type { ServiceDetail, ServiceListItem, ServiceListResponse } from '@/types/cms';

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

export async function fetchServicesList(options: {
  domain?: string | null;
  type?: string | null;
  page?: number;
  pageSize?: number;
  includeDraft?: boolean;
} = {}): Promise<ServiceListResponse> {
  const {
    domain = null,
    type = null,
    page = 1,
    pageSize = 12,
    includeDraft = false,
  } = options;

  const filters: FetchParams = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort[0]': 'publishedAt:desc',
    publicationState: includeDraft ? 'preview' : 'live',
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
  options: { previewToken?: string } = {},
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

  const data = await request<any>('/api/services', params);
  if (!data) return null;
  const entry = Array.isArray(data.data) ? data.data[0] : null;
  return entry ? mapServiceDetail(entry) : null;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
}