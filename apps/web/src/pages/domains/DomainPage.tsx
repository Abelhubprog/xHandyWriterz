import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchDomainPage, 
  fetchServicesBySlugs, 
  fetchArticlesBySlugs,
  fetchTestimonialsList 
} from '@/lib/cms';
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
  const Icon = domain.iconKey ? ICON_MAP[domain.iconKey] : BookOpen;
  
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-10`} 
      />
      
      {/* Hero Video or Image */}
      {domain.heroVideoUrl ? (
        <div className="absolute inset-0">
          <video
            src={domain.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-gray-900/60 dark:to-gray-900" />
        </div>
      ) : domain.heroImageUrl && (
        <div className="absolute inset-0">
          <img
            src={domain.heroImageUrl}
            alt={domain.name}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <Link to="/domains" className="hover:text-indigo-600 transition-colors">
              Domains
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{domain.name}</span>
          </div>
          
          {/* Icon */}
          {Icon && (
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
              style={{ backgroundColor: `${domain.themeColor}20` }}
            >
              <Icon className="w-10 h-10" style={{ color: domain.themeColor }} />
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {domain.heroTitle}
          </h1>
          
          {domain.heroSubtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {domain.heroSubtitle}
            </p>
          )}
          
          {domain.ctaUrl && (
            <Link
              to={domain.ctaUrl}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              style={{ backgroundColor: domain.themeColor }}
            >
              {domain.ctaLabel}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function HighlightsSection({ domain }: { domain: DomainPageType }) {
  if (!domain.highlights?.length) return null;
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {domain.highlights.map((highlight, index) => {
            const Icon = highlight.iconKey ? ICON_MAP[highlight.iconKey] : CheckCircle2;
            return (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                {Icon && (
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${domain.themeColor}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: domain.themeColor }} />
                  </div>
                )}
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {highlight.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {highlight.label}
                </div>
                {highlight.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {highlight.description}
                  </div>
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
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose {domain.name}
          </h2>
          {domain.tagline && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {domain.tagline}
            </p>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domain.features.map((feature, index) => {
            const Icon = feature.iconKey ? ICON_MAP[feature.iconKey] : Sparkles;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg transition-all">
                  {feature.imageUrl ? (
                    <div className="h-40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={feature.imageUrl}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : Icon && (
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${domain.themeColor}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: domain.themeColor }} />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  {feature.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {feature.description}
                    </p>
                  )}
                  
                  {feature.linkUrl && (
                    <Link
                      to={feature.linkUrl}
                      className="inline-flex items-center text-sm font-medium hover:underline"
                      style={{ color: domain.themeColor }}
                    >
                      {feature.linkLabel || 'Learn more'}
                      <ArrowRight className="w-4 h-4 ml-1" />
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
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
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
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
                      className="px-5 pb-5 text-gray-600 dark:text-gray-300 prose dark:prose-invert prose-sm max-w-none"
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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Services
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Expert services tailored for {domain.name}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all">
                  {service.heroImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={service.heroImageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {service.title}
                    </h3>
                    {service.summary && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                        {service.summary}
                      </p>
                    )}
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Articles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Latest insights and expert knowledge
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all">
                  {article.heroImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.heroImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Clients Say
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
            >
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Quote */}
              <blockquote className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.authorAvatarUrl ? (
                  <img
                    src={testimonial.authorAvatarUrl}
                    alt={testimonial.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: domain.themeColor }}
                  >
                    {testimonial.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.authorName}
                  </div>
                  {(testimonial.authorRole || testimonial.authorCompany) && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
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
      if (!slug) {
        navigate('/domains');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch domain page
        const domainData = await fetchDomainPage(slug);
        
        if (!domainData) {
          setError('Domain not found');
          return;
        }
        
        setDomain(domainData);
        
        // Fetch related content in parallel
        const [servicesData, articlesData, testimonialsData] = await Promise.all([
          domainData.featuredServiceSlugs.length > 0 
            ? fetchServicesBySlugs(domainData.featuredServiceSlugs)
            : Promise.resolve([]),
          domainData.featuredArticleSlugs.length > 0
            ? fetchArticlesBySlugs(domainData.featuredArticleSlugs)
            : Promise.resolve([]),
          fetchTestimonialsList({ domain: slug, limit: 6 }),
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
