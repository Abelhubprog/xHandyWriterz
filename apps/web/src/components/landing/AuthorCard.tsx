import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Twitter, Linkedin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  credentials?: string;
  articleCount?: number;
  featured?: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface AuthorCardProps {
  author: Author;
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
  showArticleCount?: boolean;
  showBio?: boolean;
  showSocial?: boolean;
  className?: string;
}

export interface AuthorGridProps {
  authors: Author[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'featured';
  showViewAll?: boolean;
  viewAllLink?: string;
  maxItems?: number;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function AuthorCard({
  author,
  variant = 'default',
  showArticleCount = true,
  showBio = true,
  showSocial = true,
  className
}: AuthorCardProps) {
  if (variant === 'minimal') {
    return (
      <Link to={`/authors/${author.slug}`}>
        <motion.div
          variants={itemVariants}
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
              {author.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {author.name}
            </p>
            {author.credentials && (
              <p className="text-sm text-slate-500 truncate">{author.credentials}</p>
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/authors/${author.slug}`}>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className={cn(
            "group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md",
            className
          )}
        >
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
              {author.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {author.name}
            </h3>
            {author.credentials && (
              <p className="text-sm text-slate-500 truncate">{author.credentials}</p>
            )}
            {showArticleCount && author.articleCount && (
              <p className="text-xs text-slate-400 mt-1">
                {author.articleCount} article{author.articleCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
        </motion.div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/authors/${author.slug}`}>
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className={cn(
            "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl transition-all hover:shadow-2xl",
            className
          )}
        >
          {/* Decorative Elements */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
          
          <div className="relative z-10">
            {/* Avatar */}
            <div className="mb-6 flex justify-center">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold">{author.name}</h3>
              {author.credentials && (
                <div className="mb-3 flex items-center justify-center gap-2 text-blue-300">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">{author.credentials}</span>
                </div>
              )}
              {showBio && author.bio && (
                <p className="mb-4 text-slate-300 line-clamp-3">{author.bio}</p>
              )}
              {showArticleCount && author.articleCount && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <BookOpen className="h-4 w-4" />
                  {author.articleCount} article{author.articleCount !== 1 ? 's' : ''} published
                </div>
              )}
            </div>

            {/* Social Links */}
            {showSocial && author.socialLinks && (
              <div className="flex justify-center gap-3">
                {author.socialLinks.twitter && (
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {author.socialLinks.website && (
                  <a
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/authors/${author.slug}`}>
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4 }}
        className={cn(
          "group overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-xl text-center",
          className
        )}
      >
        {/* Featured Badge */}
        {author.featured && (
          <div className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            Featured
          </div>
        )}

        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-100"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
              {author.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="mb-1 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {author.name}
        </h3>
        {author.credentials && (
          <p className="mb-3 text-sm text-slate-500">{author.credentials}</p>
        )}
        {showBio && author.bio && (
          <p className="mb-4 text-sm text-slate-600 line-clamp-2">{author.bio}</p>
        )}
        {showArticleCount && author.articleCount && (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
            <BookOpen className="h-4 w-4" />
            {author.articleCount} article{author.articleCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Social Links */}
        {showSocial && author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
          <div className="mt-4 flex justify-center gap-2">
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {author.socialLinks.website && (
              <a
                href={author.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export function AuthorGrid({
  authors,
  title = "Meet Our Authors",
  subtitle,
  variant = 'default',
  showViewAll = true,
  viewAllLink = '/authors',
  maxItems,
  className
}: AuthorGridProps) {
  if (!authors || authors.length === 0) {
    return null;
  }

  const displayAuthors = maxItems ? authors.slice(0, maxItems) : authors;
  const featuredAuthors = displayAuthors.filter(a => a.featured);
  const regularAuthors = displayAuthors.filter(a => !a.featured);

  if (variant === 'featured' && featuredAuthors.length > 0) {
    return (
      <section className={cn("py-16 md:py-24", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row"
          >
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-lg text-slate-600">{subtitle}</p>
              )}
            </div>
            {showViewAll && (
              <Link
                to={viewAllLink}
                className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all authors
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>

          {/* Featured Authors */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {featuredAuthors.map((author) => (
              <AuthorCard key={author.id} author={author} variant="featured" />
            ))}
          </motion.div>

          {/* Regular Authors */}
          {regularAuthors.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {regularAuthors.map((author) => (
                <AuthorCard key={author.id} author={author} variant="compact" />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'compact') {
    return (
      <section className={cn("py-12 md:py-16 bg-slate-50", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {showViewAll && (
              <Link
                to={viewAllLink}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </motion.div>

          {/* Authors */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayAuthors.map((author) => (
              <AuthorCard key={author.id} author={author} variant="compact" />
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Default grid
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
          )}
        </motion.div>

        {/* Authors Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {displayAuthors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </motion.div>

        {/* View All */}
        {showViewAll && authors.length > (maxItems || 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800"
            >
              View all authors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default AuthorCard;
