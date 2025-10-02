import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  Compass,
  Cpu,
  FileText,
  Flame,
  Loader2,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  fetchArticlesBySlugs,
  fetchArticlesList,
  fetchDomainPage,
  fetchServicesBySlugs,
  fetchServicesList,
} from '@/lib/cms';
import type {
  ArticleSummary,
  DomainHighlight,
  DomainPage,
  LandingSectionItem,
  ServiceListItem,
} from '@/types/cms';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  activity: Activity,
  shield: Shield,
  cpu: Cpu,
  brain: Brain,
  sparkles: Sparkles,
  compass: Compass,
  users: Users,
  flame: Flame,
  trending: TrendingUp,
  checklist: CheckCircle,
  message: MessageSquare,
  default: BarChart3,
};

const formatDate = (input: string | null) => {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const HighlightCard: React.FC<{ highlight: DomainHighlight }> = ({ highlight }) => {
  const Icon = ICON_MAP[highlight.iconKey ?? ''] ?? ICON_MAP.default;
  return (
    <div className="rounded-xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-600">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-500">{highlight.label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{highlight.value}</p>
      {highlight.description && <p className="mt-2 text-sm text-gray-600">{highlight.description}</p>}
    </div>
  );
};

const SpotlightCard: React.FC<{ item: LandingSectionItem }> = ({ item }) => {
  const Icon = item.iconKey ? ICON_MAP[item.iconKey] ?? ICON_MAP.default : ICON_MAP.default;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            {item.badge && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && <p className="mt-1 text-sm font-medium text-gray-500">{item.subtitle}</p>}
          {item.description && <p className="mt-3 text-sm text-gray-600">{item.description}</p>}
          {item.linkUrl && item.linkLabel && (
            <Link
              to={item.linkUrl}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {item.linkLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const ServiceCard: React.FC<{ service: ServiceListItem }> = ({ service }) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    {service.heroImageUrl && (
      <div className="relative h-40 overflow-hidden">
        <img
          src={service.heroImageUrl}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    )}
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
          {service.title}
        </h3>
        {service.summary && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{service.summary}</p>}
      </div>
      <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
        {service.readingMinutes ? (
          <span>{service.readingMinutes} min read</span>
        ) : (
          <span>Service insight</span>
        )}
        <Link to={`/services/${service.domain ?? ''}/${service.slug}`} className="inline-flex items-center gap-1 font-medium text-indigo-600">
          Explore
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

const ArticleCard: React.FC<{ article: ArticleSummary }> = ({ article }) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
            {article.title}
          </h3>
          {article.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{article.excerpt}</p>}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
        <span>
          {article.authorName ? `${article.authorName} • ` : ''}
          {formatDate(article.publishedAt)}
        </span>
        <Link to={`/articles/${article.slug}`} className="inline-flex items-center gap-1 font-medium text-indigo-600">
          Read more
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

const EnterpriseDomainPage: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const normalizedDomain = (domain ?? '').toLowerCase();

  const {
    data: domainPage,
    isLoading: domainLoading,
    isError: domainError,
  } = useQuery<DomainPage | null>({
    queryKey: ['domain-page', normalizedDomain],
    queryFn: () => fetchDomainPage(normalizedDomain),
    enabled: Boolean(normalizedDomain),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: services,
    isLoading: servicesLoading,
  } = useQuery<ServiceListItem[]>({
    queryKey: ['domain-services', normalizedDomain, domainPage?.serviceSlugs ?? []],
    queryFn: async () => {
      if (!domainPage) return [];
      if (domainPage.serviceSlugs.length > 0) {
        return fetchServicesBySlugs(domainPage.serviceSlugs);
      }
      const res = await fetchServicesList({ domain: normalizedDomain, pageSize: 6 });
      return res.items;
    },
    enabled: Boolean(domainPage),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: articles,
    isLoading: articlesLoading,
  } = useQuery<ArticleSummary[]>({
    queryKey: ['domain-articles', normalizedDomain, domainPage?.articleSlugs ?? []],
    queryFn: async () => {
      if (!domainPage) return [];
      if (domainPage.articleSlugs.length > 0) {
        return fetchArticlesBySlugs(domainPage.articleSlugs);
      }
      return fetchArticlesList({ limit: 6 });
    },
    enabled: Boolean(domainPage),
    staleTime: 1000 * 60 * 5,
  });

  if (!normalizedDomain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Missing domain</h1>
          <p className="mt-2 text-gray-600">Please provide a valid domain in the URL.</p>
        </div>
      </div>
    );
  }

  if (domainLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading domain experience…
        </div>
      </div>
    );
  }

  if (domainError || !domainPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Domain coming soon</h1>
          <p className="mt-2 text-gray-600">
            We haven’t published a dedicated experience for this domain yet. Check back soon or explore our services.
          </p>
          <Link
            to="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Browse services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = domainPage.heroTitle ?? domainPage.title;
  const metaDescription = domainPage.metaDescription ?? domainPage.heroDescription ?? undefined;

  return (
    <>
      <Helmet>
        <title>{pageTitle} | HandyWriterz</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta property="og:title" content={`${pageTitle} | HandyWriterz`} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 py-20 text-white">
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)] h-full w-full" />
          </div>
          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
            <div className="max-w-2xl">
              {domainPage.heroEyebrow && (
                <span className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                  {domainPage.heroEyebrow}
                </span>
              )}
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {domainPage.heroTitle ?? domainPage.title}
              </h1>
              {domainPage.heroDescription && (
                <p className="mt-6 text-lg text-indigo-100">
                  {domainPage.heroDescription}
                </p>
              )}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {domainPage.ctaUrl && domainPage.ctaLabel && (
                  <Link
                    to={domainPage.ctaUrl}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
                  >
                    {domainPage.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-100 transition hover:text-white"
                >
                  View all services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {domainPage.heroImageUrl && (
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-3">
                <img
                  src={domainPage.heroImageUrl}
                  alt={pageTitle}
                  className="h-full w-full rounded-2xl object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" aria-hidden />
              </div>
            )}
          </div>
        </section>

        {domainPage.highlights.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {domainPage.highlights.map((highlight) => (
                <HighlightCard key={highlight.id} highlight={highlight} />
              ))}
            </div>
          </section>
        )}

        {domainPage.spotlight.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Spotlight initiatives</h2>
                <p className="mt-2 text-base text-slate-600">
                  Curated programs, toolkits, and research to accelerate your progress.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {domainPage.spotlight.map((item) => (
                <SpotlightCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Signature services</h2>
                <p className="mt-2 text-base text-slate-600">
                  Strategic offerings crafted for teams operating within this domain.
                </p>
              </div>
              <Link to={`/services?domain=${normalizedDomain}`} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                View domain services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {servicesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                We’re preparing service packages for this domain. Check back soon or contact our team.
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Latest insights</h2>
                <p className="mt-2 text-base text-slate-600">
                  Explore research briefings, playbooks, and commentary from our editorial team.
                </p>
              </div>
              <Link to="/learning-hub" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                Visit learning hub
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {articlesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                Editorial coverage for this domain is on the way. In the meantime, explore our core playbooks.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-slate-600 px-8 py-12 text-white shadow-xl sm:px-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
                  Need a bespoke briefing?
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Book a domain strategy workshop</h2>
                <p className="mt-3 text-indigo-100">
                  Collaborate with our experts to design engagement plans tailored to your organization’s goals.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                Schedule a call
                <BookOpen className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EnterpriseDomainPage;
