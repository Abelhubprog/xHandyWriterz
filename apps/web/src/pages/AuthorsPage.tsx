/**
 * AuthorsPage Component
 * 
 * Authors listing page with:
 * - Featured authors
 * - Domain expertise filtering
 * - Author cards with stats
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  BookOpen,
  Award,
  Users,
  ChevronDown,
  X,
  Star,
} from 'lucide-react';

import { useAuthors, type StrapiAuthor } from '@/hooks/useCMS';
import { useCMSContext, DOMAINS } from '@/contexts/CMSContext';

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

// Author card component
function AuthorCard({ author }: { author: StrapiAuthor }) {
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  return (
    <motion.div
      variants={fadeInUp}
      className="group bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/authors/${author.slug}`} className="block">
        {/* Avatar & Featured Badge */}
        <div className="relative mb-4">
          <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
            {author.avatar ? (
              <img
                src={resolveCmsMedia(author.avatar.url)}
                alt={author.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                {author.name.charAt(0)}
              </div>
            )}
          </div>
          {author.featured && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-amber-900" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Name & Credentials */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {author.name}
        </h3>
        {author.credentials && (
          <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-3">
            {author.credentials}
          </p>
        )}

        {/* Bio */}
        {author.bio && (
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center line-clamp-3 mb-4">
            {author.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {author.articleCount || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Articles</div>
          </div>
          {author.totalViews && (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {author.totalViews >= 1000 
                  ? `${(author.totalViews / 1000).toFixed(1)}k` 
                  : author.totalViews}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
            </div>
          )}
        </div>

        {/* Social Links */}
        {author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export default function AuthorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Fetch authors
  const { data: authorsData, isLoading } = useAuthors();
  const authors = authorsData?.data || [];

  // Filter authors
  const filteredAuthors = useMemo(() => {
    let result = authors;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (author) =>
          author.name.toLowerCase().includes(query) ||
          author.bio?.toLowerCase().includes(query) ||
          author.credentials?.toLowerCase().includes(query)
      );
    }

    if (featuredOnly) {
      result = result.filter((author) => author.featured);
    }

    return result;
  }, [authors, searchQuery, featuredOnly]);

  const featuredAuthors = useMemo(
    () => authors.filter((a) => a.featured),
    [authors]
  );

  return (
    <>
      <Helmet>
        <title>Authors - HandyWriterz</title>
        <meta name="description" content="Meet our expert authors and contributors across healthcare, technology, and enterprise domains." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Meet Our Authors
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-8">
                Expert contributors sharing knowledge across healthcare, technology, and enterprise domains.
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{authors.length}</div>
                  <div className="text-sm text-purple-200">Authors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{featuredAuthors.length}</div>
                  <div className="text-sm text-purple-200">Featured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {authors.reduce((sum, a) => sum + (a.articleCount || 0), 0)}
                  </div>
                  <div className="text-sm text-purple-200">Articles</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search authors..."
                className="w-full px-4 py-2 pl-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Featured Toggle */}
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                featuredOnly
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              } border border-gray-200 dark:border-gray-700`}
            >
              <Star className={`w-4 h-4 ${featuredOnly ? 'fill-current' : ''}`} />
              Featured Only
            </button>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAuthors.length} author{filteredAuthors.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl p-6">
                  <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Authors Grid */}
          {!isLoading && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {filteredAuthors.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No authors found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery || featuredOnly
                      ? 'Try adjusting your search or filters.'
                      : 'Check back soon for new contributors.'}
                  </p>
                  {(searchQuery || featuredOnly) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFeaturedOnly(false);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAuthors.map((author) => (
                    <AuthorCard key={author.id} author={author} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
