import React from 'react';
import type { ContentBlock } from '@/types/admin';

interface ServicePageRendererProps {
  page: {
    title?: string;
    description?: string;
    featuredImage?: string;
    contentBlocks?: ContentBlock[];
  };
  className?: string;
}

const ServicePageRenderer: React.FC<ServicePageRendererProps> = ({ page, className = '' }) => {
  const renderBlock = (block: ContentBlock, index: number) => {
    const level = block.level ?? (block.metadata?.level as number | undefined) ?? 2;

    switch (block.type) {
      case 'heading': {
        const Tag = (`h${Math.min(Math.max(level, 1), 6)}` as unknown) as keyof JSX.IntrinsicElements;
        return (
          <Tag key={block.id ?? index} className="font-bold text-gray-900 mb-4 text-2xl md:text-3xl">
            {block.content}
          </Tag>
        );
      }
      case 'text':
        return (
          <div key={block.id ?? index} className="prose prose-lg max-w-none mb-6">
            <p dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
      case 'image': {
        const src = (block.url as string | undefined) || (block.metadata?.src as string | undefined) || '';
        const alt = block.caption || (block.metadata?.alt as string | undefined) || '';
        if (!src) return null;
        return (
          <div key={block.id ?? index} className="mb-8 text-center">
            <img src={src} alt={alt} className="max-w-full h-auto rounded-lg shadow" />
            {alt && <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>}
          </div>
        );
      }
      case 'video': {
        const src = (block.url as string | undefined) || '';
        if (!src) return null;
        return (
          <div key={block.id ?? index} className="mb-8">
            <video src={src} controls className="w-full rounded-lg" />
            {block.caption && <p className="text-sm text-gray-600 mt-2 italic">{block.caption}</p>}
          </div>
        );
      }
      case 'code':
        return (
          <pre key={block.id ?? index} className="mb-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto">
            <code>{block.content}</code>
          </pre>
        );
      case 'list': {
        const items = block.content.split(/\r?\n/).filter(Boolean);
        return (
          <ul key={block.id ?? index} className="list-disc pl-6 mb-6 space-y-2">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        );
      }
      case 'quote':
        return (
          <blockquote key={block.id ?? index} className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-6">
            {block.content}
            {block.caption && <cite className="block mt-2 not-italic text-gray-500">— {block.caption}</cite>}
          </blockquote>
        );
      case 'divider':
        return <hr key={block.id ?? index} className="my-8 border-gray-200" />;
      default:
        return null;
    }
  };

  return (
    <div className={`service-page ${className}`}>
      {page?.featuredImage && (
        <div className="relative mb-8">
          <img src={page.featuredImage} alt={page.title ?? 'Service'} className="w-full h-64 object-cover rounded-lg" />
          {page.title && <h1 className="mt-4 text-3xl font-bold text-gray-900">{page.title}</h1>}
          {page.description && <p className="mt-2 text-gray-600">{page.description}</p>}
        </div>
      )}

      <div className="container mx-auto px-4">
        {Array.isArray(page?.contentBlocks)
          ? page.contentBlocks.map((block, i) => renderBlock(block, i))
          : null}
      </div>
    </div>
  );
};

export default ServicePageRenderer;
