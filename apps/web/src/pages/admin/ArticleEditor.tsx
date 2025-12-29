import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Share2, Settings, Clock, CheckCircle, Users,
  AlertCircle, ArrowLeft, Calendar, Tag, Image as ImageIcon,
  Upload, Link2, Globe, Lock, Send, MessageSquare, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import RichEditor from '@/components/editor/RichEditor';
import { cmsClient, uploadMedia } from '@/lib/cms';
import type { Article, ContentBlock } from '@/types/publishing';
import { DOMAIN_TAGS, TYPE_TAGS } from '@/config/taxonomy';
import { useAuth } from '@/hooks/useAuth';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

const ARTICLE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'review', label: 'Under Review', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'red' },
];

interface ArticleFormData {
  title: string;
  slug: string;
  summary: string;
  content: ContentBlock[];
  status: Article['status'];
  domain: string;
  categories: string[];
  tags: string[];
  heroImage: string;
  scheduledAt: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
}

export const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { getToken } = useClerkAuth();

  const isEditing = Boolean(id && id !== 'new');
  const initialDomain = searchParams.get('domain') || '';

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    summary: '',
    content: [],
    status: 'draft',
    domain: initialDomain,
    categories: [],
    tags: [],
    heroImage: '',
    scheduledAt: '',
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const getAdminToken = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      toast.error('Authentication required');
      throw new Error('Missing auth token');
    }
    return token;
  }, [getToken]);

  // Load existing article if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadArticle = async () => {
        setLoading(true);
        try {
          const authToken = await getAdminToken();
          const article = await cmsClient.getArticle(id, authToken);
          if (article) {
            const attrs = article.attributes;
            setFormData({
              title: attrs.title || '',
              slug: attrs.slug || '',
              summary: attrs.summary || '',
              content: typeof attrs.content === 'string' ? JSON.parse(attrs.content) : attrs.content || [],
              status: attrs.status || 'draft',
              domain: attrs.domain || '',
              categories: attrs.categories || [],
              tags: attrs.tags || [],
              heroImage: attrs.heroImage?.data?.attributes?.url || '',
              scheduledAt: attrs.scheduledAt || '',
              seo: {
                title: attrs.seo?.title || '',
                description: attrs.seo?.description || '',
                keywords: attrs.seo?.keywords || [],
                ogImage: attrs.seo?.ogImage?.data?.attributes?.url || '',
              },
            });
          }
        } catch (error) {
          console.error('Failed to load article:', error);
          toast.error('Failed to load article');
        } finally {
          setLoading(false);
        }
      };

      loadArticle();
    }
  }, [isEditing, id]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges || !autoSaveEnabled || !isEditing) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasChanges, autoSaveEnabled, isEditing]);

  // Update slug when title changes
  useEffect(() => {
    if (formData.title && !isEditing) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, generateSlug, isEditing]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [formData]);

  const handleInputChange = <K extends keyof ArticleFormData>(
    field: K,
    value: ArticleFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeoChange = <K extends keyof ArticleFormData['seo']>(
    field: K,
    value: ArticleFormData['seo'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file: File, field: 'heroImage' | 'ogImage') => {
    try {
      const authToken = await getAdminToken();
      const result = await uploadMedia(file, {
        alt: formData.title,
        folder: `articles/${formData.domain}`,
      }, authToken);

      if (result && result[0]) {
        const imageUrl = result[0].url;
        if (field === 'heroImage') {
          handleInputChange('heroImage', imageUrl);
        } else {
          handleSeoChange('ogImage', imageUrl);
        }
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const articleData: Partial<Article> = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        content: formData.content,
        status: formData.status,
        domain: formData.domain,
        categories: formData.categories,
        tags: formData.tags,
        heroImage: formData.heroImage,
        scheduledAt: formData.scheduledAt || undefined,
        seo: formData.seo,
        authorId: user?.id || '',
      };

      const authToken = await getAdminToken();
      let result;
      if (isEditing && id) {
        result = await cmsClient.updateArticle(id, articleData, authToken);
      } else {
        result = await cmsClient.createArticle(articleData, authToken);
      }

      if (result) {
        setHasChanges(false);
        if (!isAutoSave) {
          toast.success(isEditing ? 'Article updated' : 'Article created');
          if (!isEditing) {
            navigate(`/admin/content/${result.createArticle?.data?.id || 'edit'}`);
          }
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (!isAutoSave) {
        toast.error('Failed to save article');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      // First save the article
      await handleSave();

      // Then publish it
      if (isEditing && id) {
        const authToken = await getAdminToken();
        await cmsClient.publishArticle(id, formData.scheduledAt || undefined, authToken);
        setFormData(prev => ({ ...prev, status: 'published' }));
        toast.success('Article published successfully');
      }
    } catch (error) {
      console.error('Publish failed:', error);
      toast.error('Failed to publish article');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new window/tab
    if (isEditing && id) {
      window.open(`/preview/article/${id}?token=${user?.id}`, '_blank');
    } else {
      setShowPreview(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit articles.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? `Edit: ${formData.title || 'Untitled'}` : 'Create Article'} | HandyWriterz
        </title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/content')}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Article' : 'Create Article'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      {hasChanges ? (
                        <>
                          <Clock className="h-4 w-4 mr-1 text-orange-500" />
                          Unsaved changes
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Saved
                        </>
                      )}
                    </div>
                    {autoSaveEnabled && (
                      <span>Auto-save enabled</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!formData.title}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>

                {formData.status !== 'published' && (
                  <Button
                    onClick={handlePublish}
                    disabled={saving || !formData.title}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Publish
                  </Button>
                )}

                <Button
                  onClick={() => handleSave()}
                  disabled={saving || !hasChanges}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {/* Title and Basic Info */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <Label htmlFor="title" className="text-base font-medium">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter article title..."
                        className="text-2xl font-semibold h-12 mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug" className="text-sm font-medium">
                        URL Slug
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="article-url-slug"
                        className="mt-1 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="summary" className="text-sm font-medium">
                        Summary
                      </Label>
                      <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        placeholder="Brief summary of the article..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Rich Editor */}
                  <div className="border-t pt-8">
                    <Label className="text-base font-medium mb-4 block">
                      Content
                    </Label>
                    <RichEditor
                      initialContent={formData.content}
                      onContentChange={(content) => handleInputChange('content', content)}
                      onSave={() => handleSave()}
                      showCollaboration={collaborationEnabled}
                      documentId={id}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publication Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Publication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as Article['status'])}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      {ARTICLE_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.status === 'scheduled' && (
                    <div>
                      <Label htmlFor="scheduledAt" className="text-sm font-medium">
                        Publish Date
                      </Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Badge
                      variant="outline"
                      className={`
                        ${formData.status === 'published' ? 'border-green-500 text-green-700 bg-green-50' : ''}
                        ${formData.status === 'draft' ? 'border-gray-500 text-gray-700 bg-gray-50' : ''}
                        ${formData.status === 'review' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}
                        ${formData.status === 'scheduled' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                      `}
                    >
                      {ARTICLE_STATUSES.find(s => s.value === formData.status)?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Categorization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Domain</Label>
                    <select
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select domain...</option>
                      {DOMAIN_TAGS.map(domain => (
                        <option key={domain.slug} value={domain.slug}>
                          {domain.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleTagRemove(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add tags..."
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value) {
                            handleTagAdd(value);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.heroImage ? (
                    <div className="relative">
                      <img
                        src={formData.heroImage}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleInputChange('heroImage', '')}
                        className="absolute top-2 right-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No image selected</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleImageUpload(file, 'heroImage');
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle" className="text-sm font-medium">
                      SEO Title
                    </Label>
                    <Input
                      id="seoTitle"
                      value={formData.seo.title}
                      onChange={(e) => handleSeoChange('title', e.target.value)}
                      placeholder={formData.title || 'SEO title...'}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoDescription" className="text-sm font-medium">
                      Meta Description
                    </Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seo.description}
                      onChange={(e) => handleSeoChange('description', e.target.value)}
                      placeholder={formData.summary || 'Meta description...'}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Keywords</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.seo.keywords.map(keyword => (
                        <Badge
                          key={keyword}
                          variant="outline"
                          className="text-xs cursor-pointer"
                          onClick={() => handleSeoChange('keywords',
                            formData.seo.keywords.filter(k => k !== keyword)
                          )}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add SEO keywords..."
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value && !formData.seo.keywords.includes(value)) {
                            handleSeoChange('keywords', [...formData.seo.keywords, value]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Editor Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Editor Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSave" className="text-sm font-medium">
                      Auto-save
                    </Label>
                    <Switch
                      id="autoSave"
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="collaboration" className="text-sm font-medium">
                      Collaboration
                    </Label>
                    <Switch
                      id="collaboration"
                      checked={collaborationEnabled}
                      onCheckedChange={setCollaborationEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleEditor;
