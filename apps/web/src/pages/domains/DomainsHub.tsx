import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { fetchDomainsList } from '@/lib/cms';
import type { DomainListItem } from '@/types/cms';
import { 
  Heart, Brain, Baby, Users, Code, Cpu, Bitcoin, Building, BookOpen,
  ArrowRight, Loader2
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
};

function DomainCard({ domain, index }: { domain: DomainListItem; index: number }) {
  const Icon = domain.iconKey ? ICON_MAP[domain.iconKey] : BookOpen;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/domains/${domain.slug}`}
        className="group block h-full"
      >
        <div 
          className="relative h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          {/* Hero image or gradient background */}
          <div 
            className={`h-40 bg-gradient-to-br ${domain.gradient} relative overflow-hidden`}
          >
            {domain.heroImageUrl ? (
              <img
                src={domain.heroImageUrl}
                alt={domain.name}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {Icon && <Icon className="w-16 h-16 text-white/30" />}
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              {Icon && (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${domain.themeColor}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: domain.themeColor }} />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {domain.name}
              </h3>
            </div>
            
            {/* Tagline */}
            {domain.tagline && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 italic">
                {domain.tagline}
              </p>
            )}
            
            {domain.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                {domain.description}
              </p>
            )}
            
            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function DomainsHubSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="h-40 bg-gray-200 dark:bg-gray-700" />
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DomainsHub() {
  const [domains, setDomains] = useState<DomainListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDomains() {
      try {
        setLoading(true);
        // Only fetch active domains for the public hub
        const data = await fetchDomainsList({ activeOnly: true });
        setDomains(data);
      } catch (err) {
        console.error('[DomainsHub] Failed to load domains:', err);
        setError('Unable to load domains. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadDomains();
  }, []);

  return (
    <>
      <Helmet>
        <title>Explore Domains | HandyWriterz</title>
        <meta name="description" content="Browse our expert content domains including Adult Nursing, AI, Cryptocurrency, Mental Health, and more." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="max-w-7xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Explore Our{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Domains
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Discover expert content, services, and resources across our specialized knowledge domains.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Domains Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <DomainsHubSkeleton />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Domains Published Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Check back soon for new content domains.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {domains.map((domain, index) => (
                  <DomainCard key={domain.id} domain={domain} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Need Custom Content?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our expert writers can create tailored content for your specific needs across any domain.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get in Touch
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
