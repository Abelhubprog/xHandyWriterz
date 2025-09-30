import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import {
  Play,
  Code,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Link,
  ExternalLink,
  Download,
  Maximize2
} from 'lucide-react';

interface MediaBlock {
  type: 'video' | 'image' | 'code' | 'chart' | 'pdf' | 'audio' | 'embed';
  url?: string;
  caption?: string;
  alt?: string;
  language?: string;
  code?: string;
  data?: any;
  width?: number;
  height?: number;
}

interface RichContentProps {
  content: string;
  mediaBlocks?: MediaBlock[];
  className?: string;
}

const RichContentRenderer: React.FC<RichContentProps> = ({
  content,
  mediaBlocks = [],
  className = ''
}) => {
  const [expandedImages, setExpandedImages] = React.useState<Set<string>>(new Set());
  const [loadingMedia, setLoadingMedia] = React.useState<Set<string>>(new Set());

  const toggleImageExpansion = (url: string) => {
    setExpandedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const renderVideo = (block: MediaBlock) => (
    <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
      <video
        controls
        className="w-full h-full"
        poster={block.alt}
        onLoadStart={() => setLoadingMedia(prev => new Set(prev).add(block.url!))}
        onCanPlay={() => setLoadingMedia(prev => {
          const newSet = new Set(prev);
          newSet.delete(block.url!);
          return newSet;
        })}
      >
        <source src={block.url} type="video/mp4" />
        <source src={block.url} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      {loadingMedia.has(block.url!) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
      {block.caption && (
        <p className="mt-2 text-sm text-gray-600 text-center italic">{block.caption}</p>
      )}
    </div>
  );

  const renderImage = (block: MediaBlock) => {
    const isExpanded = expandedImages.has(block.url!);

    return (
      <figure className="mb-6">
        <div
          className={`relative cursor-zoom-in transition-all duration-300 ${
            isExpanded ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4' : ''
          }`}
          onClick={() => toggleImageExpansion(block.url!)}
        >
          <img
            src={block.url}
            alt={block.alt || block.caption || 'Content image'}
            className={`${
              isExpanded
                ? 'max-w-full max-h-full object-contain'
                : 'w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow'
            }`}
            loading="lazy"
          />
          {!isExpanded && (
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleImageExpansion(block.url!);
              }}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {block.caption && !isExpanded && (
          <figcaption className="mt-2 text-sm text-gray-600 text-center italic">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  };

  const renderCodeBlock = (block: MediaBlock) => (
    <div className="mb-6">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          <span className="text-sm font-mono">{block.language || 'code'}</span>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(block.code || '')}
          className="text-sm hover:text-blue-400 transition-colors"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={block.language || 'javascript'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {block.code || ''}
      </SyntaxHighlighter>
      {block.caption && (
        <p className="mt-2 text-sm text-gray-600 italic">{block.caption}</p>
      )}
    </div>
  );

  const renderChart = (block: MediaBlock) => {
    // For charts, you might integrate with Chart.js, D3, or another library
    // This is a simple example using an image or iframe
    if (block.url) {
      return (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <img
              src={block.url}
              alt={block.alt || 'Chart'}
              className="w-full"
            />
          </div>
          {block.caption && (
            <p className="mt-2 text-sm text-gray-600 text-center italic">
              {block.caption}
            </p>
          )}
        </div>
      );
    }

    // If chart data is provided, render using a chart library
    return (
      <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="font-semibold">Interactive Chart</span>
        </div>
        {/* Chart implementation would go here */}
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart visualization would appear here
        </div>
        {block.caption && (
          <p className="mt-4 text-sm text-gray-600 italic">{block.caption}</p>
        )}
      </div>
    );
  };

  const renderPDF = (block: MediaBlock) => (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            <span className="font-medium">PDF Document</span>
          </div>
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
        <iframe
          src={`${block.url}#view=FitH`}
          className="w-full h-[600px]"
          title={block.caption || 'PDF Document'}
        />
      </div>
      {block.caption && (
        <p className="mt-2 text-sm text-gray-600 text-center italic">
          {block.caption}
        </p>
      )}
    </div>
  );

  const renderAudio = (block: MediaBlock) => (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <audio controls className="w-full">
          <source src={block.url} type="audio/mpeg" />
          <source src={block.url} type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>
        {block.caption && (
          <p className="mt-3 text-sm text-gray-600 italic">{block.caption}</p>
        )}
      </div>
    </div>
  );

  const renderEmbed = (block: MediaBlock) => (
    <div className="mb-6">
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={block.url}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={block.caption || 'Embedded content'}
        />
      </div>
      {block.caption && (
        <p className="mt-2 text-sm text-gray-600 text-center italic">
          {block.caption}
        </p>
      )}
    </div>
  );

  const renderMediaBlock = (block: MediaBlock, index: number) => {
    const key = `media-${index}`;

    switch (block.type) {
      case 'video':
        return <div key={key}>{renderVideo(block)}</div>;
      case 'image':
        return <div key={key}>{renderImage(block)}</div>;
      case 'code':
        return <div key={key}>{renderCodeBlock(block)}</div>;
      case 'chart':
        return <div key={key}>{renderChart(block)}</div>;
      case 'pdf':
        return <div key={key}>{renderPDF(block)}</div>;
      case 'audio':
        return <div key={key}>{renderAudio(block)}</div>;
      case 'embed':
        return <div key={key}>{renderEmbed(block)}</div>;
      default:
        return null;
    }
  };

  // Process content to insert media blocks at appropriate positions
  const processedContent = React.useMemo(() => {
    // Split content into sections based on media markers like [[media:0]]
    const parts = content.split(/\[\[media:(\d+)\]\]/g);
    const result: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Text content
        if (parts[i]) {
          result.push(
            <div key={`text-${i}`} className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={oneDark}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children, ...props }: any) {
                    const isExternal = href?.startsWith('http');
                    return (
                      <a
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        {isExternal && <ExternalLink className="w-3 h-3" />}
                      </a>
                    );
                  },
                  blockquote({ children, ...props }: any) {
                    return (
                      <blockquote
                        className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700 bg-blue-50 py-2 pr-4 rounded-r-lg"
                        {...props}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children, ...props }: any) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full divide-y divide-gray-300" {...props}>
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children, ...props }: any) {
                    return (
                      <th
                        className="px-4 py-2 bg-gray-100 text-left text-sm font-semibold text-gray-900"
                        {...props}
                      >
                        {children}
                      </th>
                    );
                  },
                  td({ children, ...props }: any) {
                    return (
                      <td className="px-4 py-2 text-sm text-gray-700 border-t" {...props}>
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {parts[i]}
              </ReactMarkdown>
            </div>
          );
        }
      } else {
        // Media block reference
        const mediaIndex = parseInt(parts[i], 10);
        if (mediaBlocks[mediaIndex]) {
          result.push(
            <div key={`media-${mediaIndex}`}>
              {renderMediaBlock(mediaBlocks[mediaIndex], mediaIndex)}
            </div>
          );
        }
      }
    }

    return result;
  }, [content, mediaBlocks, expandedImages, loadingMedia]);

  return (
    <div className={`rich-content ${className}`}>
      {processedContent}
    </div>
  );
};

export default RichContentRenderer;
