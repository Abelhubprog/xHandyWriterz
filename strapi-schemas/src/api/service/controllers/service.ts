/**
 * Service controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::service.service', ({ strapi }) => ({
  /**
   * Retrieve services with enhanced filtering and population
   */
  async find(ctx) {
    const { query } = ctx;

    // Sanitize query parameters
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Add default population for commonly needed relations
    const defaultPopulate = {
      heroImage: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      seo: {
        populate: {
          ogImage: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
      attachments: {
        fields: ['name', 'alternativeText', 'caption', 'ext', 'mime', 'size', 'url'],
      },
    };

    // Merge with custom populate if provided
    sanitizedQuery.populate = sanitizedQuery.populate || defaultPopulate;

    // Add default sorting by publication date (newest first)
    if (!sanitizedQuery.sort) {
      sanitizedQuery.sort = { publishedAt: 'desc', updatedAt: 'desc' };
    }

    // Execute query with enhanced parameters
    const { results, pagination } = await strapi.entityService.findPage('api::service.service', sanitizedQuery);

    // Transform results to include computed fields
    const transformedResults = results.map(service => ({
      ...service,
      readingTime: this.calculateReadingTime(service.body),
      excerpt: this.generateExcerpt(service.summary || service.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Retrieve a single service with full population
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Full population for single service view
    const fullPopulate = {
      heroImage: {
        fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
      },
      seo: {
        populate: {
          ogImage: {
            fields: ['name', 'alternativeText', 'url', 'formats'],
          },
        },
      },
      attachments: {
        fields: ['name', 'alternativeText', 'caption', 'ext', 'mime', 'size', 'url', 'createdAt'],
      },
    };

    sanitizedQuery.populate = sanitizedQuery.populate || fullPopulate;

    const entity = await strapi.entityService.findOne('api::service.service', id, sanitizedQuery);

    if (!entity) {
      return ctx.notFound('Service not found');
    }

    // Add computed fields
    const transformedEntity = {
      ...entity,
      readingTime: this.calculateReadingTime(entity.body),
      wordCount: this.calculateWordCount(entity.body),
      lastModified: entity.updatedAt,
    };

    return this.transformResponse(transformedEntity);
  },

  /**
   * Create a new service with validation
   */
  async create(ctx) {
    const { data } = ctx.request.body;

    // Validate required fields
    if (!data.title || !data.slug) {
      return ctx.badRequest('Title and slug are required');
    }

    // Check for slug uniqueness
    const existingService = await strapi.entityService.findMany('api::service.service', {
      filters: { slug: data.slug },
      limit: 1,
    });

    if (existingService.length > 0) {
      return ctx.badRequest('A service with this slug already exists');
    }

    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = strapi.utils.slugify(data.title);
    }

    // Set publication state
    if (data.publishedAt && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const entity = await strapi.entityService.create('api::service.service', {
      data,
      populate: {
        heroImage: true,
        seo: { populate: { ogImage: true } },
        attachments: true,
      },
    });

    return this.transformResponse(entity);
  },

  /**
   * Update a service with validation
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    // Check if service exists
    const existingService = await strapi.entityService.findOne('api::service.service', id);
    if (!existingService) {
      return ctx.notFound('Service not found');
    }

    // Validate slug uniqueness if changed
    if (data.slug && data.slug !== existingService.slug) {
      const duplicateService = await strapi.entityService.findMany('api::service.service', {
        filters: { slug: data.slug, id: { $ne: id } },
        limit: 1,
      });

      if (duplicateService.length > 0) {
        return ctx.badRequest('A service with this slug already exists');
      }
    }

    // Handle publication state changes
    if (data.publishedAt === null) {
      // Unpublishing
      data.publishedAt = null;
    } else if (data.publishedAt && !existingService.publishedAt) {
      // Publishing for the first time
      data.publishedAt = new Date();
    }

    const entity = await strapi.entityService.update('api::service.service', id, {
      data,
      populate: {
        heroImage: true,
        seo: { populate: { ogImage: true } },
        attachments: true,
      },
    });

    return this.transformResponse(entity);
  },

  /**
   * Delete a service with cleanup
   */
  async delete(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.entityService.findOne('api::service.service', id, {
      populate: {
        attachments: true,
        heroImage: true,
        seo: { populate: { ogImage: true } },
      },
    });

    if (!entity) {
      return ctx.notFound('Service not found');
    }

    // Note: File cleanup is handled by Strapi's lifecycle hooks
    await strapi.entityService.delete('api::service.service', id);

    return this.transformResponse(entity);
  },

  /**
   * Get services by domain
   */
  async findByDomain(ctx) {
    const { domain } = ctx.params;
    const { query } = ctx;

    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Add domain filter
    sanitizedQuery.filters = {
      ...sanitizedQuery.filters,
      domain: { $eq: domain },
      publishedAt: { $notNull: true }, // Only published services
    };

    // Default population
    sanitizedQuery.populate = sanitizedQuery.populate || {
      heroImage: true,
      seo: true,
    };

    const { results, pagination } = await strapi.entityService.findPage('api::service.service', sanitizedQuery);

    const transformedResults = results.map(service => ({
      ...service,
      readingTime: this.calculateReadingTime(service.body),
      excerpt: this.generateExcerpt(service.summary || service.body, 160),
    }));

    return this.transformResponse(transformedResults, { pagination });
  },

  /**
   * Preview a service (including unpublished)
   */
  async preview(ctx) {
    const { id } = ctx.params;
    const { token } = ctx.query;

    // Validate preview token (implement your token validation logic)
    if (!token || !this.validatePreviewToken(token, id)) {
      return ctx.unauthorized('Invalid preview token');
    }

    // Fetch service regardless of publication state
    const entity = await strapi.entityService.findOne('api::service.service', id, {
      publicationState: 'preview',
      populate: {
        heroImage: true,
        seo: { populate: { ogImage: true } },
        attachments: true,
      },
    });

    if (!entity) {
      return ctx.notFound('Service not found');
    }

    const transformedEntity = {
      ...entity,
      readingTime: this.calculateReadingTime(entity.body),
      wordCount: this.calculateWordCount(entity.body),
      isPreview: true,
    };

    return this.transformResponse(transformedEntity);
  },

  // Helper methods
  calculateReadingTime(content) {
    if (!content || typeof content !== 'string') return 0;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  calculateWordCount(content) {
    if (!content || typeof content !== 'string') return 0;
    return content.split(/\s+/).length;
  },

  generateExcerpt(content, maxLength = 160) {
    if (!content) return '';
    const stripped = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength - 3) + '...'
      : stripped;
  },

  validatePreviewToken(token, serviceId) {
    // Implement your preview token validation logic
    // This could verify a JWT or check against a stored token
    try {
      // Basic validation - replace with your implementation
      return token && token.length > 10;
    } catch (error) {
      return false;
    }
  },
}));
