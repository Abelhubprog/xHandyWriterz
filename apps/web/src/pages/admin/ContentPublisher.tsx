/**
 * ContentPublisher - Production-ready Strapi 5 content publishing interface
 * 
 * Features:
 * - Create/Edit services and articles
 * - Rich text editor with media uploads
 * - Preview before publish
 * - Scheduled publishing
 * - SEO optimization
 * - Multi-domain support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Send, Clock, ArrowLeft, Calendar, Tag,
  Image as ImageIcon, Upload, Globe, AlertCircle, CheckCircle,
  Loader2, X, Plus, Trash2, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { cmsClient, uploadMedia } from '@/lib/cms-client';
import { DOMAIN_TAGS, TYPE_TAGS } from '@/config/taxonomy';
import { generatePreviewToken, encodePreviewToken, type PreviewToken } from '@/lib/preview-tokens';

type ContentType = 'service' | 'article';

interface ContentFormData {
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  body: string;
  domain: string;
  typeTags: string[];
  heroImageUrl: string;
  publishedAt: string | null;
  status: 'draft' | 'published';
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export const ContentPublisher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();

  const isEditing = Boolean(id && id !== 'new');
  const contentType = (searchParams.get('type') as ContentType) || 'article';

  const [formData, setFormData] = useState<ContentFormData>({
    type: contentType,
    title: '',
    slug: '',
    summary: '',
    body: '',
    domain: '',
    typeTags: [],
    heroImageUrl: '',
    publishedAt: null,
    status: 'draft',
    seo: {
      title: '',
      description: '',
      keywords: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewToken, setPreviewToken] = useState<PreviewToken | null>(null);

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Load existing content if editing
  useEffect(() => {
    if (isEditing && id) {
      loadContent();
    }
  }, [id, isEditing]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.VITE_CMS_URL}/api/${formData.type}s/${id}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.VITE_CMS_TOKEN}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load content');

      const data = await response.json();
      const content = data.data;

      setFormData({
        type: formData.type,
        title: content.title || '',
        slug: content.slug || '',
        summary: content.summary || '',
        body: content.body || '',
        domain: content.domain || '',
        typeTags: content.typeTags || [],
        heroImageUrl: content.heroImage?.url || '',
        publishedAt: content.publishedAt || null,
        status: content.status || 'draft',
        seo: {
          title: content.seo?.title || '',
          description: content.seo?.description || '',
          keywords: content.seo?.keywords || '',
        },
      });
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo: {
        ...prev.seo,
        title: title.slice(0, 60),
      },
    }));
  };

  const handleSummaryChange = (summary: string) => {
    setFormData((prev) => ({
      ...prev,
      summary,
      seo: {
        ...prev.seo,
        description: summary.slice(0, 160),
      },
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedMedia = await uploadMedia(file);
      setFormData((prev) => ({
        ...prev,
        heroImageUrl: uploadedMedia.url,
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return false;
    }
    if (!formData.summary.trim()) {
      toast.error('Summary is required');
      return false;
    }
    if (!formData.body.trim()) {
      toast.error('Content body is required');
      return false;
    }
    if (!formData.domain) {
      toast.error('Domain is required');
      return false;
    }
    return true;
  };

  const saveDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        data: {
          title: formData.title,
          slug: formData.slug,
          summary: formData.summary,
          body: formData.body,
          domain: formData.domain,
          typeTags: formData.typeTags,
          heroImage: formData.heroImageUrl,
          status: 'draft',
          seo: formData.seo,
        },
      };

      const url = isEditing
        ? `${process.env.VITE_CMS_URL}/api/${formData.type}s/${id}`
        : `${process.env.VITE_CMS_URL}/api/${formData.type}s`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VITE_CMS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      const result = await response.json();
      toast.success('Draft saved successfully');

      if (!isEditing) {
        navigate(`/admin/content/${result.data.id}?type=${formData.type}`);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const publishContent = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        data: {
          title: formData.title,
          slug: formData.slug,
          summary: formData.summary,
          body: formData.body,
          domain: formData.domain,
          typeTags: formData.typeTags,
          heroImage: formData.heroImageUrl,
          status: 'published',
          publishedAt: formData.publishedAt || new Date().toISOString(),
          seo: formData.seo,
        },
      };

      const url = isEditing
        ? `${process.env.VITE_CMS_URL}/api/${formData.type}s/${id}`
        : `${process.env.VITE_CMS_URL}/api/${formData.type}s`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VITE_CMS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to publish content');

      const result = await response.json();
      toast.success('Content published successfully!');

      // Trigger cache purge webhook if configured
      if (process.env.VITE_CACHE_PURGE_WEBHOOK) {
        await fetch(process.env.VITE_CACHE_PURGE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            slug: formData.slug,
            domain: formData.domain,
          }),
        }).catch(console.warn);
      }

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
    } finally {
      setSaving(false);
    }
  };

  const generatePreview = async () => {
    if (!isEditing || !id) {
      toast.error('Save as draft first to generate preview');
      return;
    }

    try {
      const token = generatePreviewToken(formData.type, id);
      setPreviewToken(token);
      
      const encodedToken = encodePreviewToken(token);
      const previewUrl = `/preview?token=${encodedToken}&type=${formData.type}&id=${id}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      toast.success('Preview opened in new tab');
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate preview token');
    }
  };

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to publish content.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit' : 'Create'} {formData.type === 'service' ? 'Service' : 'Article'} | Admin</title>
      </Helmet>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit' : 'Create'} {formData.type === 'service' ? 'Service' : 'Article'}
              </h1>
              <p className="text-gray-600 mt-1">
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={generatePreview}
              disabled={!isEditing || saving}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={publishContent}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter content title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Summary *</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    placeholder="Brief summary (160 characters recommended)"
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.summary.length} / 160 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="body">Content Body *</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Write your content here..."
                    rows={15}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    value={formData.seo.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value },
                      })
                    }
                    placeholder="SEO title (60 characters)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="seo-description">SEO Description</Label>
                  <Textarea
                    id="seo-description"
                    value={formData.seo.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, description: e.target.value },
                      })
                    }
                    placeholder="SEO description (160 characters)"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="seo-keywords">Keywords</Label>
                  <Input
                    id="seo-keywords"
                    value={formData.seo.keywords}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, keywords: e.target.value },
                      })
                    }
                    placeholder="keyword1, keyword2, keyword3"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.heroImageUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={formData.heroImageUrl}
                        alt="Hero"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, heroImageUrl: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="hero-upload">
                      <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        {uploadingImage ? (
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Upload Image</span>
                          </div>
                        )}
                      </div>
                    </Label>
                    <Input
                      id="hero-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="domain">Domain *</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) => setFormData({ ...formData, domain: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_TAGS.map((domain) => (
                        <SelectItem key={domain.slug} value={domain.slug}>
                          {domain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TYPE_TAGS.map((tag) => {
                      const isSelected = formData.typeTags.includes(tag.slug);
                      return (
                        <Badge
                          key={tag.slug}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              typeTags: isSelected
                                ? formData.typeTags.filter((t) => t !== tag.slug)
                                : [...formData.typeTags, tag.slug],
                            });
                          }}
                        >
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="publish-date">Publish Date</Label>
                  <Input
                    id="publish-date"
                    type="datetime-local"
                    value={formData.publishedAt || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedAt: e.target.value })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to publish immediately
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentPublisher;
