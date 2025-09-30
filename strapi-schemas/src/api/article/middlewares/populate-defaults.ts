/**
 * `populate-defaults` middleware for Article API
 */

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    // Set default population for article requests
    if (!ctx.query.populate) {
      ctx.query.populate = {
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
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
            },
          },
        },
        category: {
          fields: ['name', 'slug', 'description', 'color'],
          populate: {
            icon: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
            },
          },
        },
        tags: {
          fields: ['name', 'slug', 'description', 'color'],
        },
        contributors: {
          fields: ['firstName', 'lastName', 'email', 'role'],
          populate: {
            avatar: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
            },
          },
        },
        seo: {
          populate: {
            metaImage: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
            },
          },
        },
        relatedArticles: {
          fields: ['title', 'slug', 'excerpt', 'publishedAt', 'readingTime'],
          populate: {
            heroImage: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'hash', 'ext', 'mime', 'size', 'url'],
            },
            author: {
              fields: ['firstName', 'lastName'],
            },
            category: {
              fields: ['name', 'slug', 'color'],
            },
          },
        },
      };
    }

    // Set default sorting if not specified
    if (!ctx.query.sort) {
      ctx.query.sort = ['publishedAt:desc', 'createdAt:desc'];
    }

    // Set default pagination if not specified
    if (!ctx.query.pagination) {
      ctx.query.pagination = {
        page: 1,
        pageSize: 25,
        withCount: true,
      };
    }

    // Filter out unpublished articles for public requests unless explicitly requested
    const isPreviewRequest = ctx.query.publicationState === 'preview';
    const isAuthenticated = ctx.state.user || ctx.state.auth;

    if (!isPreviewRequest && !isAuthenticated) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }

      // Only show published articles to public users
      ctx.query.filters.publishedAt = {
        $notNull: true,
        $lte: new Date().toISOString(),
      };
    }

    // Add default fields selection if not specified
    if (!ctx.query.fields) {
      ctx.query.fields = [
        'title',
        'slug',
        'excerpt',
        'body',
        'publishedAt',
        'createdAt',
        'updatedAt',
        'readingTime',
        'wordCount',
        'featured',
        'viewCount',
        'likeCount',
        'shareCount',
        'commentCount',
        'status',
        'locale',
      ];
    }

    // Handle locale filtering for internationalization
    if (ctx.query.locale && !ctx.query.filters?.locale) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }
      ctx.query.filters.locale = ctx.query.locale;
    }

    // Handle featured filter
    if (ctx.query.featured !== undefined) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }
      ctx.query.filters.featured = ctx.query.featured === 'true';
    }

    // Handle category filter
    if (ctx.query.category) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }
      ctx.query.filters.category = {
        slug: ctx.query.category,
      };
    }

    // Handle author filter
    if (ctx.query.authorId) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }
      ctx.query.filters.author = {
        id: ctx.query.authorId,
      };
    }

    // Handle tag filter
    if (ctx.query.tag) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }
      ctx.query.filters.tags = {
        slug: ctx.query.tag,
      };
    }

    // Handle date range filters
    if (ctx.query.dateFrom || ctx.query.dateTo) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }

      const dateFilter: any = {};
      if (ctx.query.dateFrom) {
        dateFilter.$gte = new Date(ctx.query.dateFrom).toISOString();
      }
      if (ctx.query.dateTo) {
        dateFilter.$lte = new Date(ctx.query.dateTo).toISOString();
      }

      ctx.query.filters.publishedAt = {
        ...ctx.query.filters.publishedAt,
        ...dateFilter,
      };
    }

    // Handle search query
    if (ctx.query.search) {
      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }

      ctx.query.filters.$or = [
        {
          title: {
            $containsi: ctx.query.search,
          },
        },
        {
          excerpt: {
            $containsi: ctx.query.search,
          },
        },
        {
          body: {
            $containsi: ctx.query.search,
          },
        },
        {
          'tags.name': {
            $containsi: ctx.query.search,
          },
        },
        {
          'category.name': {
            $containsi: ctx.query.search,
          },
        },
        {
          'author.firstName': {
            $containsi: ctx.query.search,
          },
        },
        {
          'author.lastName': {
            $containsi: ctx.query.search,
          },
        },
      ];
    }

    // Handle trending articles (high engagement in recent period)
    if (ctx.query.trending === 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (!ctx.query.filters) {
        ctx.query.filters = {};
      }

      ctx.query.filters.publishedAt = {
        ...ctx.query.filters.publishedAt,
        $gte: thirtyDaysAgo.toISOString(),
      };

      // Sort by engagement metrics
      ctx.query.sort = ['viewCount:desc', 'likeCount:desc', 'shareCount:desc', 'publishedAt:desc'];
    }

    // Handle popular articles (high view count)
    if (ctx.query.popular === 'true') {
      ctx.query.sort = ['viewCount:desc', 'likeCount:desc', 'publishedAt:desc'];
    }

    // Handle recent articles
    if (ctx.query.recent === 'true') {
      ctx.query.sort = ['publishedAt:desc', 'createdAt:desc'];
    }

    await next();
  };
};
