import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { CmsSectionRenderer, HeroSection } from '@/components/landing';
import {
  fetchArticlesList,
  fetchLandingSections,
  fetchServicesList,
  fetchTestimonialsList,
} from '@/lib/cms';
import type { LandingSection } from '@/types/cms';

const FALLBACK_SECTIONS: LandingSection[] = [
  {
    id: 'hero-fallback',
    sectionKey: 'hero',
    theme: 'centered',
    anchorId: 'hero',
    pageSlug: 'homepage',
    eyebrow: 'HandyWriterz',
    heading: 'World-Class Academic Support',
    subheading: 'Premium content for healthcare, technology, and enterprise teams.',
    body: 'Publish, discover, and share research-driven insights with confidence.',
    ctaLabel: 'Explore Content',
    ctaUrl: '/services',
    secondaryCtaLabel: 'Check Turnitin',
    secondaryCtaUrl: '/turnitin/submit',
    mediaUrl: null,
    order: 0,
    items: [
      {
        id: 'hero-stat-1',
        eyebrow: null,
        title: '10k+',
        subtitle: null,
        description: null,
        metricValue: '10k+',
        metricLabel: 'Students supported',
        iconKey: null,
        mediaUrl: null,
        quote: null,
        authorName: null,
        authorRole: null,
        rating: null,
        tag: null,
        linkLabel: null,
        linkUrl: null,
        accentGradient: null,
        backgroundGradient: null,
        badge: null,
      },
    ],
  },
];

function Homepage() {
  const { data: landingSectionsData = [] } = useQuery({
    queryKey: ['landing-sections', 'homepage'],
    queryFn: () => fetchLandingSections('homepage'),
    staleTime: 1000 * 60 * 5,
  });

  const { data: articlesData = [] } = useQuery({
    queryKey: ['homepage-articles'],
    queryFn: () => fetchArticlesList({ limit: 6 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: servicesData } = useQuery({
    queryKey: ['homepage-services'],
    queryFn: () => fetchServicesList({ pageSize: 6 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: testimonialsData = [] } = useQuery({
    queryKey: ['homepage-testimonials'],
    queryFn: () => fetchTestimonialsList({ limit: 8 }),
    staleTime: 1000 * 60 * 10,
  });

  const landingSections = landingSectionsData.length ? landingSectionsData : FALLBACK_SECTIONS;
  const sortedSections = useMemo(
    () => [...landingSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [landingSections]
  );

  return (
    <>
      <Helmet>
        <title>HandyWriterz | Premium Academic Content & Services</title>
      </Helmet>
      <div className="bg-white">
        {sortedSections.length === 0 ? (
          <HeroSection />
        ) : (
          sortedSections.map((section) => (
            <CmsSectionRenderer
              key={section.id}
              section={section}
              articles={articlesData}
              services={servicesData?.items ?? []}
              testimonials={testimonialsData}
            />
          ))
        )}
      </div>
    </>
  );
}

export default Homepage;
