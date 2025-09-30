import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import {
  DOMAIN_TAGS,
  TYPE_TAGS,
  DomainSlug as TaxonomyDomainSlug,
  TypeSlug as TaxonomyTypeSlug,
} from '@/config/taxonomy';
import type { ServiceListItem } from '@/types/cms';
import { fetchServicesList } from '@/lib/cms';

const PAGE_SIZE = 12;
const FALLBACK_IMAGE = '/images/placeholders/article-cover.jpg';

const DOMAIN_META_BY_SLUG = new Map<string, (typeof DOMAIN_TAGS)[number]>(DOMAIN_TAGS.map((entry) => [entry.slug, entry]));
const TYPE_META_BY_SLUG = new Map<string, (typeof TYPE_TAGS)[number]>(TYPE_TAGS.map((entry) => [entry.slug, entry]));
const TYPE_OPTIONS: Array<'all' | TaxonomyTypeSlug> = ['all', ...TYPE_TAGS.map((entry) => entry.slug as TaxonomyTypeSlug)];

const isDomainSlug = (value: string): value is TaxonomyDomainSlug => DOMAIN_META_BY_SLUG.has(value);

const formatDate = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const DomainLanding: React.FC = () => {
  const params = useParams();
  const domainParam = params.domain ?? '';

  if (!isDomainSlug(domainParam)) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Domain not found</h1>
        <p className="mt-2 text-slate-600">Explore the full services catalogue to find the area you need.</p>
        <Link
          to="/services"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Browse Services
          <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const domainMeta = DOMAIN_META_BY_SLUG.get(domainParam)!;
  const [typeFilter, setTypeFilter] = useState<'all' | TaxonomyTypeSlug>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ServiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [typeFilter, domainParam]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchServicesList({
      domain: domainParam,
      type: typeFilter === 'all' ? undefined : typeFilter,
      page: 1,
      pageSize: PAGE_SIZE,
    })
      .then((response) => {
        if (!mounted) return;
        setItems(response.items);
        setPageCount(response.pagination.pageCount ?? 1);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('[domain] load error', err);
        setError('Unable to load services for this domain right now.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [domainParam, typeFilter]);

  const handleLoadMore = async () => {
    if (isFetchingMore) return;
    const nextPage = page + 1;
    if (pageCount > 0 && nextPage > pageCount) return;
    setIsFetchingMore(true);
    try {
      const response = await fetchServicesList({
        domain: domainParam,
        type: typeFilter === 'all' ? undefined : typeFilter,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setItems((prev) => [...prev, ...response.items]);
      setPage(nextPage);
      setPageCount(response.pagination.pageCount ?? pageCount);
    } catch (err) {
      console.error('[domain] load more error', err);
      setError('Unable to load more services.');
    } finally {
      setIsFetchingMore(false);
    }
  };

  const hasMore = page < pageCount;

  const domainTitle = domainMeta.label;
  const domainDescription = domainMeta.description;
  const canonicalUrl = `https://www.handywriterz.com/d/${domainParam}`;

  const filteredItems = useMemo(() => items, [items]);

  return (
    <main className="bg-slate-950 text-slate-100">
      <Helmet>
        <title>{`${domainTitle} | HandyWriterz`}</title>
        <meta name="description" content={domainDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-80" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-end lg:py-24">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
              Domain feed
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {domainTitle}
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              {domainDescription}
            </p>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur lg:w-[320px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filter by type</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {TYPE_OPTIONS.map((type) => {
                  const meta = type === 'all' ? null : TYPE_META_BY_SLUG.get(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      className={clsx(
                        'rounded-full border px-3 py-2 text-xs font-semibold transition',
                        typeFilter === type
                          ? 'border-primary bg-primary/10 text-primary-light'
                          : 'border-slate-700/70 text-slate-300 hover:border-primary/60 hover:text-primary-light'
                      )}
                    >
                      {meta?.label ?? 'All types'}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-xs text-slate-300">
              <p className="font-semibold text-white">Powered by Strapi CMS</p>
              <p className="mt-1 text-slate-400">
                Live services filtered by domain and type. Each entry includes draft-to-publish workflow metadata.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-900 bg-gradient-to-b from-slate-950 via-slate-950 to-black">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-3xl border border-red-400/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <h3 className="text-xl font-semibold text-white">Publishing for this domain is coming soon.</h3>
              <p className="mt-3 text-sm text-slate-300">
                Our team is preparing expert resources for {domainTitle}. Subscribe to updates or reach out if you
                have a specific request.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-light"
                >
                  Contact HandyWriterz
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 hover:border-primary hover:text-primary-light"
                >
                  Explore other domains
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 shadow-sm transition hover:-translate-y-2 hover:border-primary/80 hover:shadow-primary/20"
                >
                  {item.heroImageUrl && (
                    <div className="h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={item.heroImageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        {domainMeta.label}
                      </span>
                      {item.typeTags.slice(0, 1).map((tag) => (
                        <span key={tag} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                          {TYPE_META_BY_SLUG.get(tag)?.label ?? tag}
                        </span>
                      ))}
                      {item.publishedAt && (
                        <time className="text-slate-400" dateTime={item.publishedAt}>
                          {formatDate(item.publishedAt)}
                        </time>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-light">{item.title}</h3>
                    {item.summary && (
                      <p className="text-sm text-slate-300/90 line-clamp-3">{item.summary}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between text-xs text-slate-400">
                      <span>{item.authorName || 'HandyWriterz Editorial'}</span>
                      {item.readingMinutes && item.readingMinutes > 0 && <span>~{item.readingMinutes} min read</span>}
                    </div>
                    <Link
                      to={`/services/${domainParam}/${item.slug}`}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-light transition hover:text-primary"
                    >
                      View service
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center justify-center">
            {isFetchingMore ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
              </span>
            ) : (
              hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-primary hover:text-primary-light"
                >
                  Load more
                  <ArrowRight className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/10 bg-slate-900 shadow-sm">
    <div className="h-48 w-full animate-pulse bg-slate-800" />
    <div className="flex flex-1 flex-col gap-3 p-6">
      <div className="h-3 w-24 rounded-full bg-slate-800" />
      <div className="h-4 w-3/4 rounded-full bg-slate-800" />
      <div className="h-4 w-full rounded-full bg-slate-800" />
      <div className="mt-auto flex items-center justify-between">
        <span className="h-3 w-20 rounded-full bg-slate-800" />
        <span className="h-3 w-16 rounded-full bg-slate-800" />
      </div>
    </div>
  </div>
);

export default DomainLanding;