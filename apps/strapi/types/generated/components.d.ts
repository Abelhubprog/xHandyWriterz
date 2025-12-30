import type { Schema, Struct } from '@strapi/strapi';

export interface DomainDomainFaq extends Struct.ComponentSchema {
  collectionName: 'components_domain_faqs';
  info: {
    description: 'FAQ items for domain pages';
    displayName: 'Domain FAQ';
    icon: 'question-mark';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DomainDomainFeature extends Struct.ComponentSchema {
  collectionName: 'components_domain_features';
  info: {
    description: 'Feature cards for domain pages';
    displayName: 'Domain Feature';
    icon: 'puzzle';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    iconKey: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    linkLabel: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DomainDomainHighlight extends Struct.ComponentSchema {
  collectionName: 'components_domain_highlights';
  info: {
    description: 'Key stats and metrics for domain pages';
    displayName: 'Domain Highlight';
    icon: 'star';
  };
  attributes: {
    color: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    iconKey: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LandingLandingItem extends Struct.ComponentSchema {
  collectionName: 'components_landing_items';
  info: {
    displayName: 'Landing Item';
    icon: 'grid';
  };
  attributes: {
    accentGradient: Schema.Attribute.String;
    authorName: Schema.Attribute.String;
    authorRole: Schema.Attribute.String;
    backgroundGradient: Schema.Attribute.String;
    badge: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    iconKey: Schema.Attribute.String;
    linkLabel: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images'>;
    metricLabel: Schema.Attribute.String;
    metricValue: Schema.Attribute.String;
    quote: Schema.Attribute.Text;
    rating: Schema.Attribute.Integer;
    subtitle: Schema.Attribute.String;
    tag: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    description: Schema.Attribute.Text;
    ogImage: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'domain.domain-faq': DomainDomainFaq;
      'domain.domain-feature': DomainDomainFeature;
      'domain.domain-highlight': DomainDomainHighlight;
      'landing.landing-item': LandingLandingItem;
      'seo.seo': SeoSeo;
    }
  }
}
