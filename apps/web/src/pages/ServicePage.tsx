/**
 * ServicePage Component
 * 
 * Full service detail page with:
 * - Service hero and description
 * - Pricing tiers
 * - Features list
 * - Related services
 * - CTA for ordering
 * - x402 badge for AI access
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Clock,
  Users,
  Shield,
  Award,
  Zap,
  Bot,
  Coins,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

// Import hooks
import {
  useService,
  useServicesByDomain,
  useTestimonials,
} from '@/hooks';

import { useCMSContext, useDomain } from '@/contexts/CMSContext';

// Import components
import { ServiceCard, TestimonialSection } from '@/components/landing';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

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

// Pricing Card component
function PricingCard({
  tier,
  isPopular = false,
}: {
  tier: {
    name: string;
    price: number;
    unit: string;
    features: string[];
    description: string;
  };
  isPopular?: boolean;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`relative p-6 rounded-2xl border ${
        isPopular
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {tier.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {tier.description}
      </p>
      <div className="mb-6">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          ${tier.price}
        </span>
        <span className="text-gray-600 dark:text-gray-400">/{tier.unit}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <Link
        to="/dashboard/new-order"
        className={`block w-full py-3 px-4 rounded-xl text-center font-medium transition-colors ${
          isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Get Started
      </Link>
    </motion.div>
  );
}

// Feature Card component
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

// Default pricing tiers
const DEFAULT_PRICING = [
  {
    name: 'Basic',
    price: 15,
    unit: 'page',
    description: 'Perfect for simple projects',
    features: [
      'Professional writing',
      '2-day delivery',
      '1 revision round',
      'Basic formatting',
      'Plagiarism check',
    ],
  },
  {
    name: 'Standard',
    price: 25,
    unit: 'page',
    description: 'Most popular choice',
    features: [
      'Expert-level writing',
      '24-hour delivery',
      '3 revision rounds',
      'Advanced formatting',
      'Plagiarism check + report',
      'Source citations',
    ],
  },
  {
    name: 'Premium',
    price: 40,
    unit: 'page',
    description: 'For complex requirements',
    features: [
      'Senior expert writing',
      '12-hour delivery',
      'Unlimited revisions',
      'Premium formatting',
      'Plagiarism check + report',
      'Source citations',
      'Priority support',
      'Quality guarantee',
    ],
  },
];

type PricingTier = {
  name: string;
  price: number;
  unit: string;
  features: string[];
  description: string;
};

type FeatureItem = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const normalizePricingTiers = (pricing: unknown): PricingTier[] => {
  if (Array.isArray(pricing)) {
    return pricing as PricingTier[];
  }
  if (pricing && Array.isArray((pricing as any).tiers)) {
    return (pricing as any).tiers as PricingTier[];
  }
  return DEFAULT_PRICING;
};

const normalizeFeatures = (features: unknown): FeatureItem[] => {
  if (Array.isArray(features) && features.length > 0) {
    if (typeof features[0] === 'string') {
      return (features as string[]).map((feature) => ({
        title: feature,
        description: 'Included with every engagement.',
        icon: Sparkles,
      }));
    }
    return features as FeatureItem[];
  }
  return DEFAULT_FEATURES;
};

// Default features
const DEFAULT_FEATURES = [
  {
    icon: Award,
    title: 'Expert Writers',
    description: 'Our writers are professionals with advanced degrees in their fields.',
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Get your work delivered on time, every time. Rush orders available.',
  },
  {
    icon: Shield,
    title: '100% Original',
    description: 'Every piece is written from scratch and checked for plagiarism.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: '24/7 support team ready to assist with any questions or concerns.',
  },
  {
    icon: Zap,
    title: 'Unlimited Revisions',
    description: 'We work until you\'re completely satisfied with the result.',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Satisfaction guaranteed or your money back. No questions asked.',
  },
];

export default function ServicePage() {
  const { slug, serviceSlug } = useParams<{ slug?: string; serviceSlug?: string }>();
  const resolvedSlug = serviceSlug || slug || '';
  const navigate = useNavigate();
  const { resolveMediaUrl } = useCMSContext();

  // Fetch service data
  const { data: service, isLoading, error } = useService(resolvedSlug);

  // Domain info
  const domainInfo = useDomain(service?.domain as any || 'general');

  // Fetch related services
  const { data: relatedData } = useServicesByDomain(
    service?.domain || '',
    4
  );

  // Fetch testimonials
  const { data: testimonialsData } = useTestimonials(service?.domain, true);

  // Filter out current service from related
  const relatedServices = (relatedData?.data || []).filter(
    (s) => s.id !== service?.id
  ).slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-8" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  // Parse pricing tiers from service or use default
  const pricingTiers = normalizePricingTiers(service.pricing);
  const features = normalizeFeatures(service.features);
  const contentHtml = service.body || service.description || '';

  return (
    <>
      <Helmet>
        <title>{service.title} - HandyWriterz Services</title>
        <meta name="description" content={service.description || service.title} />
        <meta property="og:title" content={`${service.title} - HandyWriterz`} />
        <meta property="og:description" content={service.description || service.title} />
        {service.heroImage && (
          <meta property="og:image" content={resolveMediaUrl(service.heroImage.url)} />
        )}
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-950">
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

        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className={`relative overflow-hidden bg-gradient-to-br ${domainInfo.gradient} py-16 md:py-24`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Domain & x402 badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Link
                    to={`/domains/${service.domain}`}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm"
                  >
                    {domainInfo.name}
                  </Link>
                  {service.x402Enabled && (
                    <X402Badge price={service.x402Price} />
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {service.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  {service.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8">
                  <div>
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-white/70 text-sm">Projects Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">4.9/5</div>
                    <div className="text-white/70 text-sm">Client Rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">24hrs</div>
                    <div className="text-white/70 text-sm">Avg. Turnaround</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/dashboard/new-order"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              {service.heroImage && (
                <div className="hidden lg:block">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    src={resolveMediaUrl(service.heroImage.url)}
                    alt={service.heroImage.alternativeText || service.title}
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our {service.title} Service
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We deliver excellence in every project with our team of expert writers.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature: any, index: number) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon || Sparkles}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        {contentHtml && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-p:text-gray-600 dark:prose-p:text-gray-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          </section>
        )}

        {/* Pricing Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Transparent Pricing
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose the plan that fits your needs. All plans include our quality guarantee.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {pricingTiers.map((tier: any, index: number) => (
                <PricingCard
                  key={tier.name}
                  tier={tier}
                  isPopular={index === 1}
                />
              ))}
            </motion.div>

            {/* Custom quote */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mt-12 text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Need a custom solution for your organization?
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Contact us for a custom quote
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonialsData && testimonialsData.data.length > 0 && (
          <TestimonialSection
            testimonials={testimonialsData.data.map((t) => ({
              id: String(t.id),
              quote: t.quote,
              authorName: t.authorName,
              authorRole: t.authorRole || undefined,
              authorCompany: t.authorCompany || undefined,
              authorAvatar: t.authorAvatar?.url ? resolveMediaUrl(t.authorAvatar.url) : undefined,
              rating: t.rating,
            }))}
            variant="carousel"
            title={`What Our ${domainInfo.name} Clients Say`}
            subtitle="Real feedback from satisfied customers"
          />
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex items-center justify-between mb-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Related Services
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Explore more services in {domainInfo.name}
                  </p>
                </div>
                <Link
                  to={`/domains/${service.domain}`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedServices.map((relatedService) => (
                  <ServiceCard
                    key={relatedService.id}
                    service={{
                      id: String(relatedService.id),
                      title: relatedService.title,
                      slug: relatedService.slug,
                      excerpt: relatedService.summary || relatedService.description || '',
                      description: relatedService.description || relatedService.summary || '',
                      coverImage: relatedService.heroImage?.url
                        ? resolveMediaUrl(relatedService.heroImage.url)
                        : undefined,
                      domain: relatedService.domain || 'general',
                      features: Array.isArray(relatedService.features)
                        ? relatedService.features.filter((feature) => typeof feature === 'string')
                        : undefined,
                      pricing:
                        relatedService.pricing && !Array.isArray(relatedService.pricing)
                          ? {
                              startingPrice: (relatedService.pricing as any).startingPrice,
                              currency: (relatedService.pricing as any).currency,
                              unit: (relatedService.pricing as any).unit,
                            }
                          : undefined,
                      featured: relatedService.featured,
                      x402Enabled: relatedService.x402Enabled,
                      x402Price: relatedService.x402Price,
                    }}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`text-center p-12 rounded-3xl bg-gradient-to-br ${domainInfo.gradient} relative overflow-hidden`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>

              <div className="relative">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Our team of experts is ready to help you achieve your goals.
                  Get started today with our {service.title} service.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/dashboard/new-order"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Order Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    Get Free Quote
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
