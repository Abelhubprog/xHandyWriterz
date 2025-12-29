/**
 * landing-section controller
 */

import { factories } from '@strapi/strapi';

// @ts-expect-error - Content type will be registered at runtime by Strapi
export default factories.createCoreController('api::landing-section.landing-section');
