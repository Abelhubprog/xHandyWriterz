/**
 * Hooks Barrel Export
 * 
 * Central export point for all custom hooks
 */

// CMS Data Fetching Hooks
export {
  // Article hooks
  useArticles,
  useArticle,
  useFeaturedArticles,
  useArticlesByDomain,
  useRelatedArticles,
  
  // Service hooks
  useServices,
  useService,
  useFeaturedServices,
  useServicesByDomain,
  
  // Author hooks
  useAuthors,
  useAuthor,
  useAuthorArticles,
  
  // Category & Tag hooks
  useCategories,
  useTags,
  
  // Testimonial hooks
  useTestimonials,
  
  // Mutation hooks
  useIncrementViewCount,
  
  // Data transformers
  transformArticleToCard,
  transformServiceToCard,
  transformAuthorToCard,
  transformTestimonialToCard,
  
  // Media utilities
  resolveMediaUrl,
  getMediaFormat,
  
  // Query keys for cache management
  cmsKeys,
  
  // Types
  type StrapiMedia,
  type StrapiAuthor,
  type StrapiCategory,
  type StrapiTag,
  type StrapiTestimonial,
  type StrapiArticle,
  type StrapiService,
  type StrapiPagination,
  type StrapiResponse,
  type ArticleFilters,
  type ServiceFilters,
} from './useCMS';

// CMS Context (if using the context pattern)
export {
  CMSProvider,
  useCMSContext,
  useDomain,
  useX402,
  
  // Static helpers
  getDomainInfoStatic,
  isDomainValid,
  getAllDomains,
  getDomainsByCategory,
  
  // Constants
  DOMAINS,
  DOMAIN_CONFIG,
  
  // Types
  type Domain,
  type DomainInfo,
  type X402Config,
} from '../contexts/CMSContext';

// Re-export existing hooks if they exist
// export { useAuth } from './useAuth';
// export { useDocumentSubmission } from './useDocumentSubmission';
