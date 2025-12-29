import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchDomainPage, 
  fetchServicesBySlugs, 
  fetchArticlesBySlugs,
  fetchServicesList,
  fetchArticlesList,
  fetchTestimonialsList 
} from '@/lib/cms';
import { expandDomainFilter, normalizeDomainSlug } from '@/lib/domain-utils';
import type { 
  DomainPage as DomainPageType, 
  ServiceListItem, 
  ArticleSummary,
  TestimonialEntry,
  DomainFeature,
  DomainFaq
} from '@/types/cms';
import { 
  Heart, Brain, Baby, Users, Code, Cpu, Bitcoin, Building, BookOpen,
  ArrowRight, ArrowLeft, Loader2, Star, Clock, User, ChevronRight,
  CheckCircle2, ChevronDown, Sparkles, Zap, Shield, Target,
  Lightbulb, Award, FileText, MessageCircle, PlayCircle
} from 'lucide-react';

// Icon mapping for domain iconKey
const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  brain: Brain,
  baby: Baby,
  users: Users,
  code: Code,
  cpu: Cpu,
  bitcoin: Bitcoin,
  building: Building,
  'book-open': BookOpen,
  check: CheckCircle2,
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  target: Target,
  lightbulb: Lightbulb,
  award: Award,
  'file-text': FileText,
  message: MessageCircle,
};

// Domain page composition:
// 1. Hero section with title, subtitle, image
// 2. Highlights (stats/features)
// 3. Featured Services
// 4. Featured Articles
// 5. Testimonials
// 6. Final CTA

