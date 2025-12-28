/**
 * AuthorPage Component
 * 
 * Individual author profile page with:
 * - Author bio and credentials
 * - Social links
 * - List of articles by this author
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';

import { useAuthor, useAuthorArticles } from '@/hooks/useCMS';
import { useCMSContext } from '@/contexts/CMSContext';

// Simple article card component for this page
const SimpleArticleCard = ({ article, resolveCmsMedia }: { article: any; resolveCmsMedia: (url: string) => string }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const coverImage = article.heroImage?.url || article.coverImage?.url;
  const categoryLabel =
    typeof article.category === 'string'
      ? article.category
      : article.category?.name;

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/articles/${article.slug}`}>
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
          {coverImage ? (
            <img
              src={resolveCmsMedia(coverImage)}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-300 dark:text-gray-600" />
            </div>
          )}
        </div>
        <div className="p-5">
          {categoryLabel && (
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full mb-3">
              {categoryLabel}
            </span>
          )}
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {article.excerpt || article.summary}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.publishedAt)}
              </span>
            )}
            {article.readingTime && (
              <span>{article.readingTime} min read</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  // Fetch author data
  const { data: author, isLoading: authorLoading, error } = useAuthor(slug || '');

  // Fetch author's articles
  const { data: articlesData, isLoading: articlesLoading } = useAuthorArticles(slug || '', 12);

  const articles = articlesData?.data || [];

  // Loading state
  if (authorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="flex items-center gap-8 mb-8">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
                <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Author Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The author you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/authors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Authors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{author.name} - HandyWriterz</title>
        <meta name="description" content={author.bio || `Articles and content by ${author.name}`} />
        {author.avatar && (
          <meta property="og:image" content={resolveCmsMedia(author.avatar.url)} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Back navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Author Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
        >
          <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                  {author.avatar ? (
                    <img
                      src={resolveCmsMedia(author.avatar.url)}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
                {author.featured && (
                  <div className="absolute -top-2 -right-2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Featured
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {author.name}
                </h1>
                {author.credentials && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 mb-4">
                    {author.credentials}
                  </p>
                )}
                {author.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {author.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {author.articleCount || articles.length}
                    </span>
                    <span>articles</span>
                  </div>
                  {author.totalViews && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Eye className="w-5 h-5" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {author.totalViews >= 1000
                          ? `${(author.totalViews / 1000).toFixed(1)}k`
                          : author.totalViews}
                      </span>
                      <span>views</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    {author.socialLinks.twitter && (
                      <a
                        href={author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                    {author.socialLinks.linkedin && (
                      <a
                        href={author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {author.socialLinks.website && (
                      <a
                        href={author.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles by Author */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Articles by {author.name}
          </h2>

          {articlesLoading ? (
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
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No articles yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for content from this author.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article) => (
                <SimpleArticleCard 
                  key={article.id} 
                  article={article} 
                  resolveCmsMedia={resolveCmsMedia}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
