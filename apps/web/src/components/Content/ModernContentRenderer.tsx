import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, Pause, Volume2, VolumeX, Maximize2, Download, Copy, Check } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt?: string; caption?: string; width?: number; height?: number }
  | { type: 'video'; url: string; caption?: string; poster?: string; autoplay?: boolean }
  | { type: 'audio'; url: string; caption?: string }
  | { type: 'code'; language: string; code: string; filename?: string; showLineNumbers?: boolean }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'embed'; html: string; caption?: string }
  | { type: 'divider' }
  | { type: 'callout'; variant: 'info' | 'warning' | 'success' | 'error'; title?: string; text: string };

interface ModernContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

// ============================================================================
// VIDEO PLAYER COMPONENT
// ============================================================================

const VideoPlayer: React.FC<{ url: string; caption?: string; poster?: string; autoplay?: boolean }> = ({
  url,
  caption,
  poster,
  autoplay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <figure className="my-8">
      <div className="group relative overflow-hidden rounded-2xl bg-black shadow-2xl">
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          className="w-full"
          autoPlay={autoplay}
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-xl transition-transform hover:scale-110 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMute}
              className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// ============================================================================
// AUDIO PLAYER COMPONENT
// ============================================================================

const AudioPlayer: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300 dark:bg-gray-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600"
            />
            <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// ============================================================================
// CODE BLOCK COMPONENT
// ============================================================================

const CodeBlock: React.FC<{
  language: string;
  code: string;
  filename?: string;
  showLineNumbers?: boolean;
}> = ({ language, code, filename, showLineNumbers = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-2xl dark:border-gray-700">
        {/* Code Header */}
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            {filename && (
              <span className="ml-3 text-sm font-medium text-gray-300">{filename}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-600"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              fontSize: '0.875rem',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#6b7280',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </figure>
  );
};

// ============================================================================
// MAIN CONTENT RENDERER
// ============================================================================

const ModernContentRenderer: React.FC<ModernContentRendererProps> = ({ blocks, className = '' }) => {
  return (
    <article className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
            const headingClasses = {
              1: 'text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 mt-12',
              2: 'text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-5 mt-10',
              3: 'text-3xl font-semibold text-gray-900 dark:text-white mb-4 mt-8',
              4: 'text-2xl font-semibold text-gray-900 dark:text-white mb-3 mt-6',
              5: 'text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4',
              6: 'text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4',
            };
            return (
              <HeadingTag
                key={index}
                id={block.id || block.text.toLowerCase().replace(/\s+/g, '-')}
                className={headingClasses[block.level]}
              >
                {block.text}
              </HeadingTag>
            );

          case 'paragraph':
            return (
              <p
                key={index}
                className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: block.text }}
              />
            );

          case 'image':
            return (
              <figure key={index} className="my-8">
                <img
                  src={block.url}
                  alt={block.alt || ''}
                  width={block.width}
                  height={block.height}
                  className="w-full rounded-2xl shadow-2xl"
                  loading="lazy"
                />
                {block.caption && (
                  <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'video':
            return <VideoPlayer key={index} {...block} />;

          case 'audio':
            return <AudioPlayer key={index} {...block} />;

          case 'code':
            return <CodeBlock key={index} {...block} />;

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-8 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-transparent pl-6 pr-4 py-4 italic text-gray-700 dark:from-indigo-900/20 dark:text-gray-300"
              >
                <p className="mb-2 text-lg">{block.text}</p>
                {block.author && (
                  <footer className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );

          case 'list':
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={index}
                className={`my-6 space-y-2 ${block.ordered ? 'list-decimal' : 'list-disc'} ml-6 text-gray-700 dark:text-gray-300`}
              >
                {block.items.map((item, i) => (
                  <li key={i} className="pl-2">
                    {item}
                  </li>
                ))}
              </ListTag>
            );

          case 'callout':
            const calloutStyles = {
              info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
              success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
              error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
            };
            return (
              <div
                key={index}
                className={`my-6 rounded-xl border-2 p-6 ${calloutStyles[block.variant]}`}
              >
                {block.title && (
                  <h4 className="mb-2 text-lg font-semibold">{block.title}</h4>
                )}
                <p className="leading-relaxed">{block.text}</p>
              </div>
            );

          case 'embed':
            return (
              <figure key={index} className="my-8">
                <div
                  className="overflow-hidden rounded-2xl shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
                {block.caption && (
                  <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'divider':
            return (
              <hr
                key={index}
                className="my-12 border-t-2 border-gray-200 dark:border-gray-700"
              />
            );

          default:
            return null;
        }
      })}
    </article>
  );
};

export default ModernContentRenderer;
