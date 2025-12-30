import rawTaxonomy from './taxonomy.json';

export type DomainEntry = {
  tag: string;
  slug: string;
  label: string;
  description: string;
};

export type TypeEntry = {
  tag: string;
  slug: string;
  label: string;
  description: string;
};

export type TaxonomyConfig = {
  domains: DomainEntry[];
  types: TypeEntry[];
  defaultType: string;
};

export const taxonomy = rawTaxonomy as TaxonomyConfig;

export const DOMAIN_TAGS = taxonomy.domains;
export const TYPE_TAGS = taxonomy.types;
export const DEFAULT_TYPE_TAG = taxonomy.defaultType;

export type DomainSlug = DomainEntry['slug'];
export type TypeSlug = TypeEntry['slug'];
