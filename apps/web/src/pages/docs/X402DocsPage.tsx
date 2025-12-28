/**
 * x402 Protocol Documentation Page
 * 
 * Explains the x402 payment protocol for AI agent access
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Coins,
  Zap,
  Shield,
  Code2,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Lock,
  Globe2,
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

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Agent Access',
    description: 'Enable AI agents to programmatically access premium content through HTTP 402 payment responses.',
  },
  {
    icon: Coins,
    title: 'Micropayments',
    description: 'Pay-per-access model starting at $0.001 per request. Only pay for what you use.',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Content is served immediately upon payment verification. No delays or manual approvals.',
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Built on blockchain technology with support for USDC, USDT, and ETH payments.',
  },
  {
    icon: Lock,
    title: 'Private & Anonymous',
    description: 'No account required. Pay with crypto and access content instantly.',
  },
  {
    icon: Globe2,
    title: 'Global Access',
    description: 'Available worldwide without geographic restrictions or currency conversion issues.',
  },
];

const CODE_EXAMPLE = `// Example: AI Agent accessing x402-protected content
const response = await fetch('https://api.handywriterz.com/content/article-123', {
  headers: {
    'X-402-Payment': 'your-payment-proof',
    'Accept': 'application/json'
  }
});

// If content is paid:
// HTTP 200 OK with full content

// If payment required:
// HTTP 402 Payment Required
// {
//   "amount": "0.001",
//   "currency": "USDC",
//   "address": "0x...",
//   "network": "base"
// }`;

const PRICING_TIERS = [
  {
    name: 'Per Request',
    price: '$0.001',
    unit: 'per API call',
    features: [
      'Access any article',
      'Full content returned',
      'No subscription needed',
      'Pay only for what you use',
    ],
    highlighted: false,
  },
  {
    name: 'Bulk Package',
    price: '$10',
    unit: '10,000 requests',
    features: [
      'Pre-paid request pool',
      'Lower per-request cost',
      'Priority API access',
      'Usage analytics',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: 'contact us',
    features: [
      'Unlimited access',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantees',
    ],
    highlighted: false,
  },
];

export default function X402DocsPage() {
  return (
    <>
      <Helmet>
        <title>x402 Protocol - AI Agent Content Access | HandyWriterz</title>
        <meta 
          name="description" 
          content="Enable AI agents to access premium content through micropayments using the x402 protocol. Pay-per-access starting at $0.001." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
                  <Bot className="w-4 h-4" />
                  AI-Ready Content
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              >
                x402 Payment{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Protocol
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8"
              >
                Enable AI agents to access premium content through HTTP 402 micropayments.
                No subscriptions, no accounts—just pay and access.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/api"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <Code2 className="w-5 h-5" />
                  View API Docs
                </Link>
                <a
                  href="https://github.com/x402-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Coins className="w-5 h-5" />
                  Protocol Spec
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                How It Works
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                The x402 protocol enables seamless micropayments for content access
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {FEATURES.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Integration
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Access content with just a few lines of code
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <pre className="p-6 rounded-2xl bg-gray-900 text-gray-100 overflow-x-auto text-sm">
                  <code>{CODE_EXAMPLE}</code>
                </pre>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-white dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp} className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Simple Pricing
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Pay only for the content you access
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {PRICING_TIERS.map((tier) => (
                  <motion.div
                    key={tier.name}
                    variants={fadeInUp}
                    className={`p-8 rounded-2xl border ${
                      tier.highlighted
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-transparent text-white'
                        : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <h3 className={`text-lg font-semibold mb-2 ${
                      tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {tier.name}
                    </h3>
                    <div className="mb-6">
                      <span className={`text-4xl font-bold ${
                        tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {tier.price}
                      </span>
                      <span className={`text-sm ${
                        tier.highlighted ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {' '}{tier.unit}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                            tier.highlighted ? 'text-white' : 'text-emerald-500'
                          }`} />
                          <span className={
                            tier.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                          }>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={tier.name === 'Enterprise' ? '/contact' : '/api'}
                      className={`block w-full text-center px-6 py-3 rounded-xl font-medium transition-colors ${
                        tier.highlighted
                          ? 'bg-white text-purple-600 hover:bg-gray-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tier.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Ready to Integrate?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/80 mb-8"
              >
                Start accessing premium content for your AI applications today
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/api"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-purple-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  View API Documentation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
