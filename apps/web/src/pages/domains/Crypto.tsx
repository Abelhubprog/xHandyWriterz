import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Play,
  Headphones,
  Image as ImageIcon,
  FileText,
  Code,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Download,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  Shield,
  Zap,
  Target,
  Award,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { IconButton } from '@/components/ui/IconButton';
import { PageTitle } from '@/components/ui/PageTitle';
import { NotificationSystem } from '@/components/ui/NotificationSystem';
import { MessagingInterface } from '@/components/ui/MessagingInterface';
import { EmailInterface } from '@/components/ui/EmailInterface';
import { DocumentUploadForm } from '@/components/ui/DocumentUploadForm';
import { DocumentProcessingStatus } from '@/components/ui/DocumentProcessingStatus';

// Hooks and Utils
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { cmsClient } from '@/lib/cms';

// Types
interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'news' | 'video' | 'audio' | 'podcast' | 'image' | 'code';
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  metadata: {
    duration?: number;
    fileSize?: number;
    dimensions?: { width: number; height: number };
    language?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
  };
  media: {
    url: string;
    thumbnail?: string;
    alt: string;
  }[];
  related: string[];
}

interface AnalyticsData {
  totalViews: number;
  totalEngagement: number;
  topContent: ContentItem[];
  userDemographics: {
    location: string;
    device: string;
    count: number;
  }[];
  contentPerformance: {
    type: string;
    views: number;
    engagement: number;
  }[];
  trends: {
    date: string;
    views: number;
    newUsers: number;
  }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'contributor' | 'user';
  status: 'active' | 'inactive' | 'banned';
  joinedAt: string;
  lastActive: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  stats: {
    contentCreated: number;
    totalViews: number;
    reputation: number;
  };
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: Comment[];
  parentId?: string;
}

interface FilterOptions {
  type: string[];
  category: string[];
  tags: string[];
  author: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  featured: boolean | null;
  difficulty: string[];
}

interface SortOptions {
  field: 'publishedAt' | 'views' | 'likes' | 'comments' | 'title';
  direction: 'asc' | 'desc';
}

interface ViewMode {
  layout: 'grid' | 'list' | 'masonry';
  itemsPerPage: number;
  showFilters: boolean;
  showAnalytics: boolean;
}

