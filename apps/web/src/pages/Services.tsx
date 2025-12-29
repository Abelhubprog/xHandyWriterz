import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  Brain,
  BookOpen,
  Sparkles,
  Zap,
  Heart,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DOMAIN_TAGS,
  TYPE_TAGS,
  DomainSlug as TaxonomyDomainSlug,
  TypeSlug as TaxonomyTypeSlug,
} from '@/config/taxonomy';
import type { ServiceListItem, ServiceListResponse } from '@/types/cms';
import { fetchServicesList } from '@/lib/cms';

const PAGE_SIZE = 12;

type DomainSlug = TaxonomyDomainSlug;
type ContentTypeSlug = TaxonomyTypeSlug;

type QueryState = {
  domain: DomainSlug | 'all';
  type: ContentTypeSlug | 'all';
  page: number;
};

const DOMAIN_SLUGS = DOMAIN_TAGS.map((entry) => entry.slug) as DomainSlug[];
const TYPE_SLUGS = TYPE_TAGS.map((entry) => entry.slug) as ContentTypeSlug[];

const DOMAIN_LABEL_BY_SLUG = new Map<string, string>(DOMAIN_TAGS.map((entry) => [entry.slug, entry.label]));
const DOMAIN_DESCRIPTION_BY_SLUG = new Map<string, string>(DOMAIN_TAGS.map((entry) => [entry.slug, entry.description]));
const TYPE_LABEL_BY_SLUG = new Map<string, string>(TYPE_TAGS.map((entry) => [entry.slug, entry.label]));

const DOMAIN_PRESENTATION: Record<DomainSlug, { icon: LucideIcon; title: string; description: string }> = {
  'adult-health': {
    icon: GraduationCap,
    title: 'Adult Health Nursing',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('adult-health') ?? 'Clinical support, med-surg updates, and practice-ready checklists.',
  },
  'mental-health': {
    icon: Brain,
    title: 'Mental Health Nursing',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('mental-health') ?? 'Therapeutic techniques, wellbeing protocols, and reflective practice.',
  },
  'child-nursing': {
    icon: Heart,
    title: 'Child Nursing',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('child-nursing') ?? 'Pediatric pathways, growth milestones, and family engagement guides.',
  },
  'social-work': {
    icon: Users,
    title: 'Social Work',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('social-work') ?? 'Policy updates, safeguarding workflows, and community interventions.',
  },
  ai: {
    icon: Sparkles,
    title: 'AI Services',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('ai') ?? 'Applied AI tooling, prompt engineering, and automation playbooks.',
  },
  crypto: {
    icon: Zap,
    title: 'Crypto & Web3',
    description: DOMAIN_DESCRIPTION_BY_SLUG.get('crypto') ?? 'Blockchain research, compliance notes, and market intelligence briefs.',
  },
};

const serviceCategories = DOMAIN_TAGS.map((domain) => {
  const presentation = DOMAIN_PRESENTATION[domain.slug as DomainSlug] ?? {
    icon: BookOpen,
    title: domain.label,
    description: domain.description,
  };
  return {
    icon: presentation.icon,
    title: presentation.title,
    path: `/domains/${domain.slug}`,
    description: presentation.description,
  };
});

