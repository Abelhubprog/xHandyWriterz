import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Grid, List, Calendar, User, Eye, Heart,
  Share2, Bookmark, Play, FileText, Code2, Image as ImageIcon,
  Video, Music, MessageSquare, TrendingUp, Clock, CheckCircle,
  Edit, Plus, Settings, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchArticles, fetchServices } from '@/lib/cms-client';
import type { Article, Service } from '@/types/publishing';
import { DOMAIN_TAGS, TYPE_TAGS } from '@/config/taxonomy';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedArticle extends Article {
  readTime: number;
  engagement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

const DOMAIN_CONFIGS = {
  'adult-health': {
    title: 'Adult Health Nursing',
    description: 'Comprehensive resources for adult health nursing practice, covering acute care, chronic disease management, and evidence-based interventions.',
    color: 'blue',
    gradient: 'from-blue-600 to-blue-800',
    icon: '🏥',
  },
  'mental-health': {
    title: 'Mental Health Nursing',
    description: 'Mental health nursing resources focusing on psychiatric care, therapeutic interventions, and patient-centered approaches.',
    color: 'purple',
    gradient: 'from-purple-600 to-purple-800',
    icon: '🧠',
  },
  'child-nursing': {
    title: 'Pediatric Nursing',
    description: 'Specialized content for pediatric nursing, covering child development, family-centered care, and age-appropriate interventions.',
    color: 'green',
    gradient: 'from-green-600 to-green-800',
    icon: '👶',
  },
  'social-work': {
    title: 'Social Work Practice',
    description: 'Social work resources covering community interventions, case management, and evidence-based practice methods.',
    color: 'orange',
    gradient: 'from-orange-600 to-orange-800',
    icon: '🤝',
  },
  'technology': {
    title: 'Healthcare Technology',
    description: 'Cutting-edge healthcare technology, AI applications, and digital transformation in healthcare delivery.',
    color: 'indigo',
    gradient: 'from-indigo-600 to-indigo-800',
    icon: '💻',
  },
};

const CONTENT_TYPE_ICONS = {
  'text': FileText,
  'video': Video,
  'audio': Music,
  'code': Code2,
  'image': ImageIcon,
  'interactive': Play,
};

export const EnterpriseDomainPage: React.FC = () => {
  const { domain = '' } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();

  const [articles, setArticles] = useState<EnhancedArticle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{
    type: string[];
    status: string[];
    author: string[];
  }>({
    type: [],
    status: [],
    author: [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const domainConfig = DOMAIN_CONFIGS[domain as keyof typeof DOMAIN_CONFIGS];

  if (!domainConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Domain Not Found</h1>
          <p className="text-gray-600 mb-6">The requested domain does not exist.</p>
          <Button onClick={() => navigate('/services')}>
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  // Load content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [articlesData, servicesData] = await Promise.all([
          fetchArticles({ domain, status: 'published', limit: 50 }),
          fetchServices(domain),
        ]);

        // Transform articles data
        const enhancedArticles: EnhancedArticle[] = ((articlesData as any)?.articles?.data || []).map((item: any) => {
          const article = item.attributes;
          return {
            ...article,
            id: item.id,
            readTime: Math.max(1, Math.ceil((article.content?.length || 0) / 1000 * 4)), // Estimate reading time
            engagement: {
              views: article.viewCount || 0,
              likes: article.likeCount || 0,
              comments: article.commentCount || 0,
              shares: article.shareCount || 0,
            },
            author: {
              name: article.author?.data?.attributes ?
                `${article.author.data.attributes.firstname} ${article.author.data.attributes.lastname}` :
                'Anonymous',
              avatar: article.author?.data?.attributes?.avatar?.data?.attributes?.url,
              role: article.author?.data?.attributes?.role,
            },
          };
        });

        setArticles(enhancedArticles);
        setServices((servicesData as any)?.services?.data || []);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [domain]);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filters
    if (selectedFilters.type.length > 0) {
      filtered = filtered.filter(article =>
        selectedFilters.type.some(type => article.tags.includes(`type:${type}`))
      );
    }

    // Apply status filters
    if (selectedFilters.status.length > 0) {
      filtered = filtered.filter(article =>
        selectedFilters.status.includes(article.status)
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.engagement.views + b.engagement.likes) - (a.engagement.views + a.engagement.likes);
        case 'trending':
          // Simple trending algorithm based on recent engagement
          const aScore = (a.engagement.likes * 2 + a.engagement.shares * 3) /
            Math.max(1, (Date.now() - new Date(a.publishedAt || a.createdAt).getTime()) / (24 * 60 * 60 * 1000));
          const bScore = (b.engagement.likes * 2 + b.engagement.shares * 3) /
            Math.max(1, (Date.now() - new Date(b.publishedAt || b.createdAt).getTime()) / (24 * 60 * 60 * 1000));
          return bScore - aScore;
        case 'newest':
        default:
          return new Date(b.publishedAt || b.createdAt).getTime() -
                 new Date(a.publishedAt || a.createdAt).getTime();
      }
    });

    return filtered;
  }, [articles, searchQuery, selectedFilters, sortBy]);

  const getContentTypeIcon = (article: EnhancedArticle) => {
    if (article.tags.includes('type:video')) return Video;
    if (article.tags.includes('type:audio')) return Music;
    if (article.tags.includes('type:code')) return Code2;
    if (article.tags.includes('type:image')) return ImageIcon;
    return FileText;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ArticleCard: React.FC<{ article: EnhancedArticle; index: number }> = ({ article, index }) => {
    const ContentIcon = getContentTypeIcon(article);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={viewMode === 'grid' ? 'col-span-1' : 'col-span-full'}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200 group cursor-pointer">
          <Link to={`/articles/${article.slug}`} className="block h-full">
            {article.heroImage && viewMode === 'grid' && (
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-white/90">
                    <ContentIcon className="h-3 w-3 mr-1" />
                    {article.readTime} min read
                  </Badge>
                </div>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.summary}
                    </p>
                  )}
                </div>
                {viewMode === 'list' && article.heroImage && (
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="ml-4 w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag.replace('type:', '').replace('domain:', '')}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {article.author.name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(article.publishedAt || article.createdAt)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.engagement.views}
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {article.engagement.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {article.engagement.comments}
                  </div>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{domainConfig.title} | HandyWriterz</title>
        <meta name="description" content={domainConfig.description} />
        <meta property="og:title" content={domainConfig.title} />
        <meta property="og:description" content={domainConfig.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className={`bg-gradient-to-r ${domainConfig.gradient} text-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">{domainConfig.icon}</div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {domainConfig.title}
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                {domainConfig.description}
              </p>

              {(isAdmin || isEditor) && (
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/admin/content/create?domain=${domain}`)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Content
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/domains/${domain}/analytics`)}
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search articles and resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-gray-100' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>

                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Content Type</h4>
                      <div className="space-y-2">
                        {TYPE_TAGS.map((type) => (
                          <label key={type.slug} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={selectedFilters.type.includes(type.slug)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...selectedFilters.type, type.slug]
                                  : selectedFilters.type.filter(t => t !== type.slug);
                                setSelectedFilters(prev => ({ ...prev, type: newTypes }));
                              }}
                            />
                            {type.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedFilters.status.includes('published')}
                            onChange={(e) => {
                              const newStatus = e.target.checked
                                ? [...selectedFilters.status, 'published']
                                : selectedFilters.status.filter(s => s !== 'published');
                              setSelectedFilters(prev => ({ ...prev, status: newStatus }));
                            }}
                          />
                          Published
                        </label>
                        {(isAdmin || isEditor) && (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={selectedFilters.status.includes('draft')}
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? [...selectedFilters.status, 'draft']
                                  : selectedFilters.status.filter(s => s !== 'draft');
                                setSelectedFilters(prev => ({ ...prev, status: newStatus }));
                              }}
                            />
                            Draft
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFilters({ type: [], status: [], author: [] });
                          setSearchQuery('');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchQuery ? 'Search Results' : 'Latest Content'}
              </h2>
              <p className="text-gray-600">
                {filteredAndSortedArticles.length} article{filteredAndSortedArticles.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded mb-1" />
                    <div className="h-3 bg-gray-200 rounded mb-4 w-1/2" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedArticles.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No articles match your search for "${searchQuery}"`
                  : 'No articles have been published in this domain yet.'}
              </p>
              {(isAdmin || isEditor) && (
                <Button onClick={() => navigate(`/admin/content/create?domain=${domain}`)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Article
                </Button>
              )}
            </div>
          ) : (
            <div className={`
              grid gap-6
              ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
              }
            `}>
              {filteredAndSortedArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnterpriseDomainPage;
