/**
 * Article router
 */

export default {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'POST',
      path: '/articles',
      handler: 'article.create',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/articles/:id',
      handler: 'article.update',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'DELETE',
      path: '/articles/:id',
      handler: 'article.delete',
      config: {
        policies: ['global::is-authenticated', 'global::can-delete'],
      },
    },

    // Author filtering routes
    {
      method: 'GET',
      path: '/articles/author/:authorId',
      handler: 'article.findByAuthor',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Category filtering routes
    {
      method: 'GET',
      path: '/articles/category/:categorySlug',
      handler: 'article.findByCategory',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Tag filtering routes
    {
      method: 'GET',
      path: '/articles/tag/:tagSlug',
      handler: 'article.findByTag',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Search routes
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'article.search',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Analytics routes
    {
      method: 'GET',
      path: '/articles/:id/analytics',
      handler: 'article.getAnalytics',
    },
    {
      method: 'POST',
      path: '/articles/:id/views',
      handler: 'article.incrementViews',
    },

    // Preview routes (authenticated)
    {
      method: 'GET',
      path: '/articles/preview/:id',
      handler: 'article.findOne',
      config: {
        middlewares: ['api::article.validate-preview-token', 'api::article.populate-defaults'],
      },
    },

    // Bulk operations (authenticated)
    {
      method: 'POST',
      path: '/articles/bulk/publish',
      handler: 'article.bulkPublish',
      config: {
        policies: ['global::is-authenticated', 'global::can-publish'],
      },
    },
    {
      method: 'POST',
      path: '/articles/bulk/unpublish',
      handler: 'article.bulkUnpublish',
      config: {
        policies: ['global::is-authenticated', 'global::can-publish'],
      },
    },
    {
      method: 'DELETE',
      path: '/articles/bulk/delete',
      handler: 'article.bulkDelete',
      config: {
        policies: ['global::is-authenticated', 'global::can-delete'],
      },
    },

    // Content management utilities (authenticated)
    {
      method: 'GET',
      path: '/articles/drafts',
      handler: 'article.find',
      config: {
        middlewares: ['api::article.populate-defaults'],
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/articles/published',
      handler: 'article.find',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/duplicate',
      handler: 'article.duplicate',
      config: {
        policies: ['global::is-authenticated'],
      },
    },

    // Export routes (authenticated)
    {
      method: 'GET',
      path: '/articles/export/csv',
      handler: 'article.exportCSV',
      config: {
        policies: ['global::is-authenticated', 'global::can-export'],
      },
    },
    {
      method: 'GET',
      path: '/articles/export/json',
      handler: 'article.exportJSON',
      config: {
        policies: ['global::is-authenticated', 'global::can-export'],
      },
    },

    // Category management routes
    {
      method: 'GET',
      path: '/articles/categories',
      handler: 'article.getCategories',
    },
    {
      method: 'GET',
      path: '/articles/categories/:slug/count',
      handler: 'article.getCategoryCount',
    },

    // Tag management routes
    {
      method: 'GET',
      path: '/articles/tags',
      handler: 'article.getTags',
    },
    {
      method: 'GET',
      path: '/articles/tags/:slug/count',
      handler: 'article.getTagCount',
    },

    // Author management routes
    {
      method: 'GET',
      path: '/articles/authors',
      handler: 'article.getAuthors',
    },
    {
      method: 'GET',
      path: '/articles/authors/:id/stats',
      handler: 'article.getAuthorStats',
    },

    // Featured content routes
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'article.getFeatured',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/feature',
      handler: 'article.setFeatured',
      config: {
        policies: ['global::is-authenticated', 'global::can-feature'],
      },
    },
    {
      method: 'DELETE',
      path: '/articles/:id/feature',
      handler: 'article.unsetFeatured',
      config: {
        policies: ['global::is-authenticated', 'global::can-feature'],
      },
    },

    // Related content routes
    {
      method: 'GET',
      path: '/articles/:id/related',
      handler: 'article.getRelated',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Archive routes
    {
      method: 'GET',
      path: '/articles/archive/:year',
      handler: 'article.getByYear',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/articles/archive/:year/:month',
      handler: 'article.getByMonth',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // RSS and sitemap routes
    {
      method: 'GET',
      path: '/articles/rss.xml',
      handler: 'article.generateRSS',
    },
    {
      method: 'GET',
      path: '/articles/sitemap.xml',
      handler: 'article.generateSitemap',
    },

    // Advanced filtering routes
    {
      method: 'GET',
      path: '/articles/filter',
      handler: 'article.advancedFilter',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Trending and popular routes
    {
      method: 'GET',
      path: '/articles/trending',
      handler: 'article.getTrending',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/articles/popular',
      handler: 'article.getPopular',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/articles/recent',
      handler: 'article.getRecent',
      config: {
        middlewares: ['api::article.populate-defaults'],
      },
    },

    // Comment integration routes (if comments system enabled)
    {
      method: 'GET',
      path: '/articles/:id/comments',
      handler: 'article.getComments',
    },
    {
      method: 'POST',
      path: '/articles/:id/comments',
      handler: 'article.addComment',
      config: {
        policies: ['global::is-authenticated'],
      },
    },

    // Social sharing routes
    {
      method: 'POST',
      path: '/articles/:id/share',
      handler: 'article.trackShare',
    },
    {
      method: 'POST',
      path: '/articles/:id/like',
      handler: 'article.toggleLike',
      config: {
        policies: ['global::is-authenticated'],
      },
    },

    // Reading progress routes
    {
      method: 'POST',
      path: '/articles/:id/reading-progress',
      handler: 'article.updateReadingProgress',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/articles/:id/reading-progress',
      handler: 'article.getReadingProgress',
      config: {
        policies: ['global::is-authenticated'],
      },
    },

    // Content recommendations
    {
      method: 'GET',
      path: '/articles/recommendations',
      handler: 'article.getRecommendations',
      config: {
        middlewares: ['api::article.populate-defaults'],
        policies: ['global::is-authenticated'],
      },
    },

    // Publication workflow routes
    {
      method: 'POST',
      path: '/articles/:id/submit-review',
      handler: 'article.submitForReview',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/approve',
      handler: 'article.approve',
      config: {
        policies: ['global::is-authenticated', 'global::can-approve'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/reject',
      handler: 'article.reject',
      config: {
        policies: ['global::is-authenticated', 'global::can-approve'],
      },
    },

    // Version control routes
    {
      method: 'GET',
      path: '/articles/:id/versions',
      handler: 'article.getVersions',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/revert/:versionId',
      handler: 'article.revertToVersion',
      config: {
        policies: ['global::is-authenticated', 'global::can-revert'],
      },
    },
  ],
};
