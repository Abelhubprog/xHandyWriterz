/**
 * API Documentation Page
 * 
 * Documents the HandyWriterz API for developers
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Code2,
  Book,
  Zap,
  Key,
  FileJson,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Search,
  FileText,
  Users,
  Tag,
  Folder,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const API_SECTIONS = [
  {
    id: 'articles',
    name: 'Articles',
    icon: FileText,
    description: 'Access and search articles',
    endpoints: [
      { method: 'GET', path: '/api/articles', description: 'List all articles' },
      { method: 'GET', path: '/api/articles/:slug', description: 'Get article by slug' },
      { method: 'GET', path: '/api/articles/featured', description: 'Get featured articles' },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    icon: Folder,
    description: 'Browse available services',
    endpoints: [
      { method: 'GET', path: '/api/services', description: 'List all services' },
      { method: 'GET', path: '/api/services/:slug', description: 'Get service by slug' },
      { method: 'GET', path: '/api/services/domain/:domain', description: 'Get services by domain' },
    ],
  },
  {
    id: 'authors',
    name: 'Authors',
    icon: Users,
    description: 'Author profiles and content',
    endpoints: [
      { method: 'GET', path: '/api/authors', description: 'List all authors' },
      { method: 'GET', path: '/api/authors/:slug', description: 'Get author by slug' },
      { method: 'GET', path: '/api/authors/:slug/articles', description: 'Get author articles' },
    ],
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: Tag,
    description: 'Content organization',
    endpoints: [
      { method: 'GET', path: '/api/categories', description: 'List all categories' },
      { method: 'GET', path: '/api/categories/:slug', description: 'Get category by slug' },
    ],
  },
];

const CODE_EXAMPLES = {
  articles: `// Fetch articles from the API
const response = await fetch('https://api.handywriterz.com/api/articles', {
  headers: {
    'Content-Type': 'application/json',
  }
});

const { data, meta } = await response.json();

// Response structure:
// {
//   "data": [
//     {
//       "id": "1",
//       "slug": "getting-started-guide",
//       "title": "Getting Started with Academic Writing",
//       "excerpt": "Learn the fundamentals...",
//       "coverImage": { "url": "..." },
//       "author": { "name": "John Doe", "avatar": "..." },
//       "category": { "name": "Guides", "slug": "guides" },
//       "publishedAt": "2024-01-15T00:00:00Z",
//       "x402Enabled": false,
//       "x402Price": null
//     }
//   ],
//   "meta": {
//     "pagination": {
//       "page": 1,
//       "pageSize": 10,
//       "total": 100
//     }
//   }
// }`,
  x402: `// Accessing x402-protected content
const response = await fetch('https://api.handywriterz.com/api/articles/premium-article', {
  headers: {
    'Content-Type': 'application/json',
  }
});

// If content requires payment:
if (response.status === 402) {
  const paymentInfo = await response.json();
  // {
  //   "required": true,
  //   "amount": "0.001",
  //   "currency": "USDC",
  //   "address": "0x...",
  //   "network": "base"
  // }
  
  // Complete payment, then retry with proof
  const paidResponse = await fetch('https://api.handywriterz.com/api/articles/premium-article', {
    headers: {
      'Content-Type': 'application/json',
      'X-402-Payment-Proof': transactionHash
    }
  });
  
  const content = await paidResponse.json();
}`,
  filters: `// Using query parameters for filtering
const params = new URLSearchParams({
  'pagination[page]': '1',
  'pagination[pageSize]': '10',
  'filters[category][slug]': 'nursing',
  'filters[x402Enabled]': 'false',
  'sort[0]': 'publishedAt:desc',
  'populate': 'author,category,coverImage'
});

const response = await fetch(
  \`https://api.handywriterz.com/api/articles?\${params}\`
);

const { data, meta } = await response.json();`,
};

function CodeBlock({ code, language = 'javascript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="p-6 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-mono font-semibold ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('articles');

  return (
    <>
      <Helmet>
        <title>API Documentation | HandyWriterz</title>
        <meta 
          name="description" 
          content="Complete API documentation for HandyWriterz. Access articles, services, and author content programmatically." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                  <Code2 className="w-4 h-4" />
                  Developer Documentation
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              >
                API{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Reference
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
              >
                Everything you need to integrate HandyWriterz content into your applications.
                RESTful API with JSON responses and x402 micropayment support.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Base URL:</span>
                  <code className="text-gray-900 dark:text-white font-mono">https://api.handywriterz.com</code>
                </div>
                <Link
                  to="/docs/x402"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  x402 Protocol
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Endpoints
                </h3>
                {API_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Guides
                  </h3>
                  <button
                    onClick={() => setActiveSection('x402')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeSection === 'x402'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Key className="w-5 h-5" />
                    <span className="font-medium">x402 Payments</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('filters')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeSection === 'filters'
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Filtering & Sorting</span>
                  </button>
                </div>
              </div>
            </motion.aside>

            {/* Main Content Area */}
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3 space-y-8"
            >
              {/* API Section Content */}
              {API_SECTIONS.map((section) => (
                activeSection === section.id && (
                  <div key={section.id} className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {section.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    </div>

                    {/* Endpoints List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Endpoints
                      </h3>
                      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {section.endpoints.map((endpoint, index) => (
                          <div
                            key={endpoint.path}
                            className={`flex items-center gap-4 px-6 py-4 ${
                              index !== section.endpoints.length - 1
                                ? 'border-b border-gray-100 dark:border-gray-700'
                                : ''
                            }`}
                          >
                            <MethodBadge method={endpoint.method} />
                            <code className="font-mono text-sm text-gray-900 dark:text-white">
                              {endpoint.path}
                            </code>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-auto">
                              {endpoint.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example Code */}
                    {section.id === 'articles' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Example Request
                        </h3>
                        <CodeBlock code={CODE_EXAMPLES.articles} />
                      </div>
                    )}
                  </div>
                )
              ))}

              {/* x402 Guide */}
              {activeSection === 'x402' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      x402 Payment Protocol
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Some content may require micropayment via the x402 protocol. Here's how to handle it.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      How It Works
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-purple-800 dark:text-purple-200">
                      <li>Make a request to an x402-enabled endpoint</li>
                      <li>If payment required, you'll receive HTTP 402 with payment details</li>
                      <li>Complete the crypto payment on the specified network</li>
                      <li>Retry the request with the X-402-Payment-Proof header</li>
                      <li>Receive the full content</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Code Example
                    </h3>
                    <CodeBlock code={CODE_EXAMPLES.x402} />
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      to="/docs/x402"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                    >
                      Full x402 Documentation
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Filtering Guide */}
              {activeSection === 'filters' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Filtering & Sorting
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Use query parameters to filter, sort, and paginate results.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Pagination
                      </h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                        <li><code className="text-blue-600">pagination[page]</code> - Page number</li>
                        <li><code className="text-blue-600">pagination[pageSize]</code> - Items per page (max 100)</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Sorting
                      </h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                        <li><code className="text-blue-600">sort[0]</code> - Field and direction</li>
                        <li>Example: <code className="text-gray-900 dark:text-white">publishedAt:desc</code></li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Filtering
                      </h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                        <li><code className="text-blue-600">filters[field]</code> - Equal to value</li>
                        <li><code className="text-blue-600">filters[field][$contains]</code> - Contains value</li>
                        <li><code className="text-blue-600">filters[relation][field]</code> - Nested filter</li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Population
                      </h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                        <li><code className="text-blue-600">populate</code> - Comma-separated relations</li>
                        <li>Example: <code className="text-gray-900 dark:text-white">author,category,tags</code></li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Full Example
                    </h3>
                    <CodeBlock code={CODE_EXAMPLES.filters} />
                  </div>
                </div>
              )}
            </motion.main>
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-16 bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Have questions about the API? Our team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="https://github.com/handywriterz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
