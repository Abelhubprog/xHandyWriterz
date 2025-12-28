/**
 * Redesigned Homepage
 * 
 * World-class landing page integrating Strapi CMS content
 * with stunning visuals and smooth animations
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Bot,
  Coins,
  CheckCircle2,
  Users,
  FileText,
  Award,
  Clock,
  Shield,
  Zap,
  Star,
} from 'lucide-react';

// Import components
import {
  HeroSection,
  ArticleCard,
  FeaturedGrid,
  ServiceCard,
  ServiceGrid,
  DomainShowcase,
  TestimonialSection,
  AuthorGrid,
} from '@/components/landing';

// Import hooks
import {
  useFeaturedArticles,
  useFeaturedServices,
  useTestimonials,
  useAuthors,
  transformArticleToCard,
  transformServiceToCard,
  transformAuthorToCard,
  transformTestimonialToCard,
} from '@/hooks';
import { fetchDomainsList } from '@/lib/cms';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Stats data
const STATS = [
  { label: 'Articles Published', value: '2,500+', icon: FileText },
  { label: 'Expert Authors', value: '150+', icon: Users },
  { label: 'Satisfied Clients', value: '10,000+', icon: Award },
  { label: 'Response Time', value: '< 2hrs', icon: Clock },
];

// Features list
const FEATURES = [
  {
    title: 'Expert-Written Content',
    description: 'All articles written by credentialed professionals in their fields',
    icon: Award,
  },
  {
    title: 'AI-Ready via x402',
    description: 'Content accessible to AI agents through micropayments',
    icon: Bot,
  },
  {
    title: '9 Specialized Domains',
    description: 'From healthcare to technology, we cover your needs',
    icon: Sparkles,
  },
  {
    title: 'Fast Turnaround',
    description: 'Get custom content delivered within your timeline',
    icon: Zap,
  },
  {
    title: 'Quality Guaranteed',
    description: 'Rigorous editorial process ensures top-tier quality',
    icon: Shield,
  },
  {
    title: 'Secure & Private',
    description: 'Your data and orders are always protected',
    icon: CheckCircle2,
  },
];

export default function Homepage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll-based parallax
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Fetch CMS data
  const { data: articlesData, isLoading: articlesLoading } = useFeaturedArticles(6);
  const { data: servicesData, isLoading: servicesLoading } = useFeaturedServices(6);
  const { data: testimonialsData, isLoading: testimonialsLoading } = useTestimonials(undefined, true);
  const { data: authorsData, isLoading: authorsLoading } = useAuthors(true);
  const { data: domainsData, isLoading: domainsLoading } = useQuery({
    queryKey: ['domains-homepage'],
    queryFn: () => fetchDomainsList(),
    staleTime: 1000 * 60 * 10,
  });

  // Transform data for components
  const articles = articlesData?.data?.map(transformArticleToCard) || [];
  const services = servicesData?.data?.map(transformServiceToCard) || [];
  const testimonials = testimonialsData?.data?.map(transformTestimonialToCard) || [];
  const authors = authorsData?.data?.map(transformAuthorToCard) || [];
  const domains =
    domainsData?.map((domain) => ({
      id: domain.id,
      name: domain.name,
      slug: domain.slug,
      description: domain.description ?? '',
      iconKey: domain.iconKey ?? undefined,
      themeColor: domain.themeColor,
      gradient: domain.gradient,
      heroImageUrl: domain.heroImageUrl ?? undefined,
    })) || [];

  const scrollToContent = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>HandyWriterz - Expert Content Creation & Writing Services</title>
        <meta
          name="description"
          content="Professional content creation services spanning healthcare, technology, AI, and more. Expert writers, fast delivery, AI-ready content via x402 protocol."
        />
        <meta property="og:title" content="HandyWriterz - Expert Content Creation" />
        <meta property="og:description" content="Professional content creation services with AI-ready content via x402 protocol." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Hero Section */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
          <HeroSection
            variant="gradient"
            title="Expert Content Creation"
            highlightedText="for Every Domain"
            subtitle="Empowering knowledge through expertly crafted content"
            description="From healthcare to AI, our expert writers deliver high-quality, research-backed content. Now with x402 protocol support for AI agent access."
            primaryCTA={{
              text: isSignedIn ? 'Go to Dashboard' : 'Get Started',
              href: isSignedIn ? '/dashboard' : '/sign-up',
            }}
            secondaryCTA={{
              text: 'Explore Content',
              href: '#content',
              onClick: scrollToContent,
            }}
            stats={[
              { label: 'Articles', value: '2,500+' },
              { label: 'Experts', value: '150+' },
              { label: 'Clients', value: '10K+' },
            ]}
            features={[
              'Healthcare & Nursing',
              'Technology & AI',
              'Enterprise Solutions',
            ]}
            showX402Badge
          />
        </motion.div>

        {/* Stats Section */}
        <section className="relative py-16 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div ref={contentRef} id="content">
          {/* Featured Articles Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Featured Content
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Latest Expert Articles
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Explore our latest publications from expert writers across healthcare, technology, and business domains.
                  </p>
                </motion.div>

                {articlesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-64" />
                        <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : articles.length > 0 ? (
                  <motion.div variants={fadeInUp}>
                    <FeaturedGrid
                      articles={articles as any}
                      variant="hero-grid"
                      showViewAll
                      viewAllLink="/articles"
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="text-center py-12">
                    <p className="text-gray-500">No featured articles yet. Check back soon!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Domains Section */}
          <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                    <Award className="w-4 h-4" />
                    Specialized Expertise
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Explore Our Domains
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Nine specialized domains covering healthcare, technology, and business needs with expert writers in each field.
                  </p>
                </motion.div>

                {domainsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-56" />
                      </div>
                    ))}
                  </div>
                ) : domains.length > 0 ? (
                  <motion.div variants={fadeInUp}>
                    <DomainShowcase
                      domains={domains}
                      variant="featured"
                      showCounts={false}
                    />
                    <div className="mt-8 text-center">
                      <Link
                        to="/domains"
                        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        View all domains
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="text-center py-12">
                    <p className="text-gray-500">Domains coming soon!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
                    <Zap className="w-4 h-4" />
                    Our Services
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Professional Writing Services
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    From research papers to business content, our expert writers deliver quality work on time.
                  </p>
                </motion.div>

                {servicesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-80" />
                      </div>
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <motion.div variants={fadeInUp}>
                    <ServiceGrid
                      services={services as any}
                      variant="featured"
                      showViewAll
                      viewAllLink="/services"
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="text-center py-12">
                    <p className="text-gray-500">Services coming soon!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-16">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                    <Star className="w-4 h-4" />
                    Why Choose Us
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    The HandyWriterz Advantage
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    What sets us apart from other content services
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {FEATURES.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      variants={fadeInUp}
                      className="group p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-300"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* x402 Protocol Section */}
          <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <motion.div variants={fadeInUp}>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6">
                    <Bot className="w-4 h-4" />
                    AI-Ready Content
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    x402 Protocol Integration
                  </h2>
                  <p className="text-lg text-gray-300 mb-8">
                    Our content is accessible to AI agents through the x402 payment protocol. 
                    Enable your AI applications to access expert knowledge with seamless micropayments.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      'Per-request micropayments starting at $0.001',
                      'Support for USDC, USDT, and ETH',
                      'Instant access upon payment verification',
                      'Full content API for AI agents',
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/docs/x402"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      <Coins className="w-5 h-5" />
                      Learn About x402
                    </Link>
                    <Link
                      to="/api"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    >
                      API Documentation
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl" />
                  <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{`// AI Agent Content Access
const response = await fetch(
  'https://api.handywriterz.com/articles/123',
  {
    headers: {
      'X-402-Payment': paymentToken,
      'Content-Type': 'application/json'
    }
  }
);

// Payment: $0.001 USDC
// Access: Full article content
const article = await response.json();`}</code>
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-medium mb-4">
                    <Star className="w-4 h-4" />
                    Testimonials
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    What Our Clients Say
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Join thousands of satisfied clients who trust HandyWriterz for their content needs.
                  </p>
                </motion.div>

                {testimonialsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-48" />
                      </div>
                    ))}
                  </div>
                ) : testimonials.length > 0 ? (
                  <motion.div variants={fadeInUp}>
                    <TestimonialSection
                      testimonials={testimonials as any}
                      variant="carousel"
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="text-center py-12">
                    <p className="text-gray-500">Testimonials coming soon!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Authors Section */}
          <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
                    <Users className="w-4 h-4" />
                    Our Team
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Meet Our Expert Authors
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Credentialed professionals dedicated to delivering exceptional content.
                  </p>
                </motion.div>

                {authorsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : authors.length > 0 ? (
                  <motion.div variants={fadeInUp}>
                    <AuthorGrid
                      authors={authors as any}
                      variant="compact"
                      columns={4}
                      showViewAll
                      viewAllLink="/authors"
                    />
                  </motion.div>
                ) : (
                  <motion.div variants={fadeInUp} className="text-center py-12">
                    <p className="text-gray-500">Authors coming soon!</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                >
                  Ready to Get Started?
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-blue-100 mb-8"
                >
                  Join thousands of satisfied clients and get expert content delivered to you.
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <Link
                    to={isSignedIn ? '/dashboard' : '/sign-up'}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                  >
                    {isSignedIn ? 'Go to Dashboard' : 'Create Free Account'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors"
                  >
                    Contact Sales
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
