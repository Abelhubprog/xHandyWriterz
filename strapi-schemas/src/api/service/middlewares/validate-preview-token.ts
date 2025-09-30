/**
 * Service middleware for validating preview tokens
 */

import jwt from 'jsonwebtoken';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    const { token } = ctx.query;
    const { id } = ctx.params;

    if (!token) {
      return ctx.badRequest('Preview token is required');
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      // Check if token is for the requested service
      if (decoded.serviceId !== id) {
        return ctx.unauthorized('Invalid preview token for this service');
      }

      // Check if token has expired (custom expiry beyond JWT exp)
      if (decoded.expiresAt && Date.now() > decoded.expiresAt) {
        return ctx.unauthorized('Preview token has expired');
      }

      // Set publication state to preview to include draft content
      ctx.query.publicationState = 'preview';

      // Store token info in context for potential use in controller
      ctx.state.previewToken = decoded;

      await next();
    } catch (error) {
      strapi.log.warn('Preview token validation failed:', error.message);
      return ctx.unauthorized('Invalid preview token');
    }
  };
};
