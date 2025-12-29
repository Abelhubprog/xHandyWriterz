/**
 * CMS-first Homepage
 * Renders Strapi landing sections with a clean fallback layout when sections are empty.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLandingSections,
  fetchArticlesList,
  fetchServicesList,
  fetchTestimonialsList,
  fetchDomainsList,
} from '@/lib/cms';
import type { ArticleSummary, LandingSection, ServiceListItem, TestimonialEntry, DomainListItem } from '@/types/cms';
import {
  CmsSectionRenderer,
  DomainShowcase,
  FeaturedGrid,
  HeroSection,
  ServiceGrid,
  TestimonialSection,
} from '@/components/landing';

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="space-y-6">
          <div className="h-10 w-2/3 rounded bg-slate-200 animate-pulse" />
          <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
          <div className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HomepageNew() {
  const { data: sections, isLoading: sectionsLoading } = useQuery<LandingSection[]>({
    queryKey: ['landing-sections', 'homepage'],
    queryFn: () => fetchLandingSections('homepage'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: articles } = useQuery<ArticleSummary[]>({
    queryKey: ['homepage-articles'],
    queryFn: () => fetchArticlesList({ limit: 6 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: services } = useQuery<ServiceListItem[]>({
    queryKey: ['homepage-services'],
    queryFn: () => fetchServicesList({ pageSize: 6 }).then((response) => response.items),
    staleTime: 1000 * 60 * 5,
  });

  const { data: testimonials } = useQuery<TestimonialEntry[]>({
    queryKey: ['homepage-testimonials'],
    queryFn: () => fetchTestimonialsList({ limit: 6 }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: domains } = useQuery<DomainListItem[]>({
    queryKey: ['homepage-domains'],
    queryFn: () => fetchDomainsList({ activeOnly: true }),
    staleTime: 1000 * 60 * 10,
  });

  const hasSections = Array.isArray(sections) && sections.length > 0;
  const showFallback = !sectionsLoading && !hasSections;

  const domainCards = (domains || []).map((domain) => ({
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
    description: domain.description ?? '',
    iconKey: domain.iconKey ?? undefined,
    themeColor: domain.themeColor ?? undefined,
    gradient: domain.gradient ?? undefined,
    heroImageUrl: domain.heroImageUrl ?? undefined,
  }));

  if (sectionsLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>HandyWriterz — Domain-First Knowledge Platform</title>
        <meta
          name="description"
          content="Explore expert-authored content and services across specialized domains, published daily by HandyWriterz editors."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        {hasSections ? (
          sections.map((section) => (
            <CmsSectionRenderer
              key={section.id}
              section={section}
              articles={articles}
              services={services}
              testimonials={testimonials}
              domains={domains}
            />
          ))
        ) : null}

        {showFallback && (
          <>
            <HeroSection
              variant="gradient"
              title="Domain-first content"
              highlightedText="built for real experts"
              subtitle="Publish, share, and scale knowledge across every specialty."
              description="HandyWriterz powers editorial-grade content for humans and x402-ready access for agents."
              primaryCTA={{ text: 'Explore domains', href: '/domains' }}
              secondaryCTA={{ text: 'Browse services', href: '/services' }}
              showX402Badge
            />

            {domainCards.length > 0 && (
              <DomainShowcase
                domains={domainCards}
                title="Explore domains"
                subtitle="Every domain has its own content stack, specialists, and services."
                variant="featured"
                showCounts={false}
              />
            )}

            {Array.isArray(articles) && articles.length > 0 && (
              <FeaturedGrid
                articles={articles.map((article) => ({
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  excerpt: article.excerpt ?? undefined,
                  coverImage: article.heroImageUrl ?? undefined,
                  author: article.authorName ? { name: article.authorName } : undefined,
                  publishedAt: article.publishedAt ?? undefined,
                  readingTime: article.readingMinutes ?? undefined,
                }))}
                title="Latest from the newsroom"
                subtitle="Freshly published analysis and guidance across every domain."
                layout="spotlight"
                viewAllLink="/articles"
                showViewAll
              />
            )}

            {Array.isArray(services) && services.length > 0 && (
              <ServiceGrid
                services={services.map((service) => ({
                  id: service.id,
                  title: service.title,
                  slug: service.slug,
                  excerpt: service.summary ?? '',
                  description: service.summary ?? undefined,
                  domain: service.domain ?? 'general',
                  coverImage: service.heroImageUrl ?? undefined,
                  featured: false,
                  x402Enabled: false,
                }))}
                title="Services available now"
                subtitle="Launch quickly with expert-led deliverables tailored to your domain."
                variant="default"
                showViewAll
                viewAllLink="/services"
              />
            )}

            {Array.isArray(testimonials) && testimonials.length > 0 && (
              <TestimonialSection
                testimonials={testimonials.map((entry) => ({
                  id: entry.id,
                  quote: entry.quote,
                  authorName: entry.authorName,
                  authorRole: entry.authorRole ?? undefined,
                  authorCompany: entry.authorCompany ?? undefined,
                  authorAvatar: entry.authorAvatarUrl ?? undefined,
                  rating: entry.rating ?? undefined,
                  domain: entry.domain ?? undefined,
                  featured: entry.featured,
                }))}
                title="Trusted by teams who ship"
                subtitle="Proof that domain-first publishing scales with real experts."
                variant="carousel"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
