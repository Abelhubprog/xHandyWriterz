/**
 * domain-page router
 */

import { factories } from '@strapi/strapi';

// @ts-expect-error - Content type will be registered at runtime by Strapi
export default factories.createCoreRouter('api::domain-page.domain-page');