export default function Services() {
  const [queryState, setQueryState] = useState<QueryState>({
    domain: 'all',
    type: 'all',
    page: 1,
  });

  const queryKey = useMemo(() => ['services-feed', queryState], [queryState]);

  const servicesQuery = useQuery<ServiceListResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await fetchServicesList({
        domain: queryState.domain !== 'all' ? queryState.domain : undefined,
        type: queryState.type !== 'all' ? queryState.type : undefined,
        page: queryState.page,
        pageSize: PAGE_SIZE,
      });
      return response;
    },
    placeholderData: (previous) => previous,
    keepPreviousData: true,
  });

  const { data, error, isLoading, isFetching } = servicesQuery;

  const items: ServiceListItem[] = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, pageCount: 1, total: 0, pageSize: PAGE_SIZE };
  const totalPages = pagination.pageCount;

  const domainLabel = (slug: string | null | undefined) => {
    if (!slug) return 'General';
    return DOMAIN_LABEL_BY_SLUG.get(slug) ?? slug;
  };

  const typeLabel = (tags: string[]) => {
    if (!tags || tags.length === 0) return 'Service';
    const [tag] = tags;
    return TYPE_LABEL_BY_SLUG.get(tag) ?? tag;
  };

  const handleDomainChange = (domain: QueryState['domain']) => {
    setQueryState((prev) => ({ ...prev, domain, page: 1 }));
  };

  const handleTypeChange = (type: QueryState['type']) => {
    setQueryState((prev) => ({ ...prev, type, page: 1 }));
  };

  const handleNext = () => {
    setQueryState((prev) => ({ ...prev, page: Math.min(prev.page + 1, totalPages || prev.page + 1) }));
  };

  const handlePrev = () => {
    setQueryState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  };

  const showEmptyState = !isLoading && !isFetching && items.length === 0;

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                Services catalogue
              </span>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Structured services by domain</h1>
              <p className="text-lg text-gray-600">
                Browse published services curated in Strapi. Filter by domain or service type, and deep dive into individual offers with rich media support.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Smart filters</p>
                  <p className="text-sm text-gray-600">Switch domains or types to refine the feed instantly.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Domain</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDomainChange('all')}
                      className={`rounded-full border px-3 py-1 text-sm ${queryState.domain === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      All domains
                    </button>
                    {DOMAIN_SLUGS.map((slug) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => handleDomainChange(slug)}
                        className={`rounded-full border px-3 py-1 text-sm ${queryState.domain === slug ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {DOMAIN_PRESENTATION[slug]?.title ?? slug}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Service type</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('all')}
                      className={`rounded-full border px-3 py-1 text-sm ${queryState.type === 'all' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      All types
                    </button>
                    {TYPE_SLUGS.map((slug) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => handleTypeChange(slug)}
                        className={`rounded-full border px-3 py-1 text-sm ${queryState.type === slug ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {TYPE_LABEL_BY_SLUG.get(slug) ?? slug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Popular domains</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {serviceCategories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{category.title}</p>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    View services
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100 bg-gray-50">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Latest services</h2>
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {Math.max(totalPages, 1)} — {pagination.total} items found.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isFetching && <span className="animate-spin text-blue-600">•</span>}
              Updated live from Strapi
            </div>
          </div>

          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-lg border border-gray-100 bg-gray-50 p-5">
                  <div className="mb-3 h-5 w-1/2 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error.message || 'Unable to load services right now.'}
            </div>
          )}

          {showEmptyState && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              No content matches the selected filters yet. Try choosing a different domain or type.
            </div>
          )}

          {!showEmptyState && items.length > 0 && (
            <div className="space-y-6">
              {items.map((item) => {
                const linkHref = item.slug ? `/services/${item.domain ?? 'general'}/${item.slug}` : '#';
                const hasLink = item.slug !== '';
                return (
                  <article key={item.id} className="border-b border-gray-100 pb-6 last:border-none">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start">
                      {item.heroImageUrl && (
                        <img
                          src={item.heroImageUrl}
                          alt={item.title}
                          className="h-28 w-28 flex-shrink-0 rounded-lg border border-gray-100 object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-blue-600">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                            {domainLabel(item.domain)}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            {typeLabel(item.typeTags)}
                          </span>
                          {item.publishedAt && (
                            <time className="text-gray-500" dateTime={item.publishedAt}>
                              {formatDate(item.publishedAt)}
                            </time>
                          )}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                        {item.summary && <p className="mt-2 text-sm text-gray-600">{item.summary}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          {item.authorName && <span>By {item.authorName}</span>}
                          {item.readingMinutes && item.readingMinutes > 0 && <span>~{item.readingMinutes} min read</span>}
                        </div>
                        {hasLink && (
                          <Link
                            to={linkHref}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View full service
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={queryState.page <= 1}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {Math.max(totalPages, 1)}
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={totalPages > 0 ? queryState.page >= totalPages : items.length < PAGE_SIZE}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}