import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'General',
      question: 'What services does HandyWriterz offer?',
      answer: 'HandyWriterz provides comprehensive academic support including nursing assignments, research papers, case studies, and more. We also offer plagiarism checking and academic guidance.'
    },
    {
      category: 'General',
      question: 'How does the service work?',
      answer: 'Simply submit your requirements through our platform, and our expert team will assist you with your academic needs while maintaining high quality and originality.'
    },
    {
      category: 'Turnitin',
      question: 'How does the Turnitin check work?',
      answer: 'Our Turnitin check service analyzes your document for potential plagiarism and provides a detailed report, helping you ensure your work is original.'
    },
    {
      category: 'Turnitin',
      question: 'How long does it take to get Turnitin results?',
      answer: 'Typically, Turnitin results are available within 10-15 minutes after submission.'
    },
    {
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.'
    },
    {
      category: 'Support',
      question: 'How can I contact support?',
      answer: 'Our support team is available 24/7 through live chat, email, and phone. We typically respond within minutes.'
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, process, and support.
          </p>
        </div>

        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
              <div className="space-y-4">
                {faqs
                  .filter(faq => faq.category === category)
                  .map((faq, index) => {
                    const itemIndex = categoryIndex * 100 + index;
                    return (
                      <div 
                        key={index} 
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        <button
                          onClick={() => setOpenItem(openItem === itemIndex ? null : itemIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {openItem === itemIndex ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {openItem === itemIndex && (
                          <div className="p-4 bg-gray-50 border-t">
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Contact Section */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Please reach out to our friendly team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
