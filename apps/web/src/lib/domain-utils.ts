export const DOMAIN_CANONICAL_MAP: Record<string, string> = {
  'adult-health': 'adult-nursing',
};

export const DOMAIN_ALIAS_MAP: Record<string, string[]> = {
  'adult-nursing': ['adult-health'],
};

export function normalizeDomainSlug(slug?: string | null): string | null {
  if (!slug) return slug ?? null;
  return DOMAIN_CANONICAL_MAP[slug] ?? slug;
}

export function expandDomainFilter(slug?: string | null): string[] | string | null {
  if (!slug) return slug ?? null;
  const canonical = normalizeDomainSlug(slug);
  if (!canonical) return canonical;
  const aliases = DOMAIN_ALIAS_MAP[canonical] ?? [];
  if (aliases.length === 0) {
    return canonical;
  }
  return [canonical, ...aliases];
}
