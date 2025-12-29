import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Coins,
  Cpu,
  Heart,
  Search,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchDomainsList, fetchServicesList } from '@/lib/cms';
import { normalizeDomainSlug } from '@/lib/domain-utils';
import type { DomainListItem, ServiceListItem } from '@/types/cms';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart,
  brain: Brain,
  users: Users,
  shield: Shield,
  cpu: Cpu,
  coins: Coins,
  sparkles: Sparkles,
  book: BookOpen,
  'book-open': BookOpen,
};

const getDomainIcon = (iconKey?: string | null) => {
  if (!iconKey) return BookOpen;
  const normalized = iconKey.toLowerCase();
  return ICON_MAP[normalized] || BookOpen;
};

const sortByPublished = (items: ServiceListItem[]) =>
  [...items].sort((a, b) => {
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

function ServicesHubSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-slate-200 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-6 w-2/3 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
            <div className="space-y-2">
              <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DomainCard({ domain, services }: { domain: DomainListItem; services: ServiceListItem[] }) {
  const Icon = getDomainIcon(domain.iconKey);
  const gradient = domain.gradient || 'from-slate-700 to-slate-900';
  const themeColor = domain.themeColor || '#6366f1';
  const featuredServices = sortByPublished(services).slice(0, 3);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className={cn('relative h-36 bg-gradient-to-br', gradient)}>
        {domain.heroImageUrl ? (
          <img
            src={domain.heroImageUrl}
            alt={domain.name}
            className="h-full w-full object-cover opacity-85"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-16 w-16 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: themeColor }} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{domain.name}</h3>
            {domain.tagline && (
              <p className="text-sm text-slate-500 italic">{domain.tagline}</p>
            )}
          </div>
        </div>

        {domain.description && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{domain.description}</p>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured Services</h4>
            <span className="text-xs text-slate-400">{services.length} total</span>
          </div>

          <div className="mt-3 space-y-2">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/domains/${domain.slug}/services/${service.slug}`}
                  className="group/button flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="line-clamp-1 font-medium">{service.title}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover/button:translate-x-1" />
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                No services published yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/domains/${domain.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore domain
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={`/domains/${domain.slug}`}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            View all content
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ServicesHub() {
  const [search, setSearch] = useState('');

  const {
    data: domainsData,
    isLoading: domainsLoading,
    error: domainsError,
  } = useQuery({
    queryKey: ['services-domains'],
    queryFn: () => fetchDomainsList({ activeOnly: true }),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery({
    queryKey: ['services-ads'],
    queryFn: () => fetchServicesList({ pageSize: 120 }),
    staleTime: 1000 * 60 * 5,
  });

  const servicesByDomain = useMemo(() => {
    const map: Record<string, ServiceListItem[]> = {};
    const items = servicesData?.items ?? [];
    items.forEach((item) => {
      const rawDomain = item.domain ?? 'general';
      const domainKey = normalizeDomainSlug(rawDomain) ?? rawDomain;
      if (!map[domainKey]) {
        map[domainKey] = [];
      }
      map[domainKey].push(item);
    });
    return map;
  }, [servicesData]);

  const filteredDomains = useMemo(() => {
    const list = domainsData ?? [];
    if (!search) return list;
    const term = search.toLowerCase();
    return list.filter((domain) =>
      [domain.name, domain.slug, domain.tagline, domain.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [domainsData, search]);

  const totalDomains = domainsData?.length ?? 0;
  const totalServices = servicesData?.items?.length ?? 0;
  const isLoading = domainsLoading || servicesLoading;
  const hasError = Boolean(domainsError || servicesError);

  return (
    <>
      <Helmet>
        <title>Services by Domain | HandyWriterz</title>
        <meta
          name="description"
          content="Explore HandyWriterz domains and jump directly into our expert services. Find the right domain, then choose the service that fits your needs."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
            <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-fuchsia-500 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
              Services Directory
            </div>
            <h1 className="mt-6 text-4xl font-semibold md:text-5xl">
              Choose a Domain, Jump Into a Service
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
              Every domain has its own set of expert services. Browse domains, then pick the service that fits your goal.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="rounded-full bg-white/10 px-4 py-2">
                {totalDomains} domains live
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2">
                {totalServices} services available
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mx-auto -mt-10 max-w-5xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Find a domain
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search AI, Crypto, Adult Nursing..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Domains Grid */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          {hasError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
              We could not load domains right now. Please refresh or try again soon.
            </div>
          ) : isLoading ? (
            <ServicesHubSkeleton />
          ) : filteredDomains.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No domains found</p>
              <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredDomains.map((domain) => {
                const domainKey = normalizeDomainSlug(domain.slug) ?? domain.slug;
                return (
                  <DomainCard
                    key={domain.id}
                    domain={domain}
                    services={servicesByDomain[domainKey] ?? []}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-10 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">Need a custom service?</h2>
                <p className="mt-2 text-white/80">
                  Tell us the domain and we will match you with a specialist team.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition-transform hover:-translate-y-0.5"
              >
                Request a quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
