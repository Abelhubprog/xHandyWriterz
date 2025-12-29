import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  MessageCircle,
  FileText,
  Download,
  Bot,
  Coins,
} from 'lucide-react';

import {
  useService,
  useServicesByDomain,
  useTestimonials,
  transformServiceToCard,
} from '@/hooks';
import { useCMSContext, useDomain } from '@/contexts/CMSContext';
import { normalizeDomainSlug } from '@/lib/domain-utils';
import { ServiceCard, TestimonialSection } from '@/components/landing';

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

type PricingTier = {
  name?: string;
  price?: number;
  unit?: string;
  description?: string;
  features?: string[];
  ctaLabel?: string;
};

type FeatureItem = {
  title: string;
  description?: string;
};

function X402Badge({ price }: { price?: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      x402 enabled
      {typeof price === 'number' && price > 0 && (
        <span className="inline-flex items-center gap-1 text-emerald-100">
          <Coins className="h-3.5 w-3.5" />
          {price.toFixed(3)}
        </span>
      )}
    </span>
  );
}

function parsePricing(pricing: unknown): PricingTier[] {
  if (!pricing) return [];
  if (Array.isArray(pricing)) return pricing as PricingTier[];
  if (typeof pricing === 'object') {
    const tiers = (pricing as { tiers?: PricingTier[] }).tiers;
    if (Array.isArray(tiers)) return tiers;

    const single = pricing as PricingTier & { startingPrice?: number };
    const price = typeof single.price === 'number' ? single.price : single.startingPrice;
    if (!single.description && !single.features?.length && typeof price !== 'number') {
      return [];
    }

    return [
      {
        name: single.name || 'Standard',
        price,
        unit: single.unit,
        description: single.description,
        features: single.features,
        ctaLabel: single.ctaLabel,
      },
    ];
  }
  return [];
}

function parseFeatures(features: unknown): FeatureItem[] {
  if (!Array.isArray(features)) return [];

  return features
    .map((item) => {
      if (typeof item === 'string') {
        return { title: item };
      }
      if (item && typeof item === 'object') {
        const title = (item as FeatureItem).title || (item as { name?: string }).name;
        if (!title) return null;
        return {
          title,
          description: (item as FeatureItem).description,
        } as FeatureItem;
      }
      return null;
    })
    .filter(Boolean) as FeatureItem[];
}

function stripHtml(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, '').trim();
}

