/**
 * ArticlesPage Component
 * 
 * Article listing/browse page with:
 * - Domain filtering
 * - Category filtering
 * - Search functionality
 * - Infinite scroll / pagination
 * - x402 badge indicators
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  Filter,
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

import { useCMSContext, useDomain, DOMAINS } from '@/contexts/CMSContext';
import { ArticleCard } from '@/components/landing';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Domain filter options
const DOMAIN_OPTIONS = [
  { value: '', label: 'All Domains' },
  ...DOMAINS.map(d => ({ value: d.slug, label: d.name })),
];

// View mode component
function ViewToggle({ view, setView }: { view: 'grid' | 'list'; setView: (v: 'grid' | 'list') => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setView('grid')}
        className={`p-2 rounded-lg transition-colors ${
          view === 'grid'
            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setView('list')}
        className={`p-2 rounded-lg transition-colors ${
          view === 'list'
            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

// Article list item component
function ArticleListItem({ article }: { article: StrapiArticle }) {
  const domainInfo = useDomain(article.domain as any || 'general');
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  return (
    <motion.article
      variants={fadeInUp}
      className="group flex gap-6 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Image */}
      <Link
        to={`/articles/${article.slug}`}
        className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        {article.coverImage ? (
          <img
            src={resolveCmsMedia(article.coverImage.url)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${domainInfo.gradient}`} />
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${domainInfo.gradient} text-white`}>
            {domainInfo.name}
          </span>
          {article.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {article.category.name}
            </span>
          )}
          {article.x402Enabled && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Bot className="w-3 h-3" />
              AI Access
            </span>
          )}
        </div>

        <Link
          to={`/articles/${article.slug}`}
          className="block mb-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {article.author && (
            <span className="flex items-center gap-1">
              {article.author.avatar ? (
                <img
                  src={resolveCmsMedia(article.author.avatar.url)}
                  alt={article.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
              )}
              {article.author.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(article.publishedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readingTime || '5 min'}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.viewCount || 0}
          </span>
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
  const [showFilters, setShowFilters] = useState(false);

  // Fetch articles with filters
  const filters = useMemo(() => ({
    domain: selectedDomain || undefined,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    pageSize: 12,
  }), [selectedDomain, selectedCategory, searchQuery]);

  const { data: articlesData, isLoading } = useArticles(filters);
  const { data: featuredData } = useFeaturedArticles(3);
  const { data: categoriesData } = useCategories();

  const articles = articlesData?.data || [];
  const featuredArticles = featuredData?.data || [];
  const categories = categoriesData?.data || [];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDomain) params.set('domain', selectedDomain);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedDomain, selectedCategory]);

  // Clear all filters
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Expert Insights & Articles
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                Discover research-driven content across healthcare, technology, and enterprise domains.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-blue-200" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* Domain Filter */}
              <div className="relative">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {DOMAIN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {articles.length} article{articles.length !== 1 ? 's' : ''}
              </span>
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>

          {/* Featured Articles (only show when no filters) */}
          {!hasActiveFilters && featuredArticles.length > 0 && (
            <motion.section
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Featured Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredArticles.map((article) => (
                  <ArticleCard key={article.id} {...transformArticleToCard(article)} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Articles Grid/List */}
          {!isLoading && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {hasActiveFilters
                      ? 'Try adjusting your filters or search terms.'
                      : 'Check back soon for new content.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : view === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} {...transformArticleToCard(article)} />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {articles.map((article) => (
                    <ArticleListItem key={article.id} article={article} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Load More */}
          {articles.length >= 12 && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                Load more articles
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
