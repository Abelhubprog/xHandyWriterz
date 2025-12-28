/**
 * ArticlePage Component
 * 
 * Full article reading experience with:
 * - Rich content rendering
 * - Author information
 * - Related articles
 * - x402 badge for AI-accessible content
 * - Social sharing
 * - Table of contents
 */

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Bot,
  Coins,
  ChevronRight,
  Tag,
  User,
  Copy,
  Check,
} from 'lucide-react';

// Import hooks
import {
  useArticle,
  useRelatedArticles,
  useIncrementViewCount,
} from '@/hooks';

import { useCMSContext, useDomain } from '@/contexts/CMSContext';

// Import components
import { ArticleCard, AuthorCard } from '@/components/landing';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Table of contents extractor
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>([^<]+)<\/h[2-4]>/gi;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2] || match[3].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const text = match[3];
    headings.push({ id, text, level });
  }
  
  return headings;
}

// Share component
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
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Share:</span>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Table of Contents component
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
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 space-y-1">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">
        Table of Contents
      </h3>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`block text-sm py-1 transition-colors ${
            heading.level === 2 ? 'pl-0' : heading.level === 3 ? 'pl-3' : 'pl-6'
          } ${
            activeId === heading.id
              ? 'text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

// x402 Badge component
function X402Badge({ price }: { price?: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <Bot className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
        AI-Ready
      </span>
      {price && (
        <>
          <span className="text-gray-400">•</span>
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-600 dark:text-amber-400">
            ${price.toFixed(3)}
          </span>
        </>
      )}
    </div>
  );
}

export default function ArticlePage() {
  const { slug, articleSlug } = useParams<{ slug?: string; articleSlug?: string }>();
  const resolvedSlug = articleSlug || slug || '';
  const navigate = useNavigate();
  const { resolveMediaUrl: resolveCmsMedia } = useCMSContext();
  
  // Fetch article data
  const { data: article, isLoading, error } = useArticle(resolvedSlug);
  const { mutate: incrementView } = useIncrementViewCount();
  
  // Fetch related articles
  const { data: relatedData } = useRelatedArticles(
    article?.id || 0,
    article?.domain || '',
    4
  );

  // Domain info
  const domainInfo = useDomain(article?.domain as any || 'general');

  // Extract table of contents
  const headings = useMemo(() => {
    if (!article?.content) return [];
    return extractHeadings(article.content);
  }, [article?.content]);

  // Increment view count on load
  useEffect(() => {
    if (article?.id) {
      incrementView({ articleId: article.id, currentCount: article.viewCount || 0 });
    }
  }, [article?.id]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-8" />
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  const related = relatedData?.data || [];

  return (
    <>
      <Helmet>
        <title>{article.title} - HandyWriterz</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:type" content="article" />
        {article.coverImage && (
          <meta property="og:image" content={resolveCmsMedia(article.coverImage.url)} />
        )}
        <meta property="article:published_time" content={article.publishedAt} />
        {article.author && (
          <meta property="article:author" content={article.author.name} />
        )}
      </Helmet>

      <article className="min-h-screen bg-white dark:bg-gray-950">
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

        {/* Header */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Domain & Category */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              to={`/domains/${article.domain}`}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${domainInfo.gradient} text-white`}
            >
              {domainInfo.name}
            </Link>
            {article.category && (
              <Link
                to={`/categories/${article.category.slug}`}
                className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ChevronRight className="w-4 h-4" />
                {article.category.name}
              </Link>
            )}
            {article.x402Enabled && (
              <X402Badge price={article.x402Price} />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
            {article.author && (
              <Link
                to={`/authors/${article.author.slug}`}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {article.author.avatar ? (
                  <img
                    src={resolveCmsMedia(article.author.avatar.url)}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="font-medium">{article.author.name}</span>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.publishedAt || article.createdAt)}
            </div>
            {article.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readingTime} min read
              </div>
            )}
            {article.viewCount !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.viewCount.toLocaleString()} views
              </div>
            )}
          </div>

          {/* Share & Bookmark */}
          <div className="flex items-center justify-between pb-8 border-b border-gray-200 dark:border-gray-800">
            <ShareButtons title={article.title} url={currentUrl} />
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* Cover Image */}
        {article.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <img
              src={resolveCmsMedia(article.coverImage.url)}
              alt={article.coverImage.alternativeText || article.title}
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </motion.div>
        )}

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-[1fr_250px] gap-12">
            {/* Main Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="min-w-0"
            >
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-p:text-gray-600 dark:prose-p:text-gray-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-pre:bg-gray-900 prose-pre:shadow-lg
                  prose-code:text-pink-600 dark:prose-code:text-pink-400
                  prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/tags/${tag.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Card */}
              {article.author && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">
                    About the Author
                  </h3>
                  <AuthorCard
                    author={{
                      id: String(article.author.id),
                      name: article.author.name,
                      slug: article.author.slug,
                      bio: article.author.bio,
                      avatar: article.author.avatar?.url
                        ? resolveCmsMedia(article.author.avatar.url)
                        : undefined,
                      credentials: article.author.credentials,
                      socialLinks: article.author.socialLinks,
                    }}
                    variant="compact"
                  />
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents headings={headings} />
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="bg-gray-50 dark:bg-gray-900/50 py-16 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((relatedArticle) => (
                  <ArticleCard
                    id={String(relatedArticle.id)}
                    title={relatedArticle.title}
                    slug={relatedArticle.slug}
                    excerpt={relatedArticle.excerpt || ''}
                    coverImage={
                      relatedArticle.coverImage?.url
                        ? resolveCmsMedia(relatedArticle.coverImage.url)
                        : undefined
                    }
                    publishedAt={relatedArticle.publishedAt || relatedArticle.createdAt}
                    readingTime={relatedArticle.readingTime || 5}
                    author={
                      relatedArticle.author
                        ? {
                            name: relatedArticle.author.name,
                            avatar: relatedArticle.author.avatar?.url
                              ? resolveCmsMedia(relatedArticle.author.avatar.url)
                              : undefined,
                          }
                        : undefined
                    }
                    variant="minimal"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need Custom Content?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Our expert writers can create tailored content for your specific needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                View Services
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
