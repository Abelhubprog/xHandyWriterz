import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  GraduationCap,
  Brain,
  Heart,
  BookOpen,
  Sparkles,
  Star,
  ChevronRight,
  TrendingUp,
  Clock,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';
import { ContentPlaceholder } from '@/components/common/LoadingStates';
import { fetchServicesList } from '@/lib/cms';
import type { ServiceListItem } from '@/lib/cms';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Service {
  id?: string;
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  category: 'nursing' | 'healthcare' | 'social' | 'tech' | 'business';
  articleCount: number;
  featured?: boolean;
  trending?: boolean;
  readTime?: number; // average minutes
  students?: number; // number of students
}

// ============================================================================
// FALLBACK DATA (used when CMS is unavailable)
// ============================================================================

const FALLBACK_SERVICES: Service[] = [
  {
    slug: 'adult-health',
    title: 'Adult Health Nursing',
    description: 'Comprehensive support for adult health nursing students covering patient care, disease management, and clinical skills.',
    icon: GraduationCap,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'from-emerald-100/40 to-emerald-200/20',
    category: 'nursing',
    articleCount: 24,
    featured: true,
    trending: true,
    readTime: 12,
    students: 1250,
  },
  {
    slug: 'mental-health',
    title: 'Mental Health Nursing',
    description: 'Specialized guidance for mental health nursing covering psychiatric care, therapeutic communication, and patient advocacy.',
    icon: Brain,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'from-violet-100/40 to-violet-200/20',
    category: 'nursing',
    articleCount: 18,
    featured: true,
    readTime: 15,
    students: 890,
  },
  {
    slug: 'child-nursing',
    title: 'Pediatric & Child Nursing',
    description: 'Dedicated support for pediatric nursing students with focus on child development, family-centered care, and pediatric emergencies.',
    icon: Heart,
    color: 'from-sky-500 to-sky-600',
    bgColor: 'from-sky-100/40 to-sky-200/20',
    category: 'nursing',
    articleCount: 21,
    trending: true,
    readTime: 10,
    students: 1100,
  },
  {
    slug: 'social-work',
    title: 'Social Work & Counseling',
    description: 'Professional support for social work students covering case management, community resources, and ethical practice.',
    icon: BookOpen,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'from-amber-100/40 to-amber-200/20',
    category: 'social',
    articleCount: 16,
    readTime: 14,
    students: 670,
  },
  {
    slug: 'ai',
    title: 'Artificial Intelligence & ML',
    description: 'Cutting-edge resources for AI and machine learning topics including neural networks, deep learning, and practical applications.',
    icon: Sparkles,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'from-indigo-100/40 to-indigo-200/20',
    category: 'tech',
    articleCount: 32,
    featured: true,
    trending: true,
    readTime: 18,
    students: 2100,
  },
  {
    slug: 'crypto',
    title: 'Blockchain & Cryptocurrency',
    description: 'In-depth coverage of blockchain technology, cryptocurrency markets, DeFi, and Web3 applications.',
    icon: Star,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'from-amber-100/40 to-amber-200/20',
    category: 'tech',
    articleCount: 28,
    trending: true,
    readTime: 16,
    students: 1850,
  },
];

// Icon mapping for CMS services
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'adult-health': GraduationCap,
  'mental-health': Brain,
  'child-nursing': Heart,
  'social-work': BookOpen,
  'ai': Sparkles,
  'crypto': Star,
  default: BookOpen,
};

