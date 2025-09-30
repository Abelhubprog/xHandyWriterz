/**
 * Service router
 */

export default {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/services',
      handler: 'service.find',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: ['api::service.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/services/:id',
      handler: 'service.findOne',
      config: {
        auth: false, // Public endpoint
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/services',
      handler: 'service.create',
      config: {
        auth: true, // Requires authentication
        policies: ['admin::is-authenticated', 'api::service.can-create'],
      },
    },
    {
      method: 'PUT',
      path: '/services/:id',
      handler: 'service.update',
      config: {
        auth: true, // Requires authentication
        policies: ['admin::is-authenticated', 'api::service.can-update'],
      },
    },
    {
      method: 'DELETE',
      path: '/services/:id',
      handler: 'service.delete',
      config: {
        auth: true, // Requires authentication
        policies: ['admin::is-authenticated', 'api::service.can-delete'],
      },
    },

    // Custom routes
    {
      method: 'GET',
      path: '/services/domain/:domain',
      handler: 'service.findByDomain',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: ['api::service.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/services/:id/preview',
      handler: 'service.preview',
      config: {
        auth: false, // Uses token-based auth
        policies: [],
        middlewares: ['api::service.validate-preview-token'],
      },
    },

    // Bulk operations
    {
      method: 'POST',
      path: '/services/bulk',
      handler: 'service.bulkCreate',
      config: {
        auth: true,
        policies: ['admin::is-authenticated', 'api::service.can-bulk-create'],
      },
    },
    {
      method: 'PUT',
      path: '/services/bulk',
      handler: 'service.bulkUpdate',
      config: {
        auth: true,
        policies: ['admin::is-authenticated', 'api::service.can-bulk-update'],
      },
    },

    // Analytics and metrics
    {
      method: 'GET',
      path: '/services/:id/metrics',
      handler: 'service.getMetrics',
      config: {
        auth: true,
        policies: ['admin::is-authenticated'],
      },
    },

    // Content management utilities
    {
      method: 'POST',
      path: '/services/:id/duplicate',
      handler: 'service.duplicate',
      config: {
        auth: true,
        policies: ['admin::is-authenticated', 'api::service.can-create'],
      },
    },
    {
      method: 'POST',
      path: '/services/:id/publish',
      handler: 'service.publish',
      config: {
        auth: true,
        policies: ['admin::is-authenticated', 'api::service.can-publish'],
      },
    },
    {
      method: 'POST',
      path: '/services/:id/unpublish',
      handler: 'service.unpublish',
      config: {
        auth: true,
        policies: ['admin::is-authenticated', 'api::service.can-publish'],
      },
    },

    // Search and filtering
    {
      method: 'GET',
      path: '/services/search',
      handler: 'service.search',
      config: {
        auth: false,
        policies: [],
        middlewares: ['api::service.populate-defaults'],
      },
    },
    {
      method: 'GET',
      path: '/services/tags',
      handler: 'service.getTags',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/services/domains',
      handler: 'service.getDomains',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
