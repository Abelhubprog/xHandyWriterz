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