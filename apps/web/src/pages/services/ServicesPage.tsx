import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, Tag, User, Share2, Bookmark, Eye } from 'lucide-react';
import ModernContentRenderer, { type ContentBlock } from '@/components/Content/ModernContentRenderer';
import SEOHead from '@/components/SEO/SEOHead';
import type { ServiceDetail, ServiceListItem } from '@/types/cms';
import { fetchServiceBySlug, fetchServicesList } from '@/lib/cms';

const ListSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="mb-12 space-y-4 animate-pulse">
      <div className="h-12 w-3/5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="h-6 w-4/5 rounded bg-gray-200" />
    </div>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="group rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="mb-4 h-56 w-full rounded-t-3xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-4 w-1/4 rounded-full bg-gray-200" />
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 w-32 rounded bg-gray-200" />
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200" />
            <div className="h-6 w-24 rounded-full bg-gray-200" />
          </div>
          <div className="h-12 w-4/5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
          <div className="flex gap-4">
            <div className="h-5 w-28 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="h-5 w-32 rounded bg-gray-200" />
          </div>
        </div>

        {/* Hero Image */}
        <div className="h-96 w-full rounded-3xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />

        {/* Content */}
        <div className="space-y-6 pt-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-11/12 rounded bg-gray-200" />
              <div className="h-4 w-10/12 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DOMAINS: Record<string, { name: string; description: string }> = {
  'adult-nursing': {
    name: 'Adult Nursing',
    description: 'Clinical practice updates, care plans, and evidence-based research.',
  },
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

// Convert service content to modern content blocks
const parseContentToBlocks = (content: string, mediaBlocks: MediaBlock[]): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    
    // Handle headings
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: trimmed.substring(2) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.substring(3) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.substring(4) });
    } else {
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  });
  
  // Add media blocks at the end
  mediaBlocks.forEach((media) => {
    if (media.type === 'image' && media.url) {
      blocks.push({ 
        type: 'image', 
        url: media.url, 
        alt: media.alt, 
        caption: media.caption,
        width: media.width,
        height: media.height
      });
    } else if (media.type === 'video' && media.url) {
      blocks.push({ 
        type: 'video', 
        url: media.url, 
        caption: media.caption 
      });
    } else if (media.type === 'audio' && media.url) {
      blocks.push({ 
        type: 'audio', 
        url: media.url, 
        caption: media.caption 
      });
    } else if (media.type === 'code' && media.code) {
      blocks.push({ 
        type: 'code', 
        language: media.language || 'text', 
        code: media.code,
        filename: media.caption 
      });
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
      className="group cursor-pointer rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-200"
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
        <div className="relative h-56 w-full overflow-hidden rounded-t-3xl bg-gradient-to-br from-indigo-100 to-purple-100">
          <img 
            src={item.heroImageUrl} 
            alt={item.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      )}
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
            {domainInfo?.name ?? item.domain ?? 'Services'}
          </span>
          {item.publishedAt && (
            <time dateTime={item.publishedAt} className="text-gray-500">
              {formatRelative(item.publishedAt)}
            </time>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
          {item.title}
        </h3>
        
        {item.summary && (
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
            {item.summary}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {item.typeTags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              {normalizeTag(tag)}
            </span>
          ))}
          {item.readingMinutes && item.readingMinutes > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {item.readingMinutes} min
            </span>
          )}
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

    const contentBlocks = parseContentToBlocks(detail.content, detail.mediaBlocks);
    
    return (
      <>
        <SEOHead
          title={detail.item.title}
          description={detail.item.summary || detail.content.substring(0, 160)}
          type="article"
          image={detail.heroImage || undefined}
          url={`/services/${domainSlug}/${slug}`}
          publishedTime={detail.item.publishedAt || undefined}
          author={detail.item.authorName || undefined}
          section={domainInfo?.name}
          tags={detail.item.typeTags.map(normalizeTag)}
        />
        
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {/* Header Bar */}
          <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => navigate(domainSlug ? `/services/${domainSlug}` : '/services')}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {domainInfo?.name ?? 'Services'}
              </button>
            </div>
          </div>

          {/* Article Content */}
          <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Article Header */}
            <header className="mb-12 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {detail.item.typeTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700"
                  >
                    {normalizeTag(tag)}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                {detail.item.title}
              </h1>
              
              {detail.item.summary && (
                <p className="text-xl leading-relaxed text-gray-600">
                  {detail.item.summary}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 border-t border-b border-gray-200 py-4 text-sm text-gray-600">
                {detail.item.authorName && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold">
                      {detail.item.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{detail.item.authorName}</div>
                      {detail.item.publishedAt && (
                        <div className="text-xs text-gray-500">{formatDate(detail.item.publishedAt)}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {detail.item.readingMinutes && detail.item.readingMinutes > 0 && (
                  <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                    <Clock className="h-4 w-4" /> {detail.item.readingMinutes} min read
                  </span>
                )}
                
                <div className="ml-auto flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600">
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Hero Image */}
            {detail.heroImage && (
              <figure className="mb-12">
                <div className="overflow-hidden rounded-3xl shadow-2xl">
                  <img 
                    src={detail.heroImage} 
                    alt={detail.item.title} 
                    className="h-auto w-full"
                    loading="eager"
                  />
                </div>
              </figure>
            )}

            {/* Article Content */}
            <ModernContentRenderer 
              blocks={contentBlocks}
              className="mb-12"
            />

            {/* Tags Footer */}
            {detail.item.typeTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-8">
                <Tag className="h-4 w-4 text-gray-400" />
                {detail.item.typeTags.map((tag) => (
                  <a
                    key={tag}
                    href={`/services/${domainSlug}?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    {normalizeTag(tag)}
                  </a>
                ))}
              </div>
            )}
          </article>

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="border-t border-gray-200 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-3xl font-bold text-gray-900">
                  More from {domainInfo?.name ?? 'this domain'}
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {related.map(renderCard)}
                </div>
              </div>
            </section>
          )}
        </div>
      </>
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
    <>
      <SEOHead
        title={heading}
        description={description}
        type="website"
        url={domainSlug ? `/services/${domainSlug}` : '/services'}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="space-y-6 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                {heading}
              </h1>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-indigo-100 sm:text-2xl">
                {description}
              </p>
              {items.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-medium">
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Eye className="h-4 w-4" />
                    <span>{items.length} Articles</span>
                  </div>
                  {domainInfo && (
                    <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                      <Tag className="h-4 w-4" />
                      <span>{domainInfo.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto max-w-md space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Content is on the way
                </h3>
                <p className="text-gray-600">
                  We're working on bringing you amazing content. Check back shortly!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map(renderCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
