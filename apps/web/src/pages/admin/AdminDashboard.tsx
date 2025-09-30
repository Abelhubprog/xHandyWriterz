import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, FileText, MessageSquare, Upload, Settings,
  Plus, TrendingUp, Clock, CheckCircle, AlertCircle, Eye,
  Calendar, Filter, Download, Search, Grid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { fetchArticles, fetchServices, cmsClient } from '@/lib/cms-client';
import type { Article, Service } from '@/types/publishing';
import { useAuth } from '@/hooks/useAuth';
import { DOMAIN_TAGS } from '@/config/taxonomy';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentActivity: Array<{
    id: string;
    type: 'article_created' | 'article_published' | 'article_updated';
    title: string;
    timestamp: string;
    author: string;
  }>;
}

const QUICK_ACTIONS = [
  {
    title: 'Create Article',
    description: 'Write a new article or blog post',
    icon: FileText,
    href: '/admin/content/new',
    color: 'blue',
  },
  {
    title: 'Upload Media',
    description: 'Add images, videos, or documents',
    icon: Upload,
    href: '/admin/media/upload',
    color: 'green',
  },
  {
    title: 'Manage Users',
    description: 'View and manage user accounts',
    icon: Users,
    href: '/admin/users',
    color: 'purple',
  },
  {
    title: 'Messages',
    description: 'Check and respond to messages',
    icon: MessageSquare,
    href: '/admin/messages',
    color: 'orange',
  },
  {
    title: 'Analytics',
    description: 'View detailed analytics and reports',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'indigo',
  },
  {
    title: 'Settings',
    description: 'Configure system settings',
    icon: Settings,
    href: '/admin/settings',
    color: 'gray',
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentActivity: [],
  });

  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch articles for both published and draft
        const [publishedData, draftData] = await Promise.all([
          fetchArticles({ status: 'published', limit: 100 }),
          fetchArticles({ status: 'draft', limit: 100 }),
        ]);

        const publishedArticles = (publishedData as any)?.articles?.data || [];
        const draftArticles = (draftData as any)?.articles?.data || [];
        const allArticles = [...publishedArticles, ...draftArticles];

        // Calculate stats
        const totalViews = publishedArticles.reduce((sum: number, article: any) =>
          sum + (article.attributes.viewCount || 0), 0);
        const totalLikes = publishedArticles.reduce((sum: number, article: any) =>
          sum + (article.attributes.likeCount || 0), 0);
        const totalComments = publishedArticles.reduce((sum: number, article: any) =>
          sum + (article.attributes.commentCount || 0), 0);

        // Recent activity
        const recentActivity = allArticles
          .sort((a: any, b: any) =>
            new Date(b.attributes.updatedAt).getTime() - new Date(a.attributes.updatedAt).getTime()
          )
          .slice(0, 10)
          .map((article: any) => ({
            id: article.id,
            type: (article.attributes.status === 'published' ? 'article_published' : 'article_created') as 'article_created' | 'article_published' | 'article_updated',
            title: article.attributes.title,
            timestamp: article.attributes.updatedAt,
            author: article.attributes.author?.data?.attributes ?
              `${article.attributes.author.data.attributes.firstname} ${article.attributes.author.data.attributes.lastname}` :
              'Unknown',
          }));

        setStats({
          totalArticles: allArticles.length,
          publishedArticles: publishedArticles.length,
          draftArticles: draftArticles.length,
          totalViews,
          totalLikes,
          totalComments,
          recentActivity,
        });

        // Transform recent articles
        const transformedArticles = publishedArticles.slice(0, 10).map((item: any) => ({
          ...item.attributes,
          id: item.id,
        }));
        setRecentArticles(transformedArticles);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article_published':
        return CheckCircle;
      case 'article_created':
        return FileText;
      case 'article_updated':
        return Clock;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'article_published':
        return 'text-green-600';
      case 'article_created':
        return 'text-blue-600';
      case 'article_updated':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | HandyWriterz</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/admin/content/new')}>
                <Plus className="h-5 w-5 mr-2" />
                Create Content
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Articles</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalArticles}</p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-3xl font-bold text-green-600">{stats.publishedArticles}</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <Eye className="h-12 w-12 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.draftArticles}</p>
                    </div>
                    <Clock className="h-12 w-12 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUICK_ACTIONS.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link to={action.href}>
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`
                            p-3 rounded-lg group-hover:scale-110 transition-transform duration-200
                            ${action.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                            ${action.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                            ${action.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                            ${action.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                            ${action.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
                            ${action.color === 'gray' ? 'bg-gray-100 text-gray-600' : ''}
                          `}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Articles</CardTitle>
                  <Link to="/admin/content">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentArticles.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <Link
                          to={`/admin/content/${article.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{formatDate(article.updatedAt)}</span>
                          <Badge
                            variant={article.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {article.status}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-3 w-3" />
                            <span>{article.viewCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentArticles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No articles yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/content/new')}
                        className="mt-2"
                      >
                        Create Your First Article
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 8).map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <ActivityIcon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.author}</span>
                            {' '}
                            {activity.type === 'article_published' && 'published'}
                            {activity.type === 'article_created' && 'created'}
                            {activity.type === 'article_updated' && 'updated'}
                            {' '}
                            <Link
                              to={`/admin/content/${activity.id}`}
                              className="font-medium text-blue-600 hover:text-blue-500 truncate"
                            >
                              {activity.title}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {stats.recentActivity.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Performance */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Domain Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {DOMAIN_TAGS.map((domain) => {
                    const domainArticles = recentArticles.filter(article =>
                      article.domain === domain.slug
                    );
                    const totalViews = domainArticles.reduce((sum, article) =>
                      sum + (article.viewCount || 0), 0
                    );

                    return (
                      <div key={domain.slug} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl mb-2">📄</div>
                        <h4 className="font-medium text-gray-900 mb-1">{domain.label}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{domainArticles.length} articles</div>
                          <div>{totalViews} views</div>
                        </div>
                        <Link to={`/d/${domain.slug}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            View Domain
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