// Color mapping for CMS services
const COLOR_MAP: Record<string, { color: string; bgColor: string }> = {
  'adult-health': { color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-100/40 to-emerald-200/20' },
  'mental-health': { color: 'from-violet-500 to-violet-600', bgColor: 'from-violet-100/40 to-violet-200/20' },
  'child-nursing': { color: 'from-sky-500 to-sky-600', bgColor: 'from-sky-100/40 to-sky-200/20' },
  'social-work': { color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-100/40 to-amber-200/20' },
  'ai': { color: 'from-indigo-500 to-indigo-600', bgColor: 'from-indigo-100/40 to-indigo-200/20' },
  'crypto': { color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-100/40 to-amber-200/20' },
  default: { color: 'from-gray-500 to-gray-600', bgColor: 'from-gray-100/40 to-gray-200/20' },
};

// Map category from domain
function mapDomainToCategory(domain?: string): Service['category'] {
  const domainMap: Record<string, Service['category']> = {
    'adult-health': 'nursing',
    'mental-health': 'nursing',
    'child-nursing': 'nursing',
    'social-work': 'social',
    'ai': 'tech',
    'crypto': 'tech',
  };
  return domainMap[domain || ''] || 'nursing';
}

// Transform CMS data to Service format
function transformCmsServices(cmsServices: ServiceListItem[]): Service[] {
  return cmsServices.map(item => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.summary || '',
    icon: ICON_MAP[item.slug] || ICON_MAP.default,
    color: (COLOR_MAP[item.slug] || COLOR_MAP.default).color,
    bgColor: (COLOR_MAP[item.slug] || COLOR_MAP.default).bgColor,
    category: mapDomainToCategory(item.domain),
    articleCount: 0, // Would need separate query
    featured: true,
    readTime: item.readingTime || 10,
    students: 0,
  }));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ServicesHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Fetch services from CMS with fallback
  const { data: cmsServices, isLoading, error, isError } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => fetchServicesList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Use CMS data if available, otherwise fallback to static data
  const services = useMemo(() => {
    if (cmsServices && cmsServices.length > 0) {
      return transformCmsServices(cmsServices);
    }
    return FALLBACK_SERVICES;
  }, [cmsServices]);

  const usingFallback = !cmsServices || cmsServices.length === 0;

  const CATEGORIES = useMemo(() => [
    { id: 'all', label: 'All Services', count: services.length },
    { id: 'nursing', label: 'Nursing', count: services.filter(s => s.category === 'nursing').length },
    { id: 'healthcare', label: 'Healthcare', count: services.filter(s => s.category === 'healthcare').length },
    { id: 'social', label: 'Social Work', count: services.filter(s => s.category === 'social').length },
    { id: 'tech', label: 'Technology', count: services.filter(s => s.category === 'tech').length },
    { id: 'business', label: 'Business', count: services.filter(s => s.category === 'business').length },
  ], [services]);

  // Filter services based on search and category
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesFeatured = !showFeaturedOnly || service.featured;

      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [services, searchQuery, selectedCategory, showFeaturedOnly]);

  const stats = {
    totalServices: services.length,
    totalArticles: services.reduce((sum, s) => sum + s.articleCount, 0),
    totalStudents: services.reduce((sum, s) => sum + (s.students || 0), 0),
  };

  // Show loading state while fetching
  if (isLoading) {
    return <ContentPlaceholder type="grid" count={6} />;
  }

  return (
    <>
      <Helmet>
        <title>Services & Resources | HandyWriterz</title>
        <meta 
          name="description" 
          content="Explore our comprehensive catalogue of academic services covering nursing, healthcare, technology, and more. Find expert resources tailored to your field." 
        />
        <meta name="keywords" content="academic services, nursing resources, healthcare education, technology learning" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* CMS Connection Status Banner */}
        {(isError || usingFallback) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border-b border-amber-200 px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-amber-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                {isError 
                  ? 'Unable to connect to content server. Showing cached content.'
                  : 'Showing default content. Content management system offline.'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20 px-4">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 h-96 w-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
            <div className="absolute top-0 right-0 h-96 w-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 h-96 w-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Professional Services & Resources
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Explore our structured services catalogue powered by expert knowledge and curated domains.
                Find the perfect resources for your academic journey.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalServices}</div>
                  <div className="text-blue-100">Service Categories</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold text-white mb-2">{stats.totalArticles}+</div>
                  <div className="text-blue-100">Expert Articles</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold text-white mb-2">{(stats.totalStudents / 1000).toFixed(1)}K+</div>
                  <div className="text-blue-100">Students Helped</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
          >
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-sm opacity-75">({category.count})</span>
                </button>
              ))}
            </div>

            {/* Featured Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  showFeaturedOnly
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                    : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Star className={`h-4 w-4 ${showFeaturedOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
                Featured Only
              </button>
              <span className="text-sm text-gray-500">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </motion.div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          {filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowFeaturedOnly(false);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/d/${service.slug}`}
                    className="block group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${service.bgColor} pointer-events-none`} />
                    
                    <div className="relative p-8">
                      {/* Badges */}
                      <div className="flex gap-2 mb-4">
                        {service.featured && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                            <Star className="h-3 w-3 fill-amber-500" />
                            Featured
                          </span>
                        )}
                        {service.trending && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </span>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className="h-8 w-8 text-gray-700" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{service.articleCount} articles</span>
                        </div>
                        {service.readTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>~{service.readTime} min read</span>
                          </div>
                        )}
                        {service.students && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{(service.students / 1000).toFixed(1)}K students</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <span className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${service.color} text-white rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300`}>
                        Explore Resources
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 h-64 w-64 bg-white rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 bg-white rounded-full filter blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Our support team is here to help you find the perfect resources for your academic needs.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-xl"
              >
                Contact Support
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
