import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface TrendingPost {
  id: number;
  title: string;
  slug: string;
  domain: string;
}

interface SidebarTrendingProps {
  trendingPosts: TrendingPost[];
  domain: string;
}

export function SidebarTrending({ trendingPosts, domain }: SidebarTrendingProps) {
  return (
    <aside className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Trending</h3>
      </div>
      <div className="space-y-2">
        {trendingPosts.slice(0, 5).map((post) => (
          <Link
            key={post.id}
            to={`/p/${post.slug}`}
            className="block p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <p className="text-sm font-medium">{post.title}</p>
            <p className="text-xs text-muted-foreground">{post.domain}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
