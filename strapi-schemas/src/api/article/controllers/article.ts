/**
 * Article controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  /**
   * Retrieve articles with enhanced filtering and population
   */
  async find(ctx: any): Promise<any> {
    const { query } = ctx;

    // Sanitize query parameters
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Add default population for commonly needed relations
    const defaultPopulate = {
      heroImage: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      gallery: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      attachments: {
        fields: ['name', 'alternativeText', 'caption', 'ext', 'mime', 'size', 'url'],
      },
      author: {
        fields: ['firstName', 'lastName', 'email', 'bio'],
        populate: {
          avatar: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
      category: {
        fields: ['name', 'slug', 'description'],
      },
      tags: {
        fields: ['name', 'slug'],
      },
      seo: {
        populate: {
          ogImage: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
    };

    sanitizedQuery.populate = {
      ...defaultPopulate,
      ...sanitizedQuery.populate,
    };

    // Execute query
    const { results, pagination } = await strapi.entityService.findPage('api::article.article', sanitizedQuery);

    // Transform results to include computed fields
    const transformedResults = results.map((article: any) => ({
      ...article,
      readingTime: this.calculateReadingTime(article.body),
      wordCount: this.calculateWordCount(article.body),
      excerpt: this.generateExcerpt(article.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Retrieve a single article by ID with enhanced population
   */
  async findOne(ctx: any): Promise<any> {
    const { id } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Enhanced population for single article view
    const populate = {
      heroImage: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      gallery: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      attachments: {
        fields: ['name', 'alternativeText', 'caption', 'ext', 'mime', 'size', 'url'],
      },
      author: {
        fields: ['firstName', 'lastName', 'email', 'bio'],
        populate: {
          avatar: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
      category: {
        fields: ['name', 'slug', 'description'],
      },
      tags: {
        fields: ['name', 'slug'],
      },
      seo: {
        populate: {
          ogImage: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
    };

    const entity = await strapi.entityService.findOne('api::article.article', id, {
      ...sanitizedQuery,
      populate,
    });

    if (!entity) {
      return ctx.notFound('Article not found');
    }

    // Add computed fields
    const transformedEntity = {
      ...entity,
      readingTime: this.calculateReadingTime(entity.body),
      wordCount: this.calculateWordCount(entity.body),
      excerpt: this.generateExcerpt(entity.body, 160),
    };

    return this.transformResponse(transformedEntity);
  },

  /**
   * Create a new article with validation
   */
  async create(ctx: any): Promise<any> {
    const { data } = ctx.request.body;

    // Validate required fields
    if (!data.title) {
      return ctx.badRequest('Title is required');
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.title);
    }

    // Validate slug uniqueness
    const existingArticle = await strapi.entityService.findMany('api::article.article', {
      filters: { slug: data.slug },
      limit: 1,
    });

    if (existingArticle.length > 0) {
      return ctx.badRequest('Slug already exists');
    }

    // Set metadata
    data.createdBy = ctx.state.user?.id;
    data.updatedBy = ctx.state.user?.id;

    const entity = await strapi.entityService.create('api::article.article', {
      data,
      populate: this.getDefaultPopulate(),
    });

    return this.transformResponse(entity);
  },

  /**
   * Update an existing article
   */
  async update(ctx: any): Promise<any> {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    // Check if article exists
    const existingArticle = await strapi.entityService.findOne('api::article.article', id);
    if (!existingArticle) {
      return ctx.notFound('Article not found');
    }

    // Validate slug uniqueness if slug is being updated
    if (data.slug && data.slug !== existingArticle.slug) {
      const slugExists = await strapi.entityService.findMany('api::article.article', {
        filters: {
          slug: data.slug,
          id: { $ne: id },
        },
        limit: 1,
      });

      if (slugExists.length > 0) {
        return ctx.badRequest('Slug already exists');
      }
    }

    // Set update metadata
    data.updatedBy = ctx.state.user?.id;

    const entity = await strapi.entityService.update('api::article.article', id, {
      data,
      populate: this.getDefaultPopulate(),
    });

    return this.transformResponse(entity);
  },

  /**
   * Delete an article
   */
  async delete(ctx: any): Promise<any> {
    const { id } = ctx.params;

    // Check if article exists
    const existingArticle = await strapi.entityService.findOne('api::article.article', id);
    if (!existingArticle) {
      return ctx.notFound('Article not found');
    }

    const entity = await strapi.entityService.delete('api::article.article', id);

    return this.transformResponse(entity);
  },

  /**
   * Get articles by author
   */
  async findByAuthor(ctx: any): Promise<any> {
    const { authorId } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const { results, pagination } = await strapi.entityService.findPage('api::article.article', {
      ...sanitizedQuery,
      filters: {
        ...sanitizedQuery.filters,
        author: authorId,
      },
      populate: this.getDefaultPopulate(),
    });

    const transformedResults = results.map((article: any) => ({
      ...article,
      readingTime: this.calculateReadingTime(article.body),
      wordCount: this.calculateWordCount(article.body),
      excerpt: this.generateExcerpt(article.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Get articles by category
   */
  async findByCategory(ctx: any): Promise<any> {
    const { categorySlug } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const { results, pagination } = await strapi.entityService.findPage('api::article.article', {
      ...sanitizedQuery,
      filters: {
        ...sanitizedQuery.filters,
        category: {
          slug: categorySlug,
        },
      },
      populate: this.getDefaultPopulate(),
    });

    const transformedResults = results.map((article: any) => ({
      ...article,
      readingTime: this.calculateReadingTime(article.body),
      wordCount: this.calculateWordCount(article.body),
      excerpt: this.generateExcerpt(article.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Get articles by tag
   */
  async findByTag(ctx: any): Promise<any> {
    const { tagSlug } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const { results, pagination } = await strapi.entityService.findPage('api::article.article', {
      ...sanitizedQuery,
      filters: {
        ...sanitizedQuery.filters,
        tags: {
          slug: tagSlug,
        },
      },
      populate: this.getDefaultPopulate(),
    });

    const transformedResults = results.map((article: any) => ({
      ...article,
      readingTime: this.calculateReadingTime(article.body),
      wordCount: this.calculateWordCount(article.body),
      excerpt: this.generateExcerpt(article.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Search articles
   */
  async search(ctx: any): Promise<any> {
    const { q } = ctx.query;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    if (!q) {
      return ctx.badRequest('Search query is required');
    }

    const { results, pagination } = await strapi.entityService.findPage('api::article.article', {
      ...sanitizedQuery,
      filters: {
        ...sanitizedQuery.filters,
        $or: [
          { title: { $containsi: q } },
          { body: { $containsi: q } },
          { excerpt: { $containsi: q } },
        ],
      },
      populate: this.getDefaultPopulate(),
    });

    const transformedResults = results.map((article: any) => ({
      ...article,
      readingTime: this.calculateReadingTime(article.body),
      wordCount: this.calculateWordCount(article.body),
      excerpt: this.generateExcerpt(article.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Get article analytics
   */
  async getAnalytics(ctx: any): Promise<any> {
    const { id } = ctx.params;

    const article = await strapi.entityService.findOne('api::article.article', id, {
      fields: ['id', 'title', 'slug', 'viewCount', 'likeCount', 'shareCount'],
    });

    if (!article) {
      return ctx.notFound('Article not found');
    }

    return this.transformResponse({
      id: article.id,
      title: article.title,
      slug: article.slug,
      viewCount: article.viewCount || 0,
      likeCount: article.likeCount || 0,
      shareCount: article.shareCount || 0,
      engagementRate: this.calculateEngagementRate(article),
    });
  },

  /**
   * Increment view count
   */
  async incrementViews(ctx: any): Promise<any> {
    const { id } = ctx.params;

    const article = await strapi.entityService.findOne('api::article.article', id);
    if (!article) {
      return ctx.notFound('Article not found');
    }

    const updatedArticle = await strapi.entityService.update('api::article.article', id, {
      data: {
        viewCount: (article.viewCount || 0) + 1,
      },
    });

    return this.transformResponse({
      id: updatedArticle.id,
      viewCount: updatedArticle.viewCount,
    });
  },

  // Helper methods
  getDefaultPopulate() {
    return {
      heroImage: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      gallery: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      attachments: {
        fields: ['name', 'alternativeText', 'caption', 'ext', 'mime', 'size', 'url'],
      },
      author: {
        fields: ['firstName', 'lastName', 'email', 'bio'],
        populate: {
          avatar: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
      category: {
        fields: ['name', 'slug', 'description'],
      },
      tags: {
        fields: ['name', 'slug'],
      },
      seo: {
        populate: {
          ogImage: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
    };
  },

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  calculateReadingTime(content: string): number {
    if (!content) return 0;

    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  calculateWordCount(content: string): number {
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  },

  generateExcerpt(content: string, maxLength: number = 160): string {
    if (!content) return '';

    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  },

  calculateEngagementRate(article: any): number {
    const views = article.viewCount || 0;
    const likes = article.likeCount || 0;
    const shares = article.shareCount || 0;

    if (views === 0) return 0;

    return ((likes + shares) / views) * 100;
  },
}));
