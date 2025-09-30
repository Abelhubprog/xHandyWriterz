/**
 * Service middleware for populating default fields
 */

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    // Add default population for service queries
    if (!ctx.query.populate) {
      ctx.query.populate = {
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
    }

    // Add default sorting if not specified
    if (!ctx.query.sort) {
      ctx.query.sort = { publishedAt: 'desc', updatedAt: 'desc' };
    }

    // Ensure only published content for public routes
    if (!ctx.state.user && !ctx.query.publicationState) {
      ctx.query.filters = {
        ...ctx.query.filters,
        publishedAt: { $notNull: true },
      };
    }

    await next();
  };
};