function HeroSection({ domain }: { domain: DomainPageType }) {
  const Icon = ICON_MAP[domain.iconKey ?? ''] ?? BookOpen;
  const highlights = (domain.highlights ?? []).slice(0, 3);
  const hasMedia = Boolean(domain.heroVideoUrl || domain.heroImageUrl);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-70`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
              <Link to="/domains" className="hover:text-white transition-colors">
                Domains
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{domain.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold"
                style={{ color: domain.themeColor }}
              >
                <Icon className="h-4 w-4" />
                {domain.tagline ?? 'Specialist domain'}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                Updated daily
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white">
              {domain.heroTitle}
            </h1>

            {domain.heroSubtitle && (
              <p className="text-lg text-white/80 leading-relaxed">
                {domain.heroSubtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {domain.ctaUrl && (
                <Link
                  to={domain.ctaUrl}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: domain.themeColor || '#ffffff' }}
                >
                  {domain.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {domain.secondaryCtaUrl && (
                <Link
                  to={domain.secondaryCtaUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 hover:text-white"
                >
                  {domain.secondaryCtaLabel ?? 'See the scope'}
                </Link>
              )}
            </div>

            {highlights.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((highlight) => (
                  <div key={highlight.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-2xl font-semibold text-white">{highlight.value}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                      {highlight.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -right-10 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                {domain.heroVideoUrl ? (
                  <video
                    src={domain.heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : domain.heroImageUrl ? (
                  <img
                    src={domain.heroImageUrl}
                    alt={domain.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
                    <Icon className="h-16 w-16 text-white/60" />
                  </div>
                )}

                {hasMedia && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HighlightsSection({ domain }: { domain: DomainPageType }) {
  if (!domain.highlights?.length) return null;

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-slate-50/60 px-6 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {domain.highlights.map((highlight, index) => {
            const Icon = ICON_MAP[highlight.iconKey ?? ''] ?? CheckCircle2;
            return (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl bg-white px-5 py-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${domain.themeColor}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: domain.themeColor }} />
                  </div>
                  {highlight.color && (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {highlight.color}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-semibold text-slate-900">{highlight.value}</div>
                <div className="mt-2 text-sm font-medium text-slate-600">{highlight.label}</div>
                {highlight.description && (
                  <p className="mt-3 text-xs text-slate-500">{highlight.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ domain }: { domain: DomainPageType }) {
  if (!domain.features?.length) return null;

  const intro = domain.description ?? domain.tagline ?? '';

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_1.4fr] lg:items-end"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Domain advantage
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900">
              Why teams choose {domain.name}
            </h2>
          </div>
          {intro && (
            <p className="text-base text-slate-600 leading-relaxed">{intro}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {domain.features.map((feature, index) => {
            const Icon = ICON_MAP[feature.iconKey ?? ''] ?? Sparkles;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  {feature.imageUrl ? (
                    <div className="h-40 overflow-hidden rounded-xl mb-4">
                      <img
                        src={feature.imageUrl}
                        alt={feature.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${domain.themeColor}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: domain.themeColor }} />
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>

                  {feature.description && (
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  )}

                  {feature.linkUrl && (
                    <Link
                      to={feature.linkUrl}
                      className="mt-4 inline-flex items-center text-sm font-semibold"
                      style={{ color: domain.themeColor }}
                    >
                      {feature.linkLabel || 'Learn more'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ domain }: { domain: DomainPageType }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  if (!domain.faqs?.length) return null;
  
  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Common questions about {domain.name}
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {domain.faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="pr-4 font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="prose prose-sm max-w-none px-5 pb-5 text-slate-600"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services, domain }: { services: ServiceListItem[]; domain: DomainPageType }) {
  if (!services?.length) return null;
  
  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Services
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Featured services for {domain.name}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Expert service offerings curated by the domain editors.
            </p>
          </div>
          <Link
            to={`/domains/${domain.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            View the domain
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/domains/${domain.slug}/services/${service.slug}`}
                className="block h-full group"
              >
                <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  {service.heroImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={service.heroImageUrl}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                      {service.title}
                    </h3>
                    {service.summary && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {service.summary}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticlesSection({ articles, domain }: { articles: ArticleSummary[]; domain: DomainPageType }) {
  if (!articles?.length) return null;

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Articles
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Featured articles from {domain.name}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Latest insights and editorial guidance curated by the domain team.
            </p>
          </div>
          <Link
            to={`/articles?domain=${domain.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/domains/${domain.slug}/articles/${article.slug}`}
                className="block h-full group"
              >
                <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  {article.heroImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.heroImageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {article.authorName && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.authorName}
                        </span>
                      )}
                      {article.readingMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readingMinutes} min read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials, domain }: { testimonials: TestimonialEntry[]; domain: DomainPageType }) {
  if (!testimonials?.length) return null;
  
  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              What our clients say
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {testimonial.rating && (
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              )}

              <blockquote className="mb-6 text-sm text-slate-600 italic">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                {testimonial.authorAvatarUrl ? (
                  <img
                    src={testimonial.authorAvatarUrl}
                    alt={testimonial.authorName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold"
                    style={{ backgroundColor: domain.themeColor }}
                  >
                    {testimonial.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">
                    {testimonial.authorName}
                  </div>
                  {(testimonial.authorRole || testimonial.authorCompany) && (
                    <div className="text-sm text-slate-500">
                      {testimonial.authorRole}
                      {testimonial.authorRole && testimonial.authorCompany && ', '}
                      {testimonial.authorCompany}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ domain }: { domain: DomainPageType }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div 
        className={`max-w-4xl mx-auto rounded-3xl p-12 text-center bg-gradient-to-br ${domain.gradient}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Connect with our experts in {domain.name} and take your project to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={domain.ctaUrl || '/contact'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              {domain.ctaLabel || 'Get Started'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={domain.secondaryCtaUrl || '/services'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              {domain.secondaryCtaLabel || 'Browse All Services'}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="h-96 bg-gray-200 dark:bg-gray-800" />
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DomainPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [domain, setDomain] = useState<DomainPageType | null>(null);
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDomainData() {
      const normalizedSlug = normalizeDomainSlug(slug);
      if (!normalizedSlug) {
        navigate('/domains');
        return;
      }

      if (slug !== normalizedSlug) {
        navigate(`/domains/${normalizedSlug}`, { replace: true });
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch domain page
        const domainData = await fetchDomainPage(normalizedSlug);
        
        if (!domainData) {
          setError('Domain not found');
          return;
        }
        
        setDomain(domainData);
        const domainQuery = expandDomainFilter(normalizedSlug);
        
        // Fetch related content in parallel
        const [servicesData, articlesData, testimonialsData] = await Promise.all([
          domainData.featuredServiceSlugs.length > 0
            ? fetchServicesBySlugs(domainData.featuredServiceSlugs)
            : fetchServicesList({ domain: domainQuery, pageSize: 6 }).then((response) => response.items),
          domainData.featuredArticleSlugs.length > 0
            ? fetchArticlesBySlugs(domainData.featuredArticleSlugs)
            : fetchArticlesList({ domain: domainQuery, limit: 6 }),
          fetchTestimonialsList({ domain: domainQuery, limit: 6 }),
        ]);
        
        setServices(servicesData);
        setArticles(articlesData);
        setTestimonials(testimonialsData);
        
      } catch (err) {
        console.error('[DomainPage] Failed to load domain:', err);
        setError('Unable to load domain. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadDomainData();
  }, [slug, navigate]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !domain) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Domain Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The domain you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Domains
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{domain.seoTitle || `${domain.name} | HandyWriterz`}</title>
        <meta 
          name="description" 
          content={domain.seoDescription || domain.heroSubtitle || `Expert ${domain.name} content and services.`} 
        />
        {domain.keywords && (
          <meta name="keywords" content={domain.keywords} />
        )}
        {domain.seoImageUrl && (
          <meta property="og:image" content={domain.seoImageUrl} />
        )}
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <HeroSection domain={domain} />
        <HighlightsSection domain={domain} />
        <FeaturesSection domain={domain} />
        <ServicesSection services={services} domain={domain} />
        <ArticlesSection articles={articles} domain={domain} />
        <FAQSection domain={domain} />
        <TestimonialsSection testimonials={testimonials} domain={domain} />
        <CTASection domain={domain} />
      </div>
    </>
  );
}
