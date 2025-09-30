import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { PLANS } from '@/config/plans';

const Pricing: React.FC = () => {
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <HandyWriterzLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your academic needs. All plans include plagiarism-free content and expert writers.
          </p>
        </motion.div>

        {/* Tiered Pricing Plans */}
        <motion.div
          className="mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-2xl border ${plan.isPopular ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-gray-200'} bg-white shadow-sm p-6 flex flex-col`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-sm text-gray-500">/{plan.interval}</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid grid-cols-1 gap-3">
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Talk to sales
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I place an order?</h3>
              <p className="text-gray-600">
                Simply create an account, select your service, provide your requirements, and proceed to payment. Our expert writers will start working on your order immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I request revisions?</h3>
              <p className="text-gray-600">
                Yes, you can request revisions based on your plan. Basic plans include 1 revision, Standard plans include 3 revisions, and Premium plans include unlimited revisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is my information confidential?</h3>
              <p className="text-gray-600">
                Absolutely. We maintain strict confidentiality and never share your personal information with third parties.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Excel in Your Academic Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have achieved academic success with our expert assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-in"
              className="inline-block py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="inline-block py-3 px-8 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing
