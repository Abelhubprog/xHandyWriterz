import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/Loader';
// Placeholder until a search API is implemented

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [tag, setTag] = useState('');
  const [mediaType, setMediaType] = useState('');

  const { data: searchData, isLoading, error } = useQuery({
    queryKey: ['search', query, domain, tag, mediaType],
    queryFn: async () => {
      // Fallback: return empty results; integrate backend later
      return { results: [] } as any;
    },
    enabled: !!query,
  });

  const results = searchData?.results || [];

  if (isLoading && query) {
    return <div className="min-h-screen flex items-center justify-center"><Loader size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Input
            type="search"
            placeholder="Search across all domains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-2xl mx-auto block px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {query ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={domain === '' ? 'default' : 'outline'}
                onClick={() => setDomain('')}
                size="sm"
              >
                All Domains
              </Button>
              <Button
                variant={domain === 'adult-health' ? 'default' : 'outline'}
                onClick={() => setDomain('adult-health')}
                size="sm"
              >
                Adult Health
              </Button>
              <Button
                variant={domain === 'mental-health' ? 'default' : 'outline'}
                onClick={() => setDomain('mental-health')}
                size="sm"
              >
                Mental Health
              </Button>
              <Button
                variant={domain === 'child-nursing' ? 'default' : 'outline'}
                onClick={() => setDomain('child-nursing')}
                size="sm"
              >
                Child Nursing
              </Button>
              <Button
                variant={domain === 'social-work' ? 'default' : 'outline'}
                onClick={() => setDomain('social-work')}
                size="sm"
              >
                Social Work
              </Button>
              <Button
                variant={domain === 'technology' ? 'default' : 'outline'}
                onClick={() => setDomain('technology')}
                size="sm"
              >
                Technology
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={tag === '' ? 'default' : 'outline'}
                onClick={() => setTag('')}
                size="sm"
              >
                All Tags
              </Button>
              <Button
                variant={tag === 'health' ? 'default' : 'outline'}
                onClick={() => setTag('health')}
                size="sm"
              >
                Health
              </Button>
              <Button
                variant={tag === 'nursing' ? 'default' : 'outline'}
                onClick={() => setTag('nursing')}
                size="sm"
              >
                Nursing
              </Button>
              <Button
                variant={tag === 'ai' ? 'default' : 'outline'}
                onClick={() => setTag('ai')}
                size="sm"
              >
                AI
              </Button>
              <Button
                variant={tag === 'crypto' ? 'default' : 'outline'}
                onClick={() => setTag('crypto')}
                size="sm"
              >
                Crypto
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={mediaType === '' ? 'default' : 'outline'}
                onClick={() => setMediaType('')}
                size="sm"
              >
                All Media
              </Button>
              <Button
                variant={mediaType === 'text' ? 'default' : 'outline'}
                onClick={() => setMediaType('text')}
                size="sm"
              >
                Text
              </Button>
              <Button
                variant={mediaType === 'image' ? 'default' : 'outline'}
                onClick={() => setMediaType('image')}
                size="sm"
              >
                Image
              </Button>
              <Button
                variant={mediaType === 'video' ? 'default' : 'outline'}
                onClick={() => setMediaType('video')}
                size="sm"
              >
                Video
              </Button>
              <Button
                variant={mediaType === 'audio' ? 'default' : 'outline'}
                onClick={() => setMediaType('audio')}
                size="sm"
              >
                Audio
              </Button>
            </div>

            {error ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No results found for "{query}"</p>
                <Button onClick={() => setQuery('')}>Clear Search</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <Card key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{result.type}</Badge>
                        <span className="text-sm text-gray-500">{result.reading_time_min} min read</span>
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        <Link to={`/p/${result.slug}`} className="hover:text-blue-600 transition-colors">
                          {result.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-gray-600 mb-4">
                        {result.summary}
                      </CardDescription>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{result.domain}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {result.author_name}</span>
                        <span>{new Date(result.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Search All Content</h2>
            <p className="text-gray-600 mb-8">Enter a keyword to search across domains, tags, and media types.</p>
            <Input
              type="search"
              placeholder="Start searching..."
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
