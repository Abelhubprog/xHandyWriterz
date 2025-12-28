import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Heart, User, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
    slug?: string;
  };
  category?: {
    name: string;
    slug: string;
    color?: string;
  };
  publishedAt?: string;
  readingTime?: number;
  viewCount?: number;
  likeCount?: number;
  featured?: boolean;
  x402Enabled?: boolean;
  variant?: 'default' | 'horizontal' | 'minimal' | 'hero';
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  hover: { 
    y: -8,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const imageVariants = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  coverImage,
  author,
  category,
  publishedAt,
  readingTime,
  viewCount,
  likeCount,
  featured,
  x402Enabled,
  variant = 'default',
  className
}: ArticleCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (variant === 'hero') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true }}
        className={cn(
          "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800",
          "shadow-2xl shadow-slate-900/20",
          className
        )}
      >
        <Link to={`/articles/${slug}`} className="block">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {coverImage && (
              <motion.img
                variants={imageVariants}
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex min-h-[500px] flex-col justify-end p-8 md:p-12">
            {/* Badges */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}
              {category && (
                <span 
                  className="rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                  style={{ backgroundColor: category.color || '#6366f1' }}
                >
                  {category.name}
                </span>
              )}
              {x402Enabled && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  x402 Enabled
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {title}
            </h2>

            {/* Excerpt */}
            {excerpt && (
              <p className="mb-6 max-w-2xl text-lg text-slate-300 line-clamp-3">
                {excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              {author && (
                <div className="flex items-center gap-3">
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 ring-2 ring-white/20">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <span className="font-medium text-white">{author.name}</span>
                </div>
              )}
              {publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(publishedAt)}
                </div>
              )}
              {readingTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </div>
              )}
            </div>

            {/* Read More Indicator */}
            <div className="mt-8 flex items-center gap-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <span className="font-medium">Read Article</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true }}
        className={cn(
          "group flex overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50",
          "border border-slate-100 transition-shadow hover:shadow-xl hover:shadow-slate-200/70",
          className
        )}
      >
        <Link to={`/articles/${slug}`} className="flex flex-1">
          {/* Image */}
          <div className="relative w-1/3 min-w-[200px] overflow-hidden">
            {coverImage ? (
              <motion.img
                variants={imageVariants}
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <Sparkles className="h-12 w-12 text-slate-400" />
              </div>
            )}
            {featured && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              {/* Category & x402 Badge */}
              <div className="mb-3 flex items-center gap-2">
                {category && (
                  <span 
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: category.color || '#6366f1' }}
                  >
                    {category.name}
                  </span>
                )}
                {x402Enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    x402
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {excerpt}
                </p>
              )}
            </div>

            {/* Meta */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                {author && (
                  <div className="flex items-center gap-2">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                        <User className="h-3 w-3 text-slate-500" />
                      </div>
                    )}
                    <span className="font-medium text-slate-700">{author.name}</span>
                  </div>
                )}
                {publishedAt && (
                  <span>{formatDate(publishedAt)}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {viewCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatCount(viewCount)}
                  </span>
                )}
                {readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {readingTime}m
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.article
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={cn("group", className)}
      >
        <Link to={`/articles/${slug}`} className="flex items-start gap-4">
          {/* Thumbnail */}
          {coverImage && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
              <img src={coverImage} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h4>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              {readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readingTime} min
                </span>
              )}
              {viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatCount(viewCount)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      className={cn(
        "group overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50",
        "border border-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/70",
        className
      )}
    >
      <Link to={`/articles/${slug}`}>
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {coverImage ? (
            <motion.img
              variants={imageVariants}
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <Sparkles className="h-12 w-12 text-slate-400" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
            {x402Enabled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                x402
              </span>
            )}
          </div>

          {/* Category */}
          {category && (
            <span 
              className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-lg"
              style={{ backgroundColor: category.color || '#6366f1' }}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="mb-4 text-sm text-slate-600 line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              {author && (
                <>
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                      <User className="h-3 w-3 text-slate-500" />
                    </div>
                  )}
                  <span className="font-medium text-slate-700">{author.name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCount(viewCount)}
                </span>
              )}
              {likeCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {formatCount(likeCount)}
                </span>
              )}
              {readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime}m
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default ArticleCard;
