import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Star, 
  ArrowRight, 
  Users, 
  CheckCircle2,
  Heart,
  Brain,
  Shield,
  Code,
  Cpu,
  Coins,
  Globe,
  BookOpen,
  Bot,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Service {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description?: string;
  domain: string;
  coverImage?: string;
  icon?: string;
  features?: string[];
  pricing?: {
    startingPrice?: number;
    currency?: string;
    unit?: string;
  };
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  featured?: boolean;
  x402Enabled?: boolean;
  x402Price?: number;
}

export interface ServiceCardProps {
  service: Service;
  variant?: 'default' | 'horizontal' | 'featured' | 'compact';
  showFeatures?: boolean;
  showPricing?: boolean;
  showRating?: boolean;
  className?: string;
}

export interface ServiceGridProps {
  services: Service[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'featured' | 'compact';
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'adult-nursing': Heart,
  'adult-health': Heart,
  'mental-health': Brain,
  'child-nursing': Users,
  'social-work': Shield,
  'technology': Code,
  'ai': Cpu,
  'crypto': Coins,
  'enterprise': Globe,
  'general': BookOpen,
};

const DOMAIN_GRADIENTS: Record<string, string> = {
  'adult-nursing': 'from-rose-500 to-pink-600',
  'adult-health': 'from-rose-500 to-pink-600',
  'mental-health': 'from-purple-500 to-violet-600',
  'child-nursing': 'from-blue-500 to-cyan-600',
  'social-work': 'from-emerald-500 to-teal-600',
  'technology': 'from-slate-500 to-slate-700',
  'ai': 'from-violet-500 to-purple-600',
  'crypto': 'from-amber-500 to-orange-600',
  'enterprise': 'from-indigo-500 to-blue-600',
  'general': 'from-slate-400 to-slate-600',
};

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

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          )}
        />
      ))}
    </div>
  );
}

