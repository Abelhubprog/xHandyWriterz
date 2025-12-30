// import type { Core } from '@strapi/strapi';

const PUBLIC_READ_ACTIONS = [
  'api::service.service.find',
  'api::service.service.findOne',
  'api::article.article.find',
  'api::article.article.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::tag.tag.find',
  'api::tag.tag.findOne',
  'api::testimonial.testimonial.find',
  'api::testimonial.testimonial.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::landing-section.landing-section.find',
  'api::landing-section.landing-section.findOne',
  'api::domain-page.domain-page.find',
  'api::domain-page.domain-page.findOne',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const publicRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('[bootstrap] Public role not found');
        return;
      }

      const permissions = await strapi.db
        .query('plugin::users-permissions.permission')
        .findMany({
          where: {
            role: publicRole.id,
            action: { $in: PUBLIC_READ_ACTIONS },
          },
        });

      const disabled = permissions.filter((permission: any) => !permission.enabled);

      await Promise.all(
        disabled.map((permission: any) =>
          strapi.db.query('plugin::users-permissions.permission').update({
            where: { id: permission.id },
            data: { enabled: true },
          })
        )
      );

      if (disabled.length > 0) {
        strapi.log.info(`[bootstrap] Enabled ${disabled.length} public permissions`);
      }
    } catch (error) {
      strapi.log.error('[bootstrap] Failed to update public permissions', error);
    }
  },
};