export default function ServicePage() {
  const { slug, serviceSlug } = useParams<{ slug?: string; serviceSlug?: string }>();
  const resolvedSlug = serviceSlug || slug || '';
  const navigate = useNavigate();
  const { resolveMediaUrl } = useCMSContext();

  const { data: service, isLoading, error } = useService(resolvedSlug);
  const { data: relatedData } = useServicesByDomain(service?.domain || '', 6);
  const { data: testimonialsData } = useTestimonials(service?.domain, true);

  const canonicalDomain = normalizeDomainSlug(service?.domain) ?? service?.domain ?? 'general';
  const domainInfo = useDomain(canonicalDomain as any);

  const relatedServices = useMemo(() => {
    const items = (relatedData?.data || []).filter((item) => item.id !== service?.id);
    return items.slice(0, 3).map((item) => transformServiceToCard(item));
  }, [relatedData?.data, service?.id]);

  const pricingTiers = useMemo(() => parsePricing(service?.pricing), [service?.pricing]);
  const features = useMemo(() => parseFeatures(service?.features), [service?.features]);
  const heroSummary = service?.summary || stripHtml(service?.description) || '';
  const bodyContent = service?.body || service?.description || '';
  const attachments = service?.attachments || [];

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

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Service not found</h1>
          <p className="mt-3 text-slate-600">
            The service you are looking for does not exist or is no longer available.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.title} - HandyWriterz</title>
        <meta name="description" content={heroSummary || service.title} />
        <meta property="og:title" content={`${service.title} - HandyWriterz`} />
        <meta property="og:description" content={heroSummary || service.title} />
        {service.heroImage && (
          <meta property="og:image" content={resolveMediaUrl(service.heroImage.url)} />
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
                  <Link to="/services" className="transition hover:text-white">
                    Services
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
                  {service.x402Enabled && <X402Badge price={service.x402Price} />}
                </div>

                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {service.title}
                </h1>

                {heroSummary && (
                  <p className="text-lg text-white/80 leading-relaxed">
                    {heroSummary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/dashboard/new-order"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    style={{ backgroundColor: domainInfo.color || '#ffffff' }}
                  >
                    Start an order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Talk to an editor
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                    {service.heroImage ? (
                      <img
                        src={resolveMediaUrl(service.heroImage.url)}
                        alt={service.heroImage.alternativeText || service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/0">
                        <Bot className="h-16 w-16 text-white/60" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {features.length > 0 && (
          <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-10 max-w-3xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">What you get</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  Delivered as part of every engagement
                </h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid gap-6 md:grid-cols-2"
              >
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                        {feature.description && (
                          <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {bodyContent && (
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-slate-900"
                dangerouslySetInnerHTML={{ __html: bodyContent }}
              />
            </div>
          </section>
        )}

        {pricingTiers.length > 0 && (
          <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-10 max-w-3xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pricing</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Choose the scope that fits</h2>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid gap-6 lg:grid-cols-3"
              >
                {pricingTiers.map((tier, index) => (
                  <motion.div
                    key={`${tier.name || 'tier'}-${index}`}
                    variants={fadeInUp}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-6"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-600">{tier.name || 'Plan'}</p>
                      <div className="mt-3 text-3xl font-semibold text-slate-900">
                        {typeof tier.price === 'number' ? `$${tier.price}` : 'Quote on request'}
                        {tier.unit && typeof tier.price === 'number' && (
                          <span className="text-sm font-medium text-slate-500">/{tier.unit}</span>
                        )}
                      </div>
                      {tier.description && (
                        <p className="mt-3 text-sm text-slate-600">{tier.description}</p>
                      )}
                    </div>
                    {tier.features && tier.features.length > 0 && (
                      <ul className="mt-6 space-y-2 text-sm text-slate-600">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 text-slate-800" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/dashboard/new-order"
                      className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      {tier.ctaLabel || 'Start this plan'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {attachments.length > 0 && (
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-10 max-w-3xl"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resources</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Supporting materials</h2>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attachments.map((asset) => {
                  const url = resolveMediaUrl(asset.url);
                  return (
                    <a
                      key={asset.id}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 transition hover:border-slate-300"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-semibold text-slate-900">{asset.name || 'Attachment'}</span>
                          <span className="text-xs text-slate-500">{asset.name?.split('.').pop()?.toUpperCase() || ''}</span>
                        </span>
                      </span>
                      <Download className="h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {testimonialsData?.data?.length ? (
          <TestimonialSection
            testimonials={testimonialsData.data.map((item) => ({
              id: String(item.id),
              quote: item.quote,
              authorName: item.authorName,
              authorRole: item.authorRole || undefined,
              authorCompany: item.authorCompany || undefined,
              authorAvatar: item.authorAvatar?.url
                ? resolveMediaUrl(item.authorAvatar.url)
                : undefined,
              rating: item.rating,
              domain: item.domain,
              featured: item.featured,
            }))}
            title={`What ${domainInfo.name} clients say`}
            subtitle="Feedback from teams who publish with HandyWriterz"
            variant="carousel"
            className="bg-white"
          />
        ) : null}

        {relatedServices.length > 0 && (
          <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="mb-10 flex flex-wrap items-end justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Related</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">More in {domainInfo.name}</h2>
                </div>
                <Link
                  to={`/domains/${canonicalDomain}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  View domain
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <div className="grid gap-6 lg:grid-cols-3">
                {relatedServices.map((item) => (
                  <ServiceCard key={item.id} service={item} variant="horizontal" />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center text-white">
            <h2 className="text-3xl font-semibold">Ready to publish with confidence?</h2>
            <p className="mt-4 text-lg text-white/70">
              Share your brief and we will match you with a specialist team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard/new-order"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Start an order
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                Talk to an editor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
