/**
 * `validate-preview-token` middleware for Article API
 */

import jwt from 'jsonwebtoken';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    const { token } = ctx.query;
    const { id } = ctx.params;

    // Skip validation if no token provided (will fall back to public access rules)
    if (!token) {
      return await next();
    }

    try {
      // Get JWT secret from environment or Strapi config
      const jwtSecret = process.env.JWT_SECRET || strapi.config.get('server.app.keys')[0];

      if (!jwtSecret) {
        ctx.throw(500, 'JWT secret not configured');
      }

      // Verify and decode the token
      const decoded = jwt.verify(token, jwtSecret) as any;

      // Check if token is for the requested article
      if (decoded.articleId && decoded.articleId.toString() !== id.toString()) {
        ctx.throw(403, 'Invalid preview token for this article');
      }

      // Check if token has expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        ctx.throw(401, 'Preview token has expired');
      }

      // Check token type
      if (decoded.type !== 'preview') {
        ctx.throw(403, 'Invalid token type for preview access');
      }

      // Validate required token claims
      if (!decoded.articleId && !decoded.entityType) {
        ctx.throw(400, 'Invalid preview token structure');
      }

      // If token is for a specific entity type, validate it matches
      if (decoded.entityType && decoded.entityType !== 'article') {
        ctx.throw(403, 'Token not valid for article preview');
      }

      // Check if user has permission (if user info is in token)
      if (decoded.userId) {
        try {
          const user = await strapi.plugins['users-permissions'].services.user.fetch({
            id: decoded.userId,
          });

          if (!user) {
            ctx.throw(403, 'Token user no longer exists');
          }

          // Attach user to context for downstream use
          ctx.state.user = user;
        } catch (error) {
          strapi.log.warn('Failed to fetch user for preview token:', error);
          // Continue without user context - token validation passed
        }
      }

      // Check if token allows access to draft content
      if (decoded.allowDraft !== true && ctx.query.publicationState === 'preview') {
        ctx.throw(403, 'Token does not allow draft content access');
      }

      // Set publication state to preview if token is valid
      if (!ctx.query.publicationState) {
        ctx.query.publicationState = 'preview';
      }

      // Add token validation info to context
      ctx.state.previewToken = {
        valid: true,
        articleId: decoded.articleId,
        userId: decoded.userId,
        permissions: decoded.permissions || [],
        issuedAt: decoded.iat,
        expiresAt: decoded.exp,
      };

      // Log successful token validation
      strapi.log.debug('Preview token validated successfully', {
        articleId: decoded.articleId,
        userId: decoded.userId,
        type: decoded.type,
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        ctx.throw(401, 'Invalid preview token');
      } else if (error.name === 'TokenExpiredError') {
        ctx.throw(401, 'Preview token has expired');
      } else if (error.name === 'NotBeforeError') {
        ctx.throw(401, 'Preview token not yet valid');
      } else {
        // Re-throw Strapi errors (thrown by ctx.throw)
        if (error.status) {
          throw error;
        }

        strapi.log.error('Preview token validation error:', error);
        ctx.throw(500, 'Token validation failed');
      }
    }

    await next();
  };
};
