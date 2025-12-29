import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Star, X } from 'lucide-react';

import { useAuthors, type StrapiAuthor } from '@/hooks/useCMS';
import { useCMSContext } from '@/contexts/CMSContext';

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

function AuthorCard({ author }: { author: StrapiAuthor }) {
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  return (
    <motion.div
      variants={fadeInUp}
      className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:border-slate-300"
    >
      <Link to={`/authors/${author.slug}`} className="block">
        <div className="relative mb-6">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl bg-slate-900 text-white">
            {author.avatar ? (
              <img
                src={resolveCmsMedia(author.avatar.url)}
                alt={author.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                {author.name.charAt(0)}
              </div>
            )}
          </div>
          {author.featured && (
            <span className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow">
              <Star className="h-4 w-4" />
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-slate-700">
          {author.name}
        </h3>
        {author.credentials && (
          <p className="mt-1 text-sm text-slate-500">{author.credentials}</p>
        )}
        {author.bio && (
          <p className="mt-4 text-sm text-slate-600 line-clamp-3">{author.bio}</p>
        )}

        {author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
          <div className="mt-5 flex justify-center gap-2">
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Twitter
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                LinkedIn
              </a>
            )}
            {author.socialLinks.website && (
              <a
                href={author.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Website
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
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === '1');

  const { data: authorsData, isLoading } = useAuthors();
  const authors = authorsData?.data || [];

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

  const featuredAuthors = useMemo(() => authors.filter((author) => author.featured), [authors]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (featuredOnly) params.set('featured', '1');
    setSearchParams(params, { replace: true });
  }, [searchQuery, featuredOnly, setSearchParams]);

  const resetFilters = () => {
    setSearchQuery('');
    setFeaturedOnly(false);
  };

  return (
    <>
      <Helmet>
        <title>Authors - HandyWriterz</title>
        <meta name="description" content="Meet our expert authors and contributors across healthcare, technology, and enterprise domains." />
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Our contributors</p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Meet the specialists behind the research
              </h1>
              <p className="text-lg text-white/70">
                Each author brings domain expertise to the HandyWriterz library, from clinical practice to enterprise strategy.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search authors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setFeaturedOnly((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                  featuredOnly
                    ? 'border-amber-400 bg-amber-400 text-amber-950'
                    : 'border-white/20 text-white/80 hover:border-white/40'
                }`}
              >
                <Star className="h-4 w-4" />
                Featured only
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                {isLoading ? 'Loading authors...' : `${filteredAuthors.length} author${filteredAuthors.length !== 1 ? 's' : ''} found`}
              </div>
              {(searchQuery || featuredOnly) && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                >
                  <X className="h-4 w-4" />
                  Reset filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-64 rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No authors found</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Try adjusting your search or clearing filters.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </motion.div>
            )}

            {featuredAuthors.length > 0 && (
              <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/80 p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Featured</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Highlighted contributors</h3>
                <div className="mt-6 flex flex-wrap gap-3">
                  {featuredAuthors.map((author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.slug}`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                    >
                      {author.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
