import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Baby,
  Heart,
  Users,
  BookOpen,
  Smile,
  Clock,
  ArrowRight,
  Stethoscope,
  Plus,
  TrendingUp,
  Star,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CMSClient } from '@/lib/cms-client';
import type { Article } from '@/types/publishing';

const cmsClient = new CMSClient();

const ChildNursingPage: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'child-nursing'],
    queryFn: () => cmsClient.getArticles({
      domain: 'child-nursing',
      limit: 6,
      status: 'published'
    })
  });

  useEffect(() => {
    if (articlesData) {
      setFeaturedArticles(articlesData.slice(0, 6));
    }
  }, [articlesData]);

  const specialtyAreas = [
    {
      title: 'Neonatal Intensive Care',
      description: 'Critical care for premature babies and newborns with complex conditions',
      icon: Baby,
      articles: 42,
      trending: true
    },
    {
      title: 'Pediatric Cardiology',
      description: 'Specialized care for children with congenital and acquired heart conditions',
      icon: Heart,
      articles: 28,
      trending: true
    },
    {
      title: 'Child Development',
      description: 'Growth milestones, developmental assessments, and early intervention',
      icon: Star,
      articles: 35,
      trending: false
    },
    {
      title: 'Pediatric Emergency Care',
      description: 'Acute care management and trauma response for pediatric patients',
      icon: Shield,
      articles: 31,
      trending: true
    }
  ];

  const quickLinks = [
    { title: 'Pediatric Assessment Guidelines', href: '/resources/pediatric-assessment' },
    { title: 'Growth & Development Charts', href: '/resources/growth-charts' },
    { title: 'Immunization Schedules', href: '/resources/immunizations' },
    { title: 'Family-Centered Care Resources', href: '/resources/family-care' },
    { title: 'Pediatric Emergency Protocols', href: '/resources/emergency-protocols' },
    { title: 'Child Life Programs', href: '/programs/child-life' }
  ];

  return (
    <>
      <Helmet>
        <title>Child Nursing & Pediatric Care - HandyWriterz</title>
        <meta name="description" content="Comprehensive pediatric nursing resources, child development guidelines, and family-centered care strategies for healthcare professionals." />
        <meta name="keywords" content="child nursing, pediatric nursing, neonatal care, child development, family-centered care, pediatric emergency" />
        <link rel="canonical" href="https://handywriterz.com/d/child-nursing" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-yellow-500 py-20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Baby className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Child Nursing
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl text-white/90">
                Expert resources for pediatric nursing, child development, and family-centered care
                strategies to support the health and wellbeing of children and their families.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/admin/articles/new?domain=child-nursing"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-pink-600 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-600"
                >
                  <Plus className="h-5 w-5" />
                  Create Content
                </Link>
                <Link
                  to="/services?domain=child-nursing"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-600"
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
                <div className="text-3xl font-bold text-pink-600">300+</div>
                <div className="text-sm text-gray-600">Pediatric Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">40+</div>
                <div className="text-sm text-gray-600">Child Health Experts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">15K+</div>
                <div className="text-sm text-gray-600">Families Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600">Family Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialty Areas Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Pediatric Nursing Specialties
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                Specialized care areas focused on the unique needs of children and families
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {specialtyAreas.map((specialty, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {specialty.trending && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-pink-100 mb-4">
                    <specialty.icon className="h-6 w-6 text-pink-600" />
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
                      to={`/services?domain=child-nursing&specialty=${specialty.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700"
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
                  Latest in Child Health
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Evidence-based content from pediatric nursing experts
                </p>
              </div>
              <Link
                to="/services?domain=child-nursing"
                className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
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
                    <div className="h-32 bg-gradient-to-r from-pink-400 to-yellow-400"></div>
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
                        className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700"
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
              Pediatric Resources
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Smile className="h-5 w-5 text-pink-600" />
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

        {/* Family-Centered Care Section */}
        <section className="py-16 bg-gradient-to-r from-pink-500 to-yellow-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Family-Centered Care Excellence
            </h2>
            <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
              We believe in caring for the whole family, not just the child. Our resources support
              healthcare professionals in delivering compassionate, family-centered care that honors
              the unique needs of children and their loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/education/family-centered-care"
                className="inline-flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Learn More
              </Link>
              <Link
                to="/community/child-nursing"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
              >
                Join Community
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ChildNursingPage;
