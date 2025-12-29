import React, { useMemo } from 'react';
import { BookOpen, Brain, Clock, Cpu, Globe, Heart, Shield, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroSection } from './HeroSection';
import { FeaturedGrid } from './FeaturedGrid';
import { DomainShowcase, type Domain } from './DomainShowcase';
import { ServiceGrid, type Service } from './ServiceCard';
import { TestimonialSection, type Testimonial } from './TestimonialSection';
import type { ArticleCardProps } from './ArticleCard';
import type { ArticleSummary, LandingSection, LandingSectionItem, ServiceListItem, TestimonialEntry } from '@/types/cms';

export interface CmsSectionRendererProps {
  section: LandingSection;
  articles?: ArticleSummary[];
  services?: ServiceListItem[];
  testimonials?: TestimonialEntry[];
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  users: Users,
  clock: Clock,
  book: BookOpen,
  heart: Heart,
  brain: Brain,
  sparkles: Sparkles,
  cpu: Cpu,
  globe: Globe,
  default: Sparkles,
};

const normalizeKey = (key?: string | null) => key?.toLowerCase().replace(/[^a-z]/g, '') ?? '';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const extractSlug = (path?: string | null, prefix?: string) => {
  if (!path) return null;
  if (prefix && path.startsWith(prefix)) {
    const candidate = path.slice(prefix.length).replace(/^\//, '');
    return candidate || null;
  }
  const trimmed = path.replace(/^\//, '');
  return trimmed || null;
};

const mapArticleSummary = (article: ArticleSummary): ArticleCardProps => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt ?? undefined,
  coverImage: article.heroImageUrl ?? undefined,
  author: article.authorName ? { name: article.authorName } : undefined,
  publishedAt: article.publishedAt ?? undefined,
  readingTime: article.readingMinutes ?? undefined,
});

const mapArticleItem = (item: LandingSectionItem): ArticleCardProps | null => {
  const slug = extractSlug(item.linkUrl, '/articles/') ?? extractSlug(item.linkUrl, 'articles/');
  const title = item.title?.trim();
  if (!title) return null;
  return {
    id: item.id,
    slug: slug ?? slugify(title),
    title,
    excerpt: item.description ?? item.subtitle ?? undefined,
    coverImage: item.mediaUrl ?? undefined,
    author: item.authorName ? { name: item.authorName } : undefined,
  };
};

const mapServiceSummary = (service: ServiceListItem): Service => ({
  id: service.id,
  title: service.title,
  slug: service.slug,
  excerpt: service.summary ?? '',
  description: service.summary ?? undefined,
  domain: service.domain ?? 'general',
  coverImage: service.heroImageUrl ?? undefined,
  rating: undefined,
  reviewCount: undefined,
  deliveryTime: undefined,
  featured: false,
  x402Enabled: false,
  x402Price: undefined,
});

const mapServiceItem = (item: LandingSectionItem): Service | null => {
  const title = item.title?.trim();
  if (!title) return null;
  const rawServicePath = extractSlug(item.linkUrl, '/services/') ?? extractSlug(item.linkUrl, 'services/');
  const serviceParts = rawServicePath ? rawServicePath.split('/') : [];
  const domainFromLink = serviceParts.length > 1 ? serviceParts[0] : null;
  const slugFromLink = serviceParts.length > 1 ? serviceParts.slice(1).join('/') : rawServicePath;
  const domain = domainFromLink ?? extractSlug(item.linkUrl, '/domains/') ?? item.tag ?? 'general';
  return {
    id: item.id,
    title,
    slug: slugFromLink ?? slugify(title),
    excerpt: item.description ?? item.subtitle ?? '',
    description: item.description ?? item.subtitle ?? undefined,
    domain,
    coverImage: item.mediaUrl ?? undefined,
    featured: Boolean(item.badge),
  };
};

const mapDomainItem = (item: LandingSectionItem): Domain | null => {
  const name = item.title?.trim();
  if (!name) return null;
  const slug = extractSlug(item.linkUrl, '/domains/') ?? item.tag ?? slugify(name);
  const themeColor =
    item.accentGradient && item.accentGradient.startsWith('#')
      ? item.accentGradient
      : undefined;
  return {
    id: item.id,
    name,
    slug,
    description: item.description ?? item.subtitle ?? '',
    iconKey: item.iconKey ?? undefined,
    themeColor,
    gradient: item.backgroundGradient ?? undefined,
    featured: Boolean(item.badge),
  };
};

const mapTestimonialEntry = (entry: TestimonialEntry): Testimonial => ({
  id: entry.id,
  quote: entry.quote,
  authorName: entry.authorName,
  authorRole: entry.authorRole ?? undefined,
  authorCompany: entry.authorCompany ?? undefined,
  authorAvatar: entry.authorAvatarUrl ?? undefined,
  rating: entry.rating ?? undefined,
  domain: entry.domain ?? undefined,
  featured: entry.featured,
});

const mapTestimonialItem = (item: LandingSectionItem): Testimonial | null => {
  const quote = item.quote ?? item.description ?? null;
  const authorName = item.authorName ?? item.title ?? null;
  if (!quote || !authorName) return null;
  return {
    id: item.id,
    quote,
    authorName,
    authorRole: item.authorRole ?? item.subtitle ?? undefined,
    authorAvatar: item.mediaUrl ?? undefined,
    rating: item.rating ?? undefined,
    domain: item.tag ?? undefined,
    featured: Boolean(item.badge),
  };
};