export function ServiceCard({
  service,
  variant = 'default',
  showFeatures = true,
  showPricing = true,
  showRating = true,
  className
}: ServiceCardProps) {
  const domainSlug = service.domain || 'general';
  const DomainIcon = DOMAIN_ICONS[domainSlug] || BookOpen;
  const gradient = DOMAIN_GRADIENTS[domainSlug] || DOMAIN_GRADIENTS['general'];

  if (variant === 'horizontal') {
    return (
      <motion.article
        variants={itemVariants}
        className={cn(
          "group relative flex overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/80 transition-all hover:shadow-xl hover:ring-slate-300",
          className
        )}
      >
        {/* Image/Icon Section */}
        <div className={cn(
          "relative flex w-1/3 min-w-[200px] items-center justify-center bg-gradient-to-br",
          gradient
        )}>
          {service.coverImage ? (
            <img
              src={service.coverImage}
              alt={service.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <DomainIcon className="h-16 w-16 text-white/80" />
          )}
          {service.featured && (
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">
              {domainSlug.replace('-', ' ')}
            </span>
            {service.x402Enabled && (
              <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                <Bot className="h-3 w-3" />
                x402
              </span>
            )}
          </div>

          <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            <Link to={`/domains/${domainSlug}/services/${service.slug}`} className="hover:underline">
              {service.title}
            </Link>
          </h3>

          <p className="mb-4 line-clamp-2 text-slate-600">{service.excerpt}</p>

          {/* Features */}
          {showFeatures && service.features && service.features.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {service.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showRating && service.rating && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={service.rating} />
                  <span className="text-sm text-slate-500">({service.reviewCount})</span>
                </div>
              )}
              {service.deliveryTime && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  {service.deliveryTime}
                </div>
              )}
            </div>
            {showPricing && service.pricing?.startingPrice && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Starting from</div>
                <div className="text-lg font-bold text-slate-900">
                  {service.pricing.currency || '$'}{service.pricing.startingPrice}
                  {service.pricing.unit && <span className="text-sm font-normal text-slate-500">/{service.pricing.unit}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.article
        variants={itemVariants}
        className={cn(
          "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl",
          className
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
              gradient
            )}>
              <DomainIcon className="h-7 w-7 text-white" />
            </div>
            {service.featured && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Featured
              </div>
            )}
          </div>

          {/* Domain & x402 */}
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium capitalize">
              {domainSlug.replace('-', ' ')}
            </span>
            {service.x402Enabled && (
              <span className="flex items-center gap-1 rounded-full bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-300">
                <Bot className="h-3.5 w-3.5" />
                x402 Ready
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="mb-3 text-2xl font-bold">
            <Link to={`/domains/${domainSlug}/services/${service.slug}`} className="hover:underline">
              {service.title}
            </Link>
          </h3>
          <p className="mb-6 line-clamp-2 text-slate-300">{service.excerpt}</p>

          {/* Features */}
          {showFeatures && service.features && (
            <div className="mb-6 space-y-2">
              {service.features.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-4">
              {showRating && service.rating && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={service.rating} size="md" />
                  <span className="text-sm text-slate-400">({service.reviewCount})</span>
                </div>
              )}
            </div>
            <Link
              to={`/domains/${domainSlug}/services/${service.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              View Service
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        variants={itemVariants}
        className={cn(
          "group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition-all hover:shadow-md hover:ring-slate-300",
          className
        )}
      >
        <div className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
          gradient
        )}>
          <DomainIcon className="h-6 w-6 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            <Link to={`/domains/${domainSlug}/services/${service.slug}`}>
              {service.title}
            </Link>
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="capitalize">{domainSlug.replace('-', ' ')}</span>
            {service.rating && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {service.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>

        {service.x402Enabled && (
          <Bot className="h-5 w-5 text-violet-500" />
        )}

        <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
      </motion.article>
    );
  }

  // Default variant
  return (
    <motion.article
      variants={itemVariants}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/80 transition-all hover:shadow-xl hover:ring-slate-300",
        className
      )}
    >
      {/* Image/Header */}
      <div className={cn(
        "relative flex h-48 items-center justify-center bg-gradient-to-br",
        gradient
      )}>
        {service.coverImage ? (
          <img
            src={service.coverImage}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <DomainIcon className="h-20 w-20 text-white/80" />
        )}
        
        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {service.featured && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
          {service.x402Enabled && (
            <span className="flex items-center gap-1 rounded-full bg-violet-500/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Bot className="h-3 w-3" />
              x402
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Domain */}
        <div className="mb-3">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 capitalize">
            {domainSlug.replace('-', ' ')}
          </span>
        </div>

        {/* Title & Excerpt */}
        <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          <Link to={`/domains/${domainSlug}/services/${service.slug}`} className="hover:underline">
            {service.title}
          </Link>
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-slate-600">{service.excerpt}</p>

        {/* Features */}
        {showFeatures && service.features && service.features.length > 0 && (
          <div className="mb-4 space-y-1">
            {service.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            {showRating && service.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-700">{service.rating.toFixed(1)}</span>
                {service.reviewCount && (
                  <span className="text-xs text-slate-400">({service.reviewCount})</span>
                )}
              </div>
            )}
            {service.deliveryTime && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {service.deliveryTime}
              </div>
            )}
          </div>
          
          {showPricing && service.pricing?.startingPrice && (
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">
                {service.pricing.currency || '$'}{service.pricing.startingPrice}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ServiceGrid({
  services,
  title,
  subtitle,
  variant = 'default',
  columns = 3,
  showViewAll = false,
  viewAllLink = '/services',
  className
}: ServiceGridProps) {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  if (variant === 'featured') {
    const featuredService = services.find(s => s.featured) || services[0];
    const otherServices = services.filter(s => s.id !== featuredService?.id).slice(0, 5);

    return (
      <section className={cn("py-16 md:py-24", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              {title && (
                <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
              )}
              {subtitle && (
                <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
              )}
            </motion.div>
          )}

          {/* Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid gap-8 lg:grid-cols-2"
          >
            {/* Featured Service */}
            {featuredService && (
              <ServiceCard
                service={featuredService}
                variant="featured"
                className="lg:row-span-2"
              />
            )}

            {/* Other Services */}
            <div className="space-y-4">
              {otherServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  variant="compact"
                />
              ))}
            </div>
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
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
              >
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            {title && (
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{title}</h2>
            )}
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-slate-600">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className={cn(
            "grid gap-6",
            columnClasses[columns]
          )}
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant={variant === 'compact' ? 'compact' : 'default'}
            />
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
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ServiceCard;
