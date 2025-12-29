import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Tag,
  User,
  ChevronRight,
} from 'lucide-react';

import {
  useArticle,
  useRelatedArticles,
  useIncrementViewCount,
} from '@/hooks';
import { useCMSContext, useDomain } from '@/contexts/CMSContext';
import { normalizeDomainSlug } from '@/lib/domain-utils';
import { ArticleCard } from '@/components/landing';

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>([^<]+)<\/h[2-4]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const id =
      match[2] ||
      match[3]
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    const text = match[3];
    headings.push({ id, text, level });
  }

  return headings;
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Share</span>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button
        onClick={copyToClipboard}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [activeId, setActiveId] = React.useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Contents</h3>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`block text-sm transition-colors ${
            heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-3' : 'pl-6'
          } ${
            activeId === heading.id
              ? 'text-slate-900 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

export default function ArticlePage() {
  const { slug, articleSlug } = useParams<{ slug?: string; articleSlug?: string }>();
  const resolvedSlug = articleSlug || slug || '';
  const navigate = useNavigate();
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();

  const { data: article, isLoading, error } = useArticle(resolvedSlug);
  const { mutate: incrementView } = useIncrementViewCount();
  const { data: relatedData } = useRelatedArticles(
    article?.id || 0,
    article?.domain || '',
    4
  );

  const canonicalDomain = normalizeDomainSlug(article?.domain) ?? article?.domain ?? 'general';
  const domainInfo = useDomain(canonicalDomain as any);

  const headings = useMemo(() => {
    if (!article?.content) return [];
    return extractHeadings(article.content);
  }, [article?.content]);

  useEffect(() => {
    if (article?.id) {
      incrementView({ articleId: article.id, currentCount: article.viewCount || 0 });
    }
  }, [article?.id, incrementView]);

  const related = relatedData?.data || [];
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) {
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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Article not found</h1>
          <p className="mt-3 text-slate-600">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/articles"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse articles
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = article.coverImage || article.heroImage;
  const summary = article.excerpt || article.summary || '';

  return (
    <>
      <Helmet>
        <title>{article.title} - HandyWriterz</title>
        <meta name="description" content={summary || article.title} />
        <meta property="og:title" content={`${article.title} - HandyWriterz`} />
        <meta property="og:description" content={summary || article.title} />
        {heroImage && (
          <meta property="og:image" content={resolveCmsMedia(heroImage.url)} />
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
            <div className={`absolute inset-0 bg-gradient-to-br ${domainInfo.gradient} opacity-70`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
                  <Link to="/articles" className="transition hover:text-white">
                    Articles
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link to={`/domains/${canonicalDomain}`} className="font-semibold text-white">
                    {domainInfo.name}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold"
                    style={{ color: domainInfo.color }}
                  >
                    {domainInfo.name}
                  </span>
                  {article.category && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
                      {article.category.name}
                    </span>
                  )}
                  {article.x402Enabled && (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                      x402 enabled
                    </span>
                  )}
                </div>

                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {article.title}
                </h1>

                {summary && (
                  <p className="text-lg text-white/80 leading-relaxed">
                    {summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                  {article.author && (
                    <span className="flex items-center gap-2">
                      {article.author.avatar?.url ? (
                        <img
                          src={resolveCmsMedia(article.author.avatar.url)}
                          alt={article.author.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          <User className="h-4 w-4" />
                        </span>
                      )}
                      {article.author.name}
                    </span>
                  )}
                  {article.publishedAt && (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                  {article.readingTime && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {article.readingTime} min read
                    </span>
                  )}
                  {typeof article.viewCount === 'number' && article.viewCount > 0 && (
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {article.viewCount.toLocaleString()} views
                    </span>
                  )}
                </div>

                <ShareButtons title={article.title} url={currentUrl} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                    {heroImage ? (
                      <img
                        src={resolveCmsMedia(heroImage.url)}
                        alt={heroImage.alternativeText || article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
                        <User className="h-16 w-16 text-white/60" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="min-w-0"
              >
                <div
                  className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {article.tags && article.tags.length > 0 && (
                  <div className="mt-12 border-t border-slate-200 pt-8">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Tags</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/tags/${tag.slug}`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          <Tag className="h-3 w-3" />
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {article.author && (
                  <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {article.author.avatar?.url ? (
                        <img
                          src={resolveCmsMedia(article.author.avatar.url)}
                          alt={article.author.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{article.author.name}</p>
                        {article.author.credentials && (
                          <p className="text-sm text-slate-500">{article.author.credentials}</p>
                        )}
                        {article.author.bio && (
                          <p className="mt-2 text-sm text-slate-600">{article.author.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <aside className="hidden lg:block">
                <TableOfContents headings={headings} />
              </aside>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Related reading</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Keep exploring</h2>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {related.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    id={String(relatedArticle.id)}
                    title={relatedArticle.title}
                    slug={relatedArticle.slug}
                    excerpt={relatedArticle.excerpt || relatedArticle.summary}
                    coverImage={
                      relatedArticle.coverImage?.url
                        ? resolveCmsMedia(relatedArticle.coverImage.url)
                        : relatedArticle.heroImage?.url
                          ? resolveCmsMedia(relatedArticle.heroImage.url)
                          : undefined
                    }
                    author={
                      relatedArticle.author
                        ? {
                            name: relatedArticle.author.name,
                            avatar: relatedArticle.author.avatar?.url
                              ? resolveCmsMedia(relatedArticle.author.avatar.url)
                              : undefined,
                            slug: relatedArticle.author.slug,
                          }
                        : undefined
                    }
                    publishedAt={relatedArticle.publishedAt}
                    readingTime={relatedArticle.readingTime}
                    viewCount={relatedArticle.viewCount}
                    featured={relatedArticle.featured}
                    x402Enabled={relatedArticle.x402Enabled}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
