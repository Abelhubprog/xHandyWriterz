import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HeadphonesIcon
} from 'lucide-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';
import { toast } from 'react-hot-toast';

const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Your message has been sent! We will get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
  };

  const contactMethods = [
    {
      icon: <Phone className="h-6 w-6 text-indigo-600" />,
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+1 (800) 123-4567",
      action: "Call now",
      link: "tel:+18001234567"
    },
    {
      icon: <Mail className="h-6 w-6 text-indigo-600" />,
      title: "Email Us",
      description: "Send us a detailed message",
      contact: "support@handywriterz.com",
      action: "Email now",
      link: "mailto:support@handywriterz.com"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-indigo-600" />,
      title: "Live Chat",
      description: "Chat with our support agents",
      contact: "Available 24/7",
      action: "Start chat",
      link: "#chat" // In a real app, this would trigger the chat widget
    }
  ];

  const faqs = [
    {
      question: "How quickly can I get my paper?",
      answer: "Our turnaround times vary based on the complexity and length of the assignment. We offer delivery options ranging from 24 hours to 14 days. For urgent requests, please contact our support team directly to check availability."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through encrypted connections to ensure your financial information remains protected."
    },
    {
      question: "Can I request revisions to my paper?",
      answer: "Yes, we offer free revisions within 14 days after delivery. Simply provide your revision instructions through your customer dashboard, and we'll make the necessary changes to ensure your complete satisfaction."
    },
    {
      question: "How do you ensure my paper is plagiarism-free?",
      answer: "Every paper is written from scratch by our qualified writers and goes through a rigorous plagiarism check using industry-leading software before delivery. We provide a plagiarism report upon request."
    },
    {
      question: "Do you have writers specialized in my subject?",
      answer: "Yes, we have a diverse team of writers with expertise across various academic disciplines, including nursing, education, business, engineering, and more. When you place an order, we match you with a writer who specializes in your specific subject area."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <HandyWriterzLogo size="lg" className="mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                24/7 Support
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our dedicated support team is always ready to assist you with any questions or concerns.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-indigo-100 rounded-full mb-4">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <p className="text-lg font-semibold text-indigo-600 mb-6">{method.contact}</p>
                  <a
                    href={method.link}
                    className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full"
                  >
                    {method.action} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Support Hours</h2>
                <p className="text-gray-600 mb-8">
                  Our support team is available around the clock to assist you with any questions or concerns you may have about your orders or our services.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-semibold">24/7 Availability</h3>
                      <p className="text-gray-600">Our support team is available 24 hours a day, 7 days a week</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-semibold">Quick Response Time</h3>
                      <p className="text-gray-600">We aim to respond to all inquiries within 2 hours or less</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <HeadphonesIcon className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-semibold">Dedicated Support Agents</h3>
                      <p className="text-gray-600">Each customer is assigned a dedicated support agent for personalized assistance</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 md:p-12 text-white">
                <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Find quick answers to common questions about our support services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-6 pt-0 bg-white">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
