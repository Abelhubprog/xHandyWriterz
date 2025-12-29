import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Grid,
  List,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  Bot,
  X,
  ChevronDown,
} from 'lucide-react';

import {
  useArticles,
  useFeaturedArticles,
  useCategories,
  transformArticleToCard,
  type StrapiArticle,
} from '@/hooks/useCMS';

import { useCMSContext, useDomain } from '@/contexts/CMSContext';
import { normalizeDomainSlug } from '@/lib/domain-utils';
import { ArticleCard } from '@/components/landing';
import { fetchDomainsList } from '@/lib/cms';

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function ViewToggle({ view, setView }: { view: 'grid' | 'list'; setView: (v: 'grid' | 'list') => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
      <button
        onClick={() => setView('grid')}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
          view === 'grid'
            ? 'bg-slate-900 text-white'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView('list')}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
          view === 'list'
            ? 'bg-slate-900 text-white'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

function ArticleListItem({ article }: { article: StrapiArticle }) {
  const canonicalDomain = normalizeDomainSlug(article.domain) ?? article.domain ?? 'general';
  const domainInfo = useDomain(canonicalDomain as any);
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  return (
    <motion.article
      variants={fadeInUp}
      className="group flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 md:flex-row"
    >
      <Link
        to={`/articles/${article.slug}`}
        className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-40 md:w-64"
      >
        {article.coverImage ? (
          <img
            src={resolveCmsMedia(article.coverImage.url)}
            alt={article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${domainInfo.gradient}`} />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">
            {domainInfo.name}
          </span>
          {article.category && (
            <span className="text-slate-500">{article.category.name}</span>
          )}
          {article.x402Enabled && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              <Bot className="h-3 w-3" />
              x402
            </span>
          )}
        </div>

        <Link to={`/articles/${article.slug}`} className="mt-3 block">
          <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-slate-700">
            {article.title}
          </h3>
        </Link>

        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
          {article.excerpt || article.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {article.author && (
            <span className="flex items-center gap-2">
              {article.author.avatar ? (
                <img
                  src={resolveCmsMedia(article.author.avatar.url)}
                  alt={article.author.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="h-6 w-6 rounded-full bg-slate-200" />
              )}
              {article.author.name}
            </span>
          )}
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min read
            </span>
          )}
          {typeof article.viewCount === 'number' && article.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedDomain, setSelectedDomain] = useState(searchParams.get('domain') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const filters = useMemo(
    () => ({
      domain: selectedDomain || undefined,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      pageSize: 12,
    }),
    [selectedDomain, selectedCategory, searchQuery]
  );

  const { data: articlesData, isLoading } = useArticles(filters);
  const { data: featuredData } = useFeaturedArticles(3);
  const { data: categoriesData } = useCategories();
  const { data: domainsData } = useQuery({
    queryKey: ['article-domains'],
    queryFn: () => fetchDomainsList({ activeOnly: true }),
    staleTime: 1000 * 60 * 10,
  });

  const articles = articlesData?.data || [];
  const featuredArticles = featuredData?.data || [];
  const categories = categoriesData?.data || [];

  const domainOptions = useMemo(() => {
    const options = (domainsData || []).map((domain) => ({
      value: domain.slug,
      label: domain.name,
    }));
    return [{ value: '', label: 'All Domains' }, ...options];
  }, [domainsData]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDomain) params.set('domain', selectedDomain);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedDomain, selectedCategory, setSearchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchQuery || selectedDomain || selectedCategory;

  return (
    <>
      <Helmet>
        <title>Articles - HandyWriterz</title>
        <meta name="description" content="Explore expert articles on healthcare, technology, and enterprise topics." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl space-y-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">HandyWriterz library</p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Research, insights, and domain playbooks
              </h1>
              <p className="text-lg text-white/70">
                Browse published guidance from our specialist teams across healthcare, tech, and enterprise domains.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative col-span-2">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-white/50" />
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  {domainOptions.map((domain) => (
                    <option key={domain.value} value={domain.value} className="text-slate-900">
                      {domain.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-white/50" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  <option value="" className="text-slate-900">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug} className="text-slate-900">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                {isLoading ? 'Loading articles...' : `${articles.length} article${articles.length !== 1 ? 's' : ''} found`}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </button>
                )}
                <ViewToggle view={view} setView={setView} />
              </div>
            </div>

            {featuredArticles.length > 0 && (
              <div className="mt-10">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="mb-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Featured</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Editor picks</h2>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {featuredArticles.slice(0, 1).map((article) => {
                    const card = transformArticleToCard(article);
                    return (
                      <ArticleCard
                        key={card.id}
                        {...card}
                        variant="hero"
                        className="lg:col-span-2"
                      />
                    );
                  })}
                  <div className="flex flex-col gap-6">
                    {featuredArticles.slice(1).map((article) => {
                      const card = transformArticleToCard(article);
                      return (
                        <ArticleCard
                          key={card.id}
                          {...card}
                          variant="horizontal"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-8 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">All articles</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Latest from the newsroom</h2>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-64 rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">No articles found</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Try adjusting your search or clearing some filters.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
                    >
                      <X className="h-4 w-4" />
                      Reset filters
                    </button>
                  )}
                </div>
              ) : view === 'grid' ? (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {articles.map((article) => {
                    const card = transformArticleToCard(article);
                    return (
                      <ArticleCard key={card.id} {...card} />
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={stagger}
                  className="flex flex-col gap-6"
                >
                  {articles.map((article) => (
                    <ArticleListItem key={article.id} article={article} />
                  ))}
                </motion.div>
              )}
            </div>

            <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/80 p-10">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Publishing</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Want updates delivered weekly?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Subscribe to receive new domain playbooks and expert guidance as soon as they publish.
                  </p>
                </div>
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
                >
                  Join the list
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
