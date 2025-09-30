import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  Users,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Stethoscope,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CMSClient } from '@/lib/cms-client';
import type { Article } from '@/types/publishing';

const cmsClient = new CMSClient();

const AdultHealthPage: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'adult-health'],
    queryFn: () => cmsClient.getArticles({
      domain: 'adult-health',
      limit: 6,
      status: 'published'
    })
  });

  useEffect(() => {
    if (articlesData) {
      setFeaturedArticles(articlesData.slice(0, 6));
    }
  }, [articlesData]);

  const specialties = [
    {
      title: 'Medical-Surgical Nursing',
      description: 'Comprehensive care for adult patients with complex medical conditions',
      icon: Stethoscope,
      articles: 45,
      trending: true
    },
    {
      title: 'Critical Care',
      description: 'Advanced monitoring and intervention for critically ill patients',
      icon: Activity,
      articles: 32,
      trending: true
    },
    {
      title: 'Cardiac Care',
      description: 'Specialized cardiovascular nursing and cardiac rehabilitation',
      icon: Heart,
      articles: 28,
      trending: false
    },
    {
      title: 'Oncology Nursing',
      description: 'Cancer care, chemotherapy administration, and patient support',
      icon: Award,
      articles: 38,
      trending: true
    }
  ];

  const quickLinks = [
    { title: 'Evidence-Based Practice Guidelines', href: '/resources/ebp-guidelines' },
    { title: 'Adult Health Assessment Tools', href: '/resources/assessment-tools' },
    { title: 'Medication Administration Protocols', href: '/resources/medication-protocols' },
    { title: 'Patient Education Resources', href: '/resources/patient-education' },
    { title: 'Care Plan Templates', href: '/resources/care-plans' },
    { title: 'Continuing Education Courses', href: '/education/adult-health' }
  ];

  return (
    <>
      <Helmet>
        <title>Adult Health Nursing - HandyWriterz</title>
        <meta name="description" content="Comprehensive adult health nursing resources, evidence-based practice guidelines, and clinical expertise for healthcare professionals." />
        <meta name="keywords" content="adult health nursing, medical surgical nursing, critical care, evidence-based practice, clinical guidelines" />
        <link rel="canonical" href="https://handywriterz.com/d/adult-health" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Adult Health Nursing
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl text-white/90">
                Evidence-based resources, clinical expertise, and professional development
                for adult health nursing specialists and medical-surgical professionals.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/admin/articles/new?domain=adult-health"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  <Plus className="h-5 w-5" />
                  Create Content
                </Link>
                <Link
                  to="/services?domain=adult-health"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Browse Resources
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
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Clinical Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Expert Authors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">25K+</div>
                <div className="text-sm text-gray-600">Monthly Readers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-gray-600">Evidence-Based</div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Adult Health Specialties
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                Explore specialized content areas within adult health nursing practice
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {specialties.map((specialty, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {specialty.trending && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                    <specialty.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {specialty.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {specialty.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {specialty.articles} articles
                    </span>
                    <Link
                      to={`/services?domain=adult-health&specialty=${specialty.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
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
                  Featured Articles
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Latest evidence-based content from adult health experts
                </p>
              </div>
              <Link
                to="/services?domain=adult-health"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-green-400"></div>
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
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
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
              Essential Resources
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
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

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the Adult Health Nursing Community
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with fellow adult health professionals, share knowledge, and stay updated
              with the latest evidence-based practices in adult nursing care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5" />
                Join Community
              </Link>
              <Link
                to="/newsletter"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Subscribe to Updates
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdultHealthPage;