const Crypto: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscription } = useSubscription();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    category: [],
    tags: [],
    author: [],
    dateRange: { start: '', end: '' },
    status: [],
    featured: null,
    difficulty: []
  });
  const [sort, setSort] = useState<SortOptions>({ field: 'publishedAt', direction: 'desc' });
  const [viewMode, setViewMode] = useState<ViewMode>({
    layout: 'grid',
    itemsPerPage: 12,
    showFilters: true,
    showAnalytics: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [showComments, setShowComments] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Comment[]>([]);

  // Data fetching
  const { data: contentData, isLoading: contentLoading, error: contentError, refetch: refetchContent } = useQuery({
    queryKey: ['crypto-content', searchQuery, filters, sort, currentPage, viewMode.itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        limit: viewMode.itemsPerPage.toString(),
        sort: `${sort.field}:${sort.direction}`,
        ...Object.fromEntries(
          Object.entries(filters).flatMap(([key, value]) => {
            if (Array.isArray(value)) return value.map(v => [key, v]);
            if (typeof value === 'object' && value !== null) {
              return Object.entries(value).map(([k, v]) => [`${key}.${k}`, v]);
            }
            if (value !== null && value !== undefined) return [[key, value.toString()]];
            return [];
          })
        )
      });

      const response = await cmsClient.get(`/content/crypto?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['crypto-analytics'],
    queryFn: async () => {
      const response = await cmsClient.get('/analytics/crypto');
      return response.data as AnalyticsData;
    },
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'editor'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['crypto-users'],
    queryFn: async () => {
      const response = await cmsClient.get('/users/crypto');
      return response.data as User[];
    },
    enabled: isAuthenticated && user?.role === 'admin',
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await cmsClient.post(`/content/${contentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-content'] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await cmsClient.post(`/content/${contentId}/bookmark`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-content'] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await cmsClient.post(`/content/${contentId}/share`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-content'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ contentId, comment }: { contentId: string; comment: string }) => {
      await cmsClient.post(`/content/${contentId}/comments`, { content: comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto-content'] });
      setShowComments(false);
    },
  });

  // Computed values
  const filteredContent = useMemo(() => {
    if (!contentData?.items) return [];
    return contentData.items;
  }, [contentData]);

  const totalPages = useMemo(() => {
    return Math.ceil((contentData?.total || 0) / viewMode.itemsPerPage);
  }, [contentData?.total, viewMode.itemsPerPage]);

  const contentStats = useMemo(() => {
    if (!contentData?.items) return { total: 0, byType: {}, byCategory: {} };
    const stats = {
      total: contentData.total,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    contentData.items.forEach((item: ContentItem) => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    });

    return stats;
  }, [contentData]);

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOptions) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleViewModeChange = (newMode: Partial<ViewMode>) => {
    setViewMode(prev => ({ ...prev, ...newMode }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleContentSelect = (content: ContentItem) => {
    setSelectedContent(content);
  };

  const handleLike = (contentId: string) => {
    if (isAuthenticated) {
      likeMutation.mutate(contentId);
    }
  };

  const handleBookmark = (contentId: string) => {
    if (isAuthenticated) {
      bookmarkMutation.mutate(contentId);
    }
  };

  const handleShare = (contentId: string) => {
    if (isAuthenticated) {
      shareMutation.mutate(contentId);
    }
  };

  const handleComment = (contentId: string, comment: string) => {
    if (isAuthenticated) {
      commentMutation.mutate({ contentId, comment });
    }
  };

  // Admin functions
  const handleContentCreate = () => {
    // Implementation for creating new content
    console.log('Create new content');
  };

  const handleContentEdit = (content: ContentItem) => {
    // Implementation for editing content
    console.log('Edit content:', content.id);
  };

  const handleContentDelete = (contentId: string) => {
    // Implementation for deleting content
    console.log('Delete content:', contentId);
  };

  const handleUserManage = (user: User) => {
    // Implementation for managing users
    console.log('Manage user:', user.id);
  };

  // Render functions
  const renderContentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredContent.map((item: ContentItem) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
                {item.featured && (
                  <Badge variant="default" className="text-xs bg-yellow-500">
                    Featured
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {item.media[0] && (
                  <img
                    src={item.media[0].thumbnail || item.media[0].url}
                    alt={item.media[0].alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Headphones className="w-12 h-12 text-white bg-black bg-opacity-50 rounded-full p-3" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={item.author.avatar} />
                    <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{item.author.name}</span>
                </div>
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{item.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id);
                          }}
                          className={item.likes > 0 ? 'text-red-500' : ''}
                        >
                          <Heart className="w-4 h-4" />
                        </IconButton>
                      </TooltipTrigger>
                      <TooltipContent>Like</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(item.id);
                          }}
                        >
                          <Bookmark className="w-4 h-4" />
                        </IconButton>
                      </TooltipTrigger>
                      <TooltipContent>Bookmark</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item.id);
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </IconButton>
                      </TooltipTrigger>
                      <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleContentEdit(item)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContentDelete(item.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderContentList = () => (
    <div className="space-y-4">
      {filteredContent.map((item: ContentItem) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {item.media[0] && (
                      <img
                        src={item.media[0].thumbnail || item.media[0].url}
                        alt={item.media[0].alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.featured && (
                          <Badge variant="default" className="text-xs bg-yellow-500">
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={item.author.avatar} />
                            <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{item.author.name}</span>
                        </div>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-3">
                          <span>{item.views} views</span>
                          <span>{item.likes} likes</span>
                          <span>{item.comments} comments</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(item.id);
                              }}
                              className={item.likes > 0 ? 'text-red-500' : ''}
                            >
                              <Heart className="w-4 h-4" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Like</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(item.id);
                              }}
                            >
                              <Bookmark className="w-4 h-4" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Bookmark</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(item.id);
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </IconButton>
                          </TooltipTrigger>
                          <TooltipContent>Share</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <IconButton size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </IconButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleContentEdit(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleContentDelete(item.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Type Filter */}
        <div>
          <Label className="text-sm font-medium">Content Type</Label>
          <div className="mt-2 space-y-2">
            {['article', 'news', 'video', 'audio', 'podcast', 'image', 'code'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.type.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilterChange({ type: [...filters.type, type] });
                    } else {
                      handleFilterChange({ type: filters.type.filter(t => t !== type) });
                    }
                  }}
                />
                <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <Select
            value={filters.category[0] || ''}
            onValueChange={(value) => handleFilterChange({ category: value ? [value] : [] })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="defi">DeFi</SelectItem>
              <SelectItem value="nft">NFT</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="trading">Trading</SelectItem>
              <SelectItem value="regulation">Regulation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <Label className="text-sm font-medium">Difficulty</Label>
          <RadioGroup
            value={filters.difficulty[0] || ''}
            onValueChange={(value) => handleFilterChange({ difficulty: value ? [value] : [] })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="difficulty-beginner" />
              <Label htmlFor="difficulty-beginner">Beginner</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="difficulty-intermediate" />
              <Label htmlFor="difficulty-intermediate">Intermediate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="difficulty-advanced" />
              <Label htmlFor="difficulty-advanced">Advanced</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Date Range Filter */}
        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="mt-2 space-y-2">
            <div>
              <Label htmlFor="date-start" className="text-xs">From</Label>
              <Input
                id="date-start"
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange({
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="date-end" className="text-xs">To</Label>
              <Input
                id="date-end"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange({
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Featured Filter */}
        <div>
          <Label className="text-sm font-medium">Featured Content</Label>
          <Switch
            checked={filters.featured === true}
            onCheckedChange={(checked) => handleFilterChange({ featured: checked ? true : null })}
            className="mt-2"
          />
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() => setFilters({
            type: [],
            category: [],
            tags: [],
            author: [],
            dateRange: { start: '', end: '' },
            status: [],
            featured: null,
            difficulty: []
          })}
          className="w-full"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalEngagement}%</div>
              <p className="text-xs text-muted-foreground">
                +5.4% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">
                +180 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contentStats.total}</div>
              <p className="text-xs text-muted-foreground">
                +12 new this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Content Performance by Type</CardTitle>
            <CardDescription>
              Views and engagement metrics for different content types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.contentPerformance.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize font-medium">{item.type}</span>
                    <Badge variant="secondary">{item.views} views</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={item.engagement} className="w-24" />
                    <span className="text-sm text-muted-foreground">{item.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>
              Most viewed and engaged content this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topContent.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.views} views • {item.likes} likes
                    </p>
                  </div>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>
              Geographic and device distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Top Locations</h4>
                {analyticsData.userDemographics.slice(0, 5).map((demo) => (
                  <div key={demo.location} className="flex items-center justify-between text-sm">
                    <span>{demo.location}</span>
                    <span className="font-medium">{demo.count} users</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Device Types</h4>
                {analyticsData.userDemographics.slice(5, 10).map((demo) => (
                  <div key={demo.device} className="flex items-center justify-between text-sm">
                    <span>{demo.device}</span>
                    <span className="font-medium">{demo.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUserManagement = () => {
    if (!usersData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserManage(user)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Shield className="w-4 h-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderContentDetail = () => {
    if (!selectedContent) return null;

    return (
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{selectedContent.title}</DialogTitle>
                <DialogDescription className="mt-2">
                  {selectedContent.description}
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedContent.type}</Badge>
                {selectedContent.featured && (
                  <Badge variant="default" className="bg-yellow-500">Featured</Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Media Content */}
            {selectedContent.media.length > 0 && (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedContent.type === 'video' && (
                  <video
                    src={selectedContent.media[0].url}
                    controls
                    className="w-full h-full object-cover"
                    poster={selectedContent.media[0].thumbnail}
                  />
                )}
                {selectedContent.type === 'audio' && (
                  <div className="flex items-center justify-center h-full">
                    <audio
                      src={selectedContent.media[0].url}
                      controls
                      className="w-full max-w-md"
                    />
                  </div>
                )}
                {selectedContent.type === 'image' && (
                  <img
                    src={selectedContent.media[0].url}
                    alt={selectedContent.media[0].alt}
                    className="w-full h-full object-cover"
                  />
                )}
                {selectedContent.type === 'code' && (
                  <pre className="p-4 bg-gray-900 text-green-400 overflow-x-auto text-sm">
                    <code>{selectedContent.content}</code>
                  </pre>
                )}
              </div>
            )}

            {/* Content Body */}
            {selectedContent.type !== 'code' && (
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold">{selectedContent.views}</p>
                <p className="text-sm text-gray-600">Views</p>
              </div>
              <div className="text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{selectedContent.likes}</p>
                <p className="text-sm text-gray-600">Likes</p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{selectedContent.comments}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
              <div className="text-center">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{selectedContent.shares}</p>
                <p className="text-sm text-gray-600">Shares</p>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedContent.author.avatar} />
                <AvatarFallback>{selectedContent.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{selectedContent.author.name}</h4>
                <p className="text-sm text-gray-600">{selectedContent.author.role}</p>
                <p className="text-xs text-gray-500">
                  Published {new Date(selectedContent.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLike(selectedContent.id)}
                  className={selectedContent.likes > 0 ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBookmark(selectedContent.id)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(selectedContent.id)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Tags */}
            {selectedContent.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Content */}
            {selectedContent.related.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Related Content</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedContent.related.slice(0, 4).map((relatedId) => (
                    <Card key={relatedId} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <p className="text-sm">Related content would be displayed here</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (contentLoading && !contentData) {
    return <LoadingState />;
  }

  if (contentError) {
    return <ErrorState error={contentError} onRetry={refetchContent} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <PageTitle
                title="Cryptocurrency & Blockchain"
                subtitle="Comprehensive resources for crypto, DeFi, NFTs, and blockchain technology"
                icon={<Zap className="w-8 h-8 text-orange-500" />}
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search crypto content..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode.layout === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange({ layout: 'grid' })}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode.layout === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange({ layout: 'list' })}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Admin Toggle */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
                <Button
                  variant={isAdminMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsAdminMode(!isAdminMode)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}

              {/* Create Content Button */}
              {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
                <Button onClick={handleContentCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!isAuthenticated || user?.role !== 'admin'}>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" disabled={!isAuthenticated || user?.role !== 'admin'}>
              Users
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">Crypto Content</h2>
                <Badge variant="secondary">{contentStats.total} items</Badge>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <Select
                  value={`${sort.field}:${sort.direction}`}
                  onValueChange={(value) => {
                    const [field, direction] = value.split(':');
                    handleSortChange({ field: field as any, direction: direction as any });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publishedAt:desc">Newest First</SelectItem>
                    <SelectItem value="publishedAt:asc">Oldest First</SelectItem>
                    <SelectItem value="views:desc">Most Viewed</SelectItem>
                    <SelectItem value="likes:desc">Most Liked</SelectItem>
                    <SelectItem value="title:asc">Title A-Z</SelectItem>
                    <SelectItem value="title:desc">Title Z-A</SelectItem>
                  </SelectContent>
                </Select>

                {/* Items per page */}
                <Select
                  value={viewMode.itemsPerPage.toString()}
                  onValueChange={(value) => handleViewModeChange({ itemsPerPage: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              {viewMode.showFilters && (
                <div className="lg:col-span-1">
                  {renderFilters()}
                </div>
              )}

              {/* Content Grid/List */}
              <div className={cn("space-y-6", viewMode.showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
                {viewMode.layout === 'grid' ? renderContentGrid() : renderContentList()}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? <LoadingState /> : renderAnalytics()}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {usersLoading ? <LoadingState /> : renderUserManagement()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Configure how crypto content is displayed and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-filters">Show Filters Sidebar</Label>
                    <p className="text-sm text-muted-foreground">
                      Display filtering options on the left side
                    </p>
                  </div>
                  <Switch
                    id="show-filters"
                    checked={viewMode.showFilters}
                    onCheckedChange={(checked) => handleViewModeChange({ showFilters: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-analytics">Show Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Display analytics dashboard (admin only)
                    </p>
                  </div>
                  <Switch
                    id="show-analytics"
                    checked={viewMode.showAnalytics}
                    onCheckedChange={(checked) => handleViewModeChange({ showAnalytics: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Default View Mode</Label>
                  <RadioGroup
                    value={viewMode.layout}
                    onValueChange={(value: 'grid' | 'list') => handleViewModeChange({ layout: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="grid" id="view-grid" />
                      <Label htmlFor="view-grid">Grid View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="list" id="view-list" />
                      <Label htmlFor="view-list">List View</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium">Items Per Page</Label>
                  <Select
                    value={viewMode.itemsPerPage.toString()}
                    onValueChange={(value) => handleViewModeChange({ itemsPerPage: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Detail Modal */}
      {renderContentDetail()}

      {/* Notifications */}
      <NotificationSystem />

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 HandyWriterz. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Comprehensive cryptocurrency and blockchain education platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Crypto;