const buildHeroStats = (items: LandingSectionItem[]) =>
  items
    .filter((item) => item.metricValue || item.metricLabel)
    .map((item) => ({
      value: item.metricValue ?? item.title ?? '',
      label: item.metricLabel ?? item.subtitle ?? '',
    }))
    .filter((stat) => stat.value && stat.label);

const buildHeroFeatures = (items: LandingSectionItem[]) =>
  items
    .filter((item) => item.title || item.description)
    .map((item) => ({
      icon: item.iconKey ?? undefined,
      text: item.title ?? item.description ?? '',
    }))
    .filter((feature) => feature.text);

const getVariant = <T extends string>(value: string | null, valid: readonly T[], fallback: T): T => {
  if (!value) return fallback;
  return (valid.includes(value as T) ? value : fallback) as T;
};

export const CmsSectionRenderer: React.FC<CmsSectionRendererProps> = ({
  section,
  articles = [],
  services = [],
  testimonials = [],
  className,
}) => {
  const sectionId = section.anchorId ?? section.sectionKey;

  const heroStats = useMemo(() => buildHeroStats(section.items), [section.items]);
  const heroFeatures = useMemo(() => buildHeroFeatures(section.items), [section.items]);

  if (section.sectionKey === 'hero') {
    const variant = getVariant(section.theme, ['default', 'centered', 'split', 'gradient'], 'centered');
    const showX402Badge = section.theme?.includes('x402') ?? false;
    return (
      <HeroSection
        title={section.heading ?? undefined}
        highlightedText={section.eyebrow ?? undefined}
        subtitle={section.subheading ?? undefined}
        description={section.body ?? undefined}
        primaryCTA={section.ctaLabel && section.ctaUrl ? { text: section.ctaLabel, href: section.ctaUrl } : undefined}
        secondaryCTA={section.secondaryCtaLabel && section.secondaryCtaUrl ? { text: section.secondaryCtaLabel, href: section.secondaryCtaUrl } : undefined}
        stats={heroStats.length > 0 ? heroStats : undefined}
        features={heroFeatures.length > 0 ? heroFeatures : undefined}
        image={section.mediaUrl ?? undefined}
        variant={variant}
        showX402Badge={showX402Badge}
        className={className}
      />
    );
  }

  if (section.sectionKey === 'features') {
    return (
      <section id={sectionId} className={cn('py-16 md:py-24 bg-slate-50', className)}>
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            {section.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{section.eyebrow}</p>
            )}
            {section.heading && (
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">{section.heading}</h2>
            )}
            {section.subheading && (
              <p className="mt-4 text-lg text-slate-600">{section.subheading}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = ICON_MAP[normalizeKey(item.iconKey)] ?? ICON_MAP.default;
              return (
                <div key={item.id} className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title ?? 'Feature'}</h3>
                  {(item.description || item.subtitle) && (
                    <p className="mt-2 text-sm text-slate-600">{item.description ?? item.subtitle}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (section.sectionKey === 'featured-articles' || section.sectionKey === 'articles') {
    const layout = getVariant(section.theme, ['hero-grid', 'masonry', 'featured-row', 'spotlight'], 'spotlight');
    const sectionArticles = articles.length
      ? articles.map(mapArticleSummary)
      : section.items
          .map(mapArticleItem)
          .filter((item): item is ArticleCardProps => Boolean(item));

    return (
      <FeaturedGrid
        articles={sectionArticles}
        title={section.heading ?? undefined}
        subtitle={section.subheading ?? undefined}
        layout={layout}
        viewAllLink={section.ctaUrl ?? '/articles'}
        showViewAll={Boolean(section.ctaLabel)}
        className={className}
      />
    );
  }

  if (section.sectionKey === 'services') {
    const variant = getVariant(section.theme, ['default', 'featured', 'compact'], 'default');
    const sectionServices = services.length
      ? services.map(mapServiceSummary)
      : section.items
          .map(mapServiceItem)
          .filter((item): item is Service => Boolean(item));

    return (
      <ServiceGrid
        services={sectionServices}
        title={section.heading ?? undefined}
        subtitle={section.subheading ?? undefined}
        variant={variant}
        showViewAll={Boolean(section.ctaLabel)}
        viewAllLink={section.ctaUrl ?? '/services'}
        className={className}
      />
    );
  }

  if (section.sectionKey === 'domains') {
    const variant = getVariant(section.theme, ['cards', 'grid', 'minimal', 'featured'], 'featured');
    const domains = section.items
      .map(mapDomainItem)
      .filter((item): item is Domain => Boolean(item));

    return (
      <DomainShowcase
        domains={domains}
        title={section.heading ?? undefined}
        subtitle={section.subheading ?? undefined}
        variant={variant}
        className={className}
      />
    );
  }

  if (section.sectionKey === 'testimonials') {
    const variant = getVariant(section.theme, ['carousel', 'grid', 'featured', 'marquee'], 'carousel');
    const sectionTestimonials = testimonials.length
      ? testimonials.map(mapTestimonialEntry)
      : section.items
          .map(mapTestimonialItem)
          .filter((item): item is Testimonial => Boolean(item));

    return (
      <TestimonialSection
        testimonials={sectionTestimonials}
        title={section.heading ?? undefined}
        subtitle={section.subheading ?? undefined}
        variant={variant}
        className={className}
      />
    );
  }

  return null;
};

export default CmsSectionRenderer;
