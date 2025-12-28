import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Heart, Users, Baby, Sparkles, Zap, Globe, Shield, Code, Cpu, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconKey?: string;
  themeColor?: string;
  gradient?: string;
  heroImageUrl?: string;
  articleCount?: number;
  serviceCount?: number;
  featured?: boolean;
}

export interface DomainShowcaseProps {
  domains: Domain[];
  title?: string;
  subtitle?: string;
  variant?: 'cards' | 'grid' | 'minimal' | 'featured';
  showCounts?: boolean;
  className?: string;
}

export const DOMAIN_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; bgLight: string; themeColor: string }> = {
  'adult-nursing': {
    icon: <Heart className="h-6 w-6" />,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    themeColor: '#f43f5e'
  },
  'adult-health': {
    icon: <Heart className="h-6 w-6" />,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    themeColor: '#f43f5e'
  },
  'mental-health': {
    icon: <Brain className="h-6 w-6" />,
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    themeColor: '#8b5cf6'
  },
  'child-nursing': {
    icon: <Users className="h-6 w-6" />,
    gradient: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    themeColor: '#3b82f6'
  },
  'social-work': {
    icon: <Shield className="h-6 w-6" />,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    themeColor: '#10b981'
  },
  'technology': {
    icon: <Code className="h-6 w-6" />,
    gradient: 'from-slate-600 to-slate-800',
    bgLight: 'bg-slate-50',
    themeColor: '#475569'
  },
  'ai': {
    icon: <Cpu className="h-6 w-6" />,
    gradient: 'from-violet-500 to-purple-700',
    bgLight: 'bg-violet-50',
    themeColor: '#7c3aed'
  },
  'crypto': {
    icon: <Coins className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    themeColor: '#f59e0b'
  },
  'enterprise': {
    icon: <Globe className="h-6 w-6" />,
    gradient: 'from-blue-600 to-indigo-700',
    bgLight: 'bg-indigo-50',
    themeColor: '#4f46e5'
  },
  'general': {
    icon: <BookOpen className="h-6 w-6" />,
    gradient: 'from-slate-500 to-slate-700',
    bgLight: 'bg-slate-50',
    themeColor: '#64748b'
  }
};

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  brain: Brain,
  baby: Baby,
  users: Users,
  code: Code,
  cpu: Cpu,
  bitcoin: Coins,
  coins: Coins,
  building: Globe,
  globe: Globe,
  shield: Shield,
  sparkles: Sparkles,
  book: BookOpen,
  'book-open': BookOpen,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

function getDomainConfig(domain: Domain) {
  const fallback = DOMAIN_CONFIG[domain.slug] || DOMAIN_CONFIG['general'];
  const Icon = domain.iconKey ? ICON_MAP[domain.iconKey] : undefined;
  return {
    icon: Icon ? <Icon className="h-6 w-6" /> : fallback.icon,
    gradient: domain.gradient || fallback.gradient,
    bgLight: fallback.bgLight,
    themeColor: domain.themeColor || fallback.themeColor,
  };
}

function DomainCard({ domain, showCounts = true, variant = 'default' }: { domain: Domain; showCounts?: boolean; variant?: 'default' | 'featured' | 'minimal' }) {
  const config = getDomainConfig(domain);

  if (variant === 'minimal') {
    return (
      <Link to={`/domains/${domain.slug}`}>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200"
        >
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white", config.gradient)}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {domain.name}
            </h3>
            {showCounts && (domain.articleCount || domain.serviceCount) && (
              <p className="text-sm text-slate-500">
                {domain.articleCount && `${domain.articleCount} articles`}
                {domain.articleCount && domain.serviceCount && ' • '}
                {domain.serviceCount && `${domain.serviceCount} services`}
              </p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
        </motion.div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/domains/${domain.slug}`}>
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-xl transition-all hover:shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
          }}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", config.gradient)} />
          
          {/* Decorative Elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
          
          <div className="relative z-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              {config.icon}
            </div>
            
            <h3 className="mb-3 text-2xl font-bold">{domain.name}</h3>
            <p className="mb-6 text-white/80 line-clamp-2">{domain.description}</p>
            
            {showCounts && (domain.articleCount || domain.serviceCount) && (
              <div className="mb-6 flex gap-4">
                {domain.articleCount && (
                  <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm">
                    {domain.articleCount} Articles
                  </div>
                )}
                {domain.serviceCount && (
                  <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm backdrop-blur-sm">
                    {domain.serviceCount} Services
                  </div>
                )}
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
              Explore Domain
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/domains/${domain.slug}`}>
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-xl"
      >
        {/* Icon */}
        <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white", config.gradient)}>
          {config.icon}
        </div>

        {/* Content */}
        <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {domain.name}
        </h3>
        <p className="mb-4 text-slate-600 line-clamp-2">{domain.description}</p>

        {/* Counts */}
        {showCounts && (domain.articleCount || domain.serviceCount) && (
          <div className="mb-4 flex gap-3 text-sm">
            {domain.articleCount && (
              <span
                className={cn("rounded-full px-3 py-1 text-slate-700", config.bgLight)}
                style={config.bgLight ? undefined : { backgroundColor: `${config.themeColor}15` }}
              >
                {domain.articleCount} articles
              </span>
            )}
            {domain.serviceCount && (
              <span
                className={cn("rounded-full px-3 py-1 text-slate-700", config.bgLight)}
                style={config.bgLight ? undefined : { backgroundColor: `${config.themeColor}15` }}
              >
                {domain.serviceCount} services
              </span>
            )}
          </div>
        )}

        {/* Link */}
        <div className="inline-flex items-center gap-2 font-medium text-blue-600 group-hover:gap-3 transition-all">
          Explore
          <ArrowRight className="h-4 w-4" />
        </div>

        {/* Featured Badge */}
        {domain.featured && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export function DomainShowcase({
  domains,
  title = "Explore Our Domains",
  subtitle,
  variant = 'cards',
  showCounts = true,
  className
}: DomainShowcaseProps) {
  if (!domains || domains.length === 0) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <section className={cn("py-12 md:py-16", className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
            {subtitle && (
              <p className="text-slate-600">{subtitle}</p>
            )}
          </motion.div>

          {/* Minimal Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} showCounts={showCounts} variant="minimal" />
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'grid') {
    return (
      <section className={cn("py-16 md:py-24 bg-slate-50", className)}>
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

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} showCounts={showCounts} />
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === 'featured') {
    const featuredDomains = domains.filter(d => d.featured).slice(0, 3);
    const otherDomains = domains.filter(d => !d.featured);

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

          {/* Featured Domains */}
          {featuredDomains.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {featuredDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} showCounts={showCounts} variant="featured" />
              ))}
            </motion.div>
          )}

          {/* Other Domains */}
          {otherDomains.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {otherDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} showCounts={showCounts} variant="minimal" />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Default: cards
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

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} showCounts={showCounts} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default DomainShowcase;
