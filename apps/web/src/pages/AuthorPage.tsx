import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Globe, Linkedin, Twitter } from 'lucide-react';

import { useAuthor, useAuthorArticles, transformArticleToCard } from '@/hooks';
import { useCMSContext } from '@/contexts/CMSContext';
import { ArticleCard } from '@/components/landing';

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

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  const { data: author, isLoading: authorLoading, error } = useAuthor(slug || '');
  const { data: articlesData, isLoading: articlesLoading } = useAuthorArticles(slug || '', 12);

  const articles = articlesData?.data || [];

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-10 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-64 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Author not found</h1>
          <p className="mt-3 text-slate-600">
            The author you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/authors"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse authors
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

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

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
              className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center"
            >
              <div className="h-32 w-32 overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                {author.avatar ? (
                  <img
                    src={resolveCmsMedia(author.avatar.url)}
                    alt={author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Contributor</p>
                  <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{author.name}</h1>
                  {author.credentials && (
                    <p className="mt-2 text-lg text-white/70">{author.credentials}</p>
                  )}
                </div>
                {author.bio && (
                  <p className="max-w-2xl text-base text-white/70 leading-relaxed">{author.bio}</p>
                )}
                {author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {author.socialLinks.twitter && (
                      <a
                        href={author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {author.socialLinks.linkedin && (
                      <a
                        href={author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {author.socialLinks.website && (
                      <a
                        href={author.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Articles</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Published by {author.name}</h2>
            </motion.div>

            {articlesLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-64 rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No articles yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  This author has not published any articles yet.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {articles.map((article) => {
                  const card = transformArticleToCard(article);
                  return <ArticleCard key={card.id} {...card} />;
                })}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
