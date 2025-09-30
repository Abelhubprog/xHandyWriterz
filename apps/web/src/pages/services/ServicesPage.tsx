import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import RichContentRenderer from '@/components/Services/RichContentRenderer';
import type { ServiceDetail, ServiceListItem } from '@/types/cms';
import { fetchServiceBySlug, fetchServicesList } from '@/lib/cms';

const ListSkeleton: React.FC = () => (
  <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="mb-8 space-y-3 animate-pulse">
      <div className="h-10 w-2/5 rounded bg-gray-200" />
      <div className="h-4 w-3/5 rounded bg-gray-200" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 h-40 w-full rounded bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="mb-2 h-4 w-5/6 rounded bg-gray-200" />
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
    <div className="space-y-3 animate-pulse">
      <div className="h-3 w-1/3 rounded bg-gray-200" />
      <div className="h-8 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-2/5 rounded bg-gray-200" />
    </div>
    <div className="h-64 w-full rounded-2xl bg-gray-200" />
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="h-4 w-full rounded bg-gray-200" />
      ))}
    </div>
    <div className="space-y-3">
      <div className="h-3 w-1/5 rounded bg-gray-200" />
      <div className="h-3 w-2/5 rounded bg-gray-200" />
    </div>
  </div>
);

const DOMAINS: Record<string, { name: string; description: string }> = {
  'adult-health': {
    name: 'Adult Health Nursing',
    description: 'Clinical practice updates, care plans, and evidence-based research.',
  },
  'mental-health': {
    name: 'Mental Health',
    description: 'Wellness resources, therapeutic approaches, and support strategies.',
  },
  'child-nursing': {
    name: 'Child Nursing',
    description: 'Pediatric care guidelines, developmental milestones, and family education.',
  },
  'social-work': {
    name: 'Social Work',
    description: 'Community resources, advocacy strategies, and case management.',
  },
  ai: {
    name: 'Artificial Intelligence',
    description: 'AI research, machine learning, and automation insights.',
  },
  crypto: {
    name: 'Crypto & Web3',
    description: 'Blockchain technology, digital assets, and DeFi developments.',
  },
};

type MediaBlock = {
  type: 'video' | 'image' | 'code' | 'chart' | 'pdf' | 'audio' | 'embed';
  url?: string;
  caption?: string;
  alt?: string;
  language?: string;
  code?: string;
  data?: unknown;
  width?: number;
  height?: number;
};

interface DetailedContent {
  item: ServiceDetail;
  content: string;
  mediaBlocks: MediaBlock[];
  heroImage: string | null;
}

const formatDate = (value: string | null): string => {
  if (!value) return '';
  try {
    return format(new Date(value), 'PP');
  } catch {
    return '';
  }
};

const formatRelative = (value: string | null): string => {
  if (!value) return '';
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return '';
  }
};

const buildMediaBlocks = (attachments: ServiceDetail['attachments']): MediaBlock[] => {
  const blocks: MediaBlock[] = [];
  attachments.forEach((attachment) => {
    const mime = attachment.mimeType ?? '';
    const url = attachment.url ?? '';
    if (!url) return;
    if (mime.startsWith('image/')) {
      blocks.push({ type: 'image', url, alt: mime });
      return;
    }
    if (mime.startsWith('video/')) {
      blocks.push({ type: 'video', url });
      return;
    }
    if (mime.startsWith('audio/')) {
      blocks.push({ type: 'audio', url });
      return;
    }
    if (mime === 'application/pdf') {
      blocks.push({ type: 'pdf', url });
    }
  });
  return blocks;
};

const normalizeTag = (tag: string) => tag.replace(/^domain:/, '').replace(/^type:/, '');

