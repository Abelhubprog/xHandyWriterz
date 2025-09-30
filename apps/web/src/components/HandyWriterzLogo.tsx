import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export interface HandyWriterzLogoProps {
  className?: string;
  withText?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  linkProps?: any;
  style?: React.CSSProperties;
}

export const HandyWriterzLogo: React.FC<HandyWriterzLogoProps> = ({
  className = '',
  withText = true,
  onClick,
  size = 'md',
  asLink = true,
  linkProps = {},
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110`}>
        <span className={textSizeClasses[size]}>H</span>
      </div>
      {withText && (
        <span className={`${textSizeClasses[size]} font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:tracking-wide`}>
          HandyWriterz
        </span>
      )}
    </>
  );

  // Prevent rendering an <a> inside another <a> (React warning).
  // We detect if this component is rendered inside an anchor and avoid
  // using <Link> in that case. Detection runs on mount, so default to
  // rendering a non-anchor wrapper until we know.
  const rootRef = useRef<HTMLDivElement | HTMLAnchorElement | null>(null);
  const [isInsideAnchor, setIsInsideAnchor] = useState<boolean | null>(null);

  useEffect(() => {
    setIsInsideAnchor(Boolean(rootRef.current?.closest && rootRef.current.closest('a')));
  }, []);

  const wrapperClass = `flex items-center gap-2 group ${className}`;

  // If explicitly requested not to be a link, render a div.
  if (!asLink) {
    return (
      <div ref={rootRef as React.RefObject<HTMLDivElement>} className={wrapperClass} onClick={onClick}>
        {content}
      </div>
    );
  }

  // While we haven't determined ancestor state, render a non-anchor to avoid
  // momentary nested anchors. After effect runs we'll render <Link> only if
  // there is no ancestor anchor.
  if (isInsideAnchor === null || isInsideAnchor === true) {
    return (
      <div ref={rootRef as React.RefObject<HTMLDivElement>} className={wrapperClass} onClick={onClick} aria-label="HandyWriterz Home" {...linkProps}>
        {content}
      </div>
    );
  }

  // Safe to render a Link (no ancestor anchor found).
  return (
    <Link ref={rootRef as any} to="/" className={wrapperClass} onClick={onClick} aria-label="HandyWriterz Home" {...linkProps}>
      {content}
    </Link>
  );
};

export const HandyWriterzIcon: React.FC<HandyWriterzLogoProps> = (props) => {
  return <HandyWriterzLogo {...props} withText={false} />;
};

export default HandyWriterzLogo;
