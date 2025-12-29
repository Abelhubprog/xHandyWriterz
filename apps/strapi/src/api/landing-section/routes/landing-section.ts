/**
 * landing-section router
 */

import { factories } from '@strapi/strapi';

// @ts-expect-error - Content type will be registered at runtime by Strapi
export default factories.createCoreRouter('api::landing-section.landing-section');