const ServicesPage: React.FC = () => {
  const params = useParams<{ domain?: string; slug?: string }>();
  const navigate = useNavigate();
  const domainSlug = params.domain ?? null;
  const slug = params.slug ?? null;

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(Boolean(slug));
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [items, setItems] = useState<ServiceListItem[]>([]);
  const [detail, setDetail] = useState<DetailedContent | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoadingList(true);
    setListError(null);

    fetchServicesList({ domain: domainSlug ?? undefined })
      .then((response) => {
        if (!mounted) return;
        setItems(response.items);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('[services] list error', error);
        setListError('Unable to load services at the moment.');
      })
      .finally(() => {
        if (mounted) setIsLoadingList(false);
      });

    return () => {
      mounted = false;
    };
  }, [domainSlug]);

  useEffect(() => {
    if (!slug) {
      setDetail(null);
      setIsLoadingDetail(false);
      setDetailError(null);
      return;
    }

    let mounted = true;
    setIsLoadingDetail(true);
    setDetailError(null);

    fetchServiceBySlug(slug)
      .then((service) => {
        if (!mounted) return;
        if (!service) {
          setDetailError('This service is no longer available.');
          return;
        }
        const content: DetailedContent = {
          item: service,
          content: service.body ?? '',
          mediaBlocks: buildMediaBlocks(service.attachments),
          heroImage: service.heroImageUrl,
        };
        setDetail(content);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('[services] detail error', error);
        setDetailError('Unable to load service details.');
      })
      .finally(() => {
        if (mounted) setIsLoadingDetail(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (listError) {
      toast.error(listError);
    }
  }, [listError]);

  useEffect(() => {
    if (detailError) {
      toast.error(detailError);
    }
  }, [detailError]);

  const domainInfo = domainSlug ? DOMAINS[domainSlug] : null;

  const related = useMemo(() => {
    if (!detail) return [] as ServiceListItem[];
    return items
      .filter((item) => item.slug !== detail.item.slug)
      .filter((item) => (domainSlug ? item.domain === domainSlug : true))
      .slice(0, 6);
  }, [detail, domainSlug, items]);

  const renderCard = (item: ServiceListItem) => (
    <article
      key={item.id}
      className="rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/services/${(item.domain ?? 'general')}/${item.slug}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          navigate(`/services/${(item.domain ?? 'general')}/${item.slug}`);
        }
      }}
    >
      {item.heroImageUrl && (
        <div className="h-40 w-full overflow-hidden rounded-t-2xl">
          <img src={item.heroImageUrl} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
          <span className="inline-flex items-center gap-2 text-blue-600">
            {domainInfo?.name ?? item.domain ?? 'Services'}
          </span>
          {item.publishedAt && (
            <time dateTime={item.publishedAt}>{formatRelative(item.publishedAt)}</time>
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
        {item.summary && <p className="text-sm text-gray-600">{item.summary}</p>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {item.typeTags.map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {normalizeTag(tag)}
            </span>
          ))}
          {item.readingMinutes && item.readingMinutes > 0 && <span>~{item.readingMinutes} min read</span>}
        </div>
      </div>
    </article>
  );

  if (slug) {
    if (isLoadingDetail) {
      return <DetailSkeleton />;
    }

    if (detailError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center text-center">
          <div>
            <p className="text-lg font-semibold text-gray-800">We hit a snag.</p>
            <p className="mt-2 text-sm text-gray-600">{detailError}</p>
            <button
              type="button"
              onClick={() => navigate(domainSlug ? `/services/${domainSlug}` : '/services')}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Return to Services
            </button>
          </div>
        </div>
      );
    }

    if (!detail) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
          Service unavailable.
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
        <button
          type="button"
          onClick={() => navigate(domainSlug ? `/services/${domainSlug}` : '/services')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {domainInfo?.name ?? 'Services'}
        </button>

        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-blue-600">
              {detail.item.typeTags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1">{normalizeTag(tag)}</span>
              ))}
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">{detail.item.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {detail.item.publishedAt && (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {formatDate(detail.item.publishedAt)}
                </span>
              )}
              {detail.item.readingMinutes && detail.item.readingMinutes > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {detail.item.readingMinutes} min read
                </span>
              )}
              {detail.item.authorName && (
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" /> {detail.item.authorName}
                </span>
              )}
            </div>
          </div>

          {detail.heroImage && (
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <img src={detail.heroImage} alt={detail.item.title} className="h-auto w-full" />
            </div>
          )}

          <RichContentRenderer
            content={detail.content}
            mediaBlocks={detail.mediaBlocks}
            className="prose prose-lg max-w-none"
          />

          {detail.item.typeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {detail.item.typeTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  <Tag className="h-3 w-3" /> {normalizeTag(tag)}
                </span>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">More from {domainInfo?.name ?? 'this domain'}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map(renderCard)}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (isLoadingList) {
    return <ListSkeleton />;
  }

  if (listError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <p className="text-lg font-semibold text-gray-800">We hit a snag.</p>
          <p className="mt-2 text-sm text-gray-600">{listError}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  const heading = domainInfo?.name ?? 'Professional Services & Resources';
  const description = domainInfo?.description ??
    'Explore our structured services catalogue powered by Strapi CMS and curated domains.';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">{heading}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center text-gray-500">
          Content is on the way. Check back shortly.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;