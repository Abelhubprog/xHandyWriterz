import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarDays,
  Clock,
  Play,
  FileText,
  Image,
  Code,
  Headphones,
  Stethoscope,
  Brain,
  Baby,
  Users,
  Cpu,
  Coins,
} from 'lucide-react';
import type { ServiceListItem } from '@/types/cms';
import { fetchServicesList } from '@/lib/cms';

const DOMAINS: Record<string, { name: string; icon: LucideIcon; description: string }> = {
  'adult-health': {
    name: 'Adult Health',
    icon: Stethoscope,
    description: 'Adult health and wellness content.',
  },
  'mental-health': {
    name: 'Mental Health',
    icon: Brain,
    description: 'Mental health and wellbeing resources.',
  },
  'child-nursing': {
    name: 'Child Nursing',
    icon: Baby,
    description: 'Pediatric nursing and child care.',
  },
  'social-work': {
    name: 'Social Work',
    icon: Users,
    description: 'Social work and community services.',
  },
  ai: {
    name: 'AI',
    icon: Cpu,
    description: 'AI-powered services and automation.',
  },
  crypto: {
    name: 'Crypto',
    icon: Coins,
    description: 'Blockchain, DeFi, and tokenized services.',
  },
};

const CONTENT_TYPES = {
  article: { name: 'Article', icon: FileText },
  video: { name: 'Video', icon: Play },
  audio: { name: 'Audio', icon: Headphones },
  image: { name: 'Image', icon: Image },
  code: { name: 'Code', icon: Code },
} as const;

type DomainKey = keyof typeof DOMAINS;
type ContentTypeKey = keyof typeof CONTENT_TYPES;

interface ServicesHubProps {
  className?: string;
}

function inferContentType(item: ServiceListItem): ContentTypeKey {
  const match = item.typeTags.find((tag) => ['video', 'audio', 'image', 'code'].includes(tag));
  if (match && match in CONTENT_TYPES) {
    return match as ContentTypeKey;
  }
  return 'article';
}

export default function ServicesHub({ className = '' }: ServicesHubProps) {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ContentTypeKey | 'all'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['services-hub', selectedDomain, selectedType],
    queryFn: async () => {
      const response = await fetchServicesList({
        domain: selectedDomain === 'all' ? undefined : selectedDomain,
        pageSize: 18,
      });
      return response.items;
    },
    placeholderData: (previous) => previous,
  });

  const filteredContent = useMemo(() => {
    if (!data) return [] as ServiceListItem[];
    return data.filter((item) => {
      const matchesDomain = selectedDomain === 'all' ? true : item.domain === selectedDomain;
      const type = inferContentType(item);
      const matchesType = selectedType === 'all' ? true : type === selectedType;
      return matchesDomain && matchesType;
    });
  }, [data, selectedDomain, selectedType]);

  const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTypeBadge = (item: ServiceListItem) => {
    const type = inferContentType(item);
    const config = CONTENT_TYPES[type];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.name}
      </Badge>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Services hub</h2>
          <p className="mt-2 max-w-xl text-sm text-gray-600">
            Curated services published from Strapi with clean metadata, assets, and reader-friendly summaries.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant={selectedDomain === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedDomain('all')}
        >
          All Domains
        </Button>
        {Object.entries(DOMAINS).map(([key, domain]) => {
          const Icon = domain.icon;
          return (
            <Button
              key={key}
              variant={selectedDomain === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDomain(key as DomainKey)}
              className="flex items-center gap-2"
            >
              <Icon className="h-3 w-3" />
              {domain.name}
            </Button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedType('all')}
        >
          All Types
        </Button>
        {Object.entries(CONTENT_TYPES).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <Button
              key={key}
              variant={selectedType === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(key as ContentTypeKey)}
              className="flex items-center gap-2"
            >
              <Icon className="h-3 w-3" />
              {meta.name}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Services unavailable</h3>
            <p className="text-gray-600">We could not reach the CMS. Try refreshing the page.</p>
          </div>
        ) : filteredContent.length > 0 ? (
          filteredContent.map((item) => {
            const domain = item.domain && DOMAINS[item.domain as DomainKey];
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      {domain && (() => {
                        const DomainIcon = domain.icon;
                        return (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <DomainIcon className="h-3 w-3" />
                            {domain.name}
                          </Badge>
                        );
                      })()}
                      {renderTypeBadge(item)}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    <Link
                      to={`/services/${item.domain ?? 'general'}/${item.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                  </CardTitle>
                  {item.summary && (
                    <CardDescription className="text-sm line-clamp-2">
                      {item.summary}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {item.publishedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(item.publishedAt)}
                        </span>
                      )}
                      {item.readingMinutes && item.readingMinutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.readingMinutes} min read
                        </span>
                      )}
                    </div>
                    {item.authorName && <span className="text-xs">{item.authorName}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">
              {selectedDomain !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters to see more content.'
                : 'Content will appear here once it is published.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}