import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { Highlight, themes } from 'prism-react-renderer';
import { Callout } from './mdx/Callout';
import rehypeSanitize from 'rehype-sanitize';

interface MDXRendererProps {
  content: string; // Assuming pre-compiled MDX string
  components?: {
    pre?: React.ComponentType<any>;
    code?: React.ComponentType<any>;
  };
}

const CodeBlock: React.FC<{ children: string; className?: string }> = ({ children, className }) => {
  const language = className?.replace('language-', '') || 'text';
  return (
    <Highlight theme={themes.github} code={children} language={language}>
      {({ className: className_, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`language-${language} ${className_}`}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

const components = {
  pre: CodeBlock,
  Callout,
  // Add more custom components as needed
};

const rehypePlugins = [
  rehypeSanitize({
    allowedElements: ['a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'img', 'strong', 'em', 'br'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
      '*': ['className'],
    },
  }),
];

export function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <MDXRemote
      source={content}
      components={components}
      options={{
        rehypePlugins,
      }}
    />
  );
}
