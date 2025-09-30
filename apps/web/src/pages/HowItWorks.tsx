import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, BookOpen, Users, Edit3, Clock, Zap, Star, ArrowRight } from 'lucide-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';

const HowItWorks: React.FC = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const steps = [
    {
      icon: <Edit3 className="h-6 w-6 text-blue-600" />,
      title: "Place Your Order",
      description: "Choose your service, provide project details, and set your deadline. Our intuitive order form makes it easy to specify exactly what you need.",
      color: "border-blue-200 bg-blue-50",
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Expert Assignment",
      description: "We'll match your project with a qualified expert in your field. Our professionals have advanced degrees and extensive experience.",
      color: "border-purple-200 bg-purple-50",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-600" />,
      title: "Expert Writes Your Paper",
      description: "Your assigned expert researches and writes your paper, following your requirements exactly and adhering to academic standards.",
      color: "border-green-200 bg-green-50",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-pink-600" />,
      title: "Quality Check",
      description: "Each paper undergoes rigorous quality checks, including plagiarism scanning, to ensure originality and academic excellence.",
      color: "border-pink-200 bg-pink-50",
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Delivery & Revisions",
      description: "Receive your completed paper by your deadline. Request free revisions if needed to ensure complete satisfaction with the final product.",
      color: "border-yellow-200 bg-yellow-50",
    }
  ];

  const benefits = [
    {
      title: "24/7 Support",
      description: "Our customer support team is available around the clock to assist with any questions or concerns.",
      icon: <Clock className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: "Expert Writers",
      description: "All our writers hold advanced degrees in their fields and undergo rigorous vetting.",
      icon: <Star className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: "Plagiarism Free",
      description: "Every paper is checked through advanced plagiarism detection software to ensure originality.",
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
    },
    {
      title: "Timely Delivery",
      description: "We guarantee on-time delivery, even for tight deadlines.",
      icon: <Zap className="h-6 w-6 text-indigo-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <HandyWriterzLogo size="lg" className="mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                How HandyWriterz Works
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From order to delivery, we've streamlined our process to provide you with high-quality academic support easily and efficiently.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className={`flex flex-col md:flex-row items-start md:items-center gap-6 p-8 rounded-2xl border ${step.color}`}
              >
                <div className="flex-shrink-0 rounded-full p-4 bg-white shadow-md">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HandyWriterz</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to providing the best academic support with these key benefits:
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Excel in Your Studies?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of students who have achieved academic success with our expert assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sign-up"
                className="mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started Today
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 border border-white bg-transparent text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Have Questions?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Check out our frequently asked questions for quick answers to common questions.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View FAQ
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
