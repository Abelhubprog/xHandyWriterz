import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArticleCard, ArticleCardProps } from './ArticleCard';

export interface FeaturedGridProps {
  articles: ArticleCardProps[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  layout?: 'hero-grid' | 'masonry' | 'featured-row' | 'spotlight';
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export function FeaturedGrid({
  articles,
  title = "Featured Articles",
  subtitle,
  showViewAll = true,
  viewAllLink = "/articles",
  layout = 'hero-grid',
  className
}: FeaturedGridProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const [heroArticle, ...remainingArticles] = articles;

  if (layout === 'spotlight') {
    return (
      <section className={cn("py-16 md:py-24", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col items-center text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 text-sm font-medium text-amber-700">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              Editor's Picks
            </div>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
              {title}
            </h2>
            {subtitle && (
              <p className="max-w-2xl text-lg text-slate-600">{subtitle}</p>
            )}
          </motion.div>

          {/* Spotlight Layout */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Hero Article */}
            <ArticleCard {...heroArticle} variant="hero" />

            {/* Side Articles */}
            <div className="flex flex-col gap-6">
              {remainingArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} {...article} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* View All */}
          {showViewAll && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Link
                to={viewAllLink}
                className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition-all hover:bg-slate-800"
              >
                View All Articles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  if (layout === 'featured-row') {
    return (
      <section className={cn("py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <TrendingUp className="h-4 w-4" />
                Trending Now
              </div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-lg text-slate-600">{subtitle}</p>
              )}
            </div>
            {showViewAll && (
              <Link
                to={viewAllLink}
                className="group flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700"
              >
                <span className="font-medium">View all</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </motion.div>

          {/* Horizontal Scroll */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {articles.map((article) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                className="w-80 flex-shrink-0 snap-start"
              >
                <ArticleCard {...article} variant="default" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (layout === 'masonry') {
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

          {/* Masonry Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="columns-1 gap-6 md:columns-2 lg:columns-3"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                className="mb-6 break-inside-avoid"
              >
                <ArticleCard {...article} variant={index === 0 ? 'hero' : 'default'} />
              </motion.div>
            ))}
          </motion.div>

          {/* View All */}
          {showViewAll && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Link
                to={viewAllLink}
                className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition-all hover:bg-slate-800"
              >
                Browse All Articles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Default: hero-grid layout
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4" />
            Must Read
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-2xl text-lg text-slate-600">{subtitle}</p>
          )}
        </motion.div>

        {/* Hero Grid Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 lg:grid-cols-12"
        >
          {/* Hero Article - Takes 7 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <ArticleCard {...heroArticle} variant="hero" className="h-full" />
          </motion.div>

          {/* Side Articles - Takes 5 columns */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {remainingArticles.slice(0, 2).map((article) => (
              <motion.div key={article.id} variants={itemVariants}>
                <ArticleCard {...article} variant="horizontal" />
              </motion.div>
            ))}
          </div>

          {/* Bottom Row - 4 columns each */}
          {remainingArticles.slice(2, 5).map((article) => (
            <motion.div key={article.id} variants={itemVariants} className="lg:col-span-4">
              <ArticleCard {...article} variant="default" />
            </motion.div>
          ))}
        </motion.div>

        {/* View All */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to={viewAllLink}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-transparent px-6 py-3 font-medium text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
            >
              Explore All Articles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default FeaturedGrid;
