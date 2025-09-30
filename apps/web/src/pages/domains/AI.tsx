import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Brain,
  Cpu,
  Zap,
  BookOpen,
  Target,
  Clock,
  ArrowRight,
  Bot,
  Plus,
  TrendingUp,
  Database,
  Eye,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CMSClient } from '@/lib/cms-client';
import type { Article } from '@/types/publishing';

const cmsClient = new CMSClient();

const AIPage: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'ai'],
    queryFn: () => cmsClient.getArticles({
      domain: 'ai',
      limit: 6,
      status: 'published'
    })
  });

  useEffect(() => {
    if (articlesData) {
      setFeaturedArticles(articlesData.slice(0, 6));
    }
  }, [articlesData]);

  const aiApplications = [
    {
      title: 'Clinical Decision Support',
      description: 'AI-powered diagnostic assistance and treatment recommendations',
      icon: Target,
      articles: 28,
      trending: true
    },
    {
      title: 'Medical Imaging AI',
      description: 'Computer vision for radiology, pathology, and medical image analysis',
      icon: Eye,
      articles: 35,
      trending: true
    },
    {
      title: 'Predictive Analytics',
      description: 'Early warning systems and patient outcome prediction models',
      icon: Activity,
      articles: 22,
      trending: true
    },
    {
      title: 'Healthcare Data Mining',
      description: 'Big data analysis for population health and research insights',
      icon: Database,
      articles: 30,
      trending: false
    }
  ];

  const quickLinks = [
    { title: 'AI Implementation Guides', href: '/resources/ai-implementation' },
    { title: 'Machine Learning Models', href: '/resources/ml-models' },
    { title: 'Healthcare AI Ethics', href: '/resources/ai-ethics' },
    { title: 'AI Regulatory Compliance', href: '/resources/ai-compliance' },
    { title: 'Clinical AI Tools', href: '/resources/clinical-ai' },
    { title: 'AI Research Papers', href: '/research/ai-healthcare' }
  ];

  return (
    <>
      <Helmet>
        <title>Artificial Intelligence in Healthcare - HandyWriterz</title>
        <meta name="description" content="Explore AI applications in healthcare, machine learning models, clinical decision support systems, and intelligent automation solutions for medical professionals." />
        <meta name="keywords" content="healthcare AI, artificial intelligence, machine learning, clinical decision support, medical AI, healthcare automation" />
        <link rel="canonical" href="https://handywriterz.com/d/ai" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                AI in Healthcare
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl text-white/90">
                Discover cutting-edge artificial intelligence applications, machine learning models,
                and intelligent automation solutions transforming healthcare delivery and patient outcomes.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/admin/articles/new?domain=ai"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-purple-600 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
                >
                  <Plus className="h-5 w-5" />
                  Create Content
                </Link>
                <Link
                  to="/services?domain=ai"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
                >
                  Explore AI Resources
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="border-b bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">200+</div>
                <div className="text-sm text-gray-600">AI Research Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-600">AI Specialists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Use Cases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">85%</div>
                <div className="text-sm text-gray-600">Implementation Success</div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Applications Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                AI Applications in Healthcare
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                Explore how artificial intelligence is revolutionizing medical practice and patient care
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {aiApplications.map((application, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {application.trending && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 mb-4">
                    <application.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {application.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {application.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {application.articles} articles
                    </span>
                    <Link
                      to={`/services?domain=ai&category=${application.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Latest AI Research
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Cutting-edge insights from AI healthcare experts and researchers
                </p>
              </div>
              <Link
                to="/services?domain=ai"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-xl shadow animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredArticles.map((article, index) => (
                  <article key={article.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-purple-400 to-blue-400"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3" />
                        <time>{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</time>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <Link
                        to={`/articles/${article.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-12">
              AI Resources & Tools
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {link.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Innovation Showcase */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white">
              <Cpu className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                The Future of Healthcare is Here
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                From predictive analytics to autonomous diagnostics, AI is transforming every aspect
                of healthcare delivery. Join the revolution and learn how to implement AI solutions
                that improve patient outcomes and clinical efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses/ai-healthcare"
                  className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Learning
                </Link>
                <Link
                  to="/community/ai"
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                >
                  Join AI Community
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AIPage;
