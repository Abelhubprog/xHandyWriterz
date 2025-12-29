/**
 * Unified CMS Client
 * 
 * This module consolidates all CMS operations into a single API.
 * 
 * Architecture:
 * - Public reads (listings, domains, testimonials) → REST API (fast, cacheable)
 * - Admin operations (create, update, media) → GraphQL API (flexible)
 * 
 * Usage:
 * ```ts
 * import { cms, fetchDomainsList, fetchServicesList } from '@/lib/cms';
 * 
 * // Public reads
 * const domains = await fetchDomainsList();
 * const services = await fetchServicesList({ domain: 'nursing' });
 * 
 * // Admin operations (requires auth token)
 * const articles = await cms.getArticles({ status: 'draft' }, authToken);
 * await cms.createArticle(data, authToken);
 * ```
 */

// Re-export public REST functions
export {
  // Domain functions
  fetchDomainPage,
  fetchDomainsList,
  fetchNavDomains,
  fetchFooterDomains,
  // Service functions
  fetchServicesList,
  fetchServiceBySlug,
  fetchServicesBySlugs,
  // Article functions (REST)
  fetchArticlesBySlugs,
  fetchArticlesList,
  // Landing/Homepage
  fetchLandingSections,
  // Testimonials
  fetchTestimonialsList,
} from './rest-client';

// Re-export GraphQL client for admin operations
export {
  cmsClient as cms,
  cmsClient,
  fetchArticles,
  fetchArticle,
  fetchServices,
  fetchService,
  uploadMedia,
} from './graphql-client';

// Re-export types from the types module for convenience
export type {
  ArticleSummary,
  DomainListItem,
  DomainPage,
  LandingSection,
  ServiceListItem,
  ServiceDetail,
  TestimonialEntry,
} from '@/types/cms';

// Helper types for the unified API
export type CMSFilters = {
  domain?: string;
  status?: 'draft' | 'published';
  limit?: number;
  offset?: number;
  search?: string;
};
